  // Department filtering utilities for leaderboard participation control
// Maintains competitive fairness by excluding evaluators from performance rankings

const EXCLUDED_DEPARTMENTS = [
  "hr", "h.r.", "h r", "h.r", "h-r", "h r dept", "hr dept", "hr department", 
  "human resources", "hum res", "hresources", "personnel", "people ops",
  "management", "mgmt", "mngt", "managment", "mgr", "managers", "the management", 
  "executive", "executives", "c-suite", "senior management", "leadership",
  "admin", "administration", "administrative", "office admin", "general admin"
];

/**
 * Checks if department is eligible for leaderboard participation
 * @param {string} departmentName - Department to evaluate
 * @returns {boolean} - Eligibility status
 */
export function isDepartmentAllowed(departmentName) {
  if (!departmentName || typeof departmentName !== 'string') {
    return false;
  }
  
  const normalisedName = departmentName.trim().toLowerCase();
  
  // Return false for empty strings after trimming
  if (normalisedName === '') {
    return false;
  }
  
  return !EXCLUDED_DEPARTMENTS.includes(normalisedName);
}

/**
 * Filters users to exclude ineligible departments and admin roles
 * @param {Array} users - User array to filter
 * @returns {Array} - Eligible users only
 */
export function filterLeaderboardEligibleUsers(users) {
  if (!Array.isArray(users)) {
    return [];
  }
  
  return users.filter(user => {
    if (!user || !user.department) return false;
    if (user.role === 'admin') return false;
    return isDepartmentAllowed(user.department);
  });
}

/**
 * Validates user leaderboard eligibility with detailed feedback
 * @param {Object} userData - User data to validate
 * @returns {Object} - Eligibility result with reasoning
 */
export function validateUserLeaderboardEligibility(userData) {
  if (!userData) {
    return { eligible: false, reason: 'User information required' };
  }
  
  if (userData.role === 'admin') {
    return { 
      eligible: false, 
      reason: 'Administrative staff are excluded from leaderboard participation' 
    };
  }
  
  if (!isDepartmentAllowed(userData.department)) {
    return { 
      eligible: false, 
      reason: 'HR and Management departments are excluded to maintain fairness' 
    };
  }
  
  return { 
    eligible: true, 
    reason: 'User meets all requirements for leaderboard participation' 
  };
} 