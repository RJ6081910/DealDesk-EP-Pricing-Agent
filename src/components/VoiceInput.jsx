import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceInput = ({ onTranscript, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const errorTimerRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const showError = (msg) => {
    setErrorMsg(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(''), 5000);
  };

  const getErrorMessage = (error) => {
    switch (error) {
      case 'not-allowed':
        return 'Microphone access denied. Please allow mic access in browser settings.';
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'No microphone found. Please connect a microphone.';
      case 'network':
        return 'Network error. Please check your connection.';
      case 'aborted':
        return '';
      default:
        return `Speech error: ${error}`;
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setInterimText('');
      setErrorMsg('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        onTranscript(final);
        setInterimText('');
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event) => {
      const msg = getErrorMessage(event.error);
      if (msg) showError(msg);
      setIsRecording(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setInterimText('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative">
      {/* Interim transcript tooltip */}
      {isRecording && interimText && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-[240px] whitespace-pre-wrap animate-fade-in">
          <span className="text-gray-300">{interimText}</span>
          <span className="inline-flex gap-0.5 ml-1">
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          <div className="absolute bottom-0 right-3 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </div>
      )}

      {/* Recording indicator tooltip */}
      {isRecording && !interimText && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
          Listening
          <span className="inline-flex gap-0.5 ml-1">
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          <div className="absolute bottom-0 right-3 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </div>
      )}

      {/* Error tooltip */}
      {errorMsg && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg shadow-lg max-w-[260px] animate-fade-in">
          {errorMsg}
          <div className="absolute bottom-0 right-3 translate-y-1/2 rotate-45 w-2 h-2 bg-red-600" />
        </div>
      )}

      {/* Not supported tooltip */}
      {!isSupported && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          Voice not supported in this browser
          <div className="absolute bottom-0 right-3 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-700" />
        </div>
      )}

      <button
        onClick={toggleRecording}
        disabled={disabled || !isSupported}
        className={`p-2.5 sm:p-2 rounded-full transition-all ${
          isRecording
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        } ${disabled || !isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default VoiceInput;
