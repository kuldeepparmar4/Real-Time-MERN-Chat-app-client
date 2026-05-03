import { io } from "socket.io-client";

// Connect to the backend Socket.io server
// We export this so all components share ONE connection
const socket = io("https://real-time-mern-chat-app-server.onrender.com", {
  autoConnect: false, // Don't connect automatically — we'll connect after login
});

export default socket;
