const mongoose = require('mongoose');

// กำหนด ProductSchema พร้อม validation ตามโจทย์ข้อ 1
const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: {
    type: String
  },
  category: { 
    type: String, 
    required: true 
  },
  stock: { 
    type: Number, 
    default: 0, 
    min: [0, 'Stock cannot be negative'] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);