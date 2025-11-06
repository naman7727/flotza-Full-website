D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\init_db.sql
```
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creating Customer table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    company_name TEXT,
    pin_code TEXT CHECK (pin_code ~ '^[0-9]{6}$'),
    referral_code TEXT,
    password TEXT NOT NULL,
    mobile_number TEXT UNIQUE NOT NULL CHECK (mobile_number ~ '^[0-9]{10}$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creating Driver table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password TEXT NOT NULL,
    referral_code TEXT,
    vendor_name TEXT,
    pan_card TEXT,
    aadhar_front TEXT,
    aadhar_back TEXT,
    driving_licence TEXT,
    profile_picture TEXT,
    mobile_number TEXT UNIQUE NOT NULL CHECK (mobile_number ~ '^[0-9]{10}$'),
    app_role TEXT NOT NULL,
    driving_license_no TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creating Vendor table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_address TEXT NOT NULL,
    gst_number TEXT UNIQUE CHECK (gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
    referral_code TEXT,
    gst_certificate TEXT, -- image
    pan_card TEXT, -- image
    aadhar_front TEXT, -- image
    aadhar_back TEXT, -- image
    profile_picture TEXT, -- image
    mobile_number TEXT UNIQUE NOT NULL CHECK (mobile_number ~ '^[0-9]{10}$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creating Messages table
CREATE TABLE first_contact (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone_number TEXT NOT NULL CHECK (phone_number ~ '^[0-9]{10}$'),
    message TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_to TEXT,
    status TEXT NOT NULL DEFAULT 'New Query',
    outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
CREATE TRIGGER update_customers_timestamp
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_drivers_timestamp
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_vendors_timestamp
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_messages_timestamp
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\server.js
```
const express = require('express');
const { vendorRoutes, contactRoutes } = require('./modules');
require('dotenv').config();
const path = require('path');

const app = express();

app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth/vendor', vendorRoutes);
app.use('/api/form/contact/', contactRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\config\db.js
```
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\models\Auth\vendor-login.js
```
const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

class VendorLogin {
  static async loginWithEmail({ email, password }) {
    try {
      const query = 'SELECT id, email, password, full_name FROM vendors WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('Vendor not found');
      }

      const vendor = result.rows[0];
      const isMatch = await bcrypt.compare(password, vendor.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: vendor.id,
        email: vendor.email,
        full_name: vendor.full_name,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginWithPhone({ mobile_number, password }) {
    try {
      const query = 'SELECT id, mobile_number, password, full_name FROM vendors WHERE mobile_number = $1';
      const result = await pool.query(query, [mobile_number]);
      
      if (result.rows.length === 0) {
        throw new Error('Vendor not found');
      }

      const vendor = result.rows[0];
      const isMatch = await bcrypt.compare(password, vendor.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: vendor.id,
        mobile_number: vendor.mobile_number,
        full_name: vendor.full_name,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VendorLogin;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\models\Auth\vendor-profile.js
```
const pool = require('../../config/db');

class VendorProfile {
  static async getProfile(vendorId) {
    try {
      const query = `
        SELECT id, vendor_id, first_name, last_name, full_name, email,
               business_name, business_address, gst_number, referral_code,
               gst_certificate, pan_card, aadhar_front, aadhar_back, profile_picture,
               mobile_number, created_at, updated_at
        FROM vendors
        WHERE id = $1
      `;
      const result = await pool.query(query, [vendorId]);

      if (result.rows.length === 0) {
        throw new Error('Vendor not found');
      }

      // Construct full URLs for image fields
      const vendor = result.rows[0];
      const baseUrl = process.env.BASE_URL || 'http://localhost:1337';
      return {
        ...vendor,
        gst_certificate: vendor.gst_certificate ? `${baseUrl}/${vendor.gst_certificate}` : null,
        pan_card: vendor.pan_card ? `${baseUrl}/${vendor.pan_card}` : null,
        aadhar_front: vendor.aadhar_front ? `${baseUrl}/${vendor.aadhar_front}` : null,
        aadhar_back: vendor.aadhar_back ? `${baseUrl}/${vendor.aadhar_back}` : null,
        profile_picture: vendor.profile_picture ? `${baseUrl}/${vendor.profile_picture}` : null,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VendorProfile;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\models\Auth\vendor-register.js
```
const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

class VendorRegister {
  static async register(vendorData) {
    const {
      first_name, last_name, email, business_name, business_address,
      gst_number, mobile_number, password, referral_code,
      gst_certificate, pan_card, aadhar_front, aadhar_back, profile_picture
    } = vendorData;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = `
        INSERT INTO vendors (
          vendor_id, first_name, last_name, email, business_name,
          business_address, gst_number, mobile_number, password, referral_code,
          gst_certificate, pan_card, aadhar_front, aadhar_back, profile_picture
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, email, mobile_number, full_name
      `;
      
      const vendor_id = `VEND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const values = [
        vendor_id, first_name, last_name, email, business_name,
        business_address, gst_number, mobile_number, hashedPassword, referral_code,
        gst_certificate, pan_card, aadhar_front, aadhar_back, profile_picture
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VendorRegister;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\models\Contact\contact.js
```
const pool = require('../../config/db');

class Contact {
  static async create(contactData) {
    const { full_name, email, phone_number, message } = contactData;
    try {
      const query = `
        INSERT INTO first_contact (full_name, email, phone_number, message)
        VALUES ($1, $2, $3, $4)
        RETURNING message_id, full_name, email, phone_number, message, status, created_at, updated_at
      `;
      const values = [full_name, email, phone_number, message];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getById(messageId) {
    try {
      const query = `
        SELECT message_id, full_name, email, phone_number, message, assigned_to, status, outcome, created_at, updated_at
        FROM first_contact
        WHERE message_id = $1
      `;
      const result = await pool.query(query, [messageId]);
      if (result.rows.length === 0) {
        throw new Error('Message not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getAll({ status, full_name, email, phone_number, page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      let conditions = [];
      let values = [];
      let valueIndex = 1;

      // Build search conditions
      if (status) {
        conditions.push(`status = $${valueIndex++}`);
        values.push(status);
      }
      if (full_name) {
        conditions.push(`LOWER(full_name) LIKE LOWER($${valueIndex++})`);
        values.push(`%${full_name}%`);
      }
      if (email) {
        conditions.push(`LOWER(email) LIKE LOWER($${valueIndex++})`);
        values.push(`%${email}%`);
      }
      if (phone_number) {
        conditions.push(`phone_number = $${valueIndex++}`);
        values.push(phone_number);
      }

      // Count total records for pagination metadata
      let countQuery = 'SELECT COUNT(*) FROM first_contact';
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      // Fetch paginated data
      let dataQuery = `
        SELECT message_id, full_name, email, phone_number, message, assigned_to, status, outcome, created_at, updated_at
        FROM first_contact
      `;
      if (conditions.length > 0) {
        dataQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      dataQuery += ` ORDER BY created_at DESC LIMIT $${valueIndex++} OFFSET $${valueIndex}`;
      values.push(limit, offset);

      const result = await pool.query(dataQuery, values);

      return {
        data: result.rows,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(messageId, updateData) {
    const { assigned_to, status, outcome } = updateData;
    try {
      const query = `
        UPDATE first_contact
        SET 
          assigned_to = COALESCE($1, assigned_to),
          status = COALESCE($2, status),
          outcome = COALESCE($3, outcome),
          updated_at = CURRENT_TIMESTAMP
        WHERE message_id = $4
        RETURNING message_id, full_name, email, phone_number, message, assigned_to, status, outcome, created_at, updated_at
      `;
      const values = [assigned_to, status, outcome, messageId];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Message not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(messageId) {
    try {
      const query = 'DELETE FROM first_contact WHERE message_id = $1 RETURNING message_id';
      const result = await pool.query(query, [messageId]);
      if (result.rows.length === 0) {
        throw new Error('Message not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Contact;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\modules\index.js
```
const { vendorRoutes } = require('./auth/routes');
const { contactRoutes } = require('./contact/routes');

module.exports = {
  vendorRoutes,
  contactRoutes,
};
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\modules\auth\controllers\index.js
```
const VendorController = require('./vendorController');

module.exports = {
  VendorController,
};
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\modules\auth\controllers\vendorController.js
```
const VendorLogin = require('../../../models/Auth/vendor-login');
const VendorRegister = require('../../../models/Auth/vendor-register');
const VendorProfile = require('../../../models/Auth/vendor-profile');
const { generateToken } = require('../../../utils/jwt');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateVendorRegister, validateLogin } = require('../../../utils/validation');

class VendorController {
  static async register(req, res) {
    try {
      const { error } = validateVendorRegister(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      // Extract file paths from multer
      const vendorData = {
        ...req.body,
        gst_certificate: req.files['gst_certificate'] ? req.files['gst_certificate'][0].path : null,
        pan_card: req.files['pan_card'] ? req.files['pan_card'][0].path : null,
        aadhar_front: req.files['aadhar_front'] ? req.files['aadhar_front'][0].path : null,
        aadhar_back: req.files['aadhar_back'] ? req.files['aadhar_back'][0].path : null,
        profile_picture: req.files['profile_picture'] ? req.files['profile_picture'][0].path : null,
      };

      const vendor = await VendorRegister.register(vendorData);
      const token = generateToken({ id: vendor.id, role: 'vendor' });

      return res.status(201).json(successResponse({ vendor, token }, 'Vendor registered successfully'));
    } catch (error) {
      if (error.message.includes('unique constraint')) {
        return res.status(400).json(errorResponse('Email, mobile number, or GST number already exists'));
      }
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async login(req, res) {
    try {
      const { error } = validateLogin(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const { email, mobile_number, password } = req.body;
      let vendor;

      if (email) {
        vendor = await VendorLogin.loginWithEmail({ email, password });
      } else if (mobile_number) {
        vendor = await VendorLogin.loginWithPhone({ mobile_number, password });
      } else {
        return res.status(400).json(errorResponse('Email or mobile number is required'));
      }

      const token = generateToken({ id: vendor.id, role: 'vendor' });
      return res.status(200).json(successResponse({ vendor, token }, 'Login successful'));
    } catch (error) {
      return res.status(401).json(errorResponse(error.message));
    }
  }
  
  static async getProfile(req, res) {
    try {
      const vendorId = req.user.id; // From JWT payload
      const vendor = await VendorProfile.getProfile(vendorId);
      return res.status(200).json(successResponse(vendor, 'Profile retrieved successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }
}

module.exports = VendorController;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\modules\auth\routes\index.js
```
const vendorRoutes = require('./vendorRoutes');

module.exports = {
  vendorRoutes,
};
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\modules\auth\routes\vendorRoutes.js
```
const express = require('express');
const { VendorController } = require('../controllers');
const upload = require('../../../utils/fileUpload');
const { authMiddleware } = require('../../../utils/authMiddleware');

const router = express.Router();

router.post('/register', upload.fields([
  { name: 'gst_certificate', maxCount: 1 },
  { name: 'pan_card', maxCount: 1 },
  { name: 'aadhar_front', maxCount: 1 },
  { name: 'aadhar_back', maxCount: 1 },
  { name: 'profile_picture', maxCount: 1 },
]), VendorController.register);
router.post('/login', VendorController.login);
router.get('/me', authMiddleware(['vendor']), VendorController.getProfile);

module.exports = router;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\modules\contact\controllers\contactController.js
```
const Contact = require('../../../models/Contact/contact');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateContactCreate, validateContactUpdate, validateContactQuery } = require('../../../utils/validation');

class ContactController {
  static async create(req, res) {
    try {
      const { error } = validateContactCreate(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const contact = await Contact.create(req.body);
      return res.status(201).json(successResponse(contact, 'Message created successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async getById(req, res) {
    try {
      const { messageId } = req.params;
      const contact = await Contact.getById(messageId);
      return res.status(200).json(successResponse(contact, 'Message retrieved successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async getAll(req, res) {
    try {
      const { status, full_name, email, phone_number, page, limit } = req.query;
      const { error } = validateContactQuery({ status, full_name, email, phone_number, page, limit });
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const result = await Contact.getAll({ status, full_name, email, phone_number, page, limit });
      return res.status(200).json(successResponse(result, 'Messages retrieved successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async update(req, res) {
    try {
      const { error } = validateContactUpdate(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const { messageId } = req.params;
      const contact = await Contact.update(messageId, req.body);
      return res.status(200).json(successResponse(contact, 'Message updated successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async delete(req, res) {
    try {
      const { messageId } = req.params;
      const contact = await Contact.delete(messageId);
      return res.status(200).json(successResponse(contact, 'Message deleted successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }
}

module.exports = ContactController;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\modules\contact\controllers\index.js
```
const ContactController = require('./contactController');

module.exports = {
  ContactController,
};
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\modules\contact\routes\contactRoutes.js
```
const express = require('express');
const { ContactController } = require('../controllers');
const { authMiddleware } = require('../../../utils/authMiddleware');

const router = express.Router();

router.post('/', ContactController.create);
router.get('/:messageId', authMiddleware(['admin','vendor']), ContactController.getById);
router.get('/', authMiddleware(['admin','vendor']), ContactController.getAll);
router.put('/:messageId', authMiddleware(['admin','vendor']), ContactController.update);
router.delete('/:messageId', authMiddleware(['admin','vendor']), ContactController.delete);

module.exports = router;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\modules\contact\routes\index.js
```
const contactRoutes = require('./contactRoutes');

module.exports = {
  contactRoutes,
};
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\utils\authMiddleware.js
```
const { verifyToken } = require('./jwt');
const { errorResponse } = require('./response');

const authMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json(errorResponse('No token provided'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json(errorResponse('Invalid token format'));
    }

    try {
      const decoded = verifyToken(token);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json(errorResponse(`Unauthorized access: Role '${decoded.role}' not allowed`));
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json(errorResponse('Invalid or expired token'));
    }
  };
};

module.exports = { authMiddleware };
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\utils\fileUpload.js
```
const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\utils\jwt.js
```
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\utils\response.js
```
const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

const errorResponse = (message = 'Error', data = null) => ({
  success: false,
  message,
  data,
});

module.exports = { successResponse, errorResponse };
```

D:\codebase\freelance\Kartbuddy Pvt\codebase\kartbuddy\backend-local\kartbuddyapi-nodejs\utils\validation.js
```
const Joi = require('joi');

const validateVendorRegister = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    business_name: Joi.string().min(3).required(),
    business_address: Joi.string().min(5).required(),
    gst_number: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required(),
    mobile_number: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(8).required(),
    referral_code: Joi.string().optional(),
    gst_certificate: Joi.string().optional(),
    pan_card: Joi.string().optional(),
    aadhar_front: Joi.string().optional(),
    aadhar_back: Joi.string().optional(),
    profile_picture: Joi.string().optional(),
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().optional(),
    mobile_number: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    password: Joi.string().required(),
  }).or('email', 'mobile_number');

    return schema.validate(data);
};

const validateContactCreate = (data) => {
  const schema = Joi.object({
    full_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().pattern(/^[0-9]{10}$/).required(),
    message: Joi.string().min(5).required(),
  });

  return schema.validate(data);
};

const validateContactUpdate = (data) => {
  const schema = Joi.object({
    assigned_to: Joi.string().optional(),
    status: Joi.string().valid('New Query', 'In Progress', 'Resolved', 'Closed').optional(),
    outcome: Joi.string().optional(),
  }).min(1);

  return schema.validate(data);
};

const validateContactQuery = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('New Query', 'In Progress', 'Resolved', 'Closed').optional(),
    full_name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    phone_number: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });

  return schema.validate(data);
};

module.exports = { validateVendorRegister, validateLogin, validateContactCreate, validateContactUpdate, validateContactQuery };
```

