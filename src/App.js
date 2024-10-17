import React, { useState } from 'react';
import './index.css'; 
const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    'Quem é Juvinho?',
    'Quais rolês da Juventude tem para essa semana?',
    'Me dê informações sobre os Cucas',
    'Quais projetos de bolsa a Juventude de Fortaleza oferece?',
  ];

  const handleSuggestionClick = (suggestion) => {
    addMessage(suggestion, 'user');
    setTimeout(() => {
      addMessage('fodase', 'bot');
    }, 1000);
  };

  const addMessage = (text, sender) => {
    const newMessage = { text, sender };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      addMessage(inputMessage, 'user');
      setInputMessage('');
      setIsTyping(false);

      // Simulação de resposta do bot
      setTimeout(() => {
        addMessage('fodase?');
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-between bg-[#31C7DF] p-6">
      {/* Cabeçalho do Chat */}
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold">Fortaleza - Juventude</h2>
        <h3 className="text-xl mt-2">E aí! eu sou o Juvinho 😄</h3>
        <p className="mt-1">Do que tu precisa? fala pra mim</p>
      </div>

      {/* Sugestões */}
      <div className="grid grid-cols-2 gap-4 mb-6  items-center justify-center w-[30vw] mx-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="h-[12vh] shadow-black shadow-sm bg-[#31C7DF] text-white py-3 px-5 rounded-full text-center hover:bg-cyan-800 transition duration-200" 
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Área de Mensagens */}
      <div className="w-[50vw] mx-auto flex flex-col space-y-4 overflow-y-auto flex-grow rounded-lg p-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-2xl max-w-xs ${
              message.sender === 'user'
                ? 'bg-gray-200 self-end text-right'
                : 'bg-cyan-700 text-white self-start'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      {/* Campo de Input */}
      <form className="flex items-center space-x-2" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Digite sua pergunta aqui"
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            setIsTyping(true);
          }}
          className="flex-grow px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          type="submit"
          className="bg-cyan-700 text-white py-2 px-4 rounded-full shadow-lg hover:bg-cyan-800 transition duration-200"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default App;
