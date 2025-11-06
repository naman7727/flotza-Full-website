const Joi = require('joi');

const validateVendorRegister = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    business_name: Joi.string().min(3).optional(),
    business_address: Joi.string().min(5).optional(),
    gst_number: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$/).optional(),
    mobile_number: Joi.number().integer().min(1000000000).max(9999999999).required(),
    alternate_no: Joi.number().integer().min(1000000000).max(9999999999).optional()
      .not(Joi.ref('mobile_number')).error(new Error('Alternate number must differ from mobile number')),
    password: Joi.string().min(8).required(),
    pan_card_no: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
    adhar_no: Joi.string().pattern(/^[0-9]{12}$/).optional(),
    gst_upload: Joi.string().optional(),
    pan_card_photo_upload: Joi.string().optional(),
    aadhar_front_photo_upload: Joi.string().optional(),
    aadhar_back_photo_upload: Joi.string().optional(),
    profile_photo: Joi.string().optional(),
    app_role: Joi.string().valid('vendor').default('vendor'),
  });

  return schema.validate(data);
};

const validateVendorQuery = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('New', 'Approved', 'Hold', 'Suspended', 'Blacklisted').optional(),
    full_name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    mobile_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().optional(),
    mobile_number: Joi.number().integer().min(1000000000).max(9999999999).optional(),
    phone_number: Joi.number().integer().min(1000000000).max(9999999999).optional(),
    password: Joi.string().required(),
  }).or('email', 'mobile_number', 'phone_number');

  return schema.validate(data);
};

const validateCustomerRegister = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    mobile_number: Joi.number().integer().min(1000000000).max(9999999999).required(),
    alternate_number: Joi.number().integer().min(1000000000).max(9999999999).optional()
      .not(Joi.ref('phone_number')).error(new Error('Alternate number must differ from phone number')),
    email: Joi.string().email().required(),
    company_name: Joi.string().min(3).optional(),
    first_line_address: Joi.string().min(5).optional(),
    second_line_address: Joi.string().min(5).optional(),
    state: Joi.string().min(2).optional(),
    city: Joi.string().min(2).optional(),
    pin_code: Joi.number().integer().min(100000).max(999999).optional(),
    gst_no: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$/).optional(),
    adhar_no: Joi.number().integer().min(100000000000).max(999999999999).optional(),
    pan_card_no: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$|^$/).optional(),
    adhar_front_photo: Joi.string().optional(),
    adhar_back_photo: Joi.string().optional(),
    pan_card_photo: Joi.string().optional(),
    profile_picture: Joi.string().optional(),
    password: Joi.string().min(8).required(),
    reference_code: Joi.string().optional(),
    status_remarks: Joi.string().optional(),
    app_role: Joi.string().valid('customer').default('customer'),
  });

  return schema.validate(data);
};

const validateCustomerUpdate = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).optional(),
    last_name: Joi.string().min(2).optional(),
    mobile_number: Joi.number().integer().min(1000000000).max(9999999999).optional(),
    alternate_number: Joi.number().integer().min(1000000000).max(9999999999).optional()
      .not(Joi.ref('phone_number')).error(new Error('Alternate number must differ from phone number')),
    email: Joi.string().email().optional(),
    company_name: Joi.string().min(3).optional(),
    first_line_address: Joi.string().min(5).optional(),
    second_line_address: Joi.string().min(5).optional(),
    state: Joi.string().min(2).optional(),
    city: Joi.string().min(2).optional(),
    pin_code: Joi.number().integer().min(100000).max(999999).optional(),
    gst_no: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$/).optional(),
    adhar_no: Joi.number().integer().min(100000000000).max(999999999999).optional(),
    pan_card_no: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$|^$/).optional(),
    adhar_front_photo: Joi.string().optional(),
    adhar_back_photo: Joi.string().optional(),
    pan_card_photo: Joi.string().optional(),
    profile_picture: Joi.string().optional(),
    status: Joi.string().valid('new registration', 'Approved', 'Hold', 'Suspended', 'Black Listed').optional(),
    status_remarks: Joi.string().optional(),
    reference_code: Joi.string().optional(),
  }).min(1);

  return schema.validate(data);
};

const validateCustomerQuery = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('new registration', 'Approved', 'Hold', 'Suspended', 'Black Listed').optional(),
    full_name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    mobile_number: Joi.number().integer().min(1000000000).max(9999999999).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });

  return schema.validate(data);
};

const validateDriverRegister = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    mobile_number: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    alternate_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional()
      .not(Joi.ref('mobile_number')).error(new Error('Alternate number must differ from mobile number')),
    password: Joi.string().min(8).required(),
    address_line_1: Joi.string().min(5).optional(),
    address_line_2: Joi.string().min(5).optional(),
    state: Joi.string().min(2).optional(),
    city: Joi.string().min(2).optional(),
    pin_code: Joi.string().pattern(/^[0-9]{6,10}$/).optional(),
    current_address_proof: Joi.string().optional(),
    current_address: Joi.string().min(5).optional(),
    vendor_code: Joi.string().optional(),
    vendor_name: Joi.string().min(3).optional(),
    pan_card_no: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
    pan_card_photo: Joi.string().optional(),
    aadhar_no: Joi.string().pattern(/^[0-9]{12}$/).optional(),
    aadhar_front_photo: Joi.string().optional(),
    aadhar_back_photo: Joi.string().optional(),
    driving_licence_no: Joi.string().min(5).optional(),
    driving_licence_photo: Joi.string().optional(),
    profile_picture: Joi.string().optional(),
    reference_code: Joi.string().optional(),
    status_remark: Joi.string().optional(),
    app_role: Joi.string().valid('sdddriver').default('sdddriver'),
  });

  return schema.validate(data);
};

const validateDriverUpdate = (data) => {
  const schema = Joi.object({
    app_role: Joi.string().optional(),
    first_name: Joi.string().min(2).optional(),
    last_name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    mobile_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    alternate_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional()
      .not(Joi.ref('mobile_number')).error(new Error('Alternate number must differ from mobile number')),
    address_line_1: Joi.string().min(5).optional(),
    address_line_2: Joi.string().min(5).optional(),
    state: Joi.string().min(2).optional(),
    city: Joi.string().min(2).optional(),
    pin_code: Joi.string().pattern(/^[0-9]{6,10}$/).optional(),
    current_address_proof: Joi.string().optional(),
    current_address: Joi.string().min(5).optional(),
    vendor_code: Joi.string().optional(),
    vendor_name: Joi.string().min(3).optional(),
    pan_card_no: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
    pan_card_photo: Joi.string().optional(),
    aadhar_no: Joi.string().pattern(/^[0-9]{12}$/).optional(),
    aadhar_front_photo: Joi.string().optional(),
    aadhar_back_photo: Joi.string().optional(),
    driving_licence_no: Joi.string().min(5).optional(),
    driving_licence_photo: Joi.string().optional(),
    profile_picture: Joi.string().optional(),
    status: Joi.string().valid('New', 'Approved', 'Hold', 'Suspended', 'Blacklisted').optional(),
    status_remark: Joi.string().optional(),
    reference_code: Joi.string().optional(),
  }).min(1);

  return schema.validate(data);
};

const validateDriverQuery = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('New', 'Approved', 'Hold', 'Suspended', 'Blacklisted').optional(),
    full_name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    mobile_number: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });

  return schema.validate(data);
};

const validateEmployeeRegister = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    mobile_number: Joi.number().integer().min(1000000000).max(9999999999).required(),
    app_roles: Joi.string().valid('vendor', 'sdddriver', 'admin', 'customer', 'staff', 'driver', 'executive', 'manager').required(),
    designation: Joi.string().valid('Sub Super Admin', 'Dep. Head', 'Manager', 'Executive').required(),
    department: Joi.string().valid('HR', 'Accounts', 'Operation', 'Sales & Marketing', 'CSD', 'IT.Tech').required(),
    reporting_manager: Joi.string().optional(),
    password: Joi.string().min(8).required(),
    status_remarks: Joi.string().optional(),
    status: Joi.string().valid('Active', 'Suspended', 'Terminated').required(),
  });

  return schema.validate(data);
};

const validateEmployeeUpdate = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).optional(),
    last_name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    mobile_number: Joi.number().integer().min(1000000000).max(9999999999).optional(),
    app_roles: Joi.string().valid('vendor', 'sdddriver', 'admin', 'customer', 'staff', 'driver', 'executive', 'manager').optional(),
    designation: Joi.string().valid('Sub Super Admin', 'Dep. Head', 'Manager', 'Executive').optional(),
    department: Joi.string().valid('HR', 'Accounts', 'Operation', 'Sales & Marketing', 'CSD', 'IT.Tech').optional(),
    reporting_manager: Joi.string().optional(),
    status: Joi.string().valid('Active', 'Suspended', 'Terminated').optional(),
    status_remarks: Joi.string().optional(),
  }).min(1);

  return schema.validate(data);
};

const validateEmployeeQuery = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('Active', 'Suspended', 'Terminated').optional(),
    full_name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    mobile_number: Joi.number().integer().min(1000000000).max(9999999999).optional(),
    department: Joi.string().valid('HR', 'Accounts', 'Operation', 'Sales & Marketing', 'CSD', 'IT.Tech').optional(),
    designation: Joi.string().valid('Sub Super Admin', 'Dep. Head', 'Manager', 'Executive').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });

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

const validatePlaceManagerCreate = (data) => {
  const schema = Joi.object({
    place_id: Joi.string().optional(),  // Backend can auto-generate later
    company_name: Joi.string().min(3).required(),
    place_type: Joi.string().valid('Pickup Place', 'Consignee Place').required(),
    address_line1: Joi.string().min(5).required(),
    address_line2: Joi.string().min(5).required(),
    nearest_railway_station: Joi.string().min(2).required(),
    nearest_bus_stop: Joi.string().min(2).required(),
    landmark: Joi.string().min(2).required(),
    city: Joi.string().min(2).required(),
    state: Joi.string().min(2).required(),
    pincode: Joi.number().integer().min(100000).max(999999).required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    contact_person_name: Joi.string().min(2).required(),
    contact_person_mobile: Joi.string().pattern(/^[6-9][0-9]{9}$/).required(),
    alternate_number: Joi.string().pattern(/^[6-9][0-9]{9}$/).required(),
    parking_place_availability: Joi.string().valid("YES", "NO").required(),
    place_source: Joi.string().required(),
    place_source_name: Joi.string().required(),
    created_by: Joi.string().valid('Admin', 'Customer').required(),
    status: Joi.string().valid('New Registration', 'Under Review', 'Approved', 'Suspended').optional(),
    status_remarks: Joi.string().optional(),
    gst_no: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
    connected_hub: Joi.string().required()
  });

  return schema.validate(data);
};



// ✅ Place Manager Get By Source Validation
const validatePlaceSourceParam = (params) => {
  const schema = Joi.object({
    place_source: Joi.string().min(1).required().messages({
      'string.base': 'Place source must be a string',
      'string.empty': 'Place source is required',
    }),
  });
  return schema.validate(params);
};

const validatePlaceDeleteParam = params => {
  const schema = Joi.object({
    place_id: Joi.string().min(1).required()
      .messages({
        'string.base': 'Place ID must be a string',
        'string.empty': 'Place ID is required',
      })
  });
  return schema.validate(params);
};


// Joi schema to validate fields for update
const validatePlaceManagerUpdate = (data) => {
  const schema = Joi.object({
    company_name: Joi.string().min(3),
    address_line1: Joi.string().min(5),
    address_line2: Joi.string().min(5),
    nearest_railway_station: Joi.string().min(2),
    nearest_bus_stop: Joi.string().min(2),
    landmark: Joi.string().min(2),
    city: Joi.string().min(2),
    state: Joi.string().min(2),
    pincode: Joi.number().integer().min(100000).max(999999),
    latitude: Joi.number(),
    longitude: Joi.number(),
    contact_person_name: Joi.string().min(2),
    contact_person_mobile: Joi.string().pattern(/^[6-9]\d{9}$/),
    alternate_number: Joi.string().pattern(/^[6-9]\d{9}$/),
    parking_place_availability: Joi.string().valid('YES', 'NO'),
    place_source: Joi.string(),
    place_source_name: Joi.string(),
    created_by: Joi.string().valid('Admin', 'Customer'),
    status: Joi.string().valid('New Registration', 'Under Review', 'Approved', 'Suspended'),
    status_remarks: Joi.string(),
    gst_no: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
    connected_hub: Joi.string().optional()
  });

  return schema.validate(data);
};

const validateWalletTransaction = (data) => {
  const schema = Joi.object({
    credit_debit: Joi.string().valid('credit', 'debit').required(),
    transaction_type: Joi.string().valid(
      'Admin Allocated Balance',
      'Admin Deducted Balance'
    ).required(),
    amount: Joi.number().positive().required(),
    customer_id: Joi.string().required(),

    // Optional
    remarks: Joi.string().optional(),
    portal_transaction_id: Joi.string().optional(),
    portal_transaction_remarks_1: Joi.string().optional(),
    portal_transaction_remarks_2: Joi.string().optional(),
    payment_method: Joi.string().optional()
  });

  return schema.validate(data);
};



// ✅ DC Manager Register Validation
const validateDcManagerRegister = (data) => {
  const schema = Joi.object({
    branch_name: Joi.string().min(3).required().messages({
      'any.required': 'Branch name is required',
      'string.min': 'Branch name must be at least 3 characters'
    }),

    nearest_station: Joi.string().min(2).required().messages({
      'any.required': 'Nearest station is required',
      'string.min': 'Nearest station must be at least 2 characters'
    }),

    nearest_bus_stop: Joi.string().min(2).required().messages({
      'any.required': 'Nearest bus stop is required',
      'string.min': 'Nearest bus stop must be at least 2 characters'
    }),

    state: Joi.string().min(2).required().messages({
      'any.required': 'State is required',
      'string.min': 'State must be at least 2 characters'
    }),

    city: Joi.string().min(2).required().messages({
      'any.required': 'City is required',
      'string.min': 'City must be at least 2 characters'
    }),

    pin_code: Joi.number().integer().min(100000).max(999999).required().messages({
      'any.required': 'Pin code is required',
      'number.base': 'Pin code must be a number',
      'number.min': 'Pin code must be 6 digits',
      'number.max': 'Pin code must be 6 digits'
    }),

    latitude: Joi.number().required().messages({
      'any.required': 'Latitude is required',
      'number.base': 'Latitude must be a number'
    }),

    longitude: Joi.number().required().messages({
      'any.required': 'Longitude is required',
      'number.base': 'Longitude must be a number'
    }),

    full_address: Joi.string().min(5).required().messages({
      'any.required': 'Full address is required',
      'string.min': 'Full address must be at least 5 characters'
    }),

    mobile_number: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
      'any.required': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be a valid 10-digit Indian mobile number starting with 6-9'
    }),

    status: Joi.string().valid('Active', 'Inactive', 'Suspended').default('Active').optional(),

    remark: Joi.string().optional()
  });

  return schema.validate(data);
};





/**
 * ✅ Validation for fetching a single DC Manager record
 * - Validates that branchId is present and is a non-empty string
 */
const validateDcManagerGetSingle = (params) => {
  const schema = Joi.object({
    branchId: Joi.string().min(1).required().messages({
      'string.base': 'Branch ID must be a string',
      'string.empty': 'Branch ID is required',
      'any.required': 'Branch ID parameter is missing',
    }),
  });

  return schema.validate(params);
};



/**
 * ✅ Validation for updating an existing DC Manager
 * - All fields are optional (partial update allowed).
 */
const validateDcManagerUpdate = (data) => {
  const schema = Joi.object({
    branch_name: Joi.string().optional().label('Branch Name'),
    nearest_station: Joi.string().optional().label('Nearest Station'),
    nearest_bus_stop: Joi.string().optional().label('Nearest Bus Stop'),
    state: Joi.string().optional().label('State'),
    city: Joi.string().optional().label('City'),
    pin_code: Joi.number().integer().min(100000).max(999999).optional().label('Pin Code'),
    latitude: Joi.number().optional().label('Latitude'),
    longitude: Joi.number().optional().label('Longitude'),
    full_address: Joi.string().optional().label('Full Address'),
    mobile_number: Joi.string().pattern(/^[6-9][0-9]{9}$/).optional().label('Mobile Number'),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended').optional().label('Status'),
    remark: Joi.string().allow(null, '').optional().label('Remark'),

    // ✅ New optional JSON columns
    pick_up_range: Joi.array().items(Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      radius_km: Joi.number().required(),
      input: Joi.string().required(),
      id: Joi.string().optional()
    })).optional().label('Pick Up Range'),

    consignee_up_range: Joi.array().items(Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      radius_km: Joi.number().required(),
      input: Joi.string().required(),
      id: Joi.string().optional()
    })).optional().label('Consignee Up Range'),

    staff_login_range: Joi.array().items(Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      radius_km: Joi.number().required(),
      input: Joi.string().required(),
      id: Joi.string().optional()
    })).optional().label('Staff Login Range'),

    driver_login_range: Joi.array().items(Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      radius_km: Joi.number().required(),
      input: Joi.string().required(),
      id: Joi.string().optional()
    })).optional().label('Driver Login Range')

  });

  return schema.validate(data);
};

/**
 * ✅ Validation for deleting a DC Manager
 * - branchId param is required.
 */
const validateDcManagerDelete = (params) => {
  const schema = Joi.object({
    branchId: Joi.string().required().label('Branch ID')
  });

  return schema.validate(params);
};


const validateODLimitUpdate = (data) => {
  const schema = Joi.object({
    od_limit: Joi.number().min(0).required()
  });

  return schema.validate(data);
};

module.exports = {
  validateODLimitUpdate
};


const validatePriceManagerRegister = (data) => {
  const schema = Joi.object({
    customer_id: Joi.string().min(1).required(),
    customer_name: Joi.string().min(1).required(),
    dimension_name: Joi.string().min(1).required(),
    length: Joi.number().required(),
    breadth: Joi.number().required(),
    height: Joi.number().required(),
    weight: Joi.number().required(),
    dimension_charge: Joi.number().required(),
    volumetric_factor: Joi.number().required(),
    chalaan_return_charges: Joi.alternatives().try(
      Joi.number(),
      Joi.string().allow(""),
      Joi.valid(null)
    ).optional(),
    express_delivery_percentage: Joi.number().required(),
    gst_percentage: Joi.number().required(),

    // COD JSON ranges and numeric charges
    cod_range_1: Joi.string().allow("").optional(),
    cod_charge_1: Joi.alternatives().try(Joi.number(), Joi.string().allow("")).optional(),

    cod_range_2: Joi.string().allow("").optional(),
    cod_charge_2: Joi.alternatives().try(Joi.number(), Joi.string().allow("")).optional(),

    cod_range_3: Joi.string().allow("").optional(),
    cod_charge_3: Joi.alternatives().try(Joi.number(), Joi.string().allow("")).optional(),

    cod_range_4: Joi.string().allow("").optional(),
    cod_charge_4: Joi.alternatives().try(Joi.number(), Joi.string().allow("")).optional(),

    cod_range_5: Joi.string().allow("").optional(),
    cod_charge_5: Joi.alternatives().try(Joi.number(), Joi.string().allow("")).optional(),

    cod_range_6: Joi.string().allow("").optional(),
    cod_charge_6: Joi.alternatives().try(Joi.number(), Joi.string().allow("")).optional(),

    status: Joi.string().valid('active', 'deactive').default('deactive'),
    status_remarks: Joi.string().optional()
  });

  return schema.validate(data);
};

const validatePriceManagerUpdate = (data) => {
  const schema = Joi.object({
    dimension_name: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .message('Dimension name must be 2-50 characters'),

    length: Joi.number()
      .min(0.1)
      .max(1000)
      .message('Length must be between 0.1 and 1000'),

    breadth: Joi.number()
      .min(0.1)
      .max(1000)
      .message('Breadth must be between 0.1 and 1000'),

    height: Joi.number()
      .min(0.1)
      .max(1000)
      .message('Height must be between 0.1 and 1000'),

    weight: Joi.number()
      .min(0.1)
      .max(5000)
      .message('Weight must be between 0.1 and 5000'),

    dimension_charge: Joi.number()
      .min(0)
      .message('Charge cannot be negative'),


  }).min(1) // At least one field must be provided
    .message('Must provide at least one field to update');

  return schema.validate(data, {
    abortEarly: false // Show all validation errors at once
  });
};

const validatePriceManagerStatusUpdate = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('active', 'deactive').required().messages({
      'any.only': 'Status must be either active or deactive',
    }),
    status_remarks: Joi.string().allow('').max(255),
  });

  return schema.validate(data, { abortEarly: false });
};


const validateDynamicPriceCreate = (data) => {
  const codRangeSchema = Joi.object({
    id: Joi.string().optional(),
    range: Joi.array().items(Joi.number()).length(2).required(),
    charge: Joi.number().required()
  });

  const schema = Joi.object({
    base_fare_per_kg: Joi.number().required(),
    volumetric_factor: Joi.number().required(),
    chalaan_return_charges: Joi.number().required(),
    express_delivery_surcharge_percentage: Joi.number().required(),
    gst_percentage: Joi.number().required(),
    cod_ranges: Joi.array().items(codRangeSchema).min(1).max(6).required(),
    status: Joi.string().valid('active', 'inactive').required(),
    status_remark: Joi.string().required()
  });

  return schema.validate(data);
};

const validateDynamicPriceUpdate = (data) => {
  const schema = Joi.object({
    status: Joi.string().valid('active', 'inactive').required(),
    status_remark: Joi.string().required()
  });

  return schema.validate(data);
};

const validateTimeWindowCreate = (data) => {
  const schema = Joi.object({
    branch_id: Joi.string().required().messages({
      'string.empty': 'Branch ID is required.'
    }),
    dc_name: Joi.string().min(1).required().messages({
      'string.empty': 'DC Name is required.'
    }),
    max_order_time: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'max_order_time must be in HH:mm format.',
        'string.empty': 'max_order_time is required.'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

const validateTimeWindowUpdate = (data) => {
  const schema = Joi.object({
    dc_name: Joi.string().min(1).optional(),
    max_order_time: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        'string.pattern.base': 'max_order_time must be in HH:mm format.'
      })
  }).min(1).messages({
    'object.min': 'At least one field (dc_name or max_order_time) must be provided.'
  });

  return schema.validate(data, { abortEarly: false });
};

const validateBankingDetails = (data, isUpdate = false) => {
  // For updates, all fields become optional; for create, they are required
  const reqIf = (schema) => (isUpdate ? schema.optional() : schema.required());

  const schema = Joi.object({
    upi_id: reqIf(Joi.string().min(5).max(255)).messages({
      'any.required': 'UPI ID is required',
      'string.min': 'UPI ID must be at least 5 characters',
      'string.max': 'UPI ID must not exceed 255 characters'
    }),
    qr_code_image: reqIf(Joi.string()).messages({
      'any.required': 'QR code image path is required'
    }),
    bank_name: reqIf(Joi.string().min(2).max(255)).messages({
      'any.required': 'Bank name is required',
      'string.min': 'Bank name must be at least 2 characters',
      'string.max': 'Bank name must not exceed 255 characters'
    }),
    account_number: reqIf(Joi.number().integer()).messages({
      'any.required': 'Account number is required',
      'number.base': 'Account number must be a number',
      'number.integer': 'Account number must be an integer'
    }),
    account_name: reqIf(Joi.string().min(2).max(255)).messages({
      'any.required': 'Account name is required',
      'string.min': 'Account name must be at least 2 characters',
      'string.max': 'Account name must not exceed 255 characters'
    }),
    ifsc_code: reqIf(Joi.string().length(11)).messages({
      'any.required': 'IFSC code is required',
      'string.length': 'IFSC code must be exactly 11 characters'
    }),
    primary_status: Joi.boolean().optional(),
    status: (isUpdate ? Joi.string().valid('Active', 'Inactive').optional() : Joi.string().valid('Active', 'Inactive').default('Active')),
    status_remark: Joi.string().max(500).allow('').messages({
      'string.max': 'Status remark must not exceed 500 characters'
    }),
    addition_date: Joi.date().optional(),
  }).unknown(false);

  // For update, require at least one field; for create, default Joi will enforce required ones
  const options = { abortEarly: false, context: { isUpdate } };
  const result = schema.validate(data || {}, options);

  // Manual guard for update: no fields provided
  if (isUpdate && !result.error) {
    const keys = Object.keys(data || {});
    const allowed = ['upi_id', 'qr_code_image', 'bank_name', 'account_number', 'account_name', 'ifsc_code', 'primary_status', 'status', 'status_remark', 'addition_date'];
    const hasAny = keys.some(k => allowed.includes(k));
    if (!hasAny) {
      return { error: { details: [{ message: 'At least one field must be provided to update' }] } };
    }
  }

  return result;
};

const validateRechargeRequest = (data) => {
  const schema = Joi.object({
    amount: Joi.number()
      .required()
      .min(1)
      .messages({
        'any.required': 'Amount is required',
        'number.min': 'Amount must be positive'
      }),

    screenshot: Joi.string()
      .required()
      .messages({
        'any.required': 'Screenshot path is required'
      }),

    selected_bank_id: Joi.string()
      .optional()
      .messages({
        'string.guid': 'Selected bank ID must be a valid UUID'
      }),

    bank_transaction_id: Joi.string()
      .optional()
      .max(50)
      .messages({
        'string.max': 'Transaction ID must not exceed 50 characters'
      }),

    status_remark: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Status remark must not exceed 500 characters'
      }),
  }).unknown(false); // prevent extra fields

  return schema.validate(data || {}, { abortEarly: false });
};

// ✅ Create Order Validation
const validateCreateOrder = (data) => {
  const schema = Joi.object({
    // Core
    customer_id: Joi.string().required(),
    pickup_place_id: Joi.string().required(),
    drop_place_id: Joi.string().required(),

    // Scheduling
    schedule_date: Joi.date().required(),
    preferred_pickup_time: Joi.string().required(),
    consignee_closing_time: Joi.string().required(), 

    // Notes
    pickup_note: Joi.string().allow(null, '').optional(),
    drop_note: Joi.string().allow(null, '').optional(),

    // Commodity
    commodity: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).required(),
    price_module_type: Joi.string().valid('fixed', 'dynamic').required(),

    // Service Flags
    express_delivery: Joi.boolean().required(),
    express_charges: Joi.number().default(0),

    challan_return: Joi.boolean().required(),
    challan_pic: Joi.string().allow(null, '').optional(),
    challan_return_status: Joi.string().allow(null, '').optional(),
    challan_charges: Joi.number().default(0),

    cod_collection: Joi.boolean().required(),
    cod_amount: Joi.number().default(0),
    cod_status: Joi.string().allow(null, '').optional(),
    cod_charges: Joi.number().default(0),

    // Dimensions (extended)
    dimensions: Joi.array().items(
      Joi.object({
        id: Joi.number().required(),
        length: Joi.number().required(),
        breadth: Joi.number().required(),
        height: Joi.number().required(),
        units: Joi.number().required(),
        perUnitWeight: Joi.number().required(),
        charges: Joi.number().optional(),
        volumetricWeightPerUnit: Joi.number().optional(),
        totalVolume: Joi.number().optional(),             
        totalWeight: Joi.number().optional()              
      })
    ).min(1).required(),

    // Totals
    total_units: Joi.number().required(),
    total_gross_weight: Joi.number().required(),
    total_vol_weight: Joi.number().required(),
    total_volume: Joi.number().required(),
    chargeable_weight: Joi.number().required(),

    // Financials
    transportation_charges: Joi.number().required(),
    applied_coupon: Joi.string().allow(null, '').optional(),
    coupon_discount: Joi.number().default(0),
    pre_tax_amount: Joi.number().required(),
    gst_percentage: Joi.number().required(),
    gst_amount: Joi.number().required(),
    final_payable: Joi.number().required()
  });

  return schema.validate(data);
};


// ✅ Delete Order Validation
const validateDeleteOrder = (params) => {
  const schema = Joi.object({
    order_id: Joi.string().required(),
  });
  return schema.validate(params);
};

module.exports = {
  validateVendorRegister,
  validateVendorQuery,
  validateLogin,
  validateCustomerRegister,
  validateCustomerUpdate,
  validateCustomerQuery,
  validateDriverRegister,
  validateDriverUpdate,
  validateDriverQuery,
  validateEmployeeRegister,
  validateEmployeeUpdate,
  validateEmployeeQuery,
  validateContactCreate,
  validateContactUpdate,
  validateContactQuery,
  validatePlaceManagerCreate,
  validatePlaceSourceParam,
  validatePlaceDeleteParam,
  validatePlaceManagerUpdate,
  validateWalletTransaction,
  validateDcManagerRegister,
  validateDcManagerUpdate,
  validateDcManagerDelete,
  validateDcManagerGetSingle,
  validateODLimitUpdate,
  validatePriceManagerRegister,
  validatePriceManagerUpdate,
  validatePriceManagerStatusUpdate,
  validateDynamicPriceCreate,
  validateDynamicPriceUpdate,
  validateTimeWindowCreate,
  validateTimeWindowUpdate,
  validateBankingDetails,
  validateRechargeRequest,
  validateCreateOrder,
  validateDeleteOrder
};
