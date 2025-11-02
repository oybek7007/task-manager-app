const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderName: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Yangi', 'Jarayonda', 'Tayyor', 'Yakunlangan'],
    default: 'Yangi'
  },
  stages: [
    {
      name: String,
      status: {
        type: String,
        enum: ['Kutilmoqda', 'Jarayonda', 'Yakunlangan'],
        default: 'Kutilmoqda'
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      startTime: Date,
      endTime: Date,
      duration: Number // milliseconds
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalDuration: Number, // milliseconds
  completedAt: Date
});

module.exports = mongoose.model('Order', orderSchema);