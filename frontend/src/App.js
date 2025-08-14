import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import './App.css';

const socket = io('http://localhost:5000');
const roomId = 'room1';

function App() {
  const [code, setCode] = useState('// Start coding');
  const [chat, setChat] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit('join-room', roomId);

    socket.on('receive-code', newCode => setCode(newCode));
    socket.on('chat-message', msg => setMessages(prev => [...prev, msg]));

    return () => socket.disconnect();
  }, []);

  const handleCodeChange = value => {
    setCode(value);
    socket.emit('code-change', { roomId, code: value });
  };

  const sendMessage = () => {
    socket.emit('send-chat-message', { roomId, message: chat });
    setMessages([...messages, chat]);
    setChat('');
  };

  return (
    <div className="editor-container">
      <h1>Collaborative Code Editor</h1>
      <CodeMirror
        value={code}
        height="300px"
        theme="light"
        extensions={[javascript()]}
        onChange={handleCodeChange}
      />
      <div className="chat-container">
        <h2>Live Chat</h2>
        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className="chat-msg">{msg}</div>
          ))}
        </div>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message and press Enter"
          value={chat}
          onChange={e => setChat(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
      </div>
    </div>
  );
}

export default App;
