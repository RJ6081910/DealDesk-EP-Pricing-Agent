const DiscountRow = ({ label, rate, amount, reason, formatCurrency }) => {
  if (!amount || amount === 0) return null;

  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">{label}</span>
        {rate > 0 && (
          <span className="text-xs text-gray-500">({(rate * 100).toFixed(0)}%)</span>
        )}
        {reason && (
          <span className="text-xs text-gray-400">- {reason}</span>
        )}
      </div>
      <span className="text-green-600 font-medium">-{formatCurrency(amount)}</span>
    </div>
  );
};

export default DiscountRow;
