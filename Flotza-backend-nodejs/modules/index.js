const { vendorRoutes, customerRoutes, driverRoutes, employeeRoutes } = require('./auth/routes');
const { contactRoutes } = require('./contact/routes');
const { dcManagerRoutes } = require('./dc_manager/routes');
const { placeManagerRoutes } = require('./placeManager/routes');
const { walletManagerRoutes } = require('./walletManager/routes');
const { OdLimitManagerRoutes } = require('./odLimitManager/routes');
const { priceManagerRoutes } = require('./fixedPriceManager/routes');
const { dynamicPriceManagerRoutes } = require('./dynamicPriceManager/routes');
const { timeWindowRoutes } = require('./timeWindow/routes');
const { commoditiesRoutes } = require('./commodity/routes');
const { orderManagerRoutes } = require('./orderManager/routes');

module.exports = {
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
};