import { 
    getItems, 
    getTalentDetails, 
    getAttributes, 
    getBrandSets, 
    getGearSets,
    saveLoadout, 
    getLoadouts,
    getLoadout
} from './data.js';

import { getSHDStats, updateSHDStats, toggleMaxStats } from './SHD.js';

// Make the toggleMaxStats function available globally
window.toggleMaxStats = toggleMaxStats;

// Get references to DOM elements
const inventoryTiles = document.querySelectorAll('.inventory-tile');
const popupTemplate = document.getElementById('popupTemplate');
const closeButton = popupTemplate.querySelector('.popup-close');
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const shdToggle = document.getElementById('shdToggle');
const itemsGrid = document.getElementById('itemsGrid');
const selectedItemDetails = document.getElementById('selectedItemDetails');
const itemSearch = document.getElementById('itemSearch');
const itemSort = document.getElementById('itemSort');

// Current loadout state
let currentLoadout = {};
let currentItemType = '';
let currentItemSlot = '';

// Set initial mode
function initializeMode() {
    // Theme mode initialization
    if (localStorage.getItem("darkMode") === "disabled") {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeToggle.textContent = "Toggle Dark Mode";
    } else {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
        themeToggle.textContent = "Toggle Light Mode";
    }
    
    // SHD mode initialization
    const isMaxStats = localStorage.getItem("isMaxStats") === "true";
    if(isMaxStats) {
        body.classList.add('max-shd');
        body.classList.remove('no-shd');
        shdToggle.textContent = "Toggle No SHD";
    } else {
        body.classList.remove('max-shd');
        body.classList.add('no-shd');
        shdToggle.textContent = "Toggle Max SHD";
    }
    
    // Load saved loadout if available
    const savedLoadout = getLoadout();
    if (savedLoadout) {
        currentLoadout = savedLoadout;
        updateInventoryTiles();
    }
}

// Update inventory tiles with saved loadout items
function updateInventoryTiles() {
    for (const [slot, item] of Object.entries(currentLoadout)) {
        const tile = document.querySelector(`[data-item="${slot.toLowerCase()}"]`);
        if (tile) {
            tile.querySelector('.tile-name').textContent = item.name;
        }
    }
}

// Toggle between dark and light mode
function toggleDarkMode() {
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode');

    if (body.classList.contains('light-mode')) {
        localStorage.setItem('darkMode', 'disabled');
        themeToggle.textContent = "Toggle Dark Mode";
    } else {
        localStorage.removeItem('darkMode');
        themeToggle.textContent = "Toggle Light Mode";
    }
}

function toggleSHDMode() {
    // Call the toggleMaxStats function from SHD.js
    if (window.toggleMaxStats) {
        window.toggleMaxStats();
    }
    
    // Get the updated state from localStorage
    const isMaxStats = localStorage.getItem("isMaxStats") === "true";
    
    // Update UI based on the new state
    if (isMaxStats) {
        body.classList.add('max-shd');
        body.classList.remove('no-shd');
        shdToggle.textContent = "Toggle No SHD";
    } else {
        body.classList.remove('max-shd');
        body.classList.add('no-shd');
        shdToggle.textContent = "Toggle Max SHD";
    }
}       

// Add event listener to toggle buttons
themeToggle.addEventListener('click', toggleDarkMode);
shdToggle.addEventListener('click', toggleSHDMode);

// Load and display items for a specific slot
async function showItemSelection(slot, type) {
    currentItemType = type;
    currentItemSlot = slot;
    
    const items = await getItems(type, slot);
    const currentItemTypeElement = document.getElementById('currentItemType');
    currentItemTypeElement.textContent = `Select ${slot}`;
    
    // Clear previous items
    itemsGrid.innerHTML = '';
    
    // Create item cards
    items.forEach(item => {
        const card = createItemCard(item);
        itemsGrid.appendChild(card);
    });
    
    // Show popup
    popupTemplate.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Create an item card element based on item type
async function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.itemId = item.id || item.name;
    
    // Determine rarity class
    let rarityClass = 'rarity-standard';
    if (item.quality) {
        rarityClass = `rarity-${item.quality.toLowerCase()}`;
    } else if (item.rarity) {
        rarityClass = `rarity-${item.rarity.toLowerCase()}`;
    }
    
    // Different display based on item type
    if (currentItemType === 'weapons') {
        // Get talent details if available
        let talentInfo = '';
        if (item.talent) {
            const talentDetails = await getTalentDetails(item.talent, 'weapon');
            if (talentDetails) {
                talentInfo = `<div class="item-talent">${talentDetails.description || item.talent}</div>`;
            } else {
                talentInfo = `<div class="item-talent">${item.talent}</div>`;
            }
        }
        
        card.innerHTML = `
            <div class="item-card-header">
                <span class="item-card-name">${item.name}</span>
                <span class="item-card-rarity ${rarityClass}">${item.quality || item.rarity || 'Standard'}</span>
            </div>
            <div class="item-card-type">${item.type}</div>
            ${talentInfo}
            <div class="item-card-stats">
                <div>DMG: ${item.dmg || 'N/A'}</div>
                <div>RPM: ${item.rpm || 'N/A'}</div>
                <div>Mag: ${item.mag || 'N/A'}</div>
            </div>
        `;
    } else if (currentItemType === 'gearItems') {
        // Get brand or gear set info
        let brandInfo = '';
        if (item.brand) {
            const brandSets = await getBrandSets();
            const brand = brandSets.find(b => b.name === item.brand);
            if (brand) {
                brandInfo = `<div class="item-brand">${brand.name} (${brand.bonus1})</div>`;
            } else {
                brandInfo = `<div class="item-brand">${item.brand}</div>`;
            }
        } else if (item.gearSet) {
            const gearSets = await getGearSets();
            const gearSet = gearSets.find(g => g.name === item.gearSet);
            if (gearSet) {
                brandInfo = `<div class="item-brand gear-set">${gearSet.name} (${gearSet.bonus1})</div>`;
            } else {
                brandInfo = `<div class="item-brand gear-set">${item.gearSet}</div>`;
            }
        }
        
        // Get talent details if available
        let talentInfo = '';
        if (item.talent) {
            const talentDetails = await getTalentDetails(item.talent, 'gear');
            if (talentDetails) {
                talentInfo = `<div class="item-talent">${talentDetails.description || item.talent}</div>`;
            } else {
                talentInfo = `<div class="item-talent">${item.talent}</div>`;
            }
        }
        
        card.innerHTML = `
            <div class="item-card-header">
                <span class="item-card-name">${item.name}</span>
                <span class="item-card-rarity ${rarityClass}">${item.quality || item.rarity || 'Standard'}</span>
            </div>
            ${brandInfo}
            ${talentInfo}
            <div class="item-card-stats">
                <div>Armor: ${item.baseArmor || 'N/A'}</div>
            </div>
        `;
    } else if (currentItemType === 'skills') {
        card.innerHTML = `
            <div class="item-card-header">
                <span class="item-card-name">${item.name}</span>
            </div>
            <div class="item-card-stats">
                <div>${item.description || ''}</div>
            </div>
        `;
    } else if (currentItemType === 'specializations') {
        card.innerHTML = `
            <div class="item-card-header">
                <span class="item-card-name">${item.name}</span>
            </div>
            <div class="item-card-stats">
                <div>${item.description || ''}</div>
            </div>
        `;
    }
    
    card.addEventListener('click', () => selectItem(item));
    
    return card;
}

// Handle item selection
function selectItem(item) {
    // Remove previous selection
    const selected = itemsGrid.querySelector('.selected');
    if (selected) selected.classList.remove('selected');
    
    // Add selection to clicked item
    event.currentTarget.classList.add('selected');
    
    // Show item details with stat inputs
    showItemDetails(item);
}

// Show detailed item view with stat inputs
async function showItemDetails(item) {
    let detailsHTML = `<h3>${item.name}</h3>`;
    
    // Different details based on item type
    if (currentItemType === 'weapons') {
        // Get talent details
        let talentDescription = '';
        if (item.talent) {
            const talentDetails = await getTalentDetails(item.talent, 'weapon');
            talentDescription = talentDetails ? talentDetails.description : '';
        }
        
        detailsHTML += `
            <div class="item-detail-section">
                <div class="item-detail-header">Weapon Details</div>
                <div class="stat-input">
                    <label>Type:</label>
                    <span>${item.type || 'N/A'}</span>
                </div>
                <div class="stat-input">
                    <label>Damage:</label>
                    <input type="number" id="stat-dmg" value="${item.dmg || 0}" min="0">
                </div>
                <div class="stat-input">
                    <label>RPM:</label>
                    <input type="number" id="stat-rpm" value="${item.rpm || 0}" min="0">
                </div>
                <div class="stat-input">
                    <label>Magazine:</label>
                    <input type="number" id="stat-mag" value="${item.mag || 0}" min="0">
                </div>
            </div>
            
            ${item.talent ? `
                <div class="item-detail-section">
                    <div class="item-detail-header">Talent: ${item.talent}</div>
                    <div class="item-talent-description">${talentDescription}</div>
                </div>
            ` : ''}
            
            <div class="item-detail-section">
                <div class="item-detail-header">Attributes</div>
                <div class="attribute-inputs" id="attributeInputs">
                    <div class="attribute-row">
                        <select id="attribute1" class="attribute-select">
                            <option value="">Select Attribute</option>
                            <!-- Will be populated dynamically -->
                        </select>
                        <input type="number" id="attribute1-value" value="0" min="0" max="100">
                    </div>
                </div>
                <button class="add-attribute" id="addAttribute">+ Add Attribute</button>
            </div>
        `;
    } else if (currentItemType === 'gearItems') {
        // Get brand or gear set info
        let brandBonus = '';
        if (item.brand) {
            const brandSets = await getBrandSets();
            const brand = brandSets.find(b => b.name === item.brand);
            if (brand) {
                brandBonus = `
                    <div>1pc: ${brand.bonus1}</div>
                    <div>2pc: ${brand.bonus2}</div>
                    <div>3pc: ${brand.bonus3}</div>
                `;
            }
        } else if (item.gearSet) {
            const gearSets = await getGearSets();
            const gearSet = gearSets.find(g => g.name === item.gearSet);
            if (gearSet) {
                brandBonus = `
                    <div>2pc: ${gearSet.bonus1}</div>
                    <div>3pc: ${gearSet.bonus2}</div>
                    <div>4pc: ${gearSet.bonus3}</div>
                `;
            }
        }
        
        // Get talent details
        let talentDescription = '';
        if (item.talent) {
            const talentDetails = await getTalentDetails(item.talent, 'gear');
            talentDescription = talentDetails ? talentDetails.description : '';
        }
        
        detailsHTML += `
            <div class="item-detail-section">
                <div class="item-detail-header">Gear Details</div>
                <div class="stat-input">
                    <label>Slot:</label>
                    <span>${item.slot || currentItemSlot}</span>
                </div>
                <div class="stat-input">
                    <label>Armor:</label>
                    <input type="number" id="stat-armor" value="${item.baseArmor || 0}" min="0">
                </div>
            </div>
            
            ${(item.brand || item.gearSet) ? `
                <div class="item-detail-section">
                    <div class="item-detail-header">${item.brand || item.gearSet}</div>
                    <div class="brand-bonuses">${brandBonus}</div>
                </div>
            ` : ''}
            
            ${item.talent ? `
                <div class="item-detail-section">
                    <div class="item-detail-header">Talent: ${item.talent}</div>
                    <div class="item-talent-description">${talentDescription}</div>
                </div>
            ` : ''}
            
            <div class="item-detail-section">
                <div class="item-detail-header">Attributes</div>
                <div class="attribute-inputs" id="attributeInputs">
                    <div class="attribute-row">
                        <select id="attribute1" class="attribute-select">
                            <option value="">Select Attribute</option>
                            <!-- Will be populated dynamically -->
                        </select>
                        <input type="number" id="attribute1-value" value="0" min="0" max="100">
                    </div>
                </div>
                <button class="add-attribute" id="addAttribute">+ Add Attribute</button>
            </div>
        `;
    } else {
        // Simple details for skills and specializations
        detailsHTML += `
            <div class="item-detail-section">
                <div class="item-detail-description">${item.description || ''}</div>
            </div>
        `;
    }
    
    // Add save button
    detailsHTML += `
        <button class="save-loadout" id="saveItemButton">
            Select Item
        </button>
    `;
    
    // Update the details section
    selectedItemDetails.innerHTML = detailsHTML;
    
    // Populate attribute dropdowns
    if (currentItemType === 'weapons' || currentItemType === 'gearItems') {
        populateAttributeDropdowns();
    }
    
    // Add event listeners
    const addAttributeButton = document.getElementById('addAttribute');
    if (addAttributeButton) {
        addAttributeButton.addEventListener('click', addAttributeRow);
    }
    
    const saveItemButton = document.getElementById('saveItemButton');
    if (saveItemButton) {
        saveItemButton.addEventListener('click', () => saveItemToLoadout(item));
    }
}

// Populate attribute dropdowns with available attributes
async function populateAttributeDropdowns() {
    const attributes = await getAttributes();
    const attributeSelects = document.querySelectorAll('.attribute-select');
    
    attributeSelects.forEach(select => {
        // Keep the first option
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        // Add attribute options
        attributes.forEach(attr => {
            const option = document.createElement('option');
            option.value = attr.name;
            option.textContent = attr.name;
            select.appendChild(option);
        });
    });
}

// Add a new attribute row
function addAttributeRow() {
    const attributeInputs = document.getElementById('attributeInputs');
    const rowCount = attributeInputs.children.length + 1;
    
    const newRow = document.createElement('div');
    newRow.className = 'attribute-row';
    newRow.innerHTML = `
        <select id="attribute${rowCount}" class="attribute-select">
            <option value="">Select Attribute</option>
            <!-- Will be populated dynamically -->
        </select>
        <input type="number" id="attribute${rowCount}-value" value="0" min="0" max="100">
        <button class="remove-attribute">×</button>
    `;
    
    attributeInputs.appendChild(newRow);
    
    // Add event listener to remove button
    const removeButton = newRow.querySelector('.remove-attribute');
    removeButton.addEventListener('click', () => {
        attributeInputs.removeChild(newRow);
    });
    
    // Populate the new dropdown
    populateAttributeDropdowns();
}

// Save selected item to loadout
function saveItemToLoadout(item) {
    // Gather all stat values
    const stats = {};
    
    // Get basic stats based on item type
    if (currentItemType === 'weapons') {
        const dmgInput = document.getElementById('stat-dmg');
        const rpmInput = document.getElementById('stat-rpm');
        const magInput = document.getElementById('stat-mag');
        
        if (dmgInput) stats.dmg = dmgInput.value;
        if (rpmInput) stats.rpm = rpmInput.value;
        if (magInput) stats.mag = magInput.value;
    } else if (currentItemType === 'gearItems') {
        const armorInput = document.getElementById('stat-armor');
        if (armorInput) stats.armor = armorInput.value;
    }
    
    // Get attributes
    const attributes = [];
    const attributeRows = document.querySelectorAll('.attribute-row');
    attributeRows.forEach(row => {
        const select = row.querySelector('select');
        const valueInput = row.querySelector('input');
        
        if (select && valueInput && select.value) {
            attributes.push({
                name: select.value,
                value: valueInput.value
            });
        }
    });
    
    // Save to current loadout
    currentLoadout[currentItemSlot] = {
        name: item.name,
        id: item.id || item.name,
        type: currentItemType,
        stats: stats,
        attributes: attributes,
        talent: item.talent || null,
        brand: item.brand || null,
        gearSet: item.gearSet || null
    };
    
    // Update the inventory tile
    const tile = document.querySelector(`[data-item="${currentItemSlot.toLowerCase()}"]`);
    tile.querySelector('.tile-name').textContent = item.name;
    
    // Close popup
    hidePopup();
    
    // Save loadout to localStorage
    saveLoadout(currentLoadout);
}

// Add click event listeners to all inventory tiles
inventoryTiles.forEach(tile => {
    tile.addEventListener('click', () => {
        const itemType = tile.getAttribute('data-type');
        const itemSlot = tile.getAttribute('data-item');
        showItemSelection(itemSlot, itemType);
    });
});

// Search functionality
itemSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const items = itemsGrid.querySelectorAll('.item-card');
    
    items.forEach(item => {
        const name = item.querySelector('.item-card-name').textContent.toLowerCase();
        item.style.display = name.includes(searchTerm) ? 'block' : 'none';
    });
});

// Sorting functionality
itemSort.addEventListener('change', (e) => {
    const sortBy = e.target.value;
    const items = Array.from(itemsGrid.querySelectorAll('.item-card'));
    
    items.sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === 'name') {
            aValue = a.querySelector('.item-card-name').textContent;
            bValue = b.querySelector('.item-card-name').textContent;
        } else if (sortBy === 'rarity') {
            aValue = a.querySelector('.item-card-rarity')?.textContent || '';
            bValue = b.querySelector('.item-card-rarity')?.textContent || '';
        } else if (sortBy === 'brand') {
            aValue = a.querySelector('.item-brand')?.textContent || '';
            bValue = b.querySelector('.item-brand')?.textContent || '';
        }
        
        return aValue.localeCompare(bValue);
    });
    
    items.forEach(item => itemsGrid.appendChild(item));
});

// Close popup when clicking the close button
closeButton.addEventListener('click', hidePopup);

// Close popup when clicking outside the popup content
popupTemplate.addEventListener('click', (e) => {
    if (e.target === popupTemplate) {
        hidePopup();
    }
});

// Close popup with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hidePopup();
    }
});

// Function to hide popup
function hidePopup() {
    popupTemplate.classList.remove('active');
    document.body.style.overflow = '';
}

// Check if spritesheet is loading correctly
window.addEventListener('load', function() {
    // Create a test image to check if the spritesheet is loading
    const testImg = new Image();
    testImg.onerror = function() {
        console.error('Error loading spritesheet. Using fallback styles.');
        document.querySelectorAll('.inventory-tile').forEach(tile => {
            // Apply fallback styles if spritesheet fails to load
            tile.style.backgroundColor = '#444';
            tile.style.color = '#fff';
        });
    };
    testImg.src = 'Icons/ui_loot_spritesheet.png'; // Main Spritesheet Image
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initializeMode);

// Run initialization immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMode);
} else {
    initializeMode();
}

