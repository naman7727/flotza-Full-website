const ADDRESS_STORAGE_KEY = 'kartbuddy_addresses';

// Get all addresses from localStorage
export const getAddresses = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ADDRESS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save addresses to localStorage
export const saveAddresses = (addresses) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
};

// Add a new address
export const addAddress = (address) => {
  const addresses = getAddresses();
  const newAddress = {
    ...address,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  const updatedAddresses = [...addresses, newAddress];
  saveAddresses(updatedAddresses);
  return newAddress;
};

// Update an existing address
export const updateAddress = (id, updates) => {
  const addresses = getAddresses();
  const index = addresses.findIndex(addr => addr.id === id);
  if (index === -1) return null;
  
  const updatedAddress = {
    ...addresses[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  const updatedAddresses = [...addresses];
  updatedAddresses[index] = updatedAddress;
  saveAddresses(updatedAddresses);
  return updatedAddress;
};

// Delete an address
export const deleteAddress = (id) => {
  const addresses = getAddresses();
  const updatedAddresses = addresses.filter(addr => addr.id !== id);
  saveAddresses(updatedAddresses);
  return updatedAddresses;
};

// Get addresses by type (Pickup/Consignee)
export const getAddressesByType = (type) => {
  const addresses = getAddresses();
  if (!type || type === 'all') return addresses;
  return addresses.filter(addr => addr.type === type);
};

// Search addresses by any field
export const searchAddresses = (term) => {
  if (!term) return getAddresses();
  const searchTerm = term.toLowerCase();
  return getAddresses().filter(addr => 
    Object.values(addr).some(
      val => val && val.toString().toLowerCase().includes(searchTerm)
    )
  );
};
