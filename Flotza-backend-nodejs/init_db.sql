-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create approle table
CREATE TABLE approle (
    name TEXT PRIMARY KEY
);

-- Insert default role '<role name>'
INSERT INTO approle (name) VALUES ('vendor');
INSERT INTO approle (name) VALUES ('sdddriver');
INSERT INTO approle (name) VALUES ('customer');
INSERT INTO approle (name) VALUES ('staff');

-- Create customers table (with fixed pan_card_no)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT UNIQUE NOT NULL,
    app_role TEXT NOT NULL DEFAULT 'customer',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    phone_number BIGINT NOT NULL,
    alternate_number BIGINT NOT NULL,
    email TEXT NOT NULL,
    company_name TEXT NOT NULL,
    first_line_address TEXT NOT NULL,
    second_line_address TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    pin_code BIGINT NOT NULL,
    full_address TEXT GENERATED ALWAYS AS (
        first_line_address || ', ' || 
        second_line_address || ', ' || 
        city || ', ' || 
        state || ' - ' || 
        pin_code::TEXT
    ) STORED,
    gst_no TEXT,
    adhar_no BIGINT,
    adhar_front_photo TEXT,
    adhar_back_photo TEXT,
    pan_card_no TEXT,
    pan_card_photo TEXT,
    profile_picture TEXT,
    wallet_balance BIGINT DEFAULT 0,
    referral_code TEXT UNIQUE NOT NULL DEFAULT (gen_random_uuid()::TEXT),
    reference_code TEXT,
    password TEXT NOT NULL,
    registration_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'new registration' CHECK (status IN ('new registration', 'Approved', 'Hold', 'Suspended', 'Black Listed')),
    status_remarks TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customers_email_unique UNIQUE (email),
    CONSTRAINT customers_phone_number_unique UNIQUE (phone_number),
    CONSTRAINT customers_alternate_number_unique UNIQUE (alternate_number),
    CONSTRAINT customers_gst_no_unique UNIQUE (gst_no),
    CONSTRAINT customers_adhar_no_unique UNIQUE (adhar_no),
    CONSTRAINT customers_pan_card_no_unique UNIQUE (pan_card_no),
    CONSTRAINT customers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT customers_phone_number_check CHECK (phone_number BETWEEN 1000000000 AND 9999999999),
    CONSTRAINT customers_alternate_number_check CHECK (alternate_number BETWEEN 1000000000 AND 9999999999),
    CONSTRAINT customers_pin_code_check CHECK (pin_code BETWEEN 100000 AND 999999),
    CONSTRAINT customers_gst_no_check CHECK (gst_no ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$'),
    CONSTRAINT customers_adhar_no_check CHECK (adhar_no IS NULL OR adhar_no BETWEEN 100000000000 AND 999999999999),
    CONSTRAINT customers_pan_card_no_check CHECK (pan_card_no IS NULL OR pan_card_no ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
    CONSTRAINT customers_alternate_number_differs CHECK (alternate_number IS DISTINCT FROM phone_number),
    CONSTRAINT customers_app_role_fkey FOREIGN KEY (app_role) REFERENCES approle(name) ON UPDATE CASCADE ON DELETE RESTRICT
);


-- Create drivers table (new schema)
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id TEXT UNIQUE NOT NULL,
    app_role TEXT NOT NULL DEFAULT 'sdddriver',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    alternate_number TEXT,
    password TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    full_address TEXT GENERATED ALWAYS AS (
        address_line_1 || 
        COALESCE(', ' || address_line_2, '') || ', ' || 
        city || ', ' || 
        state || ' - ' || 
        pin_code
    ) STORED,
    current_address_proof TEXT NOT NULL,
    current_address TEXT NOT NULL,
    vendor_code TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    pan_card_no TEXT NOT NULL,
    pan_card_photo TEXT NOT NULL,
    aadhar_no TEXT NOT NULL,
    aadhar_front_photo TEXT NOT NULL,
    aadhar_back_photo TEXT NOT NULL,
    driving_licence_no TEXT NOT NULL,
    driving_licence_photo TEXT NOT NULL,
    profile_picture TEXT NOT NULL,
    cod_holdings NUMERIC(10,2) DEFAULT 0 CHECK (cod_holdings >= 0),
    chalan_holdings NUMERIC(10,2) DEFAULT 0 CHECK (chalan_holdings >= 0),
    total_deliveries INTEGER DEFAULT 0 CHECK (total_deliveries >= 0),
    customer_ratings NUMERIC(3,1) CHECK (customer_ratings IS NULL OR customer_ratings BETWEEN 1.0 AND 5.0),
    referral_code TEXT UNIQUE NOT NULL DEFAULT (gen_random_uuid()::TEXT),
    reference_code TEXT,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Approved', 'Hold', 'Suspended', 'Blacklisted')),
    status_remark TEXT,
    last_device_used JSONB,
    current_device_using JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT drivers_email_unique UNIQUE (email),
    CONSTRAINT drivers_mobile_number_unique UNIQUE (mobile_number),
    CONSTRAINT drivers_alternate_number_unique UNIQUE (alternate_number),
    CONSTRAINT drivers_pan_card_no_unique UNIQUE (pan_card_no),
    CONSTRAINT drivers_aadhar_no_unique UNIQUE (aadhar_no),
    CONSTRAINT drivers_driving_licence_no_unique UNIQUE (driving_licence_no),
    CONSTRAINT drivers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT drivers_mobile_number_check CHECK (mobile_number ~ '^[0-9]{10,15}$'),
    CONSTRAINT drivers_alternate_number_check CHECK (alternate_number IS NULL OR alternate_number ~ '^[0-9]{10,15}$'),
    CONSTRAINT drivers_pin_code_check CHECK (pin_code ~ '^[0-9]{6,10}$'),
    CONSTRAINT drivers_pan_card_no_check CHECK (pan_card_no ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
    CONSTRAINT drivers_aadhar_no_check CHECK (aadhar_no ~ '^[0-9]{12}$'),
    CONSTRAINT drivers_alternate_number_differs CHECK (alternate_number IS DISTINCT FROM mobile_number),
    CONSTRAINT drivers_app_role_fkey FOREIGN KEY (app_role) REFERENCES approle(name) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT drivers_vendor_code_fkey FOREIGN KEY (vendor_code) REFERENCES vendors(vendor_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Create vendors table with app_role as foreign key
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id TEXT UNIQUE NOT NULL,
    app_role TEXT NOT NULL DEFAULT 'vendor',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT NOT NULL,
    mobile_number BIGINT NOT NULL,
    alternate_no BIGINT,
    password TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_address TEXT NOT NULL,
    gst_number TEXT,
    gst_upload TEXT,
    pan_card_no TEXT NOT NULL,
    pan_card_photo_upload TEXT NOT NULL,
    aadhar_front_photo_upload TEXT NOT NULL,
    aadhar_back_photo_upload TEXT NOT NULL,
    adhar_no TEXT NOT NULL,
    profile_photo TEXT,
    no_of_drivers INTEGER DEFAULT 0,
    no_of_vehicles INTEGER DEFAULT 0,
    current_pay_outstandings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vendors_email_unique UNIQUE (email),
    CONSTRAINT vendors_mobile_number_unique UNIQUE (mobile_number),
    CONSTRAINT vendors_alternate_no_unique UNIQUE (alternate_no),
    CONSTRAINT vendors_gst_number_unique UNIQUE (gst_number),
    CONSTRAINT vendors_pan_card_no_unique UNIQUE (pan_card_no),
    CONSTRAINT vendors_adhar_no_unique UNIQUE (adhar_no),
    CONSTRAINT vendors_password_unique UNIQUE (password),
    CONSTRAINT vendors_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT vendors_mobile_number_check CHECK (mobile_number BETWEEN 1000000000 AND 9999999999),
    CONSTRAINT vendors_alternate_no_check CHECK (alternate_no IS NULL OR alternate_no BETWEEN 1000000000 AND 9999999999),
    CONSTRAINT vendors_gst_number_check CHECK (gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$'),
    CONSTRAINT vendors_pan_card_no_check CHECK (pan_card_no ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
    CONSTRAINT vendors_adhar_no_check CHECK (adhar_no ~ '^[0-9]{12}$'),
    CONSTRAINT vendors_alternate_no_differs CHECK (alternate_no IS DISTINCT FROM mobile_number),
    CONSTRAINT vendors_app_role_fkey FOREIGN KEY (app_role) REFERENCES approle(name) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile_number BIGINT NOT NULL,
    app_roles TEXT NOT NULL,
    designation TEXT NOT NULL CHECK (designation IN ('Sub Super Admin', 'Dep. Head', 'Manager', 'Executive')),
    department TEXT NOT NULL CHECK (department IN ('HR', 'Accounts', 'Operation', 'Sales & Marketing', 'CSD', 'IT.Tech')),
    reporting_manager TEXT,
    password TEXT NOT NULL CHECK (LENGTH(password) >= 8),
    status TEXT NOT NULL CHECK (status IN ('Active', 'Suspended', 'Terminated')),
    status_remarks TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employees_email_unique UNIQUE (email),
    CONSTRAINT employees_mobile_number_unique UNIQUE (mobile_number),
    CONSTRAINT employees_mobile_number_check CHECK (mobile_number BETWEEN 1000000000 AND 9999999999),
    CONSTRAINT employees_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT employees_app_roles_fkey FOREIGN KEY (app_roles) REFERENCES approle(name) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT employees_reporting_manager_fkey FOREIGN KEY (reporting_manager) REFERENCES employees(employee_id) ON UPDATE CASCADE ON DELETE SET NULL
);

INSERT INTO employees (
    employee_id,
    first_name,
    last_name,
    full_name,
    email,
    mobile_number,
    app_roles,
    designation,
    department,
    reporting_manager,
    password,
    status,
    status_remarks
)
VALUES (
    'EMP_1000000000_root',
    'Silence',
    'Admin',
    'Silence Admin',
    'admin@example.com',
    9999999999,
    'admin',  -- This must exist in approle(name)
    'Sub Super Admin',
    'IT.Tech',
    NULL,
    'verysecurepassword',
    'Active',
    'Root level admin user creation'
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



-- Create place_manager table with enums and constraints
CREATE TABLE place_manager (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Unique Place ID like KBC1, KBW1 etc
    place_id TEXT UNIQUE NOT NULL,

    -- Company name
    company_name TEXT NOT NULL,

    -- Place Type: Must be either 'Pickup Place' or 'Consignee Place'
    place_type TEXT NOT NULL CHECK (place_type IN ('Pickup Place', 'Consignee Place')),

    -- Address Details
    address_line1 TEXT NOT NULL,
    address_line2 TEXT NOT NULL,

    -- Nearest transport points
    nearest_railway_station TEXT NOT NULL,
    nearest_bus_stop TEXT NOT NULL,
    landmark TEXT NOT NULL,

    -- City and State
    city TEXT NOT NULL,
    state TEXT NOT NULL,

    -- 6-digit Indian Pincode
    pincode INTEGER NOT NULL CHECK (pincode >= 100000 AND pincode <= 999999),

    -- Full Address auto-generated
    full_address TEXT GENERATED ALWAYS AS (address_line1 || ' ' || address_line2) STORED NOT NULL,

    -- Geo Coordinates
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,

    -- Contact Person Details
    contact_person_name TEXT NOT NULL,
    contact_person_mobile BIGINT NOT NULL CHECK (contact_person_mobile::TEXT ~ '^[6-9][0-9]{9}$'),
    alternate_number BIGINT NOT NULL CHECK (alternate_number::TEXT ~ '^[6-9][0-9]{9}$'),

    -- Parking Availability: Must be either 'YES' or 'NO'
    parking_place_availability TEXT NOT NULL CHECK (parking_place_availability IN ('YES', 'NO')),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Customer Info
    place_source TEXT NOT NULL,          -- Customer ID
    place_source_name TEXT NOT NULL,     -- Customer Name (mandatory)

    -- Creator Info
    created_by TEXT NOT NULL,

    -- Status and Remarks
    status TEXT NOT NULL DEFAULT 'New Registration',
    status_remarks TEXT,

    -- GST Number (optional, but format-validated)
    gst_no TEXT CHECK (gst_no ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
);

INSERT INTO place_manager (
    place_id,
    company_name,
    place_type,
    address_line1,
    address_line2,
    nearest_railway_station,
    nearest_bus_stop,
    landmark,
    city,
    state,
    pincode,
    latitude,
    longitude,
    contact_person_name,
    contact_person_mobile,
    alternate_number,
    parking_place_availability,
    place_source,
    place_source_name,
    created_by,
    status,
    status_remarks,
    gst_no
) VALUES (
    'KBP1',                             -- ✅ Unique Place ID (example for Pickup Place)

    'XYZ Freight Services',             -- ✅ Company Name
    'Pickup Place',                     -- ✅ Allowed place_type: 'Pickup Place' or 'Consignee Place'

    'Plot No 45, Logistics Park',       -- ✅ Address Line 1
    'Sector 5, Near Expressway',        -- ✅ Address Line 2

    'North Railway Station',            -- ✅ Nearest Railway Station
    'Logistics Park Bus Stop',          -- ✅ Nearest Bus Stop
    'Opposite Mega Mall',               -- ✅ Landmark

    'Mumbai',                           -- ✅ City
    'Maharashtra',                      -- ✅ State
    400072,                              -- ✅ Pincode (6 digits, Indian format)

    19.0760,                             -- ✅ Latitude
    72.8777,                             -- ✅ Longitude

    'Sunil Sharma',                     -- ✅ Contact Person Name
    9876543211,                          -- ✅ Contact Person Mobile (10-digit, starts with 6-9)
    9123456790,                          -- ✅ Alternate Number (same rule)

    'YES',                               -- ✅ Parking Place Availability: Must be 'YES' or 'NO'

    'CUST456',                           -- ✅ Customer ID (place_source)
    'XYZ Freight Customer',              -- ✅ Source Place Name (place_source_name)

    'AdminUser',                         -- ✅ Created By (Backend user)

    'New Registration',                  -- ✅ Status (can skip, default is this)
    'Site inspection pending',           -- ✅ Status Remarks
    '27AAACX1234A1Z2'                    -- ✅ GST No (optional but must match GST format if given)
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

CREATE TRIGGER update_employees_timestamp
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_messages_timestamp
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

    

-----------------------------------------------------vehicle Database -----------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE vehicle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Auto-generated Vehicle ID like KBV1, KBV2...
    vehicle_id TEXT UNIQUE NOT NULL,

    vehicle_registration_no VARCHAR(20) UNIQUE NOT NULL,
    owner_name VARCHAR(50) NOT NULL,
    owner_address TEXT,
    owner_mobile_number VARCHAR(15) NOT NULL CHECK (owner_mobile_number ~ '^[6-9][0-9]{9}$'),

    vehicle_rc_card_upload BYTEA NOT NULL,
    vehicle_registration_date DATE NOT NULL,

    vehicle_brand_manufacturer VARCHAR(30),
    vehicle_type VARCHAR(20) NOT NULL,
    vehicle_model_name VARCHAR(30) NOT NULL,
    vehicle_sub_model_name VARCHAR(30),

    container_size TEXT NOT NULL,

    payload_capacity NUMERIC(10,2) NOT NULL,
    total_volume NUMERIC,
    total_cbm NUMERIC,

    engine_no VARCHAR(50),
    chasis_no VARCHAR(30) NOT NULL,

    passing_upto DATE NOT NULL,
    insurance_upto DATE NOT NULL,
    insurance_copy BYTEA NOT NULL,

    puc_expiry_date DATE NOT NULL,
    puc_certificate_upload BYTEA NOT NULL,

    state TEXT NOT NULL,
    city TEXT NOT NULL,
    hub TEXT,
    vendor TEXT,

    intrasdd_access TEXT NOT NULL CHECK (intrasdd_access IN ('YES', 'NO')),
    intrandd_access TEXT NOT NULL CHECK (intrandd_access IN ('YES', 'NO')),
    intrafull_access TEXT NOT NULL CHECK (intrafull_access IN ('YES', 'NO')),
    intrarental_access TEXT NOT NULL CHECK (intrarental_access IN ('YES', 'NO')),
    interpart_access TEXT NOT NULL CHECK (interpart_access IN ('YES', 'NO')),
    interfull_access TEXT NOT NULL CHECK (interfull_access IN ('YES', 'NO')),
    interbid_access TEXT NOT NULL CHECK (interbid_access IN ('YES', 'NO')),

    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive', 'Pending', 'Rejected')),
    status_remark TEXT
);



------------------------------------------------------- wallet Manager "database"---------------------------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE wallet_manager (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Unique transaction serial number
    serial_number NUMERIC UNIQUE NOT NULL,

    -- Transaction date in DDMMYY format
    transaction_date DATE NOT NULL,

    -- Transaction time
    transaction_time TIME NOT NULL,

    -- Transaction ID from portal or system
    transaction_id TEXT UNIQUE NOT NULL,

    -- Portal-related info (optional)
    portal_transaction_id TEXT,
    portal_transaction_remarks_1 TEXT,
    portal_transaction_remarks_2 TEXT,

    -- Transaction flow direction: Credit or Debit
    credit_debit TEXT NOT NULL CHECK (credit_debit IN ('credit', 'debit')),

    -- Type of transaction
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN (
            'Admin Allocated Balance',
            'Admin Deducted Balance',
            'Order Charge'
        )
    ),

    -- Amount added or deducted
    amount NUMERIC NOT NULL,

    -- Payment method used (if applicable)
    payment_method TEXT,

    -- Linked customer ID
    customer_id TEXT NOT NULL,

    -- Customer's wallet balance after transaction
    user_wallet_balance NUMERIC NOT NULL,

    -- Additional remarks or reason for the transaction
    remarks TEXT,

    -- Updated central company balance
    central_balance NUMERIC NOT NULL,

    -- Record creation and update timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-----------------insert query for wallet manager -------------------------------------------------------------------------------
INSERT INTO wallet_manager (
    id, serial_number, transaction_date, transaction_time, transaction_id,
    credit_debit, transaction_type, amount, customer_id,
    user_wallet_balance, central_balance, created_at, updated_at
) VALUES (
    '216b4029-de6e-4e6d-a98b-5cea000a67b9', 1, '2025-07-07', '08:26:26', 'cr07072508262601',
    'credit', 'Admin Allocated Balance', 5000, 'KBU1',
    5000, 5000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO wallet_manager (
    id, serial_number, transaction_date, transaction_time, transaction_id,
    credit_debit, transaction_type, amount, customer_id,
    user_wallet_balance, central_balance, created_at, updated_at
) VALUES (
    'e0544875-ecac-45c2-ae61-1ddf4d39f677', 2, '2025-07-07', '08:27:26', 'dr07072508272602',
    'debit', 'Order Charge', 1200, 'KBU1',
    3800, 3800, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO wallet_manager (
    id, serial_number, transaction_date, transaction_time, transaction_id,
    credit_debit, transaction_type, amount, customer_id,
    user_wallet_balance, central_balance, created_at, updated_at
) VALUES (
    '54326afd-20e4-473a-b626-56279bda247a', 3, '2025-07-07', '08:28:26', 'cr07072508282603',
    'credit', 'Admin Allocated Balance', 3000, 'KBU2',
    3000, 6800, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO wallet_manager (
    id, serial_number, transaction_date, transaction_time, transaction_id,
    credit_debit, transaction_type, amount, customer_id,
    user_wallet_balance, central_balance, created_at, updated_at
) VALUES (
    '8d77d0e1-81e8-494a-8538-6a4b064b93e6', 4, '2025-07-07', '08:29:26', 'dr07072508292604',
    'debit', 'Admin Deducted Balance', 1500, 'KBU2',
    1500, 5300, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO wallet_manager (
    id, serial_number, transaction_date, transaction_time, transaction_id,
    credit_debit, transaction_type, amount, customer_id,
    user_wallet_balance, central_balance, created_at, updated_at
) VALUES (
    '5797562e-735f-4bb4-b218-6a86455b2c85', 5, '2025-07-07', '08:30:26', 'cr07072508302605',
    'credit', 'Admin Allocated Balance', 2000, 'KBU1',
    5800, 7300, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

------------------------------------------------------- DC Manager "database"---------------------------------------------------------------------------------------------
-- Create the dc_manager table with additional JSON columns
CREATE TABLE dc_manager (
    -- Unique UUID for each DC manager (auto-generated)
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Branch ID like KBDC1, KBDC2... (backend will generate and must be unique)
    branch_id TEXT NOT NULL UNIQUE,

    -- Name of the distribution center
    branch_name TEXT NOT NULL,

    -- Nearest railway station name
    nearest_station TEXT NOT NULL,

    -- Nearest bus stop name
    nearest_bus_stop TEXT NOT NULL,

    -- State name (e.g., Karnataka, Maharashtra)
    state TEXT NOT NULL,

    -- City name (e.g., Bengaluru, Mumbai)
    city TEXT NOT NULL,

    -- 6-digit pin code constraint: must be between 100000 and 999999
    pin_code INTEGER NOT NULL CHECK (pin_code >= 100000 AND pin_code <= 999999),

    -- Geographic coordinates of the DC
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,

    -- lat_long column auto-generated as "latitude,longitude"
    lat_long TEXT NOT NULL GENERATED ALWAYS AS (latitude::TEXT || ',' || longitude::TEXT) STORED,

    -- Full address passed from frontend (like "12, XYZ St, City - 560001")
    full_address TEXT NOT NULL,

    -- Mobile number of the DC branch (must start with 6-9 and be 10 digits)
    mobile_number TEXT NOT NULL CHECK (mobile_number ~ '^[6-9][0-9]{9}$'),

    -- Status of the branch (Active by default)
    status TEXT NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Inactive', 'Suspended')),

    -- Optional remarks for branch
    remark TEXT,

    -- New optional JSON fields to store various ranges (geo coordinates etc.)
    -- Pickup area range (optional JSON)
    pick_up_range JSON,

    -- Consignee area range (optional JSON)
    consignee_up_range JSON,

    -- Staff login range (optional JSON)
    staff_login_range JSON,

    -- Driver login range (optional JSON)
    driver_login_range JSON,

    -- Record timestamps (auto-filled)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dc_manager (
    branch_id,
    branch_name,
    nearest_station,
    nearest_bus_stop,
    state,
    city,
    pin_code,
    latitude,
    longitude,
    full_address,
    mobile_number,
    status,
    remark,
    pick_up_range,
    consignee_up_range,
    staff_login_range,
    driver_login_range
)
VALUES (
    'KBDC1',                                 -- Branch ID (auto-generated by backend logic)
    'Main Distribution Center',             -- Name of branch
    'Majestic Station',                     -- Nearest station
    'BMTC Central Bus Stop',                -- Nearest bus stop
    'Karnataka',                            -- State
    'Bengaluru',                            -- City
    560001,                                 -- 6-digit PIN code
    12.9716,                                -- Latitude
    77.5946,                                -- Longitude
    '123 MG Road, Opp Mall, Bengaluru - 560001',  -- Full address from frontend
    '9876543210',                           -- Mobile number (must start with 6-9)
    'Active',                               -- Status (Active / Inactive / Suspended)
    'Head office for central operations',   -- Optional remark

    -- New JSON fields
    '{"range": [[12.95, 77.59], [12.96, 77.60]]}',          -- Example pickup range as JSON array of coordinates
    '{"range": [[12.97, 77.61], [12.98, 77.62]]}',          -- Example consignee range
    '{"area": {"lat": 12.97, "lng": 77.59, "radius": 5}}',  -- Example staff login range
    '{"area": {"lat": 12.96, "lng": 77.60, "radius": 10}}'  -- Example driver login range
);

------------------------------------------------------- Price Manager "database"---------------------------------------------------------------------------------------------


-- Enable UUID extension for unique ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Final table structure
CREATE TABLE public.sdd_fixed_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Customer Details
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,

  -- Dimension Info
  dimension_id TEXT NOT NULL UNIQUE,
  dimension_name TEXT NOT NULL,
  length NUMERIC NOT NULL,
  breadth NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,

  -- Pricing Details
  dimension_charge NUMERIC NOT NULL,
  volumetric_factor NUMERIC NOT NULL,
  chalaan_return_charges NUMERIC NOT NULL,
  express_delivery_percentage NUMERIC NOT NULL,
  gst_percentage NUMERIC NOT NULL,

  -- COD Ranges as JSON and Charges as NUMERIC
  cod_range_1 JSON NULL,
  cod_charge_1 NUMERIC NULL,
  cod_range_2 JSON NULL,
  cod_charge_2 NUMERIC NULL,
  cod_range_3 JSON NULL,
  cod_charge_3 NUMERIC NULL,
  cod_range_4 JSON NULL,
  cod_charge_4 NUMERIC NULL,
  cod_range_5 JSON NULL,
  cod_charge_5 NUMERIC NULL,
  cod_range_6 JSON NULL,
  cod_charge_6 NUMERIC NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'deactive' CHECK (status IN ('active', 'deactive')),
  status_remarks TEXT,
  created_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.sdd_fixed_pricing (
  customer_id,
  customer_name,
  dimension_id,
  dimension_name,
  length,
  breadth,
  height,
  weight,
  dimension_charge,
  volumetric_factor,
  chalaan_return_charges,
  express_delivery_percentage,
  gst_percentage,
  cod_range_1,
  cod_charge_1,
  cod_range_2,
  cod_charge_2,
  cod_range_3,
  cod_charge_3,
  cod_range_4,
  cod_charge_4,
  cod_range_5,
  cod_charge_5,
  cod_range_6,
  cod_charge_6,
  status,
  status_remarks
) VALUES (
  'CUST012',
  'XpressBees Pvt Ltd',
  'DIM-KBU12',
  'Box 16x10x8',
  16,
  10,
  8,
  2.4,
  170.00,
  5000,
  54.00,
  12.00,
  18.00,
  '{"min": 0, "max": 1000}'::json,         -- cod_range_1
  50.00,                                   -- cod_charge_1
  '{"min": 1001, "max": 5000}'::json,      -- cod_range_2
  75.00,                                   -- cod_charge_2
  '{"min": 5001, "max": 10000}'::json,     -- cod_range_3
  100.00,                                  -- cod_charge_3
  NULL,                                    -- cod_range_4
  NULL,                                    -- cod_charge_4
  NULL,                                    -- cod_range_5
  NULL,                                    -- cod_charge_5
  NULL,                                    -- cod_range_6
  NULL,                                    -- cod_charge_6
  'active',
  'COD ranges stored using object format {min, max}'
);


