import { io } from "socket.io-client";

// Connect to the backend Socket.io server
// We export this so all components share ONE connection
const socket = io("http://localhost:5000", {
  autoConnect: false, // Don't connect automatically — we'll connect after login
});

export default socket;
