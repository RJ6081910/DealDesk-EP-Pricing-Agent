import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const markdownComponents = {
  h1: ({ children }) => <h3 className="text-sm font-semibold text-gray-800 mt-2 mb-1">{children}</h3>,
  h2: ({ children }) => <h4 className="text-xs font-semibold text-gray-800 mt-2 mb-1">{children}</h4>,
  h3: ({ children }) => <h5 className="text-xs font-medium text-gray-800 mt-1.5 mb-0.5">{children}</h5>,
  p: ({ children }) => <p className="text-sm sm:text-xs leading-relaxed my-1">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="text-sm sm:text-xs pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children, inline }) =>
    inline ? (
      <code className="bg-gray-200 px-1 py-0.5 rounded text-xs sm:text-[10px] font-mono">{children}</code>
    ) : (
      <code className="block bg-gray-200 p-2 rounded text-xs sm:text-[10px] font-mono my-1 overflow-x-auto">{children}</code>
    ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-1">
      <table className="min-w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-200">{children}</thead>,
  th: ({ children }) => <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-xs">{children}</th>,
  td: ({ children }) => <td className="border border-gray-300 px-2 py-1 text-xs">{children}</td>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#0A66C2] pl-3 my-1 italic text-gray-600 text-xs">{children}</blockquote>
  ),
  hr: () => <hr className="my-2 border-gray-300" />
};

const MessageBubble = ({ message, isStreaming = false }) => {
  const isAgent = message.role === 'assistant';

  const renderContent = () => {
    if (!isAgent) {
      return (
        <div className="whitespace-pre-wrap text-sm sm:text-xs leading-relaxed">
          {message.content}
        </div>
      );
    }

    return (
      <div className="prose prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1.5 prose-headings:text-gray-800 prose-strong:text-gray-800">
        <ReactMarkdown components={markdownComponents}>
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`flex gap-2 message-enter ${isAgent ? 'justify-start' : 'justify-end'}`}>
      {isAgent && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A66C2] flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div
        className={`max-w-[75%] px-2.5 py-1.5 rounded-lg ${
          isAgent
            ? 'bg-gray-50 text-gray-800 rounded-tl-sm'
            : 'bg-[#0A66C2] text-white rounded-tr-sm'
        }`}
      >
        {renderContent()}
      </div>

      {!isAgent && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
