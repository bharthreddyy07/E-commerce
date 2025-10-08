const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// We will handle CORS dynamically in a production environment
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connection successful!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  }]
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    name: String,
    email: String,
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);

// Initial data population
const initialProducts = [
  { name: "Vintage Camera", description: "A classic camera with a timeless design.", price: 299.99, image: "https://placehold.co/400x300/F5EFE7/333?text=Camera", category: "Electronics" },
  { name: "Espresso Machine", description: "Brew perfect espresso at home with ease.", price: 159.99, image: "https://placehold.co/400x300/D8C4B5/333?text=Espresso", category: "Home Goods" },
  { name: "Wireless Headphones", description: "Immersive sound with noise cancellation.", price: 129.50, image: "https://placehold.co/400x300/C4B7A6/333?text=Headphones", category: "Electronics" },
  { name: "Leather Satchel", description: "A stylish and durable bag for everyday use.", price: 75.00, image: "https://placehold.co/400x300/A0937D/333?text=Satchel", category: "Apparel" },
  { name: "Smart Watch", description: "Stay connected on the go with this smart watch.", price: 199.99, image: "https://placehold.co/400x300/8B826D/333?text=Smart+Watch", category: "Electronics" },
  { name: "Ceramic Mug Set", description: "Handcrafted mugs for your morning coffee.", price: 35.00, image: "https://placehold.co/400x300/776F61/333?text=Mugs", category: "Home Goods" },
  { name: "Classic Denim Jacket", description: "A timeless jacket for any wardrobe.", price: 89.99, image: "https://placehold.co/400x300/625A4B/333?text=Jacket", category: "Apparel" },
  { name: "Mechanical Keyboard", description: "Tactile keys for a satisfying typing experience.", price: 149.00, image: "https://placehold.co/400x300/4D453A/333?text=Keyboard", category: "Electronics" }
];

const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(initialProducts);
      console.log('Database seeded with initial products!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seedDatabase();

// Middleware to protect routes
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).send({ error: 'Authentication required.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Invalid token.' });
  }
};

const adminAuth = (req, res, next) => {
  // A simple check to see if the user is an admin
  // In a real app, you would check a user role from the database
  if (req.user.email !== 'admin@example.com') {
    return res.status(403).send({ error: 'Forbidden: Admin access required.' });
  }
  next();
};

// API Endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Product Management Endpoints
app.post('/api/admin/products', auth, adminAuth, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/admin/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/admin/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// New endpoint for Admin Order Management: Get ALL orders
app.get('/api/admin/orders', auth, adminAuth, async (req, res) => {
  try {
    // Fetches ALL orders and populates both the user and product details
    const orders = await Order.find()
      .populate('user', 'email') // Populate user details (specifically email)
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/admin/orders/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auth Endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ email, password: hashedPassword });
    await user.save();
    const payload = { user: { id: user.id, email: user.email } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: payload.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const payload = { user: { id: user.id, email: user.email } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: payload.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cart Endpoints
app.get('/api/cart', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/cart', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    await cart.populate('items.product');
    res.json({ message: 'Item added to cart.', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/cart/:id', auth, async (req, res) => {
  try {
    const { id: productId } = req.params;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      } else {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      return res.status(404).json({ message: 'Item not in cart.' });
    }
    await cart.save();
    await cart.populate('items.product');
    res.json({ message: 'Item removed from cart.', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/checkout', auth, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }
    const totalAmount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    const newOrder = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalAmount,
      shippingAddress,
    });

    await newOrder.save();
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Checkout successful! Your order has been placed.', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// New endpoint for Order History
app.get('/api/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

