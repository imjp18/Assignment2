const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const PORT = 8080;

const app = express();
app.use(bodyParser.json());

//connect to MongoDB
const URI = '';
mongoose.connect(URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(err => console.log(err));

// setup multer for file uploads 
const storage = multer.memoryStorage();
const upload = multer({ storage });

// product schema and model
const productSchema = new mongoose.Schema({
  description: String,
  image: Buffer,
  pricing: Number,
  shippingCost: Number
});

const Product = mongoose.model('Product', productSchema);

// User schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: String,
  purchaseHistory: Array,
  shippingAddress: String
});

const User = mongoose.model('User', userSchema);

// Comment schema and model
const commentSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  images: [Buffer],
  text: String
});

const Comment = mongoose.model('Comment', commentSchema);

// Cart schema and model
const cartSchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  quantities: [Number],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Cart = mongoose.model('Cart', cartSchema);

// Order schema and model
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  shippingAddress: String,
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' }
});

const Order = mongoose.model('Order', orderSchema);

// Post method to create a new product
app.post('/product', upload.single('image'), async (req, res) => {
  try {
    const { description, pricing, shippingCost } = req.body;
    const product = new Product({
      description,
      image: req.file ? req.file.buffer : null,
      pricing,
      shippingCost
    });
    await product.save();
    res.send(product);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Find a single product
app.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.send(product);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update product
app.put('/product/:id', upload.single('image'), async (req, res) => {
  try {
    const { description, pricing, shippingCost } = req.body;
    const updateData = {
      description,
      pricing,
      shippingCost
    };
    if (req.file) {
      updateData.image = req.file.buffer;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).send('Product not found');
    res.send(product);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete product
app.delete('/product/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.send('Product deleted');
  } catch (err) {
    res.status(500).send(err);
  }
});

// API for the user to perform CRUD operations
app.post('/user', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).send('User not found');
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('User not found');
    res.send('User deleted');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Perform CRUD for comments
app.post('/comment', upload.array('images', 10), async (req, res) => {
  try {
    const { product, user, rating, text } = req.body;
    const images = req.files ? req.files.map(file => file.buffer) : [];
    const comment = new Comment({
      product,
      user,
      rating,
      images,
      text
    });
    await comment.save();
    res.send(comment);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.send(comments);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/comment/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).send('Comment not found');
    res.send(comment);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/comment/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { product, user, rating, text } = req.body;
    const updateData = {
      product,
      user,
      rating,
      text
    };
    if (req.files) {
      updateData.images = req.files.map(file => file.buffer);
    }
    const comment = await Comment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!comment) return res.status(404).send('Comment not found');
    res.send(comment);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/comment/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).send('Comment not found');
    res.send('Comment deleted');
  } catch (err) {
    res.status(500).send(err);
  }
});

// APIs for cart collection
app.post('/cart', async (req, res) => {
  try {
    const cart = new Cart(req.body);
    await cart.save();
    res.send(cart);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/carts', async (req, res) => {
  try {
    const carts = await Cart.find();
    res.send(carts);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/cart/:id', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate('products').populate('user');
    if (!cart) return res.status(404).send('Cart not found');
    res.send(cart);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/cart/:id', async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cart) return res.status(404).send('Cart not found');
    res.send(cart);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/cart/:id', async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);
    if (!cart) return res.status(404).send('Cart not found');
    res.send('Cart deleted');
  } catch (err) {
    res.status(500).send(err);
  }
});

// APIs for the order
app.post('/order', async (req, res) => {
  try {
    const { user, products, totalAmount, shippingAddress } = req.body;
    const order = new Order({
      user,
      products,
      totalAmount,
      shippingAddress
    });
    await order.save();
    res.send(order);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('products.product');
    res.send(orders);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('products.product');
    if (!order) return res.status(404).send('Order not found');
    res.send(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/order/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).send('Order not found');
    res.send(order);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/order/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).send('Order not found');
    res.send('Order deleted');
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
