// Function To Get And Return SHD Stats.
function getSHDStats() {
    // Tries To Get SHD Stats From Storage.
    const userValues = (() => {
        try {return JSON.parse(localStorage.getItem("SHD-Stats") || "{}");
        } catch (error) { console.error("Failed To Parse SHD-Stats:", error);
            return {};  // Return Empty Object Avoiding Crash
        }})(); //IIFE

    // Default Stats Name, Type, Max Value.
    const defaults = [
        ["Weapon Damage", "O", 10],
        ["Headshot Damage", "O", 20],
        ["Critical Hit Chance", "O", 10],
        ["Critical Hit Damage", "O", 20],
        ["Reload Speed %", "O", 10],
        ["Stability", "O", 10],
        ["Accuracy", "O", 10],
        ["Ammo Capacity", "O", 20],
        ["Total Armor", "D", 10],
        ["Explosive Resistance", "D", 10],
        ["Hazard Protection", "D", 10],
        ["Health", "D", 10],
        ["Skill Haste", "U", 10],
        ["Skill Damage", "U", 10],
        ["Skill Duration", "U", 20],
        ["Repair Skills", "U", 10],
    ];

    const isMaxStats = JSON.parse(localStorage.getItem("isMaxStats") || "false");

    // Creates An Object For Each Stat.
    return defaults.map(([name, type, max]) => ({
        name, // Stat Name e.g Wep Damage.
        type, // State Type e.g O = Offensive.
        max, // Max Value e.g Wep Damage = 10.
        value: isMaxStats ? max : 0, // True = Max Stat Value, False = 0.
    }));
}

// Updates SHD Stats in Storage.
function updateSHDStats(levels){
    // Creates An Object Giving Each Stat Name A Key And Each Value Is a Value.
    const userValues = Object.fromEntries(levels.map(({ name, value, max }) => {
        return [name, value === max ? true : false];  // Store true for max value, false otherwise
    }));

    localStorage.setItem("SHD-Stats", JSON.stringify(userValues));
}

// Cleans SHD Stats From Storage By Removing "Keys" Starting With SHD.
// Redundant Keeping Incase
/*function cleanSHDStats() {
	Object.keys(localStorage)
		.filter(key => key.startsWith("SHD")) // Filter Out Only The Keys Starting With "SHD".
		.forEach(key => {
			console.log(`Removing: ${key}`); // Log Removed Key(s).
			localStorage.removeItem(key); // Removes Key(s) From Storage.
		});
	console.log("SHD keys cleared."); // Logs After SHD Keys Removed.
}
*/

// Exports To Use Elsewhere.

function toggleMaxStats() {
    // Checks Current Value
    const currentState = JSON.parse(localStorage.getItem("isMaxStats") || "false");
    const newState = !currentState; // Toggles State
    localStorage.setItem("isMaxStats", JSON.stringify(newState)); // Saves New State   
}

export { getSHDStats, updateSHDStats, toggleMaxStats};