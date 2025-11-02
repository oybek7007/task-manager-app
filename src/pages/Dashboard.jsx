import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  AppBar,
  Toolbar,
  LogoutButton,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Orders fetch xatosi:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!orderName.trim() || !clientName.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/orders`,
        { orderName, clientName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderName('');
      setClientName('');
      setOpenDialog(false);
      fetchOrders();
    } catch (error) {
      console.error('Order yaratish xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Yangi': 'default',
      'Jarayonda': 'warning',
      'Tayyor': 'info',
      'Yakunlangan': 'success',
    };
    return colors[status] || 'default';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Task Manager - {user.username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Chiqish
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Buyurtmalar</Typography>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            disabled={user.role === 'worker'}
          >
            Yangi Buyurtma
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Buyurtma Nomi</TableCell>
                <TableCell>Mijoz</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Yaratilgan</TableCell>
                <TableCell>Amal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>{order.orderName}</TableCell>
                  <TableCell>{order.clientName}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      Ko'rish
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Yangi Buyurtma</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Buyurtma Nomi"
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Mijoz"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Bekor qilish</Button>
            <Button
              onClick={handleCreateOrder}
              variant="contained"
              disabled={loading || !orderName.trim() || !clientName.trim()}
            >
              Yaratish
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Dashboard;