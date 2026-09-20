const express = require('express');
const {
  vendorRoutes,
  customerRoutes,
  driverRoutes,
  employeeRoutes,
  contactRoutes,
  dcManagerRoutes,
  placeManagerRoutes,
  walletManagerRoutes,
  OdLimitManagerRoutes,
  priceManagerRoutes,
  dynamicPriceManagerRoutes,
  timeWindowRoutes,
  commoditiesRoutes,
  orderManagerRoutes
} = require('./modules');

require('dotenv').config();

const path = require('path');
const cors = require('cors');

const app = express();


// ===============================
// CORS
// ===============================

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));


// ===============================
// Middleware
// ===============================

app.use(express.json());


// ===============================
// Health Check
// ===============================

app.get('/', (req, res) => {
  res.json({
    message: 'Flotza API is running',
    status: 'success'
  });
});


// ===============================
// Static Files
// ===============================

// app.use(
//   '/uploads',
//   express.static(path.join(__dirname, 'uploads'))
// );


// ===============================
// Routes
// ===============================

app.use('/api/auth/vendor', vendorRoutes);
app.use('/api/auth/customer', customerRoutes);
app.use('/api/auth/driver', driverRoutes);
app.use('/api/auth/employee', employeeRoutes);

app.use('/api/form/contact', contactRoutes);

app.use('/api/dc-manager', dcManagerRoutes);
app.use('/api/place-manager', placeManagerRoutes);
app.use('/api/wallet-manager', walletManagerRoutes);
app.use('/api/od-limit-manager', OdLimitManagerRoutes);
app.use('/api/price-manager', priceManagerRoutes);
app.use('/api/commodities-routes', commoditiesRoutes);
app.use('/api/dynamic-price-manager', dynamicPriceManagerRoutes);
app.use('/api/time-window', timeWindowRoutes);
app.use('/api/order-manager', orderManagerRoutes);


// ===============================
// Server
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});