import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";

const Sidebar = ({ selectedUser, onSelectUser }) => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnline] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get(
        "https://real-time-mern-chat-app-server.onrender.com/api/auth/users",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      )
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, [user.token]);

  useEffect(() => {
    socket.on("getUsers", (ids) => setOnline(ids));
    return () => socket.off("getUsers");
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">💬</div>
          <span className="sidebar-brand-name">ChatFlow</span>
        </div>
        <div className="sidebar-user-row">
          <span className="sidebar-username">@{user.username}</span>
          <button
            className="logout-btn"
            onClick={() => {
              socket.disconnect();
              logout();
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="sidebar-section-label">People — {filtered.length}</div>

      <div className="user-list">
        {filtered.map((u) => {
          const isOnline = onlineUsers.includes(u._id);
          return (
            <div
              key={u._id}
              className={`user-item ${selectedUser?._id === u._id ? "active" : ""}`}
              onClick={() => onSelectUser(u)}
            >
              <div className="avatar">
                {u.username[0].toUpperCase()}
                {isOnline && <span className="online-dot" />}
              </div>
              <div className="user-info">
                <div className="name">{u.username}</div>
                <div className={`status ${isOnline ? "" : "offline"}`}>
                  {isOnline ? "● Online" : "○ Offline"}
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
