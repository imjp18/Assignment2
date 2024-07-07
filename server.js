const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer')
const path = require('path')
const PORT = 8080;


const app = express();
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

const URI = '';

mongoose.connect(URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(err => console.log(err));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

//product schema and model
const productSchema = new mongoose.Schema({
  description: String,
  image: String,
  pricing: Number,
  shippingCost: Number
});

const Product = mongoose.model('Product', productSchema);

//user schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: String,
  purchaseHistory: Array,
  shippingAddress: String
});

const User = mongoose.model('User', userSchema);

//comment schema and model
const commentSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  images: [String],
  text: String
});

const Comment = mongoose.model('Comment', commentSchema);

//cart schema and model
const cartSchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  quantities: [Number],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Cart = mongoose.model('Cart', cartSchema);

// order schema and model
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

//post method to create a new product
app.post('/product', upload.single('image'), async (req, res) => {
  try {
    const { description, pricing, shippingCost } = req.body;
    const product = new Product({
      description,
      image: req.file ? req.file.path : '',
      pricing,
      shippingCost
    });
    await product.save();
    res.send(product);
  } catch (err) {
    res.send(err);
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
