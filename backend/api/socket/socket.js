import Message from "../models/message.schema.js";

export const setupSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on("join_manifest_chat", (manifestId) => {
            if (manifestId) socket.join(`chat_${manifestId}`);
        });

        socket.on("send_chat_message", async (data) => {
            try {
                const newMessage = await Message.create({
                    manifestId: data.manifestId,
                    sender: data.senderId,
                    senderRole: data.senderRole,
                    text: data.text
                });

                io.to(`chat_${data.manifestId}`).emit("receive_chat_message", newMessage);
            } catch (err) {
                console.error("❌ DB SAVE ERROR:", err.message);
            }
        });
    });
};