import { useState, useCallback, useRef } from 'react';
import { RotateCcw, Settings, LogOut } from 'lucide-react';
import LoginPage from './components/LoginPage';
import ChatWindow from './components/ChatWindow';
import DealSummary from './components/DealSummary';
import ActionButtons from './components/ActionButtons';
import SettingsModal from './components/SettingsModal';
import { useDealState } from './hooks/useDealState';
import { useSettings } from './hooks/useSettings';
import { sendMessage, extractDealUpdate, cleanResponseText } from './utils/claudeApi';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `Hi! I'm your EP Pricing Agent. I can help you structure and price Enterprise Program deals instantly.

Tell me about your deal - which customer, what products they're interested in, and any other details you have. I'll help you figure out the optimal pricing and let you know what approvals might be needed.

What deal are you working on?`
};

function App() {
  const [user, setUser] = useState(() => sessionStorage.getItem('ep-user'));
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings, resetSettings, formatCurrency } = useSettings();
  const { dealState, updateDeal, resetDeal } = useDealState(settings);
  const abortRef = useRef(null);

  const handleLogin = (email) => {
    sessionStorage.setItem('ep-user', email);
    setUser(email);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ep-user');
    setUser(null);
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages([INITIAL_MESSAGE]);
    resetDeal();
    setError(null);
    setStreamingMessage('');
  };

  const handleSendMessage = useCallback(async (content) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setStreamingMessage('');

    try {
      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      // Send to Claude API with streaming and settings
      const fullResponse = await sendMessage(apiMessages, settings, (chunk, fullText) => {
        // Clean the response for display (remove JSON blocks)
        setStreamingMessage(cleanResponseText(fullText));
      }, { signal: controller.signal });

      // Extract any deal updates from the response
      const dealUpdate = extractDealUpdate(fullResponse);
      if (dealUpdate) {
        updateDeal(dealUpdate);
      }

      // Add the cleaned response to messages
      const cleanedResponse = cleanResponseText(fullResponse);
      setMessages(prev => [...prev, { role: 'assistant', content: cleanedResponse }]);
      setStreamingMessage('');

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm having trouble connecting. ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  }, [messages, updateDeal, settings]);

  const handleReset = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages([INITIAL_MESSAGE]);
    resetDeal();
    setError(null);
    setStreamingMessage('');
  };

  const hasDealData = dealState.customer || dealState.products.length > 0;

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/linkedin-logo.png" alt="LinkedIn" className="h-9 object-contain" />
            <h1 className="text-sm font-semibold text-gray-900">LinkedIn EP Pricing Agent</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Deal Settings & Policy"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Deal Settings & Policy</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Start new deal"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">New Deal</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-3 h-[calc(100vh-64px)]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 h-full">
          {/* Chat Window - 3 columns */}
          <div className="lg:col-span-3 h-full min-h-[500px]">
            <ChatWindow
              messages={messages}
              onSend={handleSendMessage}
              isLoading={isLoading}
              streamingMessage={streamingMessage}
              hasDealData={hasDealData}
              dealState={dealState}
            />
          </div>

          {/* Deal Summary - 2 columns */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-[500px]">
            <div className="flex-1 overflow-hidden">
              <DealSummary dealState={dealState} formatCurrency={formatCurrency} settings={settings} />
            </div>
            <div className="mt-3">
              <ActionButtons dealState={dealState} settings={settings} formatCurrency={formatCurrency} />
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
      />
    </div>
  );
}

export default App;
