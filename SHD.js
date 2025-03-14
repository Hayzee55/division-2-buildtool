// Function To Get And Return SHD Stats.
function getSHDStats() {
    // Gets SHD Stats From Storage.
    const userValues = JSON.parse(localStorage.getItem("SHD-Stats") || "{}");

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

    // Creates An Object For Each Stat.
    return defaults.map(([name, type, max]) => ({
        name, // Stat Name e.g Wep Damage.
        type, // State Type e.g O = Offensive.
        max, // Max Value e.g Wep Damage = 10.
        value: userValues[name] || 0, // Gets User Value Or 0 If No Set Value.
    }));
}

// Updates SHD Stats in Storage.
function updateSHDStats(levels){
    // Creates An Object Giving Each Stat Name A Key And Each Value Is a Value.
    const userValues = Object.fromEntries(levels.map(({name, value}) => [name, value]));
    // Stores Updated Stats In Storage As JSON String.
    localStorage.setItem("SHD-Stats", JSON.stringify(userValues));
}

// Cleans SHD Stats From Storage By Removing "Keys" Starting With SHD.
function cleanSHDStats() {
	Object.keys(localStorage)
		.filter(key => key.startsWith("SHD")) // Filter Out Only The Keys Starting With "SHD".
		.forEach(key => {
			console.log(`Removing: ${key}`); // Log Removed Key(s).
			localStorage.removeItem(key); // Removes Key(s) From Storage.
		});
	console.log("SHD keys cleared."); // Logs After SHD Keys Removed.
}

// Exports To Use Elsewhere.
export { getSHDStats, updateSHDStats, cleanSHDStats};