// SHD.js - Handles SHD level and stats

// Default SHD stats
const defaultSHDStats = {
  // Offensive
  weaponDamage: 0,
  headshotDamage: 0,
  criticalHitChance: 0,
  criticalHitDamage: 0,
  reloadSpeed: 0,
  stability: 0,
  accuracy: 0,
  ammoCapacity: 0,

  // Defensive
  totalArmor: 0,
  explosiveResistance: 0,
  hazardProtection: 0,
  health: 0,

  // Utility
  skillHaste: 0,
  skillDamage: 0,
  skillDuration: 0,
  repairSkills: 0,
}

// Max SHD stats (at SHD level 1000)
const maxSHDStats = {
  // Offensive
  weaponDamage: 10,
  headshotDamage: 20,
  criticalHitChance: 10,
  criticalHitDamage: 20,
  reloadSpeed: 10,
  stability: 10,
  accuracy: 10,
  ammoCapacity: 20,

  // Defensive
  totalArmor: 10,
  explosiveResistance: 10,
  hazardProtection: 10,
  health: 10,

  // Utility
  skillHaste: 10,
  skillDamage: 10,
  skillDuration: 20,
  repairSkills: 10,
}

// Get current SHD stats from localStorage or use defaults
function getSHDStats() {
  const isMaxStats = localStorage.getItem("isMaxStats") === "true"
  return isMaxStats ? maxSHDStats : defaultSHDStats
}

// Update SHD stats in localStorage
function updateSHDStats(stats) {
  localStorage.setItem("shdStats", JSON.stringify(stats))
}

// Toggle between max and default SHD stats
function toggleMaxStats() {
  const isMaxStats = localStorage.getItem("isMaxStats") === "true"
  localStorage.setItem("isMaxStats", (!isMaxStats).toString())

  // Update the document body class for styling
  if (!isMaxStats) {
    document.body.classList.add("max-shd")
    document.body.classList.remove("no-shd")
  } else {
    document.body.classList.remove("max-shd")
    document.body.classList.add("no-shd")
  }

  return !isMaxStats
}

// Export functions
export { getSHDStats, updateSHDStats, toggleMaxStats }

