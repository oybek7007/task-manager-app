const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const STAGES = [
  'Invoys',
  'Zayavka',
  'TIR-SMR',
  'ST-1',
  'FITO',
  'Deklaratsiya',
  'Tekshirish',
  'Topshirildi'
];

// Get all orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('stages.assignedTo', 'username')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orderName, clientName } = req.body;
    
    const stages = STAGES.map(stage => ({
      name: stage,
      status: 'Kutilmoqda'
    }));
    
    const order = new Order({
      orderName,
      clientName,
      stages
    });
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start stage
router.post('/:orderId/start-stage/:stageIndex', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    const stageIndex = parseInt(req.params.stageIndex);
    
    if (order.stages[stageIndex].status === 'Jarayonda') {
      return res.status(400).json({ message: 'Bosqich allaqachon boshlanган' });
    }
    
    order.stages[stageIndex].status = 'Jarayonda';
    order.stages[stageIndex].assignedTo = req.userId;
    order.stages[stageIndex].startTime = new Date();
    order.status = 'Jarayonda';
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete stage
router.post('/:orderId/complete-stage/:stageIndex', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    const stageIndex = parseInt(req.params.stageIndex);
    
    order.stages[stageIndex].status = 'Yakunlangan';
    order.stages[stageIndex].endTime = new Date();
    order.stages[stageIndex].duration = 
      order.stages[stageIndex].endTime - order.stages[stageIndex].startTime;
    
    // Check if all stages completed
    const allCompleted = order.stages.every(s => s.status === 'Yakunlangan');
    
    if (allCompleted) {
      order.status = 'Yakunlangan';
      order.completedAt = new Date();
      order.totalDuration = 
        order.stages.reduce((sum, s) => sum + (s.duration || 0), 0);
    }
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;