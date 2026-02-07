import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-2 justify-start">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A66C2] flex items-center justify-center">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-gray-50 px-2.5 py-1.5 rounded-lg rounded-tl-sm">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
