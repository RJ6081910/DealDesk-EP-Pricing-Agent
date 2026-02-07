const ProductLineItem = ({ product, formatCurrency }) => {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <div className="flex-1">
        <span className="font-medium text-gray-800">{product.name}</span>
        {product.volumeDiscountRate > 0 && (
          <span className="ml-2 text-xs text-green-600">
            (-{(product.volumeDiscountRate * 100).toFixed(0)}% vol)
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 text-gray-600">
        <span className="w-10 sm:w-16 text-center">{product.quantity}</span>
        <span className="w-16 sm:w-20 text-right hidden sm:inline">{formatCurrency(product.unitPrice)}</span>
        <span className="w-16 sm:w-24 text-right font-medium text-gray-800">
          {formatCurrency(product.lineTotal)}
        </span>
      </div>
    </div>
  );
};

export default ProductLineItem;
