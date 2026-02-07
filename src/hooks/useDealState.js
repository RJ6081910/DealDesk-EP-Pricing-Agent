import { useState, useCallback } from 'react';
import { calculateDealPricing } from '../utils/pricingEngine';
import { getRequiredApprovals } from '../utils/approvalMatrix';

const initialDealState = {
  customer: null,
  products: [],
  term: 1,
  specialDiscounts: [],
  pricing: null,
  approvals: []
};

export const useDealState = (settings) => {
  const [dealState, setDealState] = useState(initialDealState);

  const updateDeal = useCallback((update) => {
    setDealState(prev => {
      const newState = {
        ...prev,
        ...update,
        customer: update.customer ? { ...prev.customer, ...update.customer } : prev.customer,
        products: update.products || prev.products,
        term: update.term ?? prev.term,
        specialDiscounts: update.specialDiscounts || prev.specialDiscounts
      };

      // Recalculate pricing if we have products
      if (newState.products.length > 0) {
        const pricing = calculateDealPricing(
          newState.products,
          newState.term,
          newState.specialDiscounts,
          settings
        );

        const approvals = getRequiredApprovals(
          pricing.totalDiscountRate,
          pricing.finalTCV,
          [],
          settings
        );

        return {
          ...newState,
          pricing,
          approvals
        };
      }

      return newState;
    });
  }, [settings]);

  const resetDeal = useCallback(() => {
    setDealState(initialDealState);
  }, []);

  const hasDealData = dealState.customer || dealState.products.length > 0;

  return {
    dealState,
    updateDeal,
    resetDeal,
    hasDealData
  };
};
