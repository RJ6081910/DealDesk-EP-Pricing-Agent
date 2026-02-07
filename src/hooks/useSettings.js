import { useState, useEffect, useCallback } from 'react';

const DEFAULT_SETTINGS = {
  products: {
    salesNavigator: {
      core: { name: 'Sales Navigator Core', listPrice: 960, minSeats: 1, enabled: true },
      advanced: { name: 'Sales Navigator Advanced', listPrice: 1500, minSeats: 5, enabled: true },
      advancedPlus: { name: 'Sales Navigator Advanced Plus', listPrice: 1800, minSeats: 10, enabled: true }
    },
    recruiter: {
      lite: { name: 'Recruiter Lite', listPrice: 1680, minSeats: 1, enabled: true },
      corporate: { name: 'Recruiter Corporate', listPrice: 8500, minSeats: 1, enabled: true }
    },
    jobSlots: {
      standard: { name: 'Job Slots', listPrice: 3600, minSlots: 1, enabled: true }
    },
    careerPage: {
      standard: { name: 'Career Page', listPrice: 5000, enabled: true }
    },
    learning: {
      standard: { name: 'LinkedIn Learning', listPrice: 85, minUsers: 100, enabled: true }
    }
  },
  volumeDiscounts: {
    salesNavigator: [
      { min: 1, max: 9, discount: 0 },
      { min: 10, max: 24, discount: 5 },
      { min: 25, max: 49, discount: 10 },
      { min: 50, max: 99, discount: 15 },
      { min: 100, max: 249, discount: 20 },
      { min: 250, max: 499, discount: 25 },
      { min: 500, max: 999999, discount: 30 }
    ],
    recruiter: [
      { min: 1, max: 4, discount: 0 },
      { min: 5, max: 9, discount: 5 },
      { min: 10, max: 24, discount: 10 },
      { min: 25, max: 49, discount: 15 },
      { min: 50, max: 999999, discount: 20 }
    ],
    learning: [
      { min: 1, max: 499, discount: 0 },
      { min: 500, max: 999, discount: 10 },
      { min: 1000, max: 4999, discount: 15 },
      { min: 5000, max: 999999, discount: 25 }
    ]
  },
  termDiscounts: {
    1: 0,
    2: 5,
    3: 8
  },
  bundleDiscounts: {
    1: 0,
    2: 5,
    3: 10,
    4: 15
  },
  approvalThresholds: {
    discount: [
      { maxDiscount: 15, approver: 'Sales Manager', sla: 'Same day' },
      { maxDiscount: 25, approver: 'Deal Desk', sla: '1 business day' },
      { maxDiscount: 35, approver: 'Deal Desk Manager', sla: '2 business days' },
      { maxDiscount: 45, approver: 'Sales VP', sla: '3 business days' }
    ],
    tcv: [
      { maxTCV: 100000, approver: 'Sales Manager' },
      { maxTCV: 250000, approver: 'Deal Desk' },
      { maxTCV: 500000, approver: 'Finance' },
      { maxTCV: 1000000, approver: 'Sales VP' }
    ]
  },
  policyText: ''
};

const STORAGE_KEY = 'ep-pricing-agent-settings';

const deepMerge = (defaults, saved) => {
  const result = { ...defaults };
  for (const key of Object.keys(saved)) {
    if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])
        && defaults[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      result[key] = deepMerge(defaults[key], saved[key]);
    } else {
      result[key] = saved[key];
    }
  }
  return result;
};

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed.currency;
        return deepMerge(DEFAULT_SETTINGS, parsed);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const formatCurrency = useCallback((amountUSD) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amountUSD);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    formatCurrency,
    DEFAULT_SETTINGS
  };
};
