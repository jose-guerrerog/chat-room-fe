import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { createConsumer } from "@rails/actioncable";
import useUserStore from "../store/userStore";

// API URL pointing to Rails server
const API_URL = process.env.REACT_APP_RAILS_APP_URL;

function ChatRoom() {
  const username = useUserStore(state => state.username);
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const cableRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoom();
    fetchMessages();
    setupActionCable();

    return () => {
      if (cableRef.current) {
        console.log("Cleaning up Action Cable subscription");
        cableRef.current.unsubscribe();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms/${roomId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch room: ${response.status}`);
      }
      const data = await response.json();
      setRoom(data);
    } catch (err) {
      setError("Failed to fetch room details");
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/rooms/${roomId}/messages`);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError("Failed to fetch messages");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const setupActionCable = () => {
    console.log("Setting up Action Cable connection...");
    try {
      const consumer = createConsumer(
        `${process.env.REACT_APP_WEBSOCKET_RAILS_URL}/cable`
      );

      consumer.onopen = function () {
        console.log("WebSocket connected successfully!");
      };

      consumer.onerror = function (error) {
        console.error("WebSocket error occurred:", error);
      };

      consumer.onclose = function (event) {
        console.log("WebSocket closed with code:", event.code);
      };

      const subscription = consumer.subscriptions.create(
        { channel: "RoomChannel", room_id: roomId },
        {
          connected() {
            console.log("Connected to RoomChannel for room:", roomId);
          },
          disconnected() {
            console.log("Disconnected from RoomChannel");
          },
          received(data) {
            let formattedTimestamp;
            if (
              data.timestamp &&
              !isNaN(data.timestamp) &&
              data.timestamp.toString().length <= 10
            ) {
              // Convert seconds to milliseconds and create a date
              const jsTimestamp = parseInt(data.timestamp) * 1000;
              formattedTimestamp = new Date(jsTimestamp).toLocaleString(
                "en-AU",
                {
                  timeZone: "Australia/Sydney",
                }
              );
            } else if (data.created_at) {
              formattedTimestamp = data.created_at;
            } else {
              formattedTimestamp = new Date().toLocaleString("en-AU", {
                timeZone: "Australia/Sydney",
              });
            }

            const messageWithDate = {
              ...data,
              created_at: formattedTimestamp,
            };
            setMessages((prevMessages) => {
              // Generate a unique identifier for each message
              const messageKey = `${messageWithDate.content}-${
                messageWithDate.sender_name
              }-${messageWithDate.created_at || messageWithDate.timestamp}`;

              const isDuplicate = prevMessages.some((msg) => {
                const msgKey = `${msg.content}-${msg.sender_name}-${
                  msg.created_at || msg.timestamp
                }`;
                return msgKey === messageKey;
              });

              if (isDuplicate) {
                return prevMessages;
              }

              return [...prevMessages, messageWithDate];
            });
          },
          speak(content, senderName) {
            const result = this.perform("speak", {
              content: content,
              sender_name: senderName,
            });
            return result;
          },
        }
      );

      cableRef.current = subscription;
    } catch (error) {
      console.error("Error setting up Action Cable:", error);
      setError(
        "WebSocket connection failed. Messages may not update in real-time."
      );
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (cableRef.current) {
        // Send message via WebSocket only
        console.log("Attempting to send message via WebSocket:", newMessage);
        cableRef.current.speak(newMessage, username);

        // Add message locally for immediate feedback (will be replaced by WebSocket broadcast)
        const tempMessage = {
          id: `temp-${Date.now()}`,
          content: newMessage,
          sender_name: username,
          created_at: new Date().toISOString(),
          temp: true,
        };

        // setMessages(prev => {
        //   // Only add if not duplicate
        //   const exists = prev.some(msg =>
        //     msg.content === tempMessage.content && msg.sender_name === tempMessage.sender_name
        //   );

        //   if (!exists) {
        //     return [...prev, tempMessage];
        //   }
        //   return prev;
        // });

        setNewMessage("");
      } else {
        throw new Error("WebSocket connection not established");
      }
    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message via WebSocket:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return <div className="loading">Loading chat...</div>;
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <Link to="/rooms" className="back-link">
          ← Back to Rooms
        </Link>
        <h1>{room?.name || "Chat Room"}</h1>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`message ${
                  message.sender_name === username ? "own-message" : ""
                }`}
              >
                <div className="message-header">
                  <span className="message-sender">{message.sender_name}</span>
                  <span className="message-time">
                    {message.created_at}
                  </span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
