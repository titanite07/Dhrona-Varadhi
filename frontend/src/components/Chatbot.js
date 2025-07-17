import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chatbot', { messages: newMessages });
      setMessages([...newMessages, { role: 'bot', content: res.data.reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'bot', content: 'Sorry, there was an error.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-24 z-50 w-96 max-w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto mb-2" style={{ maxHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <span className={
              m.role === 'user'
                ? 'text-blue-600 dark:text-blue-400 transition-colors duration-200'
                : 'text-green-600 dark:text-green-400 transition-colors duration-200'
            }>
              {m.role === 'user' ? 'You: ' : 'Bot: '}
            </span>
            <span className="whitespace-pre-line">{m.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {loading && <div className="text-gray-400 dark:text-gray-300 transition-colors duration-200">Bot is typing...</div>}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Ask me anything..."
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
