import Message from '../models/message.schema.js';

export const getChatHistory = async (req, res) => {
  try {
    const { manifestId } = req.params;
    console.log("🔍 Backend searching for manifestId:", manifestId);

    const messages = await Message.find({ manifestId: manifestId })
      .sort({ createdAt: 1 });

    console.log("💾 Found count:", messages.length);
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const sendMessage = async (req, res) => {
  try {
    const { manifestId } = req.params;
    const { text, senderRole } = req.body;

    // Create the message object
    const newMessage = new Message({
      manifestId,
      text,
      senderRole,
      sender: req.user?._id || 'manager_admin' // Uses user ID from token or fallback
    });

    await newMessage.save();

    return res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("❌ Error saving message:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};