import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  AppBar,
  Toolbar,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const foundOrder = response.data.find(o => o._id === id);
      setOrder(foundOrder);
    } catch (error) {
      console.error('Order fetch xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStage = async (stageIndex) => {
    try {
      await axios.post(
        `${API_URL}/orders/${id}/start-stage/${stageIndex}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrder();
    } catch (error) {
      console.error('Bosqich boshlash xatosi:', error);
    }
  };

  const handleCompleteStage = async (stageIndex) => {
    try {
      await axios.post(
        `${API_URL}/orders/${id}/complete-stage/${stageIndex}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrder();
    } catch (error) {
      console.error('Bosqich yakunlash xatosi:', error);
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) return <Typography>Yuklanmoqda...</Typography>;
  if (!order) return <Typography>Buyurtma topilmadi</Typography>;

  const completedStages = order.stages.filter(s => s.status === 'Yakunlangan').length;
  const progress = (completedStages / order.stages.length) * 100;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            ← Orqaga
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            {order.orderName} - {order.clientName}
          </Typography>
          <Chip label={order.status} color="primary" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Umumiy Jarayon: {progress.toFixed(0)}%
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 10, mb: 2 }} />
          {order.totalDuration && (
            <Typography variant="body2" color="textSecondary">
              Jami vaqt: {formatDuration(order.totalDuration)}
            </Typography>
          )}
        </Paper>

        <Box sx={{ overflowX: 'auto', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, minWidth: 'max-content', pb: 2 }}>
            {order.stages.map((stage, index) => (
              <Card
                key={index}
                sx={{
                  minWidth: 250,
                  border: stage.status === 'Yakunlangan' ? '2px solid green' : '1px solid #ddd',
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {stage.name}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={stage.status}
                      color={
                        stage.status === 'Yakunlangan'
                          ? 'success'
                          : stage.status === 'Jarayonda'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  </Box>

                  {stage.assignedTo && (
                    <Typography variant="body2">
                      <strong>Mas'ul:</strong> {stage.assignedTo.username}
                    </Typography>
                  )}

                  {stage.duration && (
                    <Typography variant="body2">
                      <strong>Vaqt:</strong> {formatDuration(stage.duration)}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {stage.status === 'Kutilmoqda' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleStartStage(index)}
                      >
                        Boshlash
                      </Button>
                    )}
                    {stage.status === 'Jarayonda' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleCompleteStage(index)}
                      >
                        Yakunlash
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default OrderDetail;