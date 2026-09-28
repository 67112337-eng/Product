const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('./Product');

const app = express();
app.use(express.json());

// ----------------------------------------------------
// โค้ดเดิม (Basic CRUD)
// ----------------------------------------------------

// 1. POST /products (สร้างสินค้า)
app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. GET /products (ดึงสินค้าทั้งหมด)
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ข้อ 2: GET /products/search/:keyword (ค้นหาชื่อสินค้า ไม่สนตัวเล็ก/ใหญ่)
app.get('/products/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const products = await Product.find({
      name: { $regex: keyword, $options: 'i' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ข้อ 3: GET /products/category/:category (แสดงสินค้าตามหมวดหมู่)
app.get('/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category: category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ข้อ 4: GET /products/available (แสดงเฉพาะสินค้าที่มี stock > 0)
app.get('/products/available', async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET /products/:id (ดึงสินค้าตาม ID)
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. PATCH /products/:id (แก้ไขสินค้าตาม ID)
app.patch('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ข้อ 5: เพิ่มจำนวนสินค้าใน Stock
app.patch('/products/:id/add-stock', async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: amount } },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ข้อ 6: ปรับ Delete API ให้ปลอดภัยยิ่งขึ้น
app.delete('/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ฟังก์ชันเริ่มต้นสร้างฐานข้อมูลจำลองและเปิด Server
async function startServer() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
  console.log('MongoDB Memory Server Connected successfully!');

  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
}

startServer();