import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ApprovalBadge = ({ approval }) => {
  const getIcon = () => {
    switch (approval.level) {
      case 1:
        return <CheckCircle className="w-3.5 h-3.5 text-gray-400" />;
      case 2:
      case 3:
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getDotColor = () => {
    switch (approval.level) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-amber-500';
      case 3: return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50">
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
          <span className="font-medium text-xs text-gray-800">{approval.approver}</span>
        </div>
        <div className="text-xs sm:text-[10px] text-gray-500 mt-0.5">{approval.reason}</div>
        {approval.sla && (
          <div className="text-xs sm:text-[10px] text-gray-400 mt-0.5">SLA: {approval.sla}</div>
        )}
      </div>
    </div>
  );
};

export default ApprovalBadge;
