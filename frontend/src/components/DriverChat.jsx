// import React, { useState, useEffect } from 'react';
// import { Box, Typography, Paper, TextField, IconButton } from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';
// import axios from 'axios';

// export default function DriverChat({ manifestId, driverName }) {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');

//   const fetchMessages = async () => {
//     if (!manifestId) return;
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get(`http://localhost:5000/api/chat/${manifestId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       // FIX: Access res.data.data based on your console logs
//       const messagesArray = res.data.data;
      
//       setMessages(Array.isArray(messagesArray) ? messagesArray : []);
//     } catch (err) {
//       console.error("Load failed:", err);
//       setMessages([]);
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//   }, [manifestId]); // Ensures it updates when you click a different manifest

//   const handleSend = async () => {
//     if (!input.trim()) return;
//     const token = localStorage.getItem("token");
//     const newMessage = { text: input, senderRole: 'Manager' };

//     setInput('');
//     try {
//       await axios.post(`http://localhost:5000/api/chat/${manifestId}`, newMessage, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       fetchMessages(); // Refresh UI after sending
//     } catch (err) {
//       console.error("Send failed:", err);
//     }
//   };

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', height: '500px', p: 1 }}>
//       <Typography variant="caption" sx={{ color: '#c084fc', mb: 1 }}>
//         Chat with: {driverName || "Driver"}
//       </Typography>

//       <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
//         {messages.length > 0 ? (
//           messages.map((m, i) => {
//             // Check if message is from Manager or Driver
//             const isMe = m.senderRole === 'Manager' || m.sender === 'manager_admin';
//             return (
//               <Box key={i} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
//                 <Typography variant="caption" sx={{ color: '#8b949e', ml: isMe ? 0 : 1 }}>
//                   {isMe ? 'You' : driverName}
//                 </Typography>
//                 <Paper
//                   sx={{
//                     p: 1.5,
//                     borderRadius: '12px',
//                     bgcolor: isMe ? '#a855f7' : '#21262d',
//                     color: '#fff',
//                   }}
//                 >
//                   {m.text}
//                 </Paper>
//               </Box>
//             );
//           })
//         ) : (
//           <Typography variant="caption" sx={{ color: '#8b949e', textAlign: 'center', mt: 2 }}>
//             No messages yet.
//           </Typography>
//         )}
//       </Box>

//       <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           sx={{ bgcolor: '#161b22', input: { color: '#fff' }, borderRadius: '4px' }}
//         />
//         <IconButton onClick={handleSend} sx={{ color: '#a855f7' }}>
//           <SendIcon />
//         </IconButton>
//       </Box>
//     </Box>
//   );
// }
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// --- CONFIGURATION: CHECK YOUR BACKEND SERVER.JS ---
const CHAT_API_BASE_URL = `${API_BASE_URL}/api/chat`; 

export default function DriverChat({ manifestId, driverName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const fetchMessages = async () => {
    if (!manifestId) return;
    try {
      const token = localStorage.getItem("token");
      const url = `${CHAT_API_BASE_URL}/${manifestId}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const messagesArray = res.data.data;
      setMessages(Array.isArray(messagesArray) ? messagesArray : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [manifestId]);

  const handleSend = async () => {
    if (!input.trim() || !manifestId) return;

    const newMessage = { 
      text: input, 
      senderRole: 'Manager',
      timestamp: new Date() 
    };

    // 1. Optimistic UI Update
    setMessages((prev) => [...prev, newMessage]);
    const originalInput = input;
    setInput('');

    try {
      const token = localStorage.getItem("token");
      const url = `${CHAT_API_BASE_URL}/${manifestId}`;
      await axios.post(url, newMessage, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Post Error:", err);
      // Rollback UI update on failure
      setMessages((prev) => prev.filter(m => m !== newMessage));
      setInput(originalInput);
      alert("Failed to send: Ensure your backend route matches " + CHAT_API_BASE_URL);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '500px', p: 1 }}>
      <Typography variant="caption" sx={{ color: '#c084fc', mb: 1 }}>
        Chat with: {driverName || "Driver"}
      </Typography>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.length > 0 ? (
          messages.map((m, i) => {
            const isMe = m.senderRole === 'Manager';
            return (
              <Box key={i} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <Typography variant="caption" sx={{ color: '#8b949e', ml: isMe ? 0 : 1 }}>
                  {isMe ? 'You' : driverName}
                </Typography>
                <Paper sx={{ p: 1.5, borderRadius: '12px', bgcolor: isMe ? '#a855f7' : '#21262d', color: '#fff' }}>
                  {m.text}
                </Paper>
              </Box>
            );
          })
        ) : (
          <Typography variant="caption" sx={{ color: '#8b949e', textAlign: 'center', mt: 2 }}>
            No messages yet.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          sx={{ bgcolor: '#161b22', input: { color: '#fff' }, borderRadius: '4px' }}
        />
        <IconButton onClick={handleSend} sx={{ color: '#a855f7' }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}