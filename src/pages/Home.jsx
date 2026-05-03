import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import socket from "../utils/socket";

const Home = () => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    socket.connect();
    socket.emit("addUser", user._id);
    return () => {
      socket.disconnect();
    };
  }, [user._id]);

  return (
    <div className="home-page">
      <Sidebar selectedUser={selectedUser} onSelectUser={setSelectedUser} />
      <ChatWindow selectedUser={selectedUser} />
    </div>
  );
};

export default Home;
