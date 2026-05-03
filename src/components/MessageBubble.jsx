import React from "react";

// Formats time like "2:45 PM"
const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const MessageBubble = ({ msg, myId }) => {
  const isMine = msg.sender === myId || msg.sender?._id === myId;

  return (
    <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
      <div className="bubble">
        {msg.message}
        <div className="bubble-time">{formatTime(msg.createdAt)}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
