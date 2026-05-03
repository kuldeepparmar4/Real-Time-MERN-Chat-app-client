import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ selectedUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null); // Used to auto-scroll to bottom

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch old messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${selectedUser._id}`,
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser, user.token]);

  // Scroll down every time messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages from Socket.io
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      // Only show message if it's from the currently selected user
      if (msg.senderId === selectedUser?._id) {
        setMessages((prev) => [
          ...prev,
          {
            sender: msg.senderId,
            message: msg.message,
            createdAt: msg.createdAt,
          },
        ]);
      }
    });

    // Cleanup listener when component unmounts or selectedUser changes
    return () => socket.off("receiveMessage");
  }, [selectedUser]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedUser) return;

    const messageText = newMsg;
    setNewMsg(""); // Clear input immediately

    try {
      // 1. Save message to database via REST API
      const res = await axios.post(
        `https://real-time-mern-chat-app-server.onrender.com/api/messages/send/${selectedUser._id}`,
        { message: messageText },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      // 2. Add to local messages immediately (no wait for server)
      setMessages((prev) => [...prev, res.data]);

      // 3. Emit via Socket.io so receiver gets it instantly
      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId: selectedUser._id,
        message: messageText,
      });
    } catch (err) {
      console.error("Failed to send message", err);
      setNewMsg(messageText); // Restore message if failed
    }
  };

  // Allow pressing Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // No user selected yet
  if (!selectedUser) {
    return (
      <div className="chat-window">
        <div className="no-chat-selected">
          <div className="icon">💬</div>
          <p>Select a user to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="avatar">{selectedUser.username[0].toUpperCase()}</div>
        <div>
          <div className="name">{selectedUser.username}</div>
          <div className="sub">Active now</div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {loading && (
          <p style={{ textAlign: "center", color: "#aaa" }}>
            Loading messages...
          </p>
        )}
        {messages.map((msg, index) => (
          <MessageBubble key={index} msg={msg} myId={user._id} />
        ))}
        <div ref={messagesEndRef} />{" "}
        {/* Invisible div for auto-scroll target */}
      </div>

      {/* Input */}
      <div className="message-input-area">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!newMsg.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
