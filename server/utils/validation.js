export const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateBookingTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  
  if (start < now) {
    return { valid: false, error: 'Start time cannot be in the past' };
  }
  
  if (end <= start) {
    return { valid: false, error: 'End time must be after start time' };
  }
  
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 1) {
    return { valid: false, error: 'Minimum booking duration is 1 hour' };
  }
  
  // Maximum booking duration: 6 months (4320 hours)
  const maxHours = 6 * 30 * 24; // 4320 hours = 6 months
  if (diffHours > maxHours) {
    return { valid: false, error: `Maximum booking duration is ${maxHours} hours (6 months)` };
  }
  
  return { valid: true, hours: diffHours };
};

