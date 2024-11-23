import React, {useState, useEffect, useRef } from 'react';
import './index.css'; 
import fortaleza from './media/logo-png.png'
// import { logDOM } from '@testing-library/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchBot = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chatbot/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'input': inputMessage})
      });
      
      if(!response.ok) {
        throw new Error(`Network response was not okay. Status: ${response.status}`);
      }
      const data = await response.json()
      addMessage(data[0].answer, 'bot');
    } catch (error) {
      console.error('Error: ', error);
    }
  }

  useEffect(() => {
    fetchBot();
    console.log(inputMessage);
  }, [messages]);

  const suggestions = [
    'Quem é Juvinho?',
    'Quais rolês da Juventude tem para essa semana?',
    'Me dê informações sobre os Cucas',
    'Quais projetos de bolsa a Juventude de Fortaleza oferece?',
  ];

  const handleSuggestionClick = (suggestion) => {
    addMessage(suggestion, 'user');
    setInputMessage(inputMessage);
  };

  const addMessage = (text, sender) => {
    const newMessage = { text, sender };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      addMessage(inputMessage, 'user');
      setInputMessage(inputMessage);
      setIsTyping(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex w-[60vw] items my-0 mx-auto flex-col h-screen justify-between pt-[6vh] pb-[10vh]">
      {/* Cabeçalho do Chat */}
      <div className={messages.length > 0 ? "hidden" : ""}>
        <img src={fortaleza} alt="Logo Fortaleza" className='w-[6vw] z-40 mb-[4vh] mx-auto'/>
        <div className='flex flex-col z-40 items-center text-center text-white space-y-2'>
          <h3 className="text-[5vh] font-bold mt-2">E aí! eu sou o Juvinho 😄</h3>
          <p className="text-[3vh]">Do que tu precisa? fala pra mim</p>
        </div>
      </div>

      {/* Sugestões */}
      <div className={messages.length > 0 ? "hidden" : "grid grid-cols-2 gap-4 mb-6 z-40 items-center justify-center w-[30vw] mx-auto"}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="h-[14vh] shadow-black shadow-sm bg-[#1ac2db] text-white font-medium py-3 px-5 rounded-full text-center hover:bg-cyan-800 transition duration-200" 
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      {/* Área de Mensagens */}
      <div className={messages.length > 0 ? "flex z-10 flex-col w-[50vw] mx-auto space-y-4 overflow-y-auto flex-grow rounded-lg p-4 mb-4" : "hidden"}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-2xl max-w-xs ${
              message.sender === 'user'
                ? 'bg-gray-200 self-end text-right'
                : 'bg-[#FFCC54] text-[#323232] self-start'
            }`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />

      </div>

      {/* Campo de Input */}
      <form className="flex w-[70%] relative my-0 mx-auto items-center space-x-2 z-40" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Digite sua pergunta aqui"
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            setIsTyping(true);
          }}
          className="flex-grow px-4 py-2 h-[7vh] pr-16 rounded-[1.5vh] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          type="submit"
          className="bg-[#FFCC54] py-[0.8vh] px-[0.6vw] absolute right-3 text-white rounded-[1vh] shadow-lg hover:bg-[#e2a821] transition duration-200  flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faArrowRight} style={{color: "#000000", height: '3vh'}} />
        </button>
      </form>
      <div className='gradient smoky absolute bottom-0 left-0 h-[18vh] w-full z-20'></div>
    </div>
  );
};

export default App;