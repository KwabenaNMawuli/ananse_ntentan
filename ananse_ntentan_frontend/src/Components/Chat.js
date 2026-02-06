import React, { useState, useEffect, useRef } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import './Chat.css';

const Chat = () => {
  const { preferences } = usePreferences();
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [rooms, setRooms] = useState([]);
  const [searchingMatch, setSearchingMatch] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebSocket connection
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Register user with their anonymous ID
      if (preferences?.anonymousId) {
        websocket.send(JSON.stringify({
          type: 'register',
          userId: preferences.anonymousId
        }));
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'match_found':
          setCurrentRoom(data.room);
          setMessages([{
            type: 'system',
            content: 'Connected with another wanderer of the void...',
            timestamp: new Date()
          }]);
          setSearchingMatch(false);
          break;
          
        case 'message':
          setMessages(prev => [...prev, {
            type: 'user',
            content: data.content,
            senderId: data.senderId,
            timestamp: new Date(data.timestamp)
          }]);
          break;
          
        case 'user_disconnected':
          setMessages(prev => [...prev, {
            type: 'system',
            content: 'The wanderer has left the void...',
            timestamp: new Date()
          }]);
          setTimeout(() => {
            setCurrentRoom(null);
            setMessages([]);
          }, 2000);
          break;
          
        case 'room_history':
          setMessages(data.messages.map(msg => ({
            type: 'user',
            content: msg.content,
            senderId: msg.senderId,
            timestamp: new Date(msg.timestamp)
          })));
          break;
          
        case 'rooms_list':
          setRooms(data.rooms);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [preferences?.anonymousId]);

  const findRandomMatch = () => {
    if (!ws || !connected) return;
    
    setSearchingMatch(true);
    ws.send(JSON.stringify({
      type: 'find_match',
      matchType: 'random'
    }));
  };

  const viewPastChats = () => {
    if (!ws || !connected) return;
    
    ws.send(JSON.stringify({
      type: 'get_rooms'
    }));
  };

  const joinRoom = (roomId) => {
    if (!ws || !connected) return;
    
    ws.send(JSON.stringify({
      type: 'join_room',
      roomId: roomId
    }));
    
    setCurrentRoom(roomId);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !ws || !connected || !currentRoom) return;
    
    ws.send(JSON.stringify({
      type: 'send_message',
      roomId: currentRoom,
      content: inputMessage
    }));
    
    // Add message to local state
    setMessages(prev => [...prev, {
      type: 'user',
      content: inputMessage,
      senderId: preferences.anonymousId,
      timestamp: new Date()
    }]);
    
    setInputMessage('');
  };

  const leaveChat = () => {
    if (!ws || !connected || !currentRoom) return;
    
    ws.send(JSON.stringify({
      type: 'leave_room',
      roomId: currentRoom
    }));
    
    setCurrentRoom(null);
    setMessages([]);
  };

  if (!preferences?.anonymousId) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <p>Initializing your void identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Void Transmissions</h2>
        <div className="connection-status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {!currentRoom ? (
        <div className="chat-lobby">
          <div className="lobby-info">
            <p className="void-id">Your Void ID: <span>{preferences.anonymousId}</span></p>
            <p className="lobby-description">
              Connect with other wanderers in the void. Share your transmissions anonymously.
            </p>
          </div>

          <div className="lobby-actions">
            <button 
              className="btn-primary"
              onClick={findRandomMatch}
              disabled={!connected || searchingMatch}
            >
              {searchingMatch ? 'Searching for a wanderer...' : 'Find Random Wanderer'}
            </button>

            <button 
              className="btn-secondary"
              onClick={viewPastChats}
              disabled={!connected}
            >
              View Past Transmissions
            </button>
          </div>

          {rooms.length > 0 && (
            <div className="past-chats">
              <h3>Past Transmissions</h3>
              <div className="rooms-list">
                {rooms.map(room => (
                  <div key={room.roomId} className="room-item" onClick={() => joinRoom(room.roomId)}>
                    <div className="room-header">
                      <span className="room-name">Transmission #{room.roomId.slice(-6)}</span>
                      <span className="room-date">
                        {new Date(room.lastMessage).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="room-preview">{room.lastMessageText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="chat-room">
          <div className="chat-room-header">
            <span className="room-title">Transmission #{currentRoom.slice(-6)}</span>
            <button className="btn-leave" onClick={leaveChat}>Leave</button>
          </div>

          <div className="messages-container">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.type} ${msg.senderId === preferences.anonymousId ? 'own' : 'other'}`}
              >
                {msg.type === 'system' ? (
                  <p className="system-message">{msg.content}</p>
                ) : (
                  <>
                    <div className="message-bubble">
                      <p>{msg.content}</p>
                    </div>
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-container">
            <input
              type="text"
              className="message-input"
              placeholder="Send a transmission..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={!connected}
            />
            <button 
              className="btn-send"
              onClick={sendMessage}
              disabled={!connected || !inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
