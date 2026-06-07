import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Fetch credentials saved during Login
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const warehouseId = localStorage.getItem("warehouseId");

    if (!token) return;

    // 2. Connect to your Backend Server Instance
    const socketInstance = io(API_BASE_URL, {
      auth: { token }, // Useful if you implemented handshake auth middleware
      transports: ["websocket"] // Forces stable WebSocket layer connection
    });

    socketInstance.on("connect", () => {
      console.log(`⚡ Connected to Real-time Stream: ${socketInstance.id}`);
      
      // 3. Emit the authentication event you built in your backend server state
      socketInstance.emit("authenticate_session", {
        role: role,
        warehouseId: warehouseId
      });
    });

    setSocket(socketInstance);

    // Clean up connection when user closes browser tab or logs out
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
