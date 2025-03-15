// Cache for loaded data
const dataCache = {};

// Function to load CSV data
async function loadCSV(type, subtype = null) {
    // Construct the path based on type and subtype
    let path;
    if (subtype) {
        path = `csv/${type}/${subtype}.csv`;
    } else {
        path = `csv/${type}.csv`;
    }
    
    // Return cached data if available
    const cacheKey = path;
    if (dataCache[cacheKey]) {
        return dataCache[cacheKey];
    }
    
    try {
        const response = await fetch(path);
        const text = await response.text();
        const data = parseCSV(text);
        
        // Cache the data
        dataCache[cacheKey] = data;
        return data;
    } catch (error) {
        console.error(`Error loading ${path}:`, error);
        return [];
    }
}

// Parse CSV text into array of objects
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1)
        .filter(line => line.trim() !== '') // Skip empty lines
        .map(line => {
            // Handle commas within quoted fields
            const values = [];
            let inQuotes = false;
            let currentValue = '';
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentValue.trim());
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            
            // Add the last value
            values.push(currentValue.trim());
            
            // Create object from headers and values
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index] || '';
                return obj;
            }, {});
        });
}

// Get all gear items
async function getAllGearItems() {
    const gearSlots = ['Mask', 'Backpack', 'Chest', 'Gloves', 'Holster', 'Kneepads'];
    let allGear = [];
    
    for (const slot of gearSlots) {
        try {
            const items = await loadCSV('gear', slot);
            // Add slot information to each item
            items.forEach(item => {
                item.slot = slot.toLowerCase();
            });
            allGear = [...allGear, ...items];
        } catch (error) {
            console.error(`Error loading ${slot} data:`, error);
        }
    }
    
    return allGear;
}

// Get all weapons
async function getAllWeapons() {
    const weaponTypes = [
        'AssaultRifle', 'Rifle', 'Marksman Rifle', 'SMG', 
        'LMG', 'Shotgun', 'Pistol' 
    ];
    let allWeapons = [];
    
    for (const type of weaponTypes) {
        try {
            const weapons = await loadCSV('weapons', type);
            allWeapons = [...allWeapons, ...weapons];
        } catch (error) {
            console.error(`Error loading ${type} weapons data:`, error);
        }
    }
    
    return allWeapons;
}

// Get items by type and filter by slot if needed
async function getItems(type, slot = null) {
    if (type === 'gearItems') {
        const allGear = await getAllGearItems();
        
        // Filter by slot if specified
        if (slot) {
            return allGear.filter(item => item.slot.toLowerCase() === slot.toLowerCase());
        }
        
        return allGear;
    }
    
    if (type === 'weapons') {
        const allWeapons = await getAllWeapons();
        
        // Filter by weapon type if needed
        if (slot) {
            const weaponTypes = {
                primary: ['Assault Rifle', 'SMG', 'Rifle', 'Shotgun', 'Marksman Rifle', 'LMG'],
                secondary: ['Assault Rifle', 'SMG', 'Rifle', 'Shotgun', 'Marksman Rifle', 'LMG'],
                pistol: ['Pistol']
            };
            
            if (weaponTypes[slot]) {
                return allWeapons.filter(item => weaponTypes[slot].includes(item.type));
            }
        }
        
        return allWeapons;
    }
    
    // For other types like skills, specializations, etc.
    return await loadCSV(type);
}

// Get talent details by name
async function getTalentDetails(talentName, type) {
    let talents = [];
    
    if (type === 'weapon') {
        talents = await loadCSV('weapons', 'WeaponTalents');
    } else if (type === 'gear') {
        talents = await loadCSV('gear', 'GearTalents');
    }
    
    return talents.find(talent => talent.name === talentName) || null;
}

// Get attribute details
async function getAttributes() {
    return await loadCSV('gear', 'Attributes');
}

// Get brand set details
async function getBrandSets() {
    return await loadCSV('gear', 'BrandSetBonuses');
}

// Get gear set details
async function getGearSets() {
    return await loadCSV('gearsets');
}

// Get gear mods
async function getGearMods() {
    return await loadCSV('gear', 'GearMods');
}

// Save loadout to localStorage
function saveLoadout(loadout, name = "Default Loadout") {
    const loadouts = JSON.parse(localStorage.getItem('loadouts') || '{}');
    loadouts[name] = loadout;
    localStorage.setItem('loadouts', JSON.stringify(loadouts));
}

// Get saved loadouts
function getLoadouts() {
    return JSON.parse(localStorage.getItem('loadouts') || '{}');
}

// Get a specific loadout by name
function getLoadout(name = "Default Loadout") {
    const loadouts = getLoadouts();
    return loadouts[name] || null;
}

// Export functions
export { 
    getItems, 
    getTalentDetails, 
    getAttributes, 
    getBrandSets, 
    getGearSets,
    getGearMods,
    saveLoadout, 
    getLoadouts,
    getLoadout
};

