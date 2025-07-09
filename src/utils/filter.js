// Department name filter
// Checks if a department name is allowed
// Only 'HR' and 'Management' and their variations are banned for fairness

// List of banned department names and common variations
const bannedDepartments = [
  "hr", "h.r.", "h r", "h.r", "h-r", "h r dept", "hr dept", "hr department", "human resources", "hum res", "hresources",
  "management", "mgmt", "mngt", "managment", "mgr", "managers", "the management", "admin", "administration"
];

// Function to check if a department name is allowed
export function isDepartmentAllowed(name) {
  return !bannedDepartments.includes(name.trim().toLowerCase());
} 