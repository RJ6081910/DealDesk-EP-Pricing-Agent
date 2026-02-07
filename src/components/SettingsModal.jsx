import { useState } from 'react';
import { X, Package, Percent, Users, DollarSign, RotateCcw, FileText, Info } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, settings, onUpdateSettings, onResetSettings }) => {
  const [activeTab, setActiveTab] = useState('products');

  if (!isOpen) return null;

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'volume', label: 'Volume Discounts', icon: Users },
    { id: 'terms', label: 'Term & Bundle', icon: Percent },
    { id: 'approvals', label: 'Approvals', icon: DollarSign },
    { id: 'policy', label: 'Policy', icon: FileText }
  ];

  const handleProductChange = (category, tier, field, value) => {
    const newProducts = { ...settings.products };
    newProducts[category] = { ...newProducts[category] };
    newProducts[category][tier] = { ...newProducts[category][tier], [field]: value };
    onUpdateSettings({ products: newProducts });
  };

  const handleVolumeDiscountChange = (category, index, field, value) => {
    const newDiscounts = { ...settings.volumeDiscounts };
    newDiscounts[category] = [...newDiscounts[category]];
    newDiscounts[category][index] = { ...newDiscounts[category][index], [field]: Number(value) };
    onUpdateSettings({ volumeDiscounts: newDiscounts });
  };

  const handleTermDiscountChange = (years, value) => {
    onUpdateSettings({
      termDiscounts: { ...settings.termDiscounts, [years]: Number(value) }
    });
  };

  const handleBundleDiscountChange = (count, value) => {
    onUpdateSettings({
      bundleDiscounts: { ...settings.bundleDiscounts, [count]: Number(value) }
    });
  };

  const handleApprovalChange = (type, index, field, value) => {
    const newThresholds = { ...settings.approvalThresholds };
    newThresholds[type] = [...newThresholds[type]];
    newThresholds[type][index] = {
      ...newThresholds[type][index],
      [field]: field.includes('max') ? Number(value) : value
    };
    onUpdateSettings({ approvalThresholds: newThresholds });
  };

  const handlePolicyChange = (value) => {
    onUpdateSettings({ policyText: value });
  };

  const formatTCVDisplay = (amount) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-content">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Deal Settings & Policy</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetSettings}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Product Catalog</h3>
                <p className="text-[10px] text-gray-500 mb-4">
                  Toggle products on/off, customize names, and set list prices (USD per seat/year).
                </p>
              </div>

              {Object.entries(settings.products).map(([category, tiers]) => (
                <div key={category}>
                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {Object.entries(tiers).map(([tier, product]) => (
                      <div
                        key={tier}
                        className={`flex items-center justify-between px-3 py-2.5 ${
                          !product.enabled ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <button
                            onClick={() => handleProductChange(category, tier, 'enabled', !product.enabled)}
                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors flex-shrink-0 ${
                              product.enabled ? 'bg-[#0A66C2]' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                                product.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleProductChange(category, tier, 'name', e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A66C2] bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 ml-3">
                          <span className="text-[10px] text-gray-400">$</span>
                          <input
                            type="number"
                            value={product.listPrice}
                            onChange={(e) => handleProductChange(category, tier, 'listPrice', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-200 rounded text-xs text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                          />
                          <span className="text-[10px] text-gray-400">/seat/yr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500">
                  Disabled products won't appear in deal recommendations. Price changes take effect in new conversations.
                </p>
              </div>
            </div>
          )}

          {/* Volume Discounts Tab */}
          {activeTab === 'volume' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Volume Discount Tiers</h3>
                <p className="text-[10px] text-gray-500 mb-4">
                  Set discount percentages based on seat count ranges for each product line.
                </p>
              </div>

              {Object.entries(settings.volumeDiscounts).map(([category, tiers]) => (
                <div key={category}>
                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_1fr_80px] gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">Min Seats</span>
                      <span className="text-[10px] text-gray-300 w-3 text-center">&mdash;</span>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">Max Seats</span>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase text-right">Discount</span>
                    </div>
                    {tiers.map((tier, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-[1fr_auto_1fr_80px] gap-2 px-3 py-2 items-center ${
                          index < tiers.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <input
                          type="number"
                          value={tier.min}
                          onChange={(e) => handleVolumeDiscountChange(category, index, 'min', e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                        />
                        <span className="text-gray-300 w-3 text-center text-xs">&ndash;</span>
                        <input
                          type="number"
                          value={tier.max}
                          onChange={(e) => handleVolumeDiscountChange(category, index, 'max', e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                        />
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={tier.discount}
                            onChange={(e) => handleVolumeDiscountChange(category, index, 'discount', e.target.value)}
                            className="w-12 px-1.5 py-1 border border-gray-200 rounded text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                          />
                          <span className="text-[10px] text-gray-400">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500">
                  Volume discounts are applied automatically based on the seat count in a deal. Higher tiers override lower ones.
                </p>
              </div>
            </div>
          )}

          {/* Term & Bundle Discounts Tab */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Multi-Year Term Discounts</h3>
                <p className="text-[10px] text-gray-500 mb-3">
                  Incentivize longer commitments with escalating discounts.
                </p>

                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {Object.entries(settings.termDiscounts).map(([years, discount]) => (
                    <div key={years} className="flex items-center justify-between px-3 py-2.5">
                      <span className="text-xs text-gray-700">{years}-year term</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => handleTermDiscountChange(years, e.target.value)}
                          className="w-14 px-2 py-1 border border-gray-200 rounded text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                        />
                        <span className="text-[10px] text-gray-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Product Bundle Discounts</h3>
                <p className="text-[10px] text-gray-500 mb-3">
                  Reward customers who purchase multiple product lines together.
                </p>

                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {Object.entries(settings.bundleDiscounts).map(([count, discount]) => (
                    <div key={count} className="flex items-center justify-between px-3 py-2.5">
                      <span className="text-xs text-gray-700">{count} product{count > 1 ? 's' : ''}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => handleBundleDiscountChange(count, e.target.value)}
                          className="w-14 px-2 py-1 border border-gray-200 rounded text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                        />
                        <span className="text-[10px] text-gray-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500">
                  Bundle discounts stack with volume and term discounts. A 3-year, 3-product deal gets the best combined rate.
                </p>
              </div>
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="space-y-5">
              {/* Discount Level Approvals */}
              <div>
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Discount Level Approvals</h3>
                <p className="text-[10px] text-gray-500 mb-2">
                  Who needs to approve deals based on total discount percentage.
                </p>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[72px_60px_1fr_1fr] gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-200">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Level</span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Max %</span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Approver</span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">SLA</span>
                  </div>
                  {settings.approvalThresholds.discount.map((threshold, index) => (
                    <div key={index} className={`grid grid-cols-[72px_60px_1fr_1fr] gap-2 px-3 py-1.5 items-center ${index < settings.approvalThresholds.discount.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <span className="text-[10px] font-medium text-gray-400 uppercase">
                        {index === 0 ? 'Standard' : index === 1 ? 'Elevated' : index === 2 ? 'High' : 'Critical'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          value={threshold.maxDiscount}
                          onChange={(e) => handleApprovalChange('discount', index, 'maxDiscount', e.target.value)}
                          className="w-11 px-1.5 py-1 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                        />
                        <span className="text-[10px] text-gray-400">%</span>
                      </div>
                      <input
                        type="text"
                        value={threshold.approver}
                        onChange={(e) => handleApprovalChange('discount', index, 'approver', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                      />
                      <input
                        type="text"
                        value={threshold.sla}
                        onChange={(e) => handleApprovalChange('discount', index, 'sla', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Deal Size (TCV) Approvals */}
              <div>
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Deal Size (TCV) Approvals</h3>
                <p className="text-[10px] text-gray-500 mb-2">
                  Approval requirements based on Total Contract Value.
                </p>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[48px_1fr_1fr] gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-200">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Tier</span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Max TCV</span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Approver</span>
                  </div>
                  {settings.approvalThresholds.tcv.map((threshold, index) => (
                    <div key={index} className={`grid grid-cols-[48px_1fr_1fr] gap-2 px-3 py-1.5 items-center ${index < settings.approvalThresholds.tcv.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <span className="text-[10px] font-medium text-gray-400">{index + 1}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">$</span>
                        <input
                          type="number"
                          value={threshold.maxTCV}
                          onChange={(e) => handleApprovalChange('tcv', index, 'maxTCV', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                        />
                        <span className="text-[10px] text-gray-400">({formatTCVDisplay(threshold.maxTCV)})</span>
                      </div>
                      <input
                        type="text"
                        value={threshold.approver}
                        onChange={(e) => handleApprovalChange('tcv', index, 'approver', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500">
                  Both discount % and TCV thresholds are checked. A deal that exceeds either threshold will require the higher-level approver.
                </p>
              </div>
            </div>
          )}

          {/* Policy Tab */}
          {activeTab === 'policy' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-800 mb-1">Custom Policy Guidelines</h3>
                <p className="text-[10px] text-gray-500 mb-3">
                  Add company-specific pricing policies, rules, or guidelines that the AI agent should follow when structuring deals.
                </p>
              </div>

              <textarea
                value={settings.policyText || ''}
                onChange={(e) => handlePolicyChange(e.target.value)}
                placeholder={`Example policies:\n\n- Never offer more than 30% discount on Sales Navigator without VP approval\n- Government accounts always get a 10% public sector discount\n- Competitive displacement deals from ZoomInfo can get up to 20% additional discount\n- Minimum term for enterprise deals over 100 seats is 2 years\n- LinkedIn Learning must be sold in bundles of 100+ users\n- Strategic accounts (Fortune 500) should be flagged for executive review`}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent resize-y placeholder:text-gray-400"
                style={{ minHeight: '300px' }}
              />

              <div className="flex items-start gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500">
                  Be specific and use clear rules. The agent will follow these guidelines and flag any deals that conflict with your policies.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-[10px] text-gray-500">
            Changes are saved automatically and will be reflected in new conversations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
