import { useState } from 'react';
import { Mail, Send, Download, Check } from 'lucide-react';
import { generateQuotePDF } from '../utils/quoteGenerator';
import ProposalModal from './ProposalModal';

const ActionButtons = ({ dealState, settings, formatCurrency }) => {
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [approvalSubmitted, setApprovalSubmitted] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [error, setError] = useState(null);
  const hasData = dealState.pricing && dealState.products.length > 0;

  const handleGenerateQuote = async () => {
    try {
      await generateQuotePDF(dealState, settings);
      setQuoteGenerated(true);
      setError(null);
      setTimeout(() => setQuoteGenerated(false), 3000);
    } catch (err) {
      console.error('Failed to generate quote:', err);
      setError('Failed to generate quote. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSubmitApproval = () => {
    setApprovalSubmitted(true);
    setTimeout(() => setApprovalSubmitted(false), 4000);
  };

  return (
    <>
      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-2">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2 p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm">
        <button
          onClick={handleGenerateQuote}
          disabled={!hasData}
          className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            quoteGenerated
              ? 'bg-green-50 border border-green-300 text-green-700'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {quoteGenerated ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Generate Quote</span>
            </>
          )}
        </button>
        <button
          onClick={() => setShowProposal(true)}
          disabled={!hasData}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="w-4 h-4" />
          <span className="text-sm font-medium">Draft Proposal</span>
        </button>
        <button
          onClick={handleSubmitApproval}
          disabled={!hasData}
          className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            approvalSubmitted
              ? 'bg-green-500 text-white'
              : 'bg-[#0A66C2] text-white hover:bg-[#004182]'
          }`}
        >
          {approvalSubmitted ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Submitted!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="text-sm font-medium">Submit for Approval</span>
            </>
          )}
        </button>
      </div>

      <ProposalModal
        isOpen={showProposal}
        onClose={() => setShowProposal(false)}
        dealState={dealState}
        formatCurrency={formatCurrency}
      />
    </>
  );
};

export default ActionButtons;
