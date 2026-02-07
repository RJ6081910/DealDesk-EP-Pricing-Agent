export const PRODUCT_CATALOG = {
  // SALES SOLUTIONS
  salesNavigator: {
    core: {
      id: 'salesNavigator.core',
      name: 'Sales Navigator Core',
      listPrice: 960,
      minSeats: 1,
      description: 'Individual prospecting',
      category: 'Sales Solutions'
    },
    advanced: {
      id: 'salesNavigator.advanced',
      name: 'Sales Navigator Advanced',
      listPrice: 1500,
      minSeats: 5,
      description: 'Team collaboration, Smart Links',
      category: 'Sales Solutions'
    },
    advancedPlus: {
      id: 'salesNavigator.advancedPlus',
      name: 'Sales Navigator Advanced Plus',
      listPrice: 1800,
      minSeats: 10,
      description: 'CRM integration, enterprise features',
      category: 'Sales Solutions'
    }
  },

  // TALENT SOLUTIONS (HEP)
  recruiter: {
    lite: {
      id: 'recruiter.lite',
      name: 'Recruiter Lite',
      listPrice: 1680,
      minSeats: 1,
      description: 'Basic recruiting',
      category: 'Hiring Solutions'
    },
    corporate: {
      id: 'recruiter.corporate',
      name: 'Recruiter Corporate',
      listPrice: 8500,
      minSeats: 1,
      description: 'Full recruiting suite',
      category: 'Hiring Solutions'
    }
  },
  jobSlots: {
    standard: {
      id: 'jobSlots.standard',
      name: 'Job Slots',
      listPrice: 3600, // per slot/year (300/month * 12)
      minSlots: 1,
      description: 'Active job postings',
      category: 'Hiring Solutions'
    }
  },
  careerPage: {
    standard: {
      id: 'careerPage.standard',
      name: 'Career Page',
      listPrice: 5000,
      description: 'Branded career page',
      category: 'Hiring Solutions'
    }
  },

  // LEARNING
  learning: {
    standard: {
      id: 'learning.standard',
      name: 'LinkedIn Learning',
      listPrice: 85,
      minUsers: 100,
      description: 'Full course library',
      category: 'Learning Solutions'
    }
  },

  // MARKETING
  marketing: {
    campaignManager: {
      id: 'marketing.campaignManager',
      name: 'Campaign Manager',
      description: 'Self-serve advertising',
      pricingModel: 'usage-based',
      category: 'Marketing Solutions'
    }
  }
};

export const getProductById = (id) => {
  const [category, tier] = id.split('.');
  return PRODUCT_CATALOG[category]?.[tier] || null;
};

export const getAllProducts = () => {
  const products = [];
  Object.entries(PRODUCT_CATALOG).forEach(([categoryKey, category]) => {
    Object.entries(category).forEach(([tierKey, product]) => {
      if (product.listPrice) {
        products.push(product);
      }
    });
  });
  return products;
};
