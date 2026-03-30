// ===== PASSWORD VALIDATION =====
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`At least ${PASSWORD_RULES.minLength} characters`);
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter');
  }
  if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(password)) {
    errors.push('At least one number');
  }
  if (PASSWORD_RULES.requireSymbol && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push('At least one symbol (!@#$%^&*...)');
  }
  return errors;
};

export const isPasswordValid = (password) => validatePassword(password).length === 0;

export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
    password.length >= 12,
  ];
  const passed = checks.filter(Boolean).length;
  if (passed <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
  if (passed <= 3) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
  if (passed <= 4) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
  if (passed <= 5) return { level: 4, label: 'Strong', color: 'bg-green-500' };
  return { level: 5, label: 'Excellent', color: 'bg-emerald-500' };
};

// ===== DATE OF BIRTH VALIDATION =====
export const validateDateOfBirth = (day, month, year) => {
  const errors = [];
  const d = parseInt(day);
  const m = parseInt(month);
  const y = parseInt(year);

  if (!day || !month || !year) {
    errors.push('Complete date of birth is required');
    return errors;
  }

  if (isNaN(d) || d < 1 || d > 31) {
    errors.push('Day must be between 1 and 31');
  }
  if (isNaN(m) || m < 1 || m > 12) {
    errors.push('Month must be between 1 and 12');
  }
  if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) {
    errors.push('Year must be between 1900 and ' + new Date().getFullYear());
  }

  if (errors.length > 0) return errors;

  // Check valid day for the month
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d > daysInMonth) {
    errors.push(`${getMonthName(m)} only has ${daysInMonth} days`);
  }

  // Check age >= 18
  const today = new Date();
  const birthDate = new Date(y, m - 1, d);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 18) {
    errors.push('You must be at least 18 years old');
  }
  if (age > 120) {
    errors.push('Please enter a valid date of birth');
  }

  return errors;
};

const getMonthName = (m) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
  return months[m - 1] || '';
};

// ===== PHONE NUMBER VALIDATION BY COUNTRY =====
export const COUNTRY_PHONE_CONFIG = {
  'Ghana': { code: '+233', length: 10, example: '0XX XXX XXXX', totalWithCode: 13 },
  'Nigeria': { code: '+234', length: 11, example: '0XXX XXX XXXX', totalWithCode: 14 },
  'USA': { code: '+1', length: 10, example: 'XXX XXX XXXX', totalWithCode: 12 },
  'United States': { code: '+1', length: 10, example: 'XXX XXX XXXX', totalWithCode: 12 },
  'UK': { code: '+44', length: 11, example: '0XXXX XXXXXX', totalWithCode: 13 },
  'United Kingdom': { code: '+44', length: 11, example: '0XXXX XXXXXX', totalWithCode: 13 },
  'South Africa': { code: '+27', length: 10, example: '0XX XXX XXXX', totalWithCode: 12 },
  'Kenya': { code: '+254', length: 10, example: '07XX XXXXXX', totalWithCode: 13 },
  'India': { code: '+91', length: 10, example: 'XXXXX XXXXX', totalWithCode: 13 },
  'China': { code: '+86', length: 11, example: 'XXX XXXX XXXX', totalWithCode: 14 },
  'Brazil': { code: '+55', length: 11, example: '(XX) XXXXX-XXXX', totalWithCode: 14 },
  'Australia': { code: '+61', length: 10, example: '04XX XXX XXX', totalWithCode: 12 },
  'Canada': { code: '+1', length: 10, example: 'XXX XXX XXXX', totalWithCode: 12 },
  'Germany': { code: '+49', length: 11, example: '0XXX XXXXXXX', totalWithCode: 14 },
  'France': { code: '+33', length: 10, example: '0X XX XX XX XX', totalWithCode: 12 },
  'Japan': { code: '+81', length: 11, example: '0X0 XXXX XXXX', totalWithCode: 13 },
  'Egypt': { code: '+20', length: 11, example: '01X XXXX XXXX', totalWithCode: 13 },
  'Mexico': { code: '+52', length: 10, example: 'XX XXXX XXXX', totalWithCode: 13 },
  'Italy': { code: '+39', length: 10, example: '3XX XXX XXXX', totalWithCode: 13 },
  'Spain': { code: '+34', length: 9, example: 'XXX XXX XXX', totalWithCode: 12 },
  'Netherlands': { code: '+31', length: 10, example: '06 XXXX XXXX', totalWithCode: 12 },
  'Switzerland': { code: '+41', length: 10, example: '07X XXX XX XX', totalWithCode: 12 },
  'Sweden': { code: '+46', length: 10, example: '07X XXX XX XX', totalWithCode: 12 },
  'Norway': { code: '+47', length: 8, example: 'XXX XX XXX', totalWithCode: 11 },
  'Denmark': { code: '+45', length: 8, example: 'XX XX XX XX', totalWithCode: 10 },
  'Poland': { code: '+48', length: 9, example: 'XXX XXX XXX', totalWithCode: 12 },
  'Turkey': { code: '+90', length: 11, example: '05XX XXX XXXX', totalWithCode: 13 },
  'Russia': { code: '+7', length: 11, example: '9XX XXX XXXX', totalWithCode: 12 },
  'Saudi Arabia': { code: '+966', length: 10, example: '05X XXX XXXX', totalWithCode: 13 },
  'United Arab Emirates': { code: '+971', length: 9, example: '05X XXX XXXX', totalWithCode: 13 },
  'Pakistan': { code: '+92', length: 11, example: '03XX XXXXXXX', totalWithCode: 13 },
  'Bangladesh': { code: '+880', length: 11, example: '01XXX XXXXXX', totalWithCode: 14 },
  'Philippines': { code: '+63', length: 11, example: '09XX XXX XXXX', totalWithCode: 13 },
  'Indonesia': { code: '+62', length: 12, example: '08XX XXXX XXXX', totalWithCode: 15 },
  'Thailand': { code: '+66', length: 10, example: '08X XXX XXXX', totalWithCode: 12 },
  'Malaysia': { code: '+60', length: 10, example: '01X XXXX XXXX', totalWithCode: 12 },
  'Singapore': { code: '+65', length: 8, example: 'XXXX XXXX', totalWithCode: 11 },
  'New Zealand': { code: '+64', length: 10, example: '02X XXXX XXXX', totalWithCode: 12 },
  'Argentina': { code: '+54', length: 11, example: '11 XXXX XXXX', totalWithCode: 14 },
  'Colombia': { code: '+57', length: 10, example: '3XX XXX XXXX', totalWithCode: 13 },
  'Chile': { code: '+56', length: 9, example: '9 XXXX XXXX', totalWithCode: 12 },
  'Peru': { code: '+51', length: 9, example: '9XX XXX XXX', totalWithCode: 12 },
  'Uganda': { code: '+256', length: 10, example: '07XX XXXXXX', totalWithCode: 13 },
  'Tanzania': { code: '+255', length: 10, example: '07XX XXXXXX', totalWithCode: 13 },
  'Ethiopia': { code: '+251', length: 10, example: '09XX XXXXXX', totalWithCode: 13 },
  'Cameroon': { code: '+237', length: 9, example: '6XX XXX XXX', totalWithCode: 13 },
  'Ivory Coast': { code: '+225', length: 10, example: '07 XX XX XX XX', totalWithCode: 14 },
  'Senegal': { code: '+221', length: 9, example: '7X XXX XX XX', totalWithCode: 13 },
  'Rwanda': { code: '+250', length: 10, example: '07XX XXXXXX', totalWithCode: 13 },
  'Morocco': { code: '+212', length: 10, example: '06XX XXXXXX', totalWithCode: 13 },
  'Algeria': { code: '+213', length: 10, example: '05XX XXXXXX', totalWithCode: 13 },
  'Tunisia': { code: '+216', length: 8, example: 'XX XXX XXX', totalWithCode: 12 },
};

export const validatePhoneNumber = (phone, country) => {
  const errors = [];
  if (!phone) {
    errors.push('Phone number is required');
    return errors;
  }

  // Strip spaces, dashes, parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  const config = COUNTRY_PHONE_CONFIG[country];
  if (!config) {
    // For countries not in detailed list, just check basic format
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      errors.push('Phone number must be between 7 and 15 digits');
    }
    if (!/^\+?[0-9]+$/.test(cleanPhone)) {
      errors.push('Phone number must contain only digits and optionally start with +');
    }
    return errors;
  }

  // Check if it starts with country code or is local format
  const hasCountryCode = cleanPhone.startsWith(config.code) || cleanPhone.startsWith('+');
  
  if (hasCountryCode) {
    // With country code
    if (cleanPhone.startsWith(config.code)) {
      const digitsAfterCode = cleanPhone.substring(config.code.length);
      const expectedLocal = config.length - 1; // minus the leading 0
      if (digitsAfterCode.length < expectedLocal - 1 || digitsAfterCode.length > expectedLocal + 1) {
        errors.push(`${country} phone numbers should be ${config.length} digits (e.g., ${config.example}) or ${config.code}XXXXXXXXX`);
      }
    }
  } else {
    // Local format
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length !== config.length) {
      errors.push(`${country} phone numbers must be exactly ${config.length} digits (e.g., ${config.example})`);
    }
  }

  if (!/^\+?[0-9]+$/.test(cleanPhone)) {
    errors.push('Phone number must contain only digits and optionally start with +');
  }

  return errors;
};

export const getPhoneHint = (country) => {
  const config = COUNTRY_PHONE_CONFIG[country];
  if (!config) return '';
  return `${config.code} • ${config.length} digits • e.g. ${config.example}`;
};
