import React from 'react';
import DriverChat from '../components/DriverChat';
import { Box, Typography } from '@mui/material';

const ChatDrawer = ({ manifestId, onClose }) => {
  // Debug: Check if the ID is actually reaching the component
  console.log("ChatDrawer received Manifest ID:", manifestId);

  if (!manifestId) {
    return <Typography sx={{ p: 2 }}>Select a shipment to view chat.</Typography>;
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', // Use full height of the parent Paper
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#0d1117', // Match your dark theme
      overflow: 'hidden'
    }}>
      {/* If DriverChat is invisible, the border below will help you 
         see if the component is actually rendering on screen.
      */}
      <Box sx={{ border: '1px solid #3b82f6', flexGrow: 1, overflowY: 'auto' }}>
        <DriverChat 
          manifestId={manifestId} 
          driverId="manager_admin" 
          onClose={onClose} 
        />
      </Box>
    </Box>
  );
};

export default ChatDrawer;