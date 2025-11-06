import React, { useState, useEffect } from 'react';
import './MyVehicles.css';

const MyVehicles = () => {
  // Sample vehicle data
  const initialVehiclesData = [
    {
      id: 1,
      vehicleId: 'KBVH32',
      registrationNo: 'MH02ED2215',
      ownerName: 'Pratik Sharma',
      vehicleType: 'Tempo',
      modelName: 'Mahindra Jeeto',
      totalCBM: 450,
      hub: 'Sakinaka Hub',
      ownerAddress: 'shop No.1, Vishal Appt, Vijay Nagar, Andheri east, Mumbai 400072',
      ownerMobile: '9898787858',
      rcCardUpload: 'here the photo thumbnail will be shown, uploaded while registering, wh',
      registrationDate: 'here the date would be shown',
      vehicleBrand: 'tata',
      vehicleSubModel: 'Ace',
      containerSize: '8 ft.',
      payloadCapacity: '750 Kg',
      totalVolume: 'number would be shown',
      engineNo: 'text',
      chassisNo: 'text',
      passingUpTo: 'here the date would be shown',
      insuranceUpTo: 'here the date would be shown',
      uploadInsuranceCopy: 'here the photo thumbnail will be shown, uploaded while registering, wh',
      pucExpiryDate: 'here the date would be shown',
      pucCertificate: 'here the photo thumbnail will be shown, uploaded while registering, wh',
      state: 'text',
      city: 'text',
      vendor: 'text',
      intradddAccess: 'yes',
      intranddAccess: 'No',
      intrafullAccess: 'No',
      intrarental: 'No',
      interpartAccess: 'No',
      interfullAccess: 'No',
      interbid: 'No',
      status: 'Approved',
      statusRemark: 'All ok'
    },
    {
      id: 2,
      vehicleId: 'KBVH31',
      registrationNo: 'MH02FG1548',
      ownerName: 'Vinayak Dalvi',
      vehicleType: 'Tempo',
      modelName: 'tata Ace',
      totalCBM: 450,
      hub: 'South Mumbai H..',
      ownerAddress: 'Address details',
      ownerMobile: '9876543210',
      rcCardUpload: 'RC Upload',
      registrationDate: '2023-01-15',
      vehicleBrand: 'tata',
      vehicleSubModel: 'Ace',
      containerSize: '8 ft.',
      payloadCapacity: '750 Kg',
      totalVolume: '450',
      engineNo: 'ENG123456',
      chassisNo: 'CHS123456',
      passingUpTo: '2024-01-15',
      insuranceUpTo: '2024-01-15',
      uploadInsuranceCopy: 'Insurance Copy',
      pucExpiryDate: '2024-01-15',
      pucCertificate: 'PUC Certificate',
      state: 'Maharashtra',
      city: 'Mumbai',
      vendor: 'Vendor1',
      intradddAccess: 'yes',
      intranddAccess: 'No',
      intrafullAccess: 'No',
      intrarental: 'No',
      interpartAccess: 'No',
      interfullAccess: 'No',
      interbid: 'No',
      status: 'Approved',
      statusRemark: 'All ok'
    },
    {
      id: 3,
      vehicleId: 'KBVH30',
      registrationNo: 'MH05HS6697',
      ownerName: 'Pradeesh Prajapati',
      vehicleType: 'Tempo',
      modelName: 'tata Ace',
      totalCBM: 450,
      hub: 'Bhiwandi hub',
      ownerAddress: 'Address details',
      ownerMobile: '9876543211',
      rcCardUpload: 'RC Upload',
      registrationDate: '2023-02-20',
      vehicleBrand: 'tata',
      vehicleSubModel: 'Ace',
      containerSize: '8 ft.',
      payloadCapacity: '750 Kg',
      totalVolume: '450',
      engineNo: 'ENG123457',
      chassisNo: 'CHS123457',
      passingUpTo: '2024-02-20',
      insuranceUpTo: '2024-02-20',
      uploadInsuranceCopy: 'Insurance Copy',
      pucExpiryDate: '2024-02-20',
      pucCertificate: 'PUC Certificate',
      state: 'Maharashtra',
      city: 'Mumbai',
      vendor: 'Vendor2',
      intradddAccess: 'yes',
      intranddAccess: 'No',
      intrafullAccess: 'No',
      intrarental: 'No',
      interpartAccess: 'No',
      interfullAccess: 'No',
      interbid: 'No',
      status: 'Approved',
      statusRemark: 'All ok'
    },
    {
      id: 4,
      vehicleId: 'KBVH20',
      registrationNo: 'MH02ED2216',
      ownerName: 'Vishal Rajpoot',
      vehicleType: 'Tempo',
      modelName: 'tata Ace',
      totalCBM: 450,
      hub: 'Sakinaka Hub',
      ownerAddress: 'Address details',
      ownerMobile: '9876543212',
      rcCardUpload: 'RC Upload',
      registrationDate: '2023-03-10',
      vehicleBrand: 'tata',
      vehicleSubModel: 'Ace',
      containerSize: '8 ft.',
      payloadCapacity: '750 Kg',
      totalVolume: '450',
      engineNo: 'ENG123458',
      chassisNo: 'CHS123458',
      passingUpTo: '2024-03-10',
      insuranceUpTo: '2024-03-10',
      uploadInsuranceCopy: 'Insurance Copy',
      pucExpiryDate: '2024-03-10',
      pucCertificate: 'PUC Certificate',
      state: 'Maharashtra',
      city: 'Mumbai',
      vendor: 'Vendor3',
      intradddAccess: 'yes',
      intranddAccess: 'No',
      intrafullAccess: 'No',
      intrarental: 'No',
      interpartAccess: 'No',
      interfullAccess: 'No',
      interbid: 'No',
      status: 'Approved',
      statusRemark: 'All ok'
    },
    {
      id: 5,
      vehicleId: 'KBVH5',
      registrationNo: 'MH02FG1549',
      ownerName: 'Awmit Chauhan',
      vehicleType: 'Tempo',
      modelName: 'tata Ace',
      totalCBM: 450,
      hub: 'Sakinaka Hub',
      ownerAddress: 'Address details',
      ownerMobile: '9876543213',
      rcCardUpload: 'RC Upload',
      registrationDate: '2023-04-05',
      vehicleBrand: 'tata',
      vehicleSubModel: 'Ace',
      containerSize: '8 ft.',
      payloadCapacity: '750 Kg',
      totalVolume: '450',
      engineNo: 'ENG123459',
      chassisNo: 'CHS123459',
      passingUpTo: '2024-04-05',
      insuranceUpTo: '2024-04-05',
      uploadInsuranceCopy: 'Insurance Copy',
      pucExpiryDate: '2024-04-05',
      pucCertificate: 'PUC Certificate',
      state: 'Maharashtra',
      city: 'Mumbai',
      vendor: 'Vendor4',
      intradddAccess: 'yes',
      intranddAccess: 'No',
      intrafullAccess: 'No',
      intrarental: 'No',
      interpartAccess: 'No',
      interfullAccess: 'No',
      interbid: 'No',
      status: 'Approved',
      statusRemark: 'All ok'
    },
    {
      id: 6,
      vehicleId: 'KBVH2',
      registrationNo: 'MH05HS6698',
      ownerName: 'Arif Khan',
      vehicleType: 'Bike',
      modelName: 'bajra',
      totalCBM: 50,
      hub: 'Sakinaka Hub',
      ownerAddress: 'Address details',
      ownerMobile: '9876543214',
      rcCardUpload: 'RC Upload',
      registrationDate: '2023-05-01',
      vehicleBrand: 'bajra',
      vehicleSubModel: 'Bike Model',
      containerSize: 'N/A',
      payloadCapacity: '50 Kg',
      totalVolume: '50',
      engineNo: 'ENG123460',
      chassisNo: 'CHS123460',
      passingUpTo: '2024-05-01',
      insuranceUpTo: '2024-05-01',
      uploadInsuranceCopy: 'Insurance Copy',
      pucExpiryDate: '2024-05-01',
      pucCertificate: 'PUC Certificate',
      state: 'Maharashtra',
      city: 'Mumbai',
      vendor: 'Vendor5',
      intradddAccess: 'yes',
      intranddAccess: 'No',
      intrafullAccess: 'No',
      intrarental: 'No',
      interpartAccess: 'No',
      interfullAccess: 'No',
      interbid: 'No',
      status: 'Approved',
      statusRemark: 'All ok'
    },
    {
      id: 7,
      vehicleId: 'KBVH1',
      registrationNo: 'MH02ED2217',
      ownerName: 'Umesh Parab',
      vehicleType: 'Bike',
      modelName: 'bajra',
      totalCBM: 50,
      hub: 'Sakinaka Hub',
      ownerAddress: 'Address details',
      ownerMobile: '9876543215',
      rcCardUpload: 'RC Upload',
      registrationDate: '2023-06-15',
      vehicleBrand: 'bajra',
      vehicleSubModel: 'Bike Model',
      containerSize: 'N/A',
      payloadCapacity: '50 Kg',
      totalVolume: '50',
      engineNo: 'ENG123461',
      chassisNo: 'CHS123461',
      passingUpTo: '2024-06-15',
      insuranceUpTo: '2024-06-15',
      uploadInsuranceCopy: 'Insurance Copy',
      pucExpiryDate: '2024-06-15',
      pucCertificate: 'PUC Certificate',
      state: 'Maharashtra',
      city: 'Mumbai',
      vendor: 'Vendor6',
      intradddAccess: 'yes',
      intranddAccess: 'No',
      intrafullAccess: 'No',
      intrarental: 'No',
      interpartAccess: 'No',
      interfullAccess: 'No',
      interbid: 'No',
      status: 'Approved',
      statusRemark: 'All ok'
    }
  ];

  // Load data from localStorage or use initial data
  const loadVehiclesData = () => {
    const savedData = localStorage.getItem('vehiclesData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return initialVehiclesData;
  };

  const [vehicles, setVehicles] = useState(loadVehiclesData());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Save to localStorage whenever vehicles data changes
  useEffect(() => {
    localStorage.setItem('vehiclesData', JSON.stringify(vehicles));
  }, [vehicles]);

  // Search functionality
  useEffect(() => {
    const filtered = vehicles.filter(vehicle => {
      const searchLower = searchTerm.toLowerCase();
      return (
        vehicle.vehicleId.toLowerCase().includes(searchLower) ||
        vehicle.registrationNo.toLowerCase().includes(searchLower) ||
        vehicle.ownerName.toLowerCase().includes(searchLower) ||
        vehicle.modelName.toLowerCase().includes(searchLower)
      );
    });
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // View vehicle details
  const handleView = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  // Download list functionality
  const downloadList = () => {
    const csvContent = [
      ['Sr. No', 'Vehicle Id', 'Vehicle registration No', 'Owner\'s Name', 'Vehicle type', 'Vehicle Model Name', 'Total CBM', 'Hub'],
      ...filteredVehicles.map((vehicle, index) => [
        index + 1,
        vehicle.vehicleId,
        vehicle.registrationNo,
        vehicle.ownerName,
        vehicle.vehicleType,
        vehicle.modelName,
        vehicle.totalCBM,
        vehicle.hub
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicles_list.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="my-vehicles-container">
      <div className="vehicles-layout">
        {/* Left Side - Vehicle List */}
        <div className="vehicles-list-section">
          <h2>My Vehicles</h2>
          
          {/* Search and Download Section */}
          <div className="search-download-section">
            <input
              type="text"
              className="search-input"
              placeholder="search vehicle by Reg No, vehicle id, owner name or model name."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="download-btn" onClick={downloadList}>
              download list
            </button>
          </div>

          {/* Vehicles Table */}
          <div className="table-container">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Vehicle Id</th>
                  <th>Vehicle registration No</th>
                  <th>Owner's Name</th>
                  <th>Vehicle type</th>
                  <th>Vehicle Model Name</th>
                  <th>Total CBM</th>
                  <th>Hub</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, index) => (
                  <tr key={vehicle.id} className={selectedVehicle?.id === vehicle.id ? 'selected' : ''}>
                    <td>{index + 1}</td>
                    <td>{vehicle.vehicleId}</td>
                    <td>{vehicle.registrationNo}</td>
                    <td>{vehicle.ownerName}</td>
                    <td>{vehicle.vehicleType}</td>
                    <td>{vehicle.modelName}</td>
                    <td>{vehicle.totalCBM}</td>
                    <td>{vehicle.hub}</td>
                    <td>
                      <button 
                        className="view-btn" 
                        onClick={() => handleView(vehicle)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side - Vehicle Details */}
        <div className="vehicle-details-section">
          {selectedVehicle ? (
            <>
              <div className="details-header">
                <h3>Database reference Name</h3>
                <h4>Field Name in UI page of View page</h4>
                <h4>Data example</h4>
              </div>
              
              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">Vehicle id</span>
                  <span className="detail-label">Vehicle id</span>
                  <span className="detail-value">{selectedVehicle.vehicleId}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Vehicle registration No.</span>
                  <span className="detail-label">Vehicle registration No.</span>
                  <span className="detail-value">{selectedVehicle.registrationNo}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Owner's Name</span>
                  <span className="detail-label">Owner's Name</span>
                  <span className="detail-value">{selectedVehicle.ownerName}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Owner's Address</span>
                  <span className="detail-label">Owner's Address</span>
                  <span className="detail-value">{selectedVehicle.ownerAddress}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Owner's Mobile Number</span>
                  <span className="detail-label">Owner's Mobile Number</span>
                  <span className="detail-value">{selectedVehicle.ownerMobile}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Vehicle RC card upload</span>
                  <span className="detail-label">Vehicle RC card</span>
                  <span className="detail-value">{selectedVehicle.rcCardUpload}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">vehicle Registration date</span>
                  <span className="detail-label">vehicle Registration date</span>
                  <span className="detail-value">{selectedVehicle.registrationDate}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Vehicle Brand/Manufacturer</span>
                  <span className="detail-label">Vehicle Brand/Manufacturer</span>
                  <span className="detail-value">{selectedVehicle.vehicleBrand}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Vehicle type</span>
                  <span className="detail-label">Vehicle type</span>
                  <span className="detail-value">{selectedVehicle.vehicleType}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Vehicle Model Name</span>
                  <span className="detail-label">Vehicle Model Name</span>
                  <span className="detail-value">{selectedVehicle.modelName}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Vehicle sub model name</span>
                  <span className="detail-label">Vehicle sub model name</span>
                  <span className="detail-value">{selectedVehicle.vehicleSubModel}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Container Size</span>
                  <span className="detail-label">Container Size</span>
                  <span className="detail-value">{selectedVehicle.containerSize}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Payload Capacity</span>
                  <span className="detail-label">Payload Capacity</span>
                  <span className="detail-value">{selectedVehicle.payloadCapacity}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Total Volume</span>
                  <span className="detail-label">Total Volume</span>
                  <span className="detail-value">{selectedVehicle.totalVolume}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Total CBM</span>
                  <span className="detail-label">Total CBM</span>
                  <span className="detail-value">{selectedVehicle.totalCBM}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Engine No.</span>
                  <span className="detail-label">Engine No.</span>
                  <span className="detail-value">{selectedVehicle.engineNo}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Chasis No.</span>
                  <span className="detail-label">Chasis No.</span>
                  <span className="detail-value">{selectedVehicle.chassisNo}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Passing up to</span>
                  <span className="detail-label">Passing up to</span>
                  <span className="detail-value">{selectedVehicle.passingUpTo}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Insurance Upto</span>
                  <span className="detail-label">Insurance Upto</span>
                  <span className="detail-value">{selectedVehicle.insuranceUpTo}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Upload insurance copy</span>
                  <span className="detail-label">Upload insurance copy</span>
                  <span className="detail-value">{selectedVehicle.uploadInsuranceCopy}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">PUC Expiry Date</span>
                  <span className="detail-label">PUC Expiry Date</span>
                  <span className="detail-value">{selectedVehicle.pucExpiryDate}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">PUC certificate upload.</span>
                  <span className="detail-label">PUC certificate</span>
                  <span className="detail-value">{selectedVehicle.pucCertificate}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">State</span>
                  <span className="detail-label">State</span>
                  <span className="detail-value">{selectedVehicle.state}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">City</span>
                  <span className="detail-label">City</span>
                  <span className="detail-value">{selectedVehicle.city}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Hub</span>
                  <span className="detail-label">Hub</span>
                  <span className="detail-value">{selectedVehicle.hub}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">vendor</span>
                  <span className="detail-label">vendor</span>
                  <span className="detail-value">{selectedVehicle.vendor}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">intraddd access</span>
                  <span className="detail-label">intraddd access</span>
                  <span className="detail-value">{selectedVehicle.intradddAccess}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">intrandd access</span>
                  <span className="detail-label">intrandd access</span>
                  <span className="detail-value">{selectedVehicle.intranddAccess}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">intrafull access</span>
                  <span className="detail-label">intrafull access</span>
                  <span className="detail-value">{selectedVehicle.intrafullAccess}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">intrarental access</span>
                  <span className="detail-label">intrarental access</span>
                  <span className="detail-value">{selectedVehicle.intrarental}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">interpart access</span>
                  <span className="detail-label">interpart access</span>
                  <span className="detail-value">{selectedVehicle.interpartAccess}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">interfull access</span>
                  <span className="detail-label">interfull access</span>
                  <span className="detail-value">{selectedVehicle.interfullAccess}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">interbid access</span>
                  <span className="detail-label">interbid access</span>
                  <span className="detail-value">{selectedVehicle.interbid}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{selectedVehicle.status}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Status Remark</span>
                  <span className="detail-label">Status Remark</span>
                  <span className="detail-value">{selectedVehicle.statusRemark}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a vehicle to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyVehicles;