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
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    axios
      .get(
        `https://real-time-mern-chat-app-server.onrender.com/api/messages/${selectedUser._id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      )
      .then((res) => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedUser, user.token]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
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
    return () => socket.off("receiveMessage");
  }, [selectedUser]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedUser) return;
    const text = newMsg;
    setNewMsg("");
    try {
      const res = await axios.post(
        `https://real-time-mern-chat-app-server.onrender.com/api/messages/send/${selectedUser._id}`,
        { message: text },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setMessages((prev) => [...prev, res.data]);
      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId: selectedUser._id,
        message: text,
      });
    } catch (err) {
      console.error(err);
      setNewMsg(text);
    }
  };

  if (!selectedUser) {
    return (
      <div className="chat-window">
        <div className="no-chat-selected">
          <div className="no-chat-icon">💬</div>
          <h3>Start a conversation</h3>
          <p>Pick someone from the left to begin chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar">{selectedUser.username[0].toUpperCase()}</div>
        <div>
          <div className="name">{selectedUser.username}</div>
          <div className="sub">● Active now</div>
        </div>
      </div>

      <div className="messages-area">
        {loading && (
          <p
            style={{
              textAlign: "center",
              color: "var(--text2)",
              fontSize: "0.85rem",
            }}
          >
            Loading messages...
          </p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} myId={user._id} />
        ))}
        <div ref={endRef} />
      </div>

      <div className="message-input-area">
        <input
          type="text"
          placeholder={`Message ${selectedUser.username}...`}
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
