import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiUser,
  FiAlertCircle,
} from 'react-icons/fi';
import { sendAiMessage } from '../../api/catalog';

const GREETING =
  'Hi! I am the official support assistant for Exclusive. Ask me about any product, its price, stock or warranty.';

const SUGGESTIONS = [
  'Do you have Nokia phones?',
  'What is your return policy?',
  'How long is the warranty?',
];

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'greeting', role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async text => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isLoading) return;

    // History is everything that came before this new message.
    const history = messages
      .slice(-8)
      .map(item => ({ role: item.role, content: item.content.slice(0, 800) }));

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const data = await sendAiMessage({ message: trimmed, history });

      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          products: data.products,
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Something went wrong. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-[#DB4444] text-white shadow-lg shadow-[#DB4444]/30 flex items-center justify-center hover:bg-red-600 transition-transform hover:scale-105"
        aria-label="Open AI shopping assistant"
      >
        {isOpen ? <FiX size={22} /> : <FiMessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-[calc(100vw-3rem)] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#DB4444] text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <FiMessageCircle size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight">
                Exclusive Support
              </p>
              <p className="text-[11px] text-white/80">
                Powered by live store data
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-auto text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAFAFA]"
          >
            {messages.map(message => (
              <div key={message.id}>
                <div
                  className={`flex items-end gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#DB4444] text-white flex items-center justify-center flex-shrink-0">
                      <FiMessageCircle size={13} />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                      message.role === 'user'
                        ? 'bg-[#DB4444] text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                      <FiUser size={13} />
                    </div>
                  )}
                </div>

                {/* Product cards returned from the live database */}
                {Array.isArray(message.products) &&
                  message.products.length > 0 && (
                    <div className="mt-2 ml-9 space-y-2">
                      {message.products.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 bg-white hover:border-[#DB4444]/40 transition-colors"
                        >
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-11 h-11 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#DB4444] font-semibold">
                              ৳{Number(product.price).toLocaleString('en-US')}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                              product.inStock
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-[#DB4444]'
                            }`}
                          >
                            {product.inStock ? 'In stock' : 'Out of stock'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#DB4444] text-white flex items-center justify-center">
                  <FiMessageCircle size={13} />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <FiAlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#DB4444] hover:text-[#DB4444] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 p-3 flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a product..."
              className="flex-1 resize-none max-h-24 bg-[#F5F5F5] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#DB4444]"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isLoading || !input.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#DB4444] text-white hover:bg-red-600'
              }`}
              aria-label="Send message"
            >
              <FiSend size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
