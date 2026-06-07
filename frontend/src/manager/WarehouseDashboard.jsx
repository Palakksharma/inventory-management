
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import {
  Box, Grid, Paper, Typography, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Divider, CircularProgress, IconButton
} from '@mui/material';

// Icons 
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HubIcon from '@mui/icons-material/Hub';
import InfoIcon from '@mui/icons-material/Info';
import ChatDrawer from './ChatDrawer';

export default function WarehouseDashboard() {
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [liveOpsFeed, setLiveOpsFeed] = useState([]);
  const [selectedManifestId, setSelectedManifestId] = useState(null);
  // 🔄 FETCH REAL TIME BACKEND DATA
  const fetchShipmentData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`${API_BASE_URL}/api/shipping/all`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      const dataPayload = response.data.data || response.data;
      const verifiedArray = Array.isArray(dataPayload) ? dataPayload : [];
      
      setShipments(verifiedArray);

      // Map sidebar details dynamically
      const formattedOps = verifiedArray.slice(0, 6).map(shipment => ({
        id: shipment._id,
        name: shipment.product?.name || shipment.product?.title || "Cargo Item",
        status: shipment.status || "Staged",
        time: shipment.updatedAt ? new Date(shipment.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        count: shipment.quantity || 1
      }));
      setLiveOpsFeed(formattedOps);

    } catch (err) {
      console.error("❌ Failed fetching cargo data matrix:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🗑️ DELETE HANDLER
  const handleDeleteManifest = async (id) => {
    if (!window.confirm("Are you sure you want to remove this entry?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/shipping/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      fetchShipmentData();
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  // 🔌 WEBSOCKET CONNECTION
  useEffect(() => {
    fetchShipmentData();

    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket"]
    });

    socketInstance.on("driver_manifest_update", () => {
      fetchShipmentData();
    });

    return () => socketInstance.disconnect();
  }, [fetchShipmentData]);

  // Derived metrics counters computed from the dataset array
  const totalStaged = shipments.filter(s => s.status?.toLowerCase() === 'pending').length;
  const activeTransit = shipments.filter(s => s.status?.toLowerCase() === 'in transit').length;
  const completedRuns = shipments.filter(s => s.status?.toLowerCase() === 'delivered').length;

  // Setup explicitly for 22 solid data columns
  const totalWeeks = 22;
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Box sx={{ bgcolor: '#07080a', minHeight: '100vh', color: '#e2e8f0', p: 3, fontFamily: 'sans-serif' }}>
      
      {/* HEADER NAVBAR PANEL */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="600" color="#8b949e">Supply Chain Logistics</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton sx={{ color: '#8b949e' }}><NotificationsIcon fontSize="small" /></IconButton>
          <IconButton sx={{ color: '#8b949e' }}><InfoIcon fontSize="small" /></IconButton>
          <Avatar sx={{ width: 28, height: 28, bgcolor: '#a855f7', fontSize: '0.8rem' }}>M</Avatar>
        </Box>
      </Box>

      <Typography variant="h5" fontWeight="700" sx={{ color: '#c084fc', mb: 3 }}>
        Operations Terminal (Hub Manager)
      </Typography>

      {/* FORCE GRID CONTAINER WRAPPER LAYOUT */}
      <Grid container spacing={3} style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        
        {/* LEFT MAIN DATA REGION */}
        <Grid item xs={12} md={9} style={{ display: 'block' }}>
          
          {/* STATS COUNT METERS ROW */}
          <Grid container spacing={2} sx={{ mb: 3 }} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #21262d', borderRadius: '8px' }}>
                <Typography variant="caption" color="#8b949e" display="block">Awaiting Packing</Typography>
                <Typography variant="h5" fontWeight="700" sx={{ mt: 0.5 }}>
                  {totalStaged} <Box component="span" sx={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 'bold' }}>+0 new</Box>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #21262d', borderRadius: '8px' }}>
                <Typography variant="caption" color="#8b949e" display="block">Ready for Driver</Typography>
                <Typography variant="h5" fontWeight="700" sx={{ mt: 0.5 }}>
                  {activeTransit} <Box component="span" sx={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 'bold' }}>On Track</Box>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #21262d', borderRadius: '8px' }}>
                <Typography variant="caption" color="#8b949e" display="block">Weekly Efficiency</Typography>
                <Typography variant="h5" fontWeight="700" color="#10b981" sx={{ mt: 0.5 }}>
                  {shipments.length > 0 ? Math.round((completedRuns / shipments.length) * 100) : 0}% <Box component="span" sx={{ fontSize: '0.75rem', color: '#10b981' }}>+1.2%</Box>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #21262d', borderRadius: '8px' }}>
                <Typography variant="caption" color="#8b949e" display="block">TOTAL MANIFESTS</Typography>
                <Typography variant="h5" fontWeight="700" sx={{ mt: 0.5 }}>{shipments.length}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* ACTIVITY HEATMAP (🎯 HARD HARDENED WITH FLEX DIRECTION FORCING) */}
          <Paper sx={{ p: 3, bgcolor: '#0d1117', border: '1px solid #21262d', borderRadius: '12px', mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>Activity by time</Typography>
            
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'flex-start' }}>
              
              {/* Day Titles block */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8b949e', height: '98px', paddingTop: '2px' }}>
                {dayLabels.map(day => <span key={day}>{day}</span>)}
              </div>
              
              {/* Grid Column engine wrapper */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '5px', overflowX: 'auto', width: '100%', paddingBottom: '4px' }}>
                {Array.from({ length: totalWeeks }).map((_, weekIdx) => (
                  <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {dayLabels.map((_, dayIdx) => {
                      const seedValue = weekIdx * 7 + dayIdx;
                      return (
                        <div 
                          key={dayIdx} 
                          style={{ 
                            width: '11px', 
                            height: '11px', 
                            borderRadius: '2px', 
                            backgroundColor: seedValue % 11 === 0 ? '#c084fc' : seedValue % 7 === 0 ? '#a855f7' : seedValue % 5 === 0 ? '#6366f1' : '#161b22' 
                          }} 
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>
          </Paper>

          {/* MAIN STAGING PANELS */}
          <Paper sx={{ bgcolor: '#0d1117', border: '1px solid #21262d', borderRadius: '12px', overflow: 'hidden', p: 2, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2, px: 1 }}>
              <Typography variant="subtitle1" fontWeight="700">Orders Awaiting Packing</Typography>
            </Box>

            {loading ? (
              <Box textAlign="center" py={4}><CircularProgress size={30} color="secondary" /></Box>
            ) : shipments.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#8b949e', textAlign: 'center', py: 4 }}>
                No active records currently inside tracking pipelines.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ '& th': { borderBottom: '1px solid #21262d', color: '#8b949e', fontSize: '0.8rem', py: 1 } }}>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ '& td': { borderBottom: '1px solid #21262d', color: '#c9d1d9', py: 1.5, fontSize: '0.85rem' } }}>
                    {shipments.map((shipment) => (
                      <TableRow key={shipment._id}>
                        <TableCell sx={{ fontWeight: '600' }}>
                          {shipment.product?.name || shipment.product?.title || "Cargo Load Item"}
                        </TableCell>
                        <TableCell>
                          {shipment.quantity || 0} Units <Box component="span" sx={{ color: '#8b949e', fontSize: '0.75rem', ml: 0.5 }}>({shipment.totalWeight || 0} kg)</Box>
                        </TableCell>
                        <TableCell sx={{ color: '#f0f6fc', fontWeight: '700' }}>
                          {shipment.fleet?.vehicleNumber || "TRK-IND-101"}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => handleDeleteManifest(shipment._id)} sx={{ color: '#ef4444', bgcolor: '#ef444415', p: 0.5, borderRadius: '6px', '&:hover': { bgcolor: '#ef444430' } }}>
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* ACTIVE DISCREPANCY MATRIX CARD */}
          <Paper sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #21262d', borderRadius: '12px' }}>
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>
                Active Monitor Discrepancy Matrix
              </Typography>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ '& th': { borderBottom: '1px solid #21262d', color: '#484f58', fontSize: '0.75rem', fontWeight: 'bold', py: 1 } }}>
                  <TableRow>
                    <TableCell style={{ width: '35%' }}>Manifest Entry Reference ID</TableCell>
                    <TableCell style={{ width: '35%' }}>Current Delivery Target</TableCell>
                    <TableCell style={{ width: '30%' }}>Live Route Status Token</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ '& td': { borderBottom: '1px solid #161b22', py: 1.5, fontSize: '0.85rem' } }}>
                  {shipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="caption" sx={{ color: '#484f58', display: 'block', my: 1, fontStyle: 'italic' }}>
                          No immediate cross-dock friction conflicts reported.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    shipments.slice(0, 5).map((shipment) => (
                      <TableRow key={shipment._id}>
                        <TableCell sx={{ color: '#8b949e', fontFamily: 'monospace' }}>
                          #{shipment._id?.toString().slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell sx={{ color: '#e2e8f0', fontWeight: '500' }}>
                          {shipment.product?.name || shipment.product?.title || "Cargo load"}
                        </TableCell>
                        <TableCell>
                          <Box component="span" sx={{
                            px: 1.2, py: 0.3, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold',
                            bgcolor: shipment.status?.toLowerCase() === 'delivered' ? '#10b98115' : shipment.status?.toLowerCase() === 'in transit' ? '#3b82f615' : '#f59e0b10',
                            color: shipment.status?.toLowerCase() === 'delivered' ? '#10b981' : shipment.status?.toLowerCase() === 'in transit' ? '#3b82f6' : '#f59e0b'
                          }}>
                            {shipment.status || "Pending"}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

        </Grid>

        {/* RIGHT FEED SIDEBAR AREA */}
        {/* RIGHT FEED SIDEBAR AREA */}
<Grid item xs={12} md={3} style={{ display: 'block' }}>
  <Paper sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #21262d', borderRadius: '12px', minHeight: '600px' }}>
    {selectedManifestId ? (
      <Box>
        <Typography variant="caption" sx={{ cursor: 'pointer', color: '#a855f7', mb: 1, display: 'block' }} onClick={() => setSelectedManifestId(null)}>
          &larr; Back to Feed
        </Typography>
        <ChatDrawer manifestId={selectedManifestId} onClose={() => setSelectedManifestId(null)} />
      </Box>
    ) : (
      <Box>
        <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#c084fc' }}>
          <HubIcon fontSize="inherit" /> Live Operations
        </Typography>
        <Divider sx={{ borderColor: '#21262d', mb: 2 }} />
        <Box display="flex" flexDirection="column" gap={2}>
          {liveOpsFeed.map((op, idx) => (
            <Box key={idx} onClick={() => setSelectedManifestId(op.id)} sx={{ cursor: 'pointer', p: 1, borderRadius: '8px', '&:hover': { bgcolor: '#161b22' } }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#21262d', color: '#a855f7' }}>
                  <SwapHorizIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.85rem', color: '#f0f6fc' }}>{op.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#8b949e' }}>
                    {op.status === 'Pending' ? 'Packed' : op.status} • {op.time}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    )}
  </Paper>
</Grid>

      </Grid>
    </Box>
  );
}
