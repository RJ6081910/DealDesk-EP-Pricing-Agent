import { useState } from 'react';
import { X, Copy, Check, Mail, Send, Loader2 } from 'lucide-react';
import { sendProposalEmail } from '../utils/emailService';

const ProposalModal = ({ isOpen, onClose, dealState, formatCurrency }) => {
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendState, setSendState] = useState('idle'); // idle | sending | sent | error
  const [sendError, setSendError] = useState(null);

  if (!isOpen) return null;

  const { customer, pricing, term } = dealState;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);

  const generateEmailContent = () => {
    const productList = pricing?.lineItems?.map(item =>
      `  - ${item.name}: ${item.quantity} seats at ${formatCurrency(item.unitPrice)}/seat/year`
    ).join('\n') || '';

    const discountDetails = [];
    if (pricing?.discounts?.volume?.amount > 0) {
      discountDetails.push(`Volume discount applied`);
    }
    if (pricing?.discounts?.bundle?.amount > 0) {
      discountDetails.push(`Bundle discount (${(pricing.discounts.bundle.rate * 100).toFixed(0)}%) for multiple products`);
    }
    if (pricing?.discounts?.term?.amount > 0) {
      discountDetails.push(`Multi-year discount (${(pricing.discounts.term.rate * 100).toFixed(0)}%) for ${term}-year commitment`);
    }

    return `Subject: LinkedIn Enterprise Program Proposal for ${customer?.name || '[Company Name]'}

Dear ${customer?.name || '[Customer]'} Team,

Thank you for your interest in LinkedIn's Enterprise Program solutions. Based on our recent conversation, I'm pleased to present the following customized proposal for your organization.

PROPOSED SOLUTION
${productList}

PRICING SUMMARY
- Annual Contract Value: ${formatCurrency(pricing?.finalACV || 0)}${term > 1 ? `
- Total Contract Value (${term} years): ${formatCurrency(pricing?.finalTCV || 0)}` : ''}
- Total Savings: ${formatCurrency(pricing?.totalDiscount || 0)} (${((pricing?.totalDiscountRate || 0) * 100).toFixed(1)}% off list price)

${discountDetails.length > 0 ? `YOUR DISCOUNTS INCLUDE:
${discountDetails.map(d => `- ${d}`).join('\n')}

` : ''}KEY BENEFITS
- Unified platform for your ${customer?.employees?.toLocaleString() || ''} employees
- Dedicated customer success manager
- Premium support and training resources
- Regular business reviews and optimization recommendations

NEXT STEPS
1. Review this proposal with your team
2. Schedule a call to discuss any questions
3. Finalize contract terms and implementation timeline

This proposal is valid for 30 days. I'm available to discuss any aspects of this proposal at your convenience.

Looking forward to partnering with ${customer?.name || 'your organization'}.

Best regards,

[Your Name]
Account Executive, LinkedIn
[Your Email]
[Your Phone]`;
  };

  const emailContent = generateEmailContent();
  const emailSubject = `LinkedIn Enterprise Program Proposal for ${customer?.name || '[Company Name]'}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailContent.replace(/^Subject:.*\n\n/, ''));
    const to = recipientEmail ? encodeURIComponent(recipientEmail) : '';
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendEmail = async () => {
    if (!isValidEmail) return;
    setSendState('sending');
    setSendError(null);
    try {
      const bodyText = emailContent.replace(/^Subject:.*\n\n/, '');
      await sendProposalEmail(recipientEmail, emailSubject, bodyText);
      setSendState('sent');
      setTimeout(() => setSendState('idle'), 4000);
    } catch (err) {
      console.error('Failed to send email:', err);
      setSendError(err.message);
      setSendState('error');
      setTimeout(() => setSendState('idle'), 5000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-content">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Draft Proposal Email</h2>
              <p className="text-sm text-gray-500">Send directly or copy to clipboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient Email Input */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
          <label className="block text-xs font-medium text-gray-600 mb-1">Recipient Email</label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="client@company.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">
            {emailContent}
          </div>
        </div>

        {/* Send Error */}
        {sendError && (
          <div className="mx-6 mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {sendError}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-500">
            Edit the placeholders in brackets before sending
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleOpenMailClient}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Open in Mail</span>
            </button>
            <button
              onClick={handleCopy}
              className={`w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!isValidEmail || sendState === 'sending'}
              className={`w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                sendState === 'sent'
                  ? 'bg-green-500 text-white'
                  : 'bg-[#0A66C2] text-white hover:bg-[#004182]'
              }`}
            >
              {sendState === 'sending' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Sending...</span>
                </>
              ) : sendState === 'sent' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="text-sm font-medium">Send Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
