import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';

import './Chat.css';
import { SocketContext } from '../../Context';

const ENDPOINT = 'http://54.161.56.4:8070/';

let socket1;

const Chat = () => {
  const { user } = useContext(SocketContext);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const name = user.name;
    const room = 'Chat';
    console.log(user.name)
    socket1 = io(ENDPOINT);

    setRoom(room);
    setName(name);

    socket1.emit('join', { name, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }, [ENDPOINT]);

  useEffect(() => {
    socket1.on('message', (message) => {
      setMessages((messages) => [...messages, message]);
    });

    socket1.on('roomData', ({ users }) => {
      setUsers(users);
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket1.emit('sendMessage', message, () => setMessage(''));
    }
  };

  return (
    <div className="outerContainer">
      <div className="chat-container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default Chat;
