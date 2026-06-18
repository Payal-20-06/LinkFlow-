export const validators = {
  required: (value) => {
    if (!value || !String(value).trim()) return 'This field is required.';
    return null;
  },

  email: (value) => {
    if (!value) return 'Email is required.';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) return 'Please enter a valid email address.';
    return null;
  },

  password: (value) => {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number.';
    return null;
  },

  confirmPassword: (value, original) => {
    if (!value) return 'Please confirm your password.';
    if (value !== original) return 'Passwords do not match.';
    return null;
  },

  url: (value) => {
    if (!value) return 'URL is required.';
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'URL must start with http:// or https://';
      }
      return null;
    } catch {
      return 'Please enter a valid URL (e.g. https://example.com).';
    }
  },

  minLength: (min) => (value) => {
    if (!value || value.length < min) return `Must be at least ${min} characters.`;
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) return `Must be no more than ${max} characters.`;
    return null;
  },

  slug: (value) => {
    if (!value) return null;
    const re = /^[a-z0-9-_]+$/;
    if (!re.test(value)) return 'Slug can only contain lowercase letters, numbers, hyphens, and underscores.';
    return null;
  },
};

export const validateForm = (fields, rules) => {
  const errors = {};
  Object.keys(rules).forEach((key) => {
    const fieldRules = Array.isArray(rules[key]) ? rules[key] : [rules[key]];
    for (const rule of fieldRules) {
      const error = rule(fields[key], fields);
      if (error) {
        errors[key] = error;
        break;
      }
    }
  });
  return errors;
};
