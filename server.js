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

const productSchema = new mongoose.Schema({
  description: String,
  image: String,
  pricing: Number,
  shippingCost: Number
});
const Product = mongoose.model('Product', productSchema);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
