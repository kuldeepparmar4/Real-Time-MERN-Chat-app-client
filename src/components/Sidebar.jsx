import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";

const Sidebar = ({ selectedUser, onSelectUser }) => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnline] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch all other users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/users", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, [user.token]);

  // Listen for online users list from Socket.io
  useEffect(() => {
    socket.on("getUsers", (onlineUserIds) => {
      setOnline(onlineUserIds);
    });
    return () => socket.off("getUsers");
  }, []);

  // Filter users by search input
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  const handleLogout = () => {
    socket.disconnect();
    logout();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>💬 {user.username}</h3>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="user-list">
        {filteredUsers.map((u) => {
          const isOnline = onlineUsers.includes(u._id);
          const isActive = selectedUser?._id === u._id;
          return (
            <div
              key={u._id}
              className={`user-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectUser(u)}
            >
              <div className="avatar">
                {u.username[0].toUpperCase()}
                {isOnline && <span className="online-dot" />}
              </div>
              <div className="user-info">
                <div className="name">{u.username}</div>
                <div className={`status ${isOnline ? "" : "offline"}`}>
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
