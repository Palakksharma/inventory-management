
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { 
//   Box, Paper, Table, TableBody, TableCell, TableContainer, 
//   TableHead, TableRow, TextField, Button, Typography, MenuItem, 
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Chip, IconButton
// } from '@mui/material';

// // Icons
// import LocalShippingIcon from '@mui/icons-material/LocalShipping';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import InventoryIcon from '@mui/icons-material/Inventory';

// const Inventory = () => {
//   const [products, setProducts] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [fleet, setFleet] = useState([]); 
//   const [search, setSearch] = useState("");
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [isAdding, setIsAdding] = useState(false);
  
//   // Shipping Modal State
//   const [shippingProduct, setShippingProduct] = useState(null);
//   const [shipData, setShipData] = useState({ fleetId: "", quantity: 1 });

//   const [newProduct, setNewProduct] = useState({
//     title: "", category: "", price: "", quantity: "", warehouseId: "" 
//   });

//   // 1. Fetch Data
//   const fetchData = async () => {
//     try {
//       const [prodRes, whRes, fleetRes] = await Promise.all([
//         axios.get(`http://localhost:5000/api/products?search=${search}`, { withCredentials: true }),
//         axios.get("http://localhost:5000/api/warehouses/all", { withCredentials: true }),
//         axios.get("http://localhost:5000/api/fleet/all", { withCredentials: true })
//       ]);
//       setProducts(prodRes.data.products || []);
//       setWarehouses(whRes.data || []);
//       setFleet(fleetRes.data || []);
//     } catch (err) {
//       console.error("Data Fetching Error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [search]);

//   // 2. Add Product
//   const handleAddProduct = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://localhost:5000/api/products/add-stock", newProduct, { withCredentials: true });
//       setIsAdding(false);
//       setNewProduct({ title: "", category: "", price: "", quantity: "", warehouseId: "" });
//       alert("Product added successfully!");
//       fetchData();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error adding product");
//     }
//   };

//   // 3. Update Logic
//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, editingProduct, { withCredentials: true });
//       setEditingProduct(null);
//       fetchData();
//       alert("Updated successfully!");
//     } catch (err) { alert("Update failed."); }
//   };

//   // 4. Delete Logic
//   const handleDelete = async (id) => {
//     if (window.confirm("Delete product?")) {
//       try {
//         await axios.delete(`http://localhost:5000/api/products/${id}`, { withCredentials: true });
//         fetchData();
//       } catch (err) { alert("Delete failed."); }
//     }
//   };

//   // 5. Stock Adjustment (PATCH /stock/:id)
//   const handleStockAdjustment = async (productId) => {
//     const amount = window.prompt("Change quantity (e.g. 10 or -5):");
//     if (!amount) return;
//     try {
//       // Calling the specific route we updated in backend
//       await axios.patch(`http://localhost:5000/api/products/stock/${productId}`, 
//         { amount: Number(amount) }, 
//         { withCredentials: true }
//       );
//       fetchData();
//       alert("Stock adjusted.");
//     } catch (err) {
//       alert(err.response?.data?.message || "Adjustment failed.");
//     }
//   };

//   // 6. Shipment Execution
//   const handleConfirmShipment = async () => {
//     try {
//       const payload = {
//         productId: shippingProduct._id,
//         warehouseId: shippingProduct.warehouseId || shippingProduct.warehouse,
//         fleetId: shipData.fleetId,
//         quantity: Number(shipData.quantity)
//       };
//       await axios.post("http://localhost:5000/api/shipping/create", payload, { withCredentials: true });
//       alert("Item loaded onto truck successfully!");
//       setShippingProduct(null);
//       setShipData({ fleetId: "", quantity: 1 });
//       fetchData();
//     } catch (err) {
//       alert(err.response?.data?.message || "Shipping failed");
//     }
//   };

//   return (
//     <Box sx={{ p: 4, ml: '280px', bgcolor: '#F8F9FA', minHeight: '100vh' }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
//         <Typography variant="h4" fontWeight="800" color="#102542">Inventory Management</Typography>
//         {!isAdding && !editingProduct && (
//           <Button variant="contained" sx={{ bgcolor: '#102542', borderRadius: '10px' }} onClick={() => setIsAdding(true)}>
//             + Add New Product
//           </Button>
//         )}
//       </Box>

//       {/* --- ADD / EDIT VIEWS --- */}
//       {isAdding ? (
//         <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
//           <Typography variant="h6" sx={{ mb: 2 }} fontWeight="700">Add New Entry</Typography>
//           <form onSubmit={handleAddProduct}>
//             <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
//               <TextField fullWidth label="Title" required value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} />
//               <TextField fullWidth label="Category" required value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
//               <TextField fullWidth label="Price ($)" type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
//               <TextField fullWidth label="Initial Stock" type="number" required value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} />
//               <TextField select fullWidth label="Select Warehouse" required value={newProduct.warehouseId} onChange={(e) => setNewProduct({...newProduct, warehouseId: e.target.value})}>
//                 {warehouses.map((w) => (
//                   <MenuItem key={w._id} value={w._id}>{w.name} ({w.totalCapacity - w.currentStockLevel} free)</MenuItem>
//                 ))}
//               </TextField>
//             </Box>
//             <Box sx={{ mt: 3 }}>
//               <Button type="submit" variant="contained" sx={{ mr: 2, bgcolor: '#102542' }}>Save Product</Button>
//               <Button variant="outlined" color="inherit" onClick={() => setIsAdding(false)}>Cancel</Button>
//             </Box>
//           </form>
//         </Paper>
//       ) : editingProduct ? (
//         <Paper sx={{ p: 4, borderRadius: '16px' }}>
//           <Typography variant="h6" sx={{ mb: 3 }} fontWeight="700">Edit Details</Typography>
//           <form onSubmit={handleUpdate}>
//             <TextField fullWidth label="Title" sx={{ mb: 2 }} value={editingProduct.title} onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})} />
//             <TextField fullWidth label="Price" type="number" sx={{ mb: 3 }} value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} />
//             <Button type="submit" variant="contained" sx={{ mr: 2, bgcolor: '#102542' }}>Update</Button>
//             <Button variant="outlined" color="inherit" onClick={() => setEditingProduct(null)}>Cancel</Button>
//           </form>
//         </Paper>
//       ) : (
//         <>
//           <TextField fullWidth placeholder="Search inventory..." variant="outlined" sx={{ mb: 4, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} value={search} onChange={(e) => setSearch(e.target.value)} />
          
//           <TableContainer component={Paper} sx={{ borderRadius: '15px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
//             <Table>
//               <TableHead sx={{ bgcolor: '#F1F3F5' }}>
//                 <TableRow>
//                   <TableCell sx={{ fontWeight: '700' }}>Product</TableCell>
//                   <TableCell sx={{ fontWeight: '700' }}>Stock</TableCell>
//                   <TableCell sx={{ fontWeight: '700' }}>Price</TableCell>
//                   <TableCell align="center" sx={{ fontWeight: '700' }}>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {products.map((item) => (
//                   <TableRow key={item._id} hover>
//                     <TableCell>
//                       <Typography fontWeight="700">{item.title}</Typography>
//                       <Typography variant="caption" color="textSecondary">{item.category}</Typography>
//                     </TableCell>
                    
//                     {/* LOW STOCK LOGIC */}
//                     <TableCell sx={{ color: item.quantity < 5 ? '#D32F2F' : 'inherit', fontWeight: item.quantity < 5 ? 'bold' : 'normal' }}>
//                       {item.quantity}
//                       {item.quantity < 5 && <Chip label="Low" size="small" sx={{ ml: 1, height: '18px', fontSize: '10px', bgcolor: '#FFEBEE', color: '#D32F2F' }} />}
//                     </TableCell>

//                     <TableCell fontWeight="600">${item.price}</TableCell>
                    
//                     <TableCell align="right">
//                       <Button size="small" startIcon={<LocalShippingIcon />} sx={{ color: '#4CAF50', mr: 1 }} onClick={() => setShippingProduct(item)}>Ship</Button>
//                       <IconButton onClick={() => setEditingProduct(item)} color="primary"><EditIcon /></IconButton>
//                       <IconButton onClick={() => handleStockAdjustment(item._id)} color="secondary"><InventoryIcon /></IconButton>
//                       <IconButton onClick={() => handleDelete(item._id)} color="error"><DeleteIcon /></IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </>
//       )}

//       {/* --- SHIPPING DIALOG (MODAL) --- */}
//       <Dialog 
//         open={Boolean(shippingProduct)} 
//         onClose={() => setShippingProduct(null)} 
//         fullWidth 
//         maxWidth="xs"
//         slotProps={{ paper: { sx: { borderRadius: '16px', p: 1 } } }}
//       >
//         <DialogTitle sx={{ fontWeight: '800' }}>Create Shipment</DialogTitle>
//         <DialogContent sx={{ pt: 2 }}>
//           <Typography variant="subtitle2" sx={{ mb: 2 }}>Item: {shippingProduct?.title}</Typography>
//           <TextField
//             select fullWidth label="Select Vehicle" sx={{ mb: 3 }}
//             value={shipData.fleetId}
//             onChange={(e) => setShipData({...shipData, fleetId: e.target.value})}
//           >
//             {fleet.filter(v => v.status === 'Idle').map((v) => (
//               <MenuItem key={v._id} value={v._id}>
//                 {v.vehicleNumber} ({v.currentWeightLoad}/{v.maxWeightCapacity}kg)
//               </MenuItem>
//             ))}
//           </TextField>
//           <TextField
//             fullWidth type="number" label="Quantity to Ship"
//             value={shipData.quantity}
//             onChange={(e) => setShipData({...shipData, quantity: e.target.value})}
//             // Note: lowercase 'inputProps' for native attributes
//             inputProps={{ max: shippingProduct?.quantity, min: 1 }}
//           />
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={() => setShippingProduct(null)} color="inherit">Cancel</Button>
//           <Button 
//             variant="contained" 
//             sx={{ bgcolor: '#102542' }}
//             onClick={handleConfirmShipment}
//             disabled={!shipData.fleetId || shipData.quantity > shippingProduct?.quantity}
//           >
//             Confirm & Load
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default Inventory;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, Button, Typography, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, IconButton
} from '@mui/material';

// Icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [fleet, setFleet] = useState([]); 
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [shippingProduct, setShippingProduct] = useState(null);
  const [shipData, setShipData] = useState({ fleetId: "", quantity: 1 });

  const [newProduct, setNewProduct] = useState({
    title: "", category: "", price: "", quantity: "", warehouseId: "" 
  });

  // Helper to get the token
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchData = async () => {
    try {
      const config = getAuthHeader();
      const [prodRes, whRes, fleetRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/products?search=${search}`, config),
        axios.get(`${API_BASE_URL}/api/warehouses/all`, config),
        axios.get(`${API_BASE_URL}/api/fleet/all`, config)
      ]);
      setProducts(prodRes.data.products || []);
      setWarehouses(whRes.data || []);
      setFleet(fleetRes.data || []);
    } catch (err) {
      console.error("Data Fetching Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/products/add-stock`, newProduct, getAuthHeader());
      setIsAdding(false);
      setNewProduct({ title: "", category: "", price: "", quantity: "", warehouseId: "" });
      alert("Product added successfully!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding product");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/products/${editingProduct._id}`, editingProduct, getAuthHeader());
      setEditingProduct(null);
      fetchData();
      alert("Updated successfully!");
    } catch (err) { alert("Update failed."); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete product?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`, getAuthHeader());
        fetchData();
      } catch (err) { alert("Delete failed."); }
    }
  };

  const handleStockAdjustment = async (productId) => {
    const amount = window.prompt("Change quantity (e.g. 10 or -5):");
    if (!amount) return;
    try {
      await axios.patch(`${API_BASE_URL}/api/products/stock/${productId}`, 
        { amount: Number(amount) }, 
        getAuthHeader()
      );
      fetchData();
      alert("Stock adjusted.");
    } catch (err) {
      alert(err.response?.data?.message || "Adjustment failed.");
    }
  };

  const handleConfirmShipment = async () => {
    try {
      const payload = {
        productId: shippingProduct._id,
        warehouseId: shippingProduct.warehouseId || shippingProduct.warehouse,
        fleetId: shipData.fleetId,
        quantity: Number(shipData.quantity)
      };
      await axios.post(`${API_BASE_URL}/api/shipping/create`, payload, getAuthHeader());
      alert("Item loaded onto truck successfully!");
      setShippingProduct(null);
      setShipData({ fleetId: "", quantity: 1 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Shipping failed");
    }
  };

  return (
    <Box sx={{ p: 4, ml: '280px', bgcolor: '#F8F9FA', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#102542' }}>Inventory Management</Typography>
        {!isAdding && !editingProduct && (
          <Button variant="contained" sx={{ bgcolor: '#102542', borderRadius: '10px' }} onClick={() => setIsAdding(true)}>
            + Add New Product
          </Button>
        )}
      </Box>

      {isAdding ? (
        <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Add New Entry</Typography>
          <form onSubmit={handleAddProduct}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField fullWidth label="Title" required value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} />
              <TextField fullWidth label="Category" required value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
              <TextField fullWidth label="Price ($)" type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              <TextField fullWidth label="Initial Stock" type="number" required value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} />
              <TextField select fullWidth label="Select Warehouse" required value={newProduct.warehouseId} onChange={(e) => setNewProduct({...newProduct, warehouseId: e.target.value})}>
                {warehouses.map((w) => (
                  <MenuItem key={w._id} value={w._id}>{w.name} ({w.totalCapacity - w.currentStockLevel} free)</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" sx={{ mr: 2, bgcolor: '#102542' }}>Save Product</Button>
              <Button variant="outlined" color="inherit" onClick={() => setIsAdding(false)}>Cancel</Button>
            </Box>
          </form>
        </Paper>
      ) : editingProduct ? (
        <Paper sx={{ p: 4, borderRadius: '16px' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Edit Details</Typography>
          <form onSubmit={handleUpdate}>
            <TextField fullWidth label="Title" sx={{ mb: 2 }} value={editingProduct.title} onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})} />
            <TextField fullWidth label="Price" type="number" sx={{ mb: 3 }} value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} />
            <Button type="submit" variant="contained" sx={{ mr: 2, bgcolor: '#102542' }}>Update</Button>
            <Button variant="outlined" color="inherit" onClick={() => setEditingProduct(null)}>Cancel</Button>
          </form>
        </Paper>
      ) : (
        <>
          <TextField fullWidth placeholder="Search inventory..." variant="outlined" sx={{ mb: 4, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} value={search} onChange={(e) => setSearch(e.target.value)} />
          
          <TableContainer component={Paper} sx={{ borderRadius: '15px', border: '1px solid #E0E0E0', boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F1F3F5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((item) => (
                  <TableRow key={item._id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                      <Typography variant="caption" color="textSecondary">{item.category}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: item.quantity < 5 ? '#D32F2F' : 'inherit', fontWeight: item.quantity < 5 ? 'bold' : 'normal' }}>
                      {item.quantity}
                      {item.quantity < 5 && <Chip label="Low" size="small" sx={{ ml: 1, height: '18px', fontSize: '10px', bgcolor: '#FFEBEE', color: '#D32F2F' }} />}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>${item.price}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<LocalShippingIcon />} sx={{ color: '#4CAF50', mr: 1 }} onClick={() => setShippingProduct(item)}>Ship</Button>
                      <IconButton onClick={() => setEditingProduct(item)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleStockAdjustment(item._id)} color="secondary"><InventoryIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(item._id)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={Boolean(shippingProduct)} onClose={() => setShippingProduct(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Shipment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Item: {shippingProduct?.title}</Typography>
          <TextField select fullWidth label="Select Vehicle" sx={{ mb: 3 }} value={shipData.fleetId} onChange={(e) => setShipData({...shipData, fleetId: e.target.value})}>
            {fleet.filter(v => v.status === 'Idle').map((v) => (
              <MenuItem key={v._id} value={v._id}>
                {v.vehicleNumber} ({v.currentWeightLoad}/{v.maxWeightCapacity}kg)
              </MenuItem>
            ))}
          </TextField>
          <TextField fullWidth type="number" label="Quantity to Ship" value={shipData.quantity} onChange={(e) => setShipData({...shipData, quantity: e.target.value})} inputProps={{ max: shippingProduct?.quantity, min: 1 }} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShippingProduct(null)} color="inherit">Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: '#102542' }} onClick={handleConfirmShipment} disabled={!shipData.fleetId || shipData.quantity > shippingProduct?.quantity}>Confirm & Load</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;