const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // To load environment variables from .env file

// --- Initialization ---
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Allow the server to accept JSON in the request body

// --- Database Connection ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    seedDatabase();
  })
  .catch(err => console.error('MongoDB connection error:', err.message));

// --- Mongoose Schemas ---

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
});
const Product = mongoose.model('Product', ProductSchema);

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// CartItem Schema (Embedded in the Cart Model or Checkout)
const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      priceAtPurchase: { type: Number, required: true }, // To prevent price changes affecting old orders
    },
  ],
  shippingAddress: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', OrderSchema);

// --- Auth Middleware and Helpers ---

// Middleware to verify JWT token and extract user info
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adds user payload (id, email) to the request object
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Middleware to restrict access to admin
const adminAuth = (req, res, next) => {
  // Simple check for admin based on email (for project simplicity)
  if (req.user && req.user.email === 'admin@example.com') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Requires admin privileges.' });
  }
};

// --- API Endpoints ---

// 1. Product Endpoints (Public + Search/Filter)
app.get('/api/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products.', error: err.message });
  }
});

// 2. Auth Endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already registered.' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ email, password: hashedPassword });
    await user.save();

    // Generate Token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Error during registration.', error: err.message });
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

    // Generate Token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Error during login.', error: err.message });
  }
});

// 3. Cart Endpoints (Protected)

// GET: Fetch user's cart
app.get('/api/cart', auth, async (req, res) => {
  try {
    // The cart is stored inside a temporary field on the User document in this simplified model.
    // For this model, the cart items are directly tracked on the Order model until checkout.
    // To represent the "live" cart, we will temporarily use a simplified Cart model if we had one.
    // Since we don't have a dedicated "live" Cart model, we'll return an empty array for now.
    // In a production app, you would fetch from a dedicated `Cart` collection here.
    // To match the front-end structure (which needs Product details), we'll simulate fetching and return items from the user's latest 'Pending' order if we had one.
    // Since we are tracking the cart on the frontend for now, we will return an empty array until the user checks out.
    // NOTE: The true implementation is achieved by the front end storing the cart locally and the backend only interacting on checkout.
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart.', error: err.message });
  }
});

// POST: Add item to cart (Simplified to return the item added, not persist it yet)
app.post('/api/cart', auth, async (req, res) => {
  try {
    const { _id, name, description, price, image, category } = req.body;

    // In a full implementation, you would:
    // 1. Find the user's active cart.
    // 2. Add or update the product quantity in that cart.
    // 3. Save the cart to the database.
    
    // For now, we simply return the product to update the client-side state.
    res.json({ _id, name, description, price, image, category, quantity: 1 });
  } catch (err) {
    res.status(500).json({ message: 'Error adding item to cart.', error: err.message });
  }
});

// DELETE: Remove item from cart (Simplified)
app.delete('/api/cart/:id', auth, async (req, res) => {
  try {
    // In a full implementation, you would:
    // 1. Find the user's active cart.
    // 2. Remove the product from that cart.
    // 3. Save the cart to the database.
    
    // For now, we simply return success to update the client-side state.
    res.json({ message: 'Item removed successfully (Client-side update only).' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing item from cart.', error: err.message });
  }
});


// 4. Checkout Endpoint (Protected)
app.post('/api/checkout', auth, async (req, res) => {
  try {
    const { cart, formData } = req.body;
    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const itemDetails = cart.map(item => ({
      product: item._id,
      quantity: item.quantity,
      priceAtPurchase: item.price,
    }));

    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const newOrder = new Order({
      user: req.user.id,
      items: itemDetails,
      shippingAddress: formData,
      totalAmount: totalAmount,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder._id });
  } catch (err) {
    res.status(500).json({ message: 'Error during checkout.', error: err.message });
  }
});


// 5. Order History Endpoint (Protected)
app.get('/api/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price image') // Populate product details
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order history.', error: err.message });
  }
});


// 6. Admin Endpoints (Protected by auth and adminAuth)

// ADMIN: Get all orders
app.get('/api/admin/orders', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name price image') // Populate product details
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all orders.', error: err.message });
  }
});

// ADMIN: Update order status
app.put('/api/admin/orders/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated successfully.', order });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status.', error: err.message });
  }
});

// ADMIN: Add New Product
app.post('/api/admin/products', auth, adminAuth, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product.', error: err.message });
  }
});

// ADMIN: Update Existing Product
app.put('/api/admin/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product.', error: err.message });
  }
});

// ADMIN: Delete Product
app.delete('/api/admin/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product.', error: err.message });
  }
});


// --- Database Seeding (Initial Data) ---
const seedDatabase = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
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
      await Product.insertMany(initialProducts);
      console.log('Database seeded with initial products.');
    }
  } catch (err) {
    console.error('Database seeding error:', err.message);
  }
};

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
