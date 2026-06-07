// import React from 'react';
// import { Box, Drawer, AppBar, CssBaseline, Toolbar, List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import InventoryIcon from '@mui/icons-material/Inventory';
// import PeopleIcon from '@mui/icons-material/People';
// import SettingsIcon from '@mui/icons-material/Settings';

// const drawerWidth = 240;
// export default function Layout({ children }) {
//   return (
//     <Box sx={{ display: 'flex' }}>
//       <CssBaseline />
//       {/* 1. The Top Bar */}
//       <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
//         <Toolbar>
//           <Typography variant="h6" noWrap component="div">
//             Warehouse Management System
//           </Typography>
//         </Toolbar>
//       </AppBar>

//       {/* 2. The Sidebar */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           width: drawerWidth,
//           flexShrink: 0,
//           [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
//         }}
//       >
//         <Toolbar />
//         <Box sx={{ overflow: 'auto' }}>
//           <List>
//             {/* We changed the names here to fit your project */}
//             {['Dashboard', 'Inventory'].map((text, index) => (
//               <ListItem key={text} disablePadding>
//                 <ListItemButton>
//                   <ListItemIcon>
//                     {index === 0 ? <DashboardIcon /> : <InventoryIcon />}
//                   </ListItemIcon>
//                   <ListItemText primary={text} />
//                 </ListItemButton>
//               </ListItem>
//             ))}
//           </List>
//           <Divider />
//           <List>
//             {['Staff Management', 'Settings'].map((text, index) => (
//               <ListItem key={text} disablePadding>
//                 <ListItemButton>
//                   <ListItemIcon>
//                     {index === 0 ? <PeopleIcon /> : <SettingsIcon />}
//                   </ListItemIcon>
//                   <ListItemText primary={text} />
//                 </ListItemButton>
//               </ListItem>
//             ))}
//           </List>
//         </Box>
//       </Drawer>

//       {/* 3. The Main Content Area */}
//       <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//         <Toolbar />
//         {/* 'children' represents the page we are currently on */}
//         {children}
//       </Box>
//     </Box>
//   );
// }
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { 
  Box, Drawer, AppBar, CssBaseline, Toolbar, List, 
  Typography, Divider, ListItem, ListItemButton, 
  ListItemIcon, ListItemText 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HistoryIcon from '@mui/icons-material/History';

const drawerWidth = 240;

export default function Layout({ children }) {
  const navigate = useNavigate();
  
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
      console.log(`🔌 Live Connection Verified! Socket ID: ${socket.id}`);
      
      socket.emit("authenticate_session", {
        role: role,
        warehouseId: warehouseId
      });
    });

    return () => {
      socket.disconnect();
      console.log("❌ Live Connection Terminated Safely");
    };
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Warehouse Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/dashboard')}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/inventory')}>
                <ListItemIcon><InventoryIcon /></ListItemIcon>
                <ListItemText primary="Inventory" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/fleet')}>
                <ListItemIcon><LocalShippingIcon /></ListItemIcon>
                <ListItemText primary="Fleet" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/shipping-history')}>
                <ListItemIcon><HistoryIcon /></ListItemIcon>
                <ListItemText primary="Shipping History" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
