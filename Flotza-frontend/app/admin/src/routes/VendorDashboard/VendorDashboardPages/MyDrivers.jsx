// Ye sirf reference ke liye hai
import React, { useState, useEffect } from 'react';
import './MyDrivers.css';

const MyDrivers = () => {
  // Sample data - replace with your actual data source
  const initialDriversData = [
    {
      id: 1,
      driverId: 'KBD1',
      name: 'Arvind Vishwakarma',
      type: 'SDD',
      contact: '9867524566',
      email: 'arvind@gmail.com'
    },
    {
      id: 2,
      driverId: 'KBD2',
      name: 'rajesh rajan',
      type: 'SDD',
      contact: '9875498525',
      email: 'rajesh@gmail.com'
    },
    {
      id: 3,
      driverId: 'KBD3',
      name: 'Jitendra yadav',
      type: 'SDD',
      contact: '9883472484',
      email: 'jitu@gmail.com'
    },
    {
      id: 4,
      driverId: 'KBD4',
      name: 'Vikram Singh',
      type: 'SDD',
      contact: '9891446443',
      email: 'vik@gmail.com'
    },
    {
      id: 5,
      driverId: 'KBD5',
      name: 'Satish patil',
      type: 'SDD',
      contact: '9899420402',
      email: 'satish@gmail.com'
    },
    {
      id: 6,
      driverId: 'KBD6',
      name: 'Avinash Raut',
      type: 'SDD',
      contact: '9907394361',
      email: 'avi@gmail.com'
    }
  ];

  // Load data from localStorage or use initial data
  const loadDriversData = () => {
    const savedData = localStorage.getItem('driversData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return initialDriversData;
  };

  const [drivers, setDrivers] = useState(loadDriversData());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDrivers, setFilteredDrivers] = useState(drivers);
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    type: 'SDD',
    contact: '',
    email: ''
  });

  // Save to localStorage whenever drivers data changes
  useEffect(() => {
    localStorage.setItem('driversData', JSON.stringify(drivers));
  }, [drivers]);

  // Search functionality
  useEffect(() => {
    const filtered = drivers.filter(driver => {
      const searchLower = searchTerm.toLowerCase();
      return (
        driver.driverId.toLowerCase().includes(searchLower) ||
        driver.name.toLowerCase().includes(searchLower) ||
        driver.contact.includes(searchTerm) ||
        driver.email.toLowerCase().includes(searchLower)
      );
    });
    setFilteredDrivers(filtered);
  }, [searchTerm, drivers]);

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // View driver details
  const handleView = (driver) => {
    // Implement your view logic here
    console.log('View driver:', driver);
    alert(`Viewing details for ${driver.name}`);
  };

  // Handle new driver form input changes
  const handleNewDriverChange = (e) => {
    const { name, value } = e.target;
    setNewDriverData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit new driver
  const handleSubmitNewDriver = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newDriverData.name || !newDriverData.contact || !newDriverData.email) {
      alert('Please fill all required fields');
      return;
    }

    // Generate new driver ID
    const newId = drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1;
    const newDriver = {
      id: newId,
      driverId: `KBD${newId}`,
      ...newDriverData
    };

    // Add new driver to the list
    setDrivers([...drivers, newDriver]);

    // Reset form and close modal
    setNewDriverData({
      name: '',
      type: 'SDD',
      contact: '',
      email: ''
    });
    setShowAddDriverForm(false);

    alert('New driver added successfully!');
  };

  // Download list functionality
  const downloadList = () => {
    const csvContent = [
      ['Sr. No', 'Driver ID', 'Driver Full Name', 'Driver type', 'Primary Contact', 'Email ID'],
      ...filteredDrivers.map((driver, index) => [
        index + 1,
        driver.driverId,
        driver.name,
        driver.type,
        driver.contact,
        driver.email
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drivers_list.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="my-drivers-container">
      <div className="header-section">
        <h2>My Drivers</h2>
        <button 
          className="request-driver-btn" 
          onClick={() => setShowAddDriverForm(true)}
        >
          Request New Driver
        </button>
      </div>
      
      {/* Search and Download Section */}
      <div className="search-download-section">
        <input
          type="text"
          className="search-input"
          placeholder="search driver by driver id name, mobile, email id,"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="download-btn" onClick={downloadList}>
          Download List
        </button>
      </div>

      {/* Drivers Table */}
      <div className="table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Driver ID</th>
              <th>Driver Full Name</th>
              <th>Driver Type</th>
              <th>Primary Contact</th>
              <th>Email ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver, index) => (
              <tr key={driver.id}>
                <td>{index + 1}</td>
                <td>{driver.driverId}</td>
                <td>{driver.name}</td>
                <td>{driver.type}</td>
                <td>{driver.contact}</td>
                <td>
                  <a href={`mailto:${driver.email}`}>{driver.email}</a>
                </td>
                <td>
                  <button 
                    className="view-btn" 
                    onClick={() => handleView(driver)}
                  >
                    "View"
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Driver Modal */}
      {showAddDriverForm && (
        <div className="modal-overlay" onClick={() => setShowAddDriverForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request New Driver</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowAddDriverForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitNewDriver} className="new-driver-form">
              <div className="form-group">
                <label htmlFor="name">Driver Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newDriverData.name}
                  onChange={handleNewDriverChange}
                  required
                  placeholder="Enter driver name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Driver Type *</label>
                <select
                  id="type"
                  name="type"
                  value={newDriverData.type}
                  onChange={handleNewDriverChange}
                  required
                >
                  <option value="SDD">SDD</option>
                  <option value="Rental">Rental</option>
                  <option value="FTL">FTL</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact">Primary Contact *</label>
                <input
                  type="tel"
                  id="contact"
                  name="contact"
                  value={newDriverData.contact}
                  onChange={handleNewDriverChange}
                  required
                  placeholder="Enter contact number"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email ID *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newDriverData.email}
                  onChange={handleNewDriverChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowAddDriverForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDrivers;