const express = require('express');
const { vendorRoutes, customerRoutes, driverRoutes, employeeRoutes, contactRoutes, dcManagerRoutes,placeManagerRoutes,walletManagerRoutes,OdLimitManagerRoutes, priceManagerRoutes, dynamicPriceManagerRoutes, timeWindowRoutes  , commoditiesRoutes, orderManagerRoutes  } = require('./modules');
require('dotenv').config();
const path = require('path');
const cors = require('cors');

const app = express();


// Allow all cross-origin requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Set to true if using cookies
}));

// Optional: Handle preflight OPTIONS requests
app.options('*', cors());


app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth/vendor', vendorRoutes);
app.use('/api/auth/customer', customerRoutes);
app.use('/api/auth/driver', driverRoutes);
app.use('/api/auth/employee', employeeRoutes);
app.use('/api/form/contact/', contactRoutes);
app.use('/api/dc-manager', dcManagerRoutes);
app.use('/api/place-manager', placeManagerRoutes);
app.use('/api/wallet-manager',walletManagerRoutes);
app.use('/api/od-limit-manager', OdLimitManagerRoutes);
app.use('/api/price-manager',  priceManagerRoutes);
app.use('/api/commodities-routes',  commoditiesRoutes);
app.use('/api/dynamic-price-manager', dynamicPriceManagerRoutes);
app.use('/api/time-window', timeWindowRoutes);
app.use('/api/order-manager', orderManagerRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});