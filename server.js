const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PORT = 8080;


const app = express();
app.use(bodyParser.json());


const URI = '';

mongoose.connect(URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));