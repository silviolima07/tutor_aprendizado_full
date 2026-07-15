import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const API_URL = 'http://localhost:8000/api';

function Chatbot({ topic, links }) {
  const { role } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'tutor', content: `Olá! Sou seu Tutor de IA sobre "${topic}". Pergunte qualquer dúvida e eu indicarei o melhor artigo para você estudar!` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          links,
          question: userMessage.content,
          user_id: parseInt(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 1)
        })
      });
      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'tutor',
            content: data.reply,
            recommendedUrl: data.recommended_url,
            metadata: data.usage ? {
              rag_source: 'Artigos da trilha (similaridade por embeddings)',
              usage: data.usage
            } : null
          }
        ]);
        setIsTyping(false);
      }, 800);

    } catch (err) {
      console.error('Chat erro:', err);
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: 'tutor', content: 'Desculpe, estou com problemas de conexão. Tente novamente mais tarde.' }]);
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all z-50 flex items-center justify-center focus:outline-none"
        title="Falar com Tutor IA"
      >
        <span className="text-2xl">{isOpen ? '✖️' : '🤖'}</span>
      </button>

      {/* Janela de Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden animate-fade-in" style={{ height: '550px', maxHeight: '75vh' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl shrink-0">🤖</span>
              <div className="min-w-0">
                <h3 className="font-bold truncate">Tutor IA</h3>
                <p className="text-xs text-blue-200 truncate">{topic}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 shrink-0 ml-2">
              ✖
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Link recomendado em destaque */}
                  {msg.recommendedUrl && (
                    <a
                      href={msg.recommendedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all"
                    >
                      <span>📖</span>
                      <span className="flex-1 truncate">Artigo recomendado</span>
                      <span className="text-emerald-500 font-bold">Abrir →</span>
                    </a>
                  )}

                  {/* Metadata Section (RAG & Ops) */}
                  {msg.metadata && (
                      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs flex flex-col gap-1">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          🔗 Fonte: {msg.metadata.rag_source}
                        </span>

                        {msg.metadata.usage && (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            📦 Modelo: {msg.metadata.usage.model}
                          </span>
                        )}

                        {/* LLMOps - Visível apenas para admin */}
                        {role === 'admin' && msg.metadata.usage && (
                          <div className="bg-gray-100 dark:bg-gray-900 rounded p-2 mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                            <p className="font-bold text-gray-700 dark:text-gray-300">⚙️ Custo</p>
                            <p>${msg.metadata.usage.cost.toFixed(4)} ({msg.metadata.usage.prompt_tokens} in / {msg.metadata.usage.completion_tokens} out)</p>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida sobre o tema..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;