
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { io } from 'socket.io-client';
// import { 
//   ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip,
//   CartesianGrid, AreaChart, Area, PieChart, Pie, Cell
// } from 'recharts';
// import { 
//   Box, Grid, Paper, Typography, TextField, 
//   InputAdornment, Avatar, List, ListItem, ListItemButton,
//   ListItemIcon, ListItemText, LinearProgress, Divider 
// } from '@mui/material';

// // Icons
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import LocalShippingIcon from '@mui/icons-material/LocalShipping';
// import AssessmentIcon from '@mui/icons-material/Assessment';
// import SearchIcon from '@mui/icons-material/Search';
// import LogoutIcon from '@mui/icons-material/Logout';
// import HistoryIcon from '@mui/icons-material/History';
// import NotificationsIcon from '@mui/icons-material/Notifications';
// import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// import { useNavigate, useLocation } from 'react-router-dom';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   const [report, setReport] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [stats, setStats] = useState({
//     outofStockCount: 0,
//     totalOrders: 0,
//     totalRevenue: 0, 
//     topStores: []
//   });

//   // Mock Data for the "System Activity Feed" to perfectly match your screenshot look
//   const [activityFeed] = useState([
//     { id: 1, title: 'Manifest #5521: Shipped', subtitle: '15 minutes ago - 11 bags ago', color: '#a855f7' },
//     { id: 2, title: 'Fleet #T-102: Dispatched', subtitle: '26 minutes ago - 11 bags ago', color: '#3b82f6' },
//     { id: 3, title: 'WH-LFP: Received', subtitle: '15 minutes ago - 3 items left', color: '#10b981' },
//     { id: 4, title: 'WH-LFP: Received', subtitle: '16 minutes ago - 10 items left', color: '#10b981' }
//   ]);

//   const fetchAllDashboardData = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const headers = { Authorization: `Bearer ${token}` };

//       const [reportRes, statsRes] = await Promise.all([
//         axios.get("http://localhost:5000/api/products/warehouse-report", { withCredentials: true }),
//         axios.get("http://localhost:5000/api/products/dashboard/stats", { headers, withCredentials: true })
//       ]);

//       setReport(reportRes.data);
//       const actualData = statsRes.data.data || statsRes.data;
//       if (actualData) {
//         setStats({
//           outofStockCount: actualData.outofStockCount || 0,
//           totalOrders: actualData.totalOrders || 0,
//           totalRevenue: actualData.totalRevenue || 0, 
//           topStores: actualData.topStores || []
//         });
//       }
//     } catch (err) {
//       console.error("Dashboard Sync Error:", err);
//     }
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     const warehouseId = localStorage.getItem("warehouseId");

//     if (!token) return;

//     const socket = io("http://localhost:5000", {
//       auth: { token },
//       transports: ["websocket"]
//     });

//     socket.on("connect", () => {
//       console.log(`🔌 Dashboard Socket Connected Successfully! ID: ${socket.id}`);
//       socket.emit("authenticate_session", { role: role, warehouseId: warehouseId });
//     });

//     socket.on("admin_alert", (data) => {
//       console.log("🚨 Live Operational Packet Captured via WebSocket:", data);
//       fetchAllDashboardData();
//     });

//     return () => socket.disconnect();
//   }, [fetchAllDashboardData]);

//   useEffect(() => {
//     fetchAllDashboardData();
//   }, [fetchAllDashboardData]);

//   useEffect(() => {
//     window.addEventListener('focus', fetchAllDashboardData);
//     return () => window.removeEventListener('focus', fetchAllDashboardData);
//   }, [fetchAllDashboardData]);

//   // KEEPING ALL YOUR EXACT LOGIC FILTER FILTERS UNTOUCHED
//   const filteredReport = report.filter(item => 
//     (item.warehouseName || "Unknown").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const filteredStores = stats.topStores.filter(store => 
//     (store.warehouseName || "N/A").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const maxStoreRevenue = Math.max(...filteredStores.map(s => s.revenue || 0), 1);

//   const COLORS = ['#a855f7', '#2196F3', '#4CAF50', '#FF9800', '#FF5630'];

//   return (
//     <Box sx={{ display: 'flex', bgcolor: '#07080a', minHeight: '100vh', color: '#e2e8f0' }}>
      
//       {/* SIDEBAR (Premium Cyber Theme) */}
//       <Box sx={{ width: 280, bgcolor: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 }}>
//         <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Avatar sx={{ width: 50, height: 50, bgcolor: '#1f6feb', border: `2px solid #a855f7` }}>PS</Avatar>
//           <Box>
//             <Typography variant="body1" fontWeight="700">Palak Sharma</Typography>
//             <Typography variant="caption" sx={{ color: '#829399', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>SUPPLY CHAIN LOGISTICS</Typography>
//           </Box>
//         </Box>

//         <List sx={{ px: 2, mt: 2 }}>
//           {[
//             { text: 'Global Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
//             { text: 'Fleet & Shipping', icon: <LocalShippingIcon />, path: '/fleet' },
//             { text: 'Inventory Audit', icon: <AssessmentIcon />, path: '/inventory' },
//             { text: 'Shipping History', icon: <HistoryIcon />, path: '/shipping-history' },
//           ].map((item) => {
//             const isActive = location.pathname === item.path;
//             return (
//               <ListItem key={item.text} disablePadding>
//                 <ListItemButton 
//                   onClick={() => navigate(item.path)}
//                   sx={{ 
//                     borderRadius: '10px', mb: 1, py: 1.2,
//                     bgcolor: isActive ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
//                     color: isActive ? '#c084fc' : '#8b949e',
//                     borderLeft: isActive ? '4px solid #a855f7' : '4px solid transparent',
//                     '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
//                   }}
//                 >
//                   <ListItemIcon sx={{ color: isActive ? '#c084fc' : '#8b949e', minWidth: 40 }}>{item.icon}</ListItemIcon>
//                   <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: '600', fontSize: '0.9rem' }} />
//                 </ListItemButton>
//               </ListItem>
//             );
//           })}
//         </List>

//         <Box sx={{ mt: 'auto', p: 3 }}>
//           <ListItemButton onClick={() => { localStorage.clear(); navigate('/login'); }} sx={{ color: '#FF5630', borderRadius: '12px', '&:hover': { bgcolor: 'rgba(255, 86, 48, 0.1)' } }}>
//             <ListItemIcon sx={{ color: '#FF5630', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
//             <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: '600' }} />
//           </ListItemButton>
//         </Box>
//       </Box>

//       {/* MAIN CONTENT TERMINAL */}
//       <Box sx={{ flexGrow: 1, p: 4, ml: '280px' }}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
//           <Box>
//             <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>Global Operations Control (Admin Panel)</Typography>
//             <Typography variant="body2" sx={{ color: '#8b949e' }}>Ludhiana Supply Chain Network Matrix</Typography>
//           </Box>
//           <TextField 
//             placeholder="Search warehouses..." 
//             size="small"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{ 
//               startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: '#8b949e' }} /></InputAdornment>),
//               style: { color: '#e2e8f0' }
//             }}
//             sx={{ 
//               width: 350, bgcolor: '#0d1117', 
//               '& .MuiOutlinedInput-root': { borderRadius: '10px', '& fieldset': { borderColor: '#21262d' }, '&:hover fieldset': { borderColor: '#30363d' } } 
//             }}
//           />
//         </Box>

//         <Grid container spacing={3}>
//           <Grid item xs={12} md={8.5}>
            
//             {/* STAT CARDS (Dark Glowing Containers) */}
//             <Grid container spacing={2} sx={{ mb: 4 }}>
//               {[
//                 { label: 'ACTIVE WAREHOUSES', val: report.length, color: '#2196F3' },
//                 { label: 'TOTAL ORDERS', val: stats.totalOrders, color: '#4CAF50' },
//                 { label: 'OUT OF STOCK', val: stats.outofStockCount, color: '#FF9800' },
//                 { label: 'TOTAL REVENUE', val: `$${(stats.totalRevenue || 0).toLocaleString()}`, color: '#a855f7' }
//               ].map((card, idx) => (
//                 <Grid item xs={3} key={idx}>
//                   <Paper sx={{ p: 2.5, bgcolor: '#0d1117', borderRadius: '12px', border: '1px solid #21262d', textAlign: 'center' }}>
//                     <Typography variant="caption" sx={{ color: '#6e7681', fontWeight: '800', letterSpacing: '0.5px' }}>{card.label}</Typography>
//                     <Typography variant="h4" fontWeight="700" sx={{ mt: 1, color: card.color }}>{card.val}</Typography>
//                   </Paper>
//                 </Grid>
//               ))}
//             </Grid>

//             {/* PERFORMANCE CHART (Darker Canvas Grid) */}
//             <Paper sx={{ p: 3, bgcolor: '#0d1117', borderRadius: '12px', border: '1px solid #21262d', mb: 3 }}>
//               <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <FiberManualRecordIcon sx={{ fontSize: 10, color: '#4CAF50' }} /> Efficiency Performance Matrix
//               </Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart data={filteredReport}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#161b22" />
//                   <XAxis dataKey="warehouseName" stroke="#484f58" tickLine={false} style={{ fontSize: '0.8rem' }} />
//                   <YAxis stroke="#484f58" tickLine={false} style={{ fontSize: '0.8rem' }} />
//                   <RechartsTooltip contentStyle={{ backgroundColor: '#0d1117', borderColor: '#30363d', color: '#e2e8f0' }} />
//                   <Area type="monotone" dataKey="totalExpense" stroke="#FF5630" fill="rgba(255, 86, 48, 0.02)" strokeWidth={3} />
//                   <Area type="monotone" dataKey="totalProfit" stroke="#4CAF50" fill="rgba(76, 175, 80, 0.05)" strokeWidth={3} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </Paper>
//           </Grid>

//           {/* RIGHT PANELS (System Activity Feed & Top Stores side-by-side stack) */}
//           <Grid item xs={12} md={3.5}>
            
//             {/* 1. REALTIME LIVE NOTIFICATION WIDGET */}
//             <Paper sx={{ p: 3, bgcolor: '#0d1117', borderRadius: '12px', border: '1px solid #21262d', mb: 3 }}>
//               <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                 <NotificationsIcon sx={{ fontSize: 18, color: '#a855f7' }} /> System Activity Feed
//               </Typography>
//               <Divider sx={{ borderColor: '#21262d', mb: 2 }} />
//               <List sx={{ p: 0, maxHeight: '200px', overflowY: 'auto' }}>
//                 {activityFeed.map((feed) => (
//                   <Box key={feed.id} sx={{ mb: 2, position: 'relative', pl: 2.5 }}>
//                     <FiberManualRecordIcon sx={{ fontSize: 8, color: feed.color, position: 'absolute', left: 0, top: 6 }} />
//                     <Typography variant="body2" fontWeight="700" sx={{ color: '#f0f6fc', lineHeight: 1.2 }}>{feed.title}</Typography>
//                     <Typography variant="caption" sx={{ color: '#8b949e', display: 'block', mt: 0.2 }}>{feed.subtitle}</Typography>
//                   </Box>
//                 ))}
//               </List>
//             </Paper>

//             {/* 2. SALES PROGRESS MATRIX */}
//             <Paper sx={{ p: 3, bgcolor: '#0d1117', borderRadius: '12px', border: '1px solid #21262d', minHeight: '220px' }}>
//               <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 3 }}>Top 10 Stores by Sales</Typography>
//               {filteredStores.map((store, i) => (
//                 <Box key={i} sx={{ mb: 2.5 }}>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
//                     <Typography variant="body2" fontWeight="600" sx={{ color: '#c9d1d9' }}>{store.warehouseName || "N/A"}</Typography>
//                     <Typography variant="body2" fontWeight="700" sx={{ color: '#e2e8f0' }}>${(store.revenue || 0).toLocaleString()}</Typography>
//                   </Box>
//                   <LinearProgress 
//                     variant="determinate" 
//                     value={((store.revenue || 0) / maxStoreRevenue) * 100} 
//                     sx={{ 
//                       height: 6, borderRadius: 3, bgcolor: '#161b22', 
//                       '& .MuiLinearProgress-bar': { bgcolor: COLORS[i % COLORS.length], borderRadius: 3 } 
//                     }}
//                   />
//                 </Box>
//               ))}
//             </Paper>

//           </Grid>
//         </Grid>
//       </Box>
//     </Box>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import { 
  ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip,
  CartesianGrid, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Box, Grid, Paper, Typography, TextField, 
  InputAdornment, Avatar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, LinearProgress, Divider 
} from '@mui/material';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [report, setReport] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    outofStockCount: 0,
    totalOrders: 0,
    totalRevenue: 0, 
    topStores: []
  });

  // 📈 PERSISTENT DATABASE STATE FOR LIVE ACTIVITY LOGS
  const [activities, setActivities] = useState([]);

  // 🕒 LIVE TIME-AGO CALCULATOR UTILITY
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    const postDate = new Date(timestamp);
    const nowDate = new Date();
    const differenceInMs = nowDate - postDate;
    
    const minutes = Math.floor(differenceInMs / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const fetchAllDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Simultaneously fetch stats, inventory summaries, and our historical logger timeline
      const [reportRes, statsRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/products/warehouse-report`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/products/dashboard/stats`, { headers, withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/products/activities`, { withCredentials: true }) // Your new logging route
      ]);

      setReport(reportRes.data);
      
      if (activityRes.data?.success) {
        setActivities(activityRes.data.data);
      }

      const actualData = statsRes.data.data || statsRes.data;
      if (actualData) {
        setStats({
          outofStockCount: actualData.outofStockCount || 0,
          totalOrders: actualData.totalOrders || 0,
          totalRevenue: actualData.totalRevenue || 0, 
          topStores: actualData.topStores || []
        });
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const warehouseId = localStorage.getItem("warehouseId");

    if (!token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      console.log(`🔌 Dashboard Socket Connected Successfully! ID: ${socket.id}`);
      socket.emit("authenticate_session", { role: role, warehouseId: warehouseId });
    });

    // Capture standard system re-sync requests
    socket.on("admin_alert", (data) => {
      console.log("🚨 Live Operational Packet Captured via WebSocket:", data);
      fetchAllDashboardData();
    });

    // 📡 STREAM SUBSCRIPTION: Append new system logs directly into the visual feed card
    socket.on("new_global_activity", (newLog) => {
      console.log("💾 Real-Time Database Activity Broadcast Received:", newLog);
      setActivities((prev) => [newLog, ...prev.slice(0, 14)]); // Capped at top 15 logs
    });

    return () => socket.disconnect();
  }, [fetchAllDashboardData]);

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  useEffect(() => {
    window.addEventListener('focus', fetchAllDashboardData);
    return () => window.removeEventListener('focus', fetchAllDashboardData);
  }, [fetchAllDashboardData]);

  const filteredReport = report.filter(item => 
    (item.warehouseName || "Unknown").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStores = stats.topStores.filter(store => 
    (store.warehouseName || "N/A").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maxStoreRevenue = Math.max(...filteredStores.map(s => s.revenue || 0), 1);
  const COLORS = ['#a855f7', '#2196F3', '#4CAF50', '#FF9800', '#FF5630'];

  // Helper mapping to maintain your precise premium look
  const getBulletColor = (type) => {
    if (type === 'manifest') return '#a855f7';  // Purple
    if (type === 'fleet') return '#3b82f6';     // Blue
    return '#10b981';                            // Green ('warehouse')
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#07080a', minHeight: '100vh', color: '#e2e8f0' }}>
      
      {/* SIDEBAR */}
      <Box sx={{ width: 280, bgcolor: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 50, height: 50, bgcolor: '#1f6feb', border: `2px solid #a855f7` }}>PS</Avatar>
          <Box>
            <Typography variant="body1" fontWeight="700">Palak Sharma</Typography>
            <Typography variant="caption" sx={{ color: '#829399', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>SUPPLY CHAIN LOGISTICS</Typography>
          </Box>
        </Box>

        <List sx={{ px: 2, mt: 2 }}>
          {[
            { text: 'Global Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
            { text: 'Fleet & Shipping', icon: <LocalShippingIcon />, path: '/fleet' },
            { text: 'Inventory Audit', icon: <AssessmentIcon />, path: '/inventory' },
            { text: 'Shipping History', icon: <HistoryIcon />, path: '/shipping-history' },
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    borderRadius: '10px', mb: 1, py: 1.2,
                    bgcolor: isActive ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
                    color: isActive ? '#c084fc' : '#8b949e',
                    borderLeft: isActive ? '4px solid #a855f7' : '4px solid transparent',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#c084fc' : '#8b949e', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: '600', fontSize: '0.9rem' }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', p: 3 }}>
          <ListItemButton onClick={() => { localStorage.clear(); navigate('/login'); }} sx={{ color: '#FF5630', borderRadius: '12px', '&:hover': { bgcolor: 'rgba(255, 86, 48, 0.1)' } }}>
            <ListItemIcon sx={{ color: '#FF5630', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: '600' }} />
          </ListItemButton>
        </Box>
      </Box>

      {/* MAIN CONTENT TERMINAL */}
      <Box sx={{ flexGrow: 1, p: 4, ml: '280px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>Global Operations Control (Admin Panel)</Typography>
            <Typography variant="body2" sx={{ color: '#8b949e' }}>Ludhiana Supply Chain Network Matrix</Typography>
          </Box>
          <TextField 
            placeholder="Search warehouses..." 
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ 
              startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: '#8b949e' }} /></InputAdornment>),
              style: { color: '#e2e8f0' }
            }}
            sx={{ 
              width: 350, bgcolor: '#0d1117', 
              '& .MuiOutlinedInput-root': { borderRadius: '10px', '& fieldset': { borderColor: '#21262d' }, '&:hover fieldset': { borderColor: '#30363d' } } 
            }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8.5}>
            
            {/* STAT CARDS */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { label: 'ACTIVE WAREHOUSES', val: report.length, color: '#2196F3' },
                { label: 'TOTAL ORDERS', val: stats.totalOrders, color: '#4CAF50' },
                { label: 'OUT OF STOCK', val: stats.outofStockCount, color: '#FF9800' },
                { label: 'TOTAL REVENUE', val: `$${(stats.totalRevenue || 0).toLocaleString()}`, color: '#a855f7' }
              ].map((card, idx) => (
                <Grid item xs={3} key={idx}>
                  <Paper sx={{ p: 2.5, bgcolor: '#0d1117', borderRadius: '12px', border: '1px solid #21262d', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#6e7681', fontWeight: '800', letterSpacing: '0.5px' }}>{card.label}</Typography>
                    <Typography variant="h4" fontWeight="700" sx={{ mt: 1, color: card.color }}>{card.val}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* PERFORMANCE CHART */}
            <Paper sx={{ p: 3, bgcolor: '#0d1117', borderRadius: '12px', border: '1px solid #21262d', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiberManualRecordIcon sx={{ fontSize: 10, color: '#4CAF50' }} /> Efficiency Performance Matrix
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={filteredReport}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#161b22" />
                  <XAxis dataKey="warehouseName" stroke="#484f58" tickLine={false} style={{ fontSize: '0.8rem' }} />
                  <YAxis stroke="#484f58" tickLine={false} style={{ fontSize: '0.8rem' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0d1117', borderColor: '#30363d', color: '#e2e8f0' }} />
                  <Area type="monotone" dataKey="totalExpense" stroke="#FF5630" fill="rgba(255, 86, 48, 0.02)" strokeWidth={3} />
                  <Area type="monotone" dataKey="totalProfit" stroke="#4CAF50" fill="rgba(76, 175, 80, 0.05)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* RIGHT PANELS */}
          <Grid item xs={12} md={3.5}>
            
            {/* 1. DYNAMIC SYSTEM ACTIVITY FEED WIDGET */}
            <Paper sx={{ p: 3, bgcolor: '#0d1117', borderRadius: '12px', border: '1px solid #21262d', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <NotificationsIcon sx={{ fontSize: 18, color: '#a855f7' }} /> System Activity Feed
              </Typography>
              <Divider sx={{ borderColor: '#21262d', mb: 2 }} />
              <List sx={{ p: 0, maxHeight: '200px', overflowY: 'auto' }}>
                {activities.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#8b949e', textAlign: 'center', py: 2 }}>
                    No operations logged.
                  </Typography>
                ) : (
                  activities.map((log) => (
                    <Box key={log._id} sx={{ mb: 2, position: 'relative', pl: 2.5 }}>
                      <FiberManualRecordIcon sx={{ fontSize: 8, color: getBulletColor(log.type), position: 'absolute', left: 0, top: 6 }} />
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#f0f6fc', lineHeight: 1.2 }}>
                        {log.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8b949e', display: 'block', mt: 0.2 }}>
                        {formatTimeAgo(log.createdAt)} - {log.description}
                      </Typography>
                    </Box>
                  ))
                )}
              </List>
            </Paper>

            {/* 2. SALES PROGRESS MATRIX */}
            <Paper sx={{ p: 3, bgcolor: '#0d1117', borderRadius: '12px', border: '1px solid #21262d', minHeight: '220px' }}>
              <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 3 }}>Top 10 Stores by Sales</Typography>
              {filteredStores.map((store, i) => (
                <Box key={i} sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="600" sx={{ color: '#c9d1d9' }}>{store.warehouseName || "N/A"}</Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ color: '#e2e8f0' }}>${(store.revenue || 0).toLocaleString()}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={((store.revenue || 0) / maxStoreRevenue) * 100} 
                    sx={{ 
                      height: 6, borderRadius: 3, bgcolor: '#161b22', 
                      '& .MuiLinearProgress-bar': { bgcolor: COLORS[i % COLORS.length], borderRadius: 3 } 
                    }}
                  />
                </Box>
              ))}
            </Paper>

          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;