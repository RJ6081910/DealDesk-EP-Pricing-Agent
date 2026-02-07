import { useRef, useEffect, useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import SuggestedReplies from './SuggestedReplies';

const ChatWindow = ({ messages, onSend, isLoading, streamingMessage, hasDealData, dealState }) => {
  const scrollContainerRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const userIsNearBottom = useRef(true);

  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    userIsNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  useEffect(() => {
    if (userIsNearBottom.current) {
      scrollToBottom();
    }
  }, [messages, streamingMessage, scrollToBottom]);

  const handleSend = (text) => {
    onSend(text);
    setInputValue('');
    userIsNearBottom.current = true;
    scrollToBottom();
  };

  const handleSuggestionSelect = (text) => {
    setInputValue(text);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversation</h2>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2.5 space-y-2 chat-scrollbar"
      >
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}

        {streamingMessage && (
          <MessageBubble
            message={{ role: 'assistant', content: streamingMessage }}
            isStreaming={true}
          />
        )}

        {isLoading && !streamingMessage && <TypingIndicator />}
      </div>

      {!isLoading && (
        <SuggestedReplies
          onSelect={handleSuggestionSelect}
          messageCount={messages.length}
          hasDealData={hasDealData}
          messages={messages}
          dealState={dealState}
        />
      )}

      <ChatInput
        onSend={handleSend}
        disabled={isLoading}
        value={inputValue}
        onChange={setInputValue}
      />
    </div>
  );
};

export default ChatWindow;
