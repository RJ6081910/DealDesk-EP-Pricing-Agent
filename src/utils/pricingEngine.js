export const DISCOUNT_MATRIX = {
  // Volume tiers (by seat count)
  volumeTiers: {
    salesNavigator: [
      { min: 1, max: 9, discount: 0 },
      { min: 10, max: 24, discount: 0.05 },
      { min: 25, max: 49, discount: 0.10 },
      { min: 50, max: 99, discount: 0.15 },
      { min: 100, max: 249, discount: 0.20 },
      { min: 250, max: 499, discount: 0.25 },
      { min: 500, max: Infinity, discount: 0.30 }
    ],
    recruiter: [
      { min: 1, max: 4, discount: 0 },
      { min: 5, max: 9, discount: 0.05 },
      { min: 10, max: 24, discount: 0.10 },
      { min: 25, max: 49, discount: 0.15 },
      { min: 50, max: Infinity, discount: 0.20 }
    ],
    learning: [
      { min: 1, max: 499, discount: 0 },
      { min: 500, max: 999, discount: 0.10 },
      { min: 1000, max: 4999, discount: 0.15 },
      { min: 5000, max: Infinity, discount: 0.25 }
    ]
  },

  // Multi-year discounts
  termDiscounts: {
    1: 0,
    2: 0.05,
    3: 0.08
  },

  // Bundle discounts (multiple product lines)
  bundleDiscounts: {
    1: 0,
    2: 0.05,
    3: 0.10,
    4: 0.15
  },

  // Special discounts (require approval)
  specialDiscounts: {
    competitiveDisplacement: {
      id: 'competitiveDisplacement',
      name: 'Competitive Displacement',
      max: 0.15,
      requiresApproval: true,
      approver: 'Deal Desk Manager'
    },
    strategicAccount: {
      id: 'strategicAccount',
      name: 'Strategic Account',
      max: 0.20,
      requiresApproval: true,
      approver: 'Sales VP'
    },
    yearEndClose: {
      id: 'yearEndClose',
      name: 'Year-End Close',
      max: 0.10,
      requiresApproval: false,
      validQuarters: ['Q4']
    }
  }
};

export const getVolumeDiscount = (productCategory, quantity, settingsVolumeDiscounts) => {
  // Use settings discounts if provided (whole-number % → decimal)
  if (settingsVolumeDiscounts && settingsVolumeDiscounts[productCategory]) {
    const tiers = settingsVolumeDiscounts[productCategory];
    const tier = tiers.find(t => quantity >= t.min && quantity <= t.max);
    return tier ? tier.discount / 100 : 0;
  }
  // Fallback to hardcoded defaults
  const tiers = DISCOUNT_MATRIX.volumeTiers[productCategory];
  if (!tiers) return 0;
  const tier = tiers.find(t => quantity >= t.min && quantity <= t.max);
  return tier ? tier.discount : 0;
};

export const getTermDiscount = (years, settingsTermDiscounts) => {
  // Use settings discounts if provided (whole-number % → decimal)
  if (settingsTermDiscounts) {
    const discount = settingsTermDiscounts[years];
    return discount != null ? discount / 100 : 0;
  }
  return DISCOUNT_MATRIX.termDiscounts[years] || 0;
};

export const getBundleDiscount = (productLineCount, settingsBundleDiscounts) => {
  // Use settings discounts if provided (whole-number % → decimal)
  if (settingsBundleDiscounts) {
    if (productLineCount >= 4) {
      const discount = settingsBundleDiscounts[4];
      return discount != null ? discount / 100 : 0;
    }
    const discount = settingsBundleDiscounts[productLineCount];
    return discount != null ? discount / 100 : 0;
  }
  if (productLineCount >= 4) return DISCOUNT_MATRIX.bundleDiscounts[4];
  return DISCOUNT_MATRIX.bundleDiscounts[productLineCount] || 0;
};

export const calculateDealPricing = (products, term, specialDiscounts = [], settings = null) => {
  // Calculate line item totals
  let subtotal = 0;
  const lineItems = products.map(product => {
    const lineTotal = product.unitPrice * product.quantity;
    subtotal += lineTotal;
    return {
      ...product,
      lineTotal
    };
  });

  // Count unique product categories for bundle discount
  const uniqueCategories = new Set(products.map(p => p.category));
  const bundleDiscountRate = getBundleDiscount(uniqueCategories.size, settings?.bundleDiscounts);
  const bundleDiscount = subtotal * bundleDiscountRate;

  // Calculate volume discounts per line
  let volumeDiscountTotal = 0;
  lineItems.forEach(item => {
    if (item.productCategory) {
      const volumeRate = getVolumeDiscount(item.productCategory, item.quantity, settings?.volumeDiscounts);
      item.volumeDiscount = item.lineTotal * volumeRate;
      item.volumeDiscountRate = volumeRate;
      volumeDiscountTotal += item.volumeDiscount;
    }
  });

  // Apply term discount
  const afterVolumeAndBundle = subtotal - volumeDiscountTotal - bundleDiscount;
  const termDiscountRate = getTermDiscount(term, settings?.termDiscounts);
  const termDiscount = afterVolumeAndBundle * termDiscountRate;

  // Calculate special discounts (from AI deal updates — policy-defined or standard)
  let specialDiscountTotal = 0;
  const appliedSpecialDiscounts = [];
  specialDiscounts.forEach(sd => {
    if (sd.rate && sd.rate > 0) {
      const knownInfo = DISCOUNT_MATRIX.specialDiscounts[sd.type];
      const name = sd.name || knownInfo?.name || sd.type || 'Special Discount';
      const amount = (afterVolumeAndBundle - termDiscount) * sd.rate;
      specialDiscountTotal += amount;
      appliedSpecialDiscounts.push({
        name,
        rate: sd.rate,
        amount,
        requiresApproval: knownInfo?.requiresApproval ?? true,
        approver: knownInfo?.approver || 'Deal Desk',
      });
    }
  });

  // Calculate totals (cap total discount at subtotal so ACV never goes negative)
  const totalDiscount = Math.min(volumeDiscountTotal + bundleDiscount + termDiscount + specialDiscountTotal, subtotal);
  const totalDiscountRate = subtotal > 0 ? totalDiscount / subtotal : 0;
  const finalACV = subtotal - totalDiscount;
  const finalTCV = finalACV * term;

  return {
    lineItems,
    subtotal,
    discounts: {
      volume: { amount: volumeDiscountTotal },
      bundle: { rate: bundleDiscountRate, amount: bundleDiscount, reason: `${uniqueCategories.size} product lines` },
      term: { rate: termDiscountRate, amount: termDiscount, reason: `${term}-year commitment` },
      special: appliedSpecialDiscounts
    },
    totalDiscount,
    totalDiscountRate,
    finalACV,
    finalTCV,
    term
  };
};
