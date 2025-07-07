import DOMPurify from 'dompurify';
import validator from 'validator';

// XSS Protection
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  });
};

export const sanitizeText = (text: string): string => {
  return text.replace(/<[^>]*>/g, '').trim();
};

export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Input Validation
export const validation = {
  email: (email: string): boolean => {
    return validator.isEmail(email);
  },

  url: (url: string): boolean => {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
    });
  },

  strongPassword: (password: string): boolean => {
    return validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });
  },

  taskTitle: (title: string): boolean => {
    if (!title || title.trim().length === 0) return false;
    if (title.length > 200) return false;
    // Check for malicious patterns
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i,
      /onclick/i,
    ];
    return !maliciousPatterns.some(pattern => pattern.test(title));
  },

  taskDescription: (description: string): boolean => {
    if (description.length > 5000) return false;
    // Allow basic HTML but check for XSS
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i,
      /onclick/i,
    ];
    return !maliciousPatterns.some(pattern => pattern.test(description));
  },

  fileName: (fileName: string): boolean => {
    // Check for directory traversal and malicious file names
    const maliciousPatterns = [
      /\.\./,
      /\//,
      /\\/,
      /\0/,
      /<script/i,
    ];
    return !maliciousPatterns.some(pattern => pattern.test(fileName)) 
           && fileName.length <= 255;
  },

  jsonData: (data: string): boolean => {
    try {
      JSON.parse(data);
      return data.length <= 1000000; // 1MB limit
    } catch {
      return false;
    }
  },
};

// CSRF Protection
export const csrfProtection = {
  generateToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  validateToken: (token: string, storedToken: string): boolean => {
    return token === storedToken && token.length === 64;
  },

  getStoredToken: (): string | null => {
    return sessionStorage.getItem('csrf_token');
  },

  setStoredToken: (token: string): void => {
    sessionStorage.setItem('csrf_token', token);
  },
};

// Content Security Policy helpers
export const cspViolationHandler = (event: SecurityPolicyViolationEvent) => {
  console.error('CSP Violation:', {
    blockedURI: event.blockedURI,
    violatedDirective: event.violatedDirective,
    originalPolicy: event.originalPolicy,
    documentURI: event.documentURI,
    lineNumber: event.lineNumber,
    columnNumber: event.columnNumber,
  });

  // Report to monitoring service
  if (window.fetch) {
    fetch('/api/csp-violation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        documentURI: event.documentURI,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail
    });
  }
};

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        integrity: generateIntegrityHash(value),
      });
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },

  getItem: <T>(key: string): T | null => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      // Verify integrity
      if (!verifyIntegrityHash(parsed.data, parsed.integrity)) {
        console.warn('Data integrity check failed for key:', key);
        localStorage.removeItem(key);
        return null;
      }

      // Check for expiration (optional)
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};

// Simple integrity hash (for demo purposes - use proper HMAC in production)
const generateIntegrityHash = (data: any): string => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

const verifyIntegrityHash = (data: any, hash: string): boolean => {
  return generateIntegrityHash(data) === hash;
};

// Rate limiting
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

// URL validation for external links
export const validateExternalUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Block localhost and private IPs in production
    if (import.meta.env.PROD) {
      const hostname = parsedUrl.hostname.toLowerCase();
      const privatePatterns = [
        /^localhost$/,
        /^127\./,
        /^192\.168\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^169\.254\./,
        /^::1$/,
        /^fc00:/,
        /^fe80:/,
      ];

      if (privatePatterns.some(pattern => pattern.test(hostname))) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

// Secure API client wrapper
export const secureApiClient = {
  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const csrfToken = csrfProtection.getStoredToken();
    
    const secureOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken || '',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      },
      credentials: 'same-origin',
      mode: 'cors',
    };

    // Add integrity check for POST/PUT requests
    if (options.body && ['POST', 'PUT', 'PATCH'].includes(options.method || 'GET')) {
      const bodyHash = await generateBodyHash(options.body);
      secureOptions.headers = {
        ...secureOptions.headers,
        'X-Content-Hash': bodyHash,
      };
    }

    const response = await fetch(url, secureOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};

// Generate hash for request body integrity
const generateBodyHash = async (body: BodyInit): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(typeof body === 'string' ? body : JSON.stringify(body));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};