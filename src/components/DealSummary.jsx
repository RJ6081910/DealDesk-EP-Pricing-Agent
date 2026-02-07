import { Building2, Users, Briefcase, Calendar } from 'lucide-react';
import ProductLineItem from './ProductLineItem';
import DiscountRow from './DiscountRow';
import ApprovalBadge from './ApprovalBadge';

const DealSummary = ({ dealState, formatCurrency, settings }) => {
  const { customer, products, term, pricing, approvals } = dealState;

  const hasData = customer || products.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
        <div className="px-3 py-2 border-b border-gray-200 bg-white">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5" />
            Deal Summary
          </h2>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center text-gray-400 h-[calc(100%-40px)]">
          <Briefcase className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-xs">Deal details will appear here as you describe your deal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5" />
          Deal Summary
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 chat-scrollbar">
        {/* Customer Info */}
        {customer && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</h3>
            <div className="grid grid-cols-2 gap-3">
              {customer.name && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-800">{customer.name}</span>
                </div>
              )}
              {customer.employees && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{customer.employees.toLocaleString()} employees</span>
                </div>
              )}
              {customer.segment && (
                <div className="text-sm">
                  <span className="text-gray-500">Segment:</span>{' '}
                  <span className="font-medium text-gray-800">{customer.segment}</span>
                </div>
              )}
              {customer.dealType && (
                <div className="text-sm">
                  <span className="text-gray-500">Type:</span>{' '}
                  <span className={`font-medium ${customer.dealType === 'New Business' ? 'text-green-600' : 'text-blue-600'}`}>
                    {customer.dealType}
                  </span>
                </div>
              )}
              {customer.industry && (
                <div className="text-sm col-span-2">
                  <span className="text-gray-500">Industry:</span>{' '}
                  <span className="font-medium text-gray-800">{customer.industry}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {pricing?.lineItems && pricing.lineItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium pb-2 border-b border-gray-200">
                <span>Product</span>
                <div className="flex items-center gap-4">
                  <span className="w-16 text-center">Qty</span>
                  <span className="w-20 text-right">Unit</span>
                  <span className="w-24 text-right">Total</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {pricing.lineItems.map((product, index) => (
                  <ProductLineItem key={index} product={product} formatCurrency={formatCurrency} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contract Term */}
        {term > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Contract Term:</span>
            <span className="font-medium text-gray-800">{term} years</span>
          </div>
        )}

        {/* Pricing Summary */}
        {pricing && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">{formatCurrency(pricing.subtotal)}</span>
              </div>

              {/* Discounts */}
              <div className="border-t border-gray-200 pt-2 space-y-1">
                {pricing.discounts.volume?.amount > 0 && (
                  <DiscountRow
                    label="Volume Discount"
                    amount={pricing.discounts.volume.amount}
                    formatCurrency={formatCurrency}
                  />
                )}
                {pricing.discounts.bundle?.amount > 0 && (
                  <DiscountRow
                    label="Bundle Discount"
                    rate={pricing.discounts.bundle.rate}
                    amount={pricing.discounts.bundle.amount}
                    reason={pricing.discounts.bundle.reason}
                    formatCurrency={formatCurrency}
                  />
                )}
                {pricing.discounts.term?.amount > 0 && (
                  <DiscountRow
                    label="Multi-Year Discount"
                    rate={pricing.discounts.term.rate}
                    amount={pricing.discounts.term.amount}
                    reason={pricing.discounts.term.reason}
                    formatCurrency={formatCurrency}
                  />
                )}
                {pricing.discounts.special?.map((discount, index) => (
                  <DiscountRow
                    key={index}
                    label={discount.name}
                    rate={discount.rate}
                    amount={discount.amount}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>

              {/* Total Discount */}
              {pricing.totalDiscountRate > 0 && (
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Total Discount</span>
                  <span className="font-medium text-green-600">
                    {(pricing.totalDiscountRate * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              {/* ACV and TCV */}
              <div className="border-t border-gray-200 pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-800">Annual Contract Value</span>
                  <span className="font-bold text-[#0A66C2]">{formatCurrency(pricing.finalACV)}</span>
                </div>
                {term > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-800">Total Contract Value ({term}yr)</span>
                    <span className="font-bold text-[#0A66C2]">{formatCurrency(pricing.finalTCV)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approvals */}
        {approvals && approvals.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Required Approvals</h3>
            <div className="space-y-2">
              {approvals.map((approval, index) => (
                <ApprovalBadge key={index} approval={approval} />
              ))}
            </div>
          </div>
        )}

        {/* Auto-approve indicator */}
        {pricing && approvals?.length === 0 && pricing.totalDiscountRate <= (settings?.approvalThresholds?.discount?.[0]?.maxDiscount ? settings.approvalThresholds.discount[0].maxDiscount / 100 : 0.15) && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Within auto-approval threshold</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealSummary;
