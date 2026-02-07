export const APPROVAL_THRESHOLDS = {
  // Discount levels
  discountApprovals: [
    { maxDiscount: 0.15, approver: 'Sales Manager', sla: 'Same day', level: 1 },
    { maxDiscount: 0.25, approver: 'Deal Desk', sla: '1 business day', level: 2 },
    { maxDiscount: 0.35, approver: 'Deal Desk Manager', sla: '2 business days', level: 3 },
    { maxDiscount: 0.40, approver: 'Sales VP', sla: '3 business days', level: 4 },
    { maxDiscount: 1.00, approver: 'CFO', sla: '5 business days', level: 5 }
  ],

  // Deal size (TCV)
  sizeApprovals: [
    { maxTCV: 50000, approver: 'Sales Manager', level: 1 },
    { maxTCV: 200000, approver: 'Deal Desk', level: 2 },
    { maxTCV: 500000, approver: 'Finance', level: 3 },
    { maxTCV: 1000000, approver: 'Finance Director', level: 4 },
    { maxTCV: Infinity, approver: 'CFO', level: 5 }
  ],

  // Non-standard terms
  nonStandardApprovals: {
    customPaymentTerms: { approver: 'Finance', level: 3 },
    customSLA: { approver: 'Legal', level: 3 },
    customDataTerms: { approver: 'Legal + Security', level: 4 },
    pilotProgram: { approver: 'Deal Desk Manager', level: 3 }
  }
};

export const getDiscountApproval = (discountRate, settingsThresholds) => {
  // Use settings thresholds if provided (whole-number % → decimal)
  if (settingsThresholds?.discount) {
    const approval = settingsThresholds.discount.find(
      a => discountRate <= (a.maxDiscount / 100)
    );
    if (approval) {
      return {
        ...approval,
        maxDiscount: approval.maxDiscount / 100,
        level: settingsThresholds.discount.indexOf(approval) + 1
      };
    }
    // Over all thresholds
    return { approver: 'CFO', sla: '5 business days', level: settingsThresholds.discount.length + 1 };
  }
  // Fallback to hardcoded
  const approval = APPROVAL_THRESHOLDS.discountApprovals.find(
    a => discountRate <= a.maxDiscount
  );
  return approval || APPROVAL_THRESHOLDS.discountApprovals[APPROVAL_THRESHOLDS.discountApprovals.length - 1];
};

export const getSizeApproval = (tcv, settingsThresholds) => {
  // Use settings thresholds if provided
  if (settingsThresholds?.tcv) {
    const approval = settingsThresholds.tcv.find(a => tcv <= a.maxTCV);
    if (approval) {
      return {
        ...approval,
        level: settingsThresholds.tcv.indexOf(approval) + 1
      };
    }
    // Over all thresholds
    return { approver: 'CFO', level: settingsThresholds.tcv.length + 1 };
  }
  // Fallback to hardcoded
  const approval = APPROVAL_THRESHOLDS.sizeApprovals.find(
    a => tcv <= a.maxTCV
  );
  return approval || APPROVAL_THRESHOLDS.sizeApprovals[APPROVAL_THRESHOLDS.sizeApprovals.length - 1];
};

export const getRequiredApprovals = (discountRate, tcv, nonStandardTerms = [], settings = null) => {
  const approvals = [];
  const settingsThresholds = settings?.approvalThresholds;

  // Check discount threshold
  const discountApproval = getDiscountApproval(discountRate, settingsThresholds);
  if (discountApproval.level > 1) {
    approvals.push({
      type: 'Discount',
      approver: discountApproval.approver,
      sla: discountApproval.sla,
      reason: `Discount of ${(discountRate * 100).toFixed(1)}%`,
      level: discountApproval.level
    });
  }

  // Check TCV threshold
  const sizeApproval = getSizeApproval(tcv, settingsThresholds);
  if (sizeApproval.level > 1) {
    approvals.push({
      type: 'Deal Size',
      approver: sizeApproval.approver,
      sla: 'Standard review',
      reason: `TCV of $${tcv.toLocaleString()}`,
      level: sizeApproval.level
    });
  }

  // Check non-standard terms
  nonStandardTerms.forEach(term => {
    const termApproval = APPROVAL_THRESHOLDS.nonStandardApprovals[term];
    if (termApproval) {
      approvals.push({
        type: 'Non-Standard Terms',
        approver: termApproval.approver,
        sla: 'Case-by-case',
        reason: term.replace(/([A-Z])/g, ' $1').trim(),
        level: termApproval.level
      });
    }
  });

  // Deduplicate by highest level for each approver
  const uniqueApprovals = [];
  const seenApprovers = new Set();

  // Sort by level descending to keep highest
  approvals.sort((a, b) => b.level - a.level);

  approvals.forEach(approval => {
    if (!seenApprovers.has(approval.approver)) {
      seenApprovers.add(approval.approver);
      uniqueApprovals.push(approval);
    }
  });

  return uniqueApprovals.sort((a, b) => b.level - a.level);
};

export const getApprovalStatus = (discountRate, settingsThresholds) => {
  const autoApproveThreshold = settingsThresholds?.discount?.[0]?.maxDiscount
    ? settingsThresholds.discount[0].maxDiscount / 100
    : 0.15;
  const escalationThreshold = settingsThresholds?.discount?.[1]?.maxDiscount
    ? settingsThresholds.discount[1].maxDiscount / 100
    : 0.25;

  if (discountRate <= autoApproveThreshold) return { status: 'auto', color: 'green', label: 'Auto-Approved' };
  if (discountRate <= escalationThreshold) return { status: 'pending', color: 'amber', label: 'Requires Approval' };
  return { status: 'escalation', color: 'red', label: 'Escalation Required' };
};
