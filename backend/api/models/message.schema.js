import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    manifestId: { type: String, required: true }, // Changed to String
    sender: { type: String, required: true },     // Changed to String
    senderRole: { type: String, required: true }, // Ensure this is passed
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;