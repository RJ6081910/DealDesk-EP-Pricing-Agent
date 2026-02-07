import { useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import VoiceInput from './VoiceInput';

const ChatInput = ({ onSend, disabled, value, onChange }) => {
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
    }
  };

  const handleVoiceTranscript = (transcript) => {
    onChange(value + (value ? ' ' : '') + transcript);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Focus textarea when value changes from suggestion
  useEffect(() => {
    if (value && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [value]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2.5 border-t border-gray-200 bg-white">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your deal..."
          disabled={disabled}
          rows={1}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-xs resize-y focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          style={{ minHeight: '36px', maxHeight: '100px' }}
        />
        <div className="absolute right-2 bottom-1.5">
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={disabled} />
        </div>
      </div>
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="p-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default ChatInput;
