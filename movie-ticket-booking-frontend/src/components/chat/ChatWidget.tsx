import React, { useEffect, useRef, useState } from 'react';
import { chatService } from '../../services/chatService';

const supportsSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

type RecognitionType = typeof window extends any ? any : never;

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ from: 'me' | 'ai'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<RecognitionType | null>(null);

  useEffect(() => {
    if (supportsSpeechRecognition) {
      const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new Recognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
    }
  }, []);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { from: 'me', text: trimmed }]);
    setInput('');
    setLoading(true);
    try {
      const { answer } = await chatService.ask(trimmed);
      setMessages(prev => [...prev, { from: 'ai', text: answer }]);
      speak(answer);
    } catch (e: any) {
      const msg = e?.message || 'Chat failed';
      setMessages(prev => [...prev, { from: 'ai', text: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!supportsSpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      (rec as any).start();
    } catch (_) {
      // ignore multiple starts
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Open AI Chat"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        {open ? '✖️' : '🤖'}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
            <div className="font-semibold">MovieHub Assistant</div>
            <div className="text-sm opacity-90">Emoji-friendly ✨</div>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-gray-500 text-sm text-center mt-8">Ask me anything about your account 🎬</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.from === 'me' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 rounded-bl-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-gray-500 text-sm">Thinking… 🤔</div>
            )}
          </div>

          <div className="p-3 border-t bg-white flex items-center gap-2">
            <button
              onClick={toggleMic}
              title="Speak"
              className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              🎤
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type your message…"
              className="flex-1 h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="h-10 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? '…' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
