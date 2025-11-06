import React, { useState } from 'react';
import Modal from './IntracityPartloadSDDModal/Modal';
import AssignTripModal from './IntracityPartloadSDDModal/AssignTripModal';
import ModifyTripModal from './IntracityPartloadSDDModal/ModifyTripModal';
import TripDetailsModal from './IntracityPartloadSDDModal/TripDetailsModal';

const IntracityPartloadSDD = ({ setRenderPage }) => {
  // Initial dummy data for trips
  const [trips, setTrips] = useState([
    {
      id: 'KBT1',
      name: 'Andheri to Dahisar',
      totalOrders: 8,
      date: '2025-03-15',
      driver: 'John Doe',
      hub: 'Andheri',
      lastUpdate: '2025-03-16 14:30',
      status: 'Pending',
      lastStatus: 'Pending',
    },
    {
      id: 'KBT2',
      name: 'Andheri to South Mumbai',
      totalOrders: 12,
      date: '2025-03-14',
      driver: 'Jane Smith',
      hub: 'Andheri',
      lastUpdate: '2025-03-15 10:45',
      status: 'Pending',
      lastStatus: 'Pending',
    },
    {
      id: 'KBT3',
      name: 'Andheri to Mulund',
      totalOrders: 12,
      date: '2025-03-14',
      driver: 'Jane Smith',
      hub: 'Andheri',
      lastUpdate: '2025-03-15 10:45',
      status: 'Pending',
      lastStatus: 'Pending',
    },
  ]);

  // Dummy data for trip details
  const [tripDetailsData, setTripDetailsData] = useState([
    {
      srNo: 1,
      orderId: 'KB25',
      pickUpSequence: 1,
      pickUpAddress: '123 Street, City',
      pickUpContact: '9876543210',
      pop: 'Yes',
      deliverySequence: 1,
      deliveryAddress: '456 Avenue, City',
      deliveryContact: '9876543211',
      pod: 'No',
    },
    ...Array.from({ length: 7 }, (_, i) => ({
      srNo: i + 2,
      orderId: 'KB25',
      pickUpSequence: i + 2,
      pickUpAddress: '123 Street, City',
      pickUpContact: '9876543210',
      pop: 'Yes',
      deliverySequence: i + 2,
      deliveryAddress: '456 Avenue, City',
      deliveryContact: '9876543211',
      pod: 'No',
    })),
  ]);

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    tripId: '',
    tripName: '',
    status: '',
    startDate: '',
    endDate: '',
    hub: '',
    city: '',
  });

  const [tripCounter, setTripCounter] = useState(3);
  const [filteredTrips, setFilteredTrips] = useState(trips);

  const handleFilterChange = (e) => {
    setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
  };

  const filterTrips = () => {
    const filtered = trips.filter((trip) => {
      const {
        tripId,
        tripName,
        status,
        startDate,
        endDate,
        hub,
        city,
      } = searchFilters;

      // Trip ID filter
      if (tripId && !trip.id.toLowerCase().includes(tripId.toLowerCase())) {
        return false;
      }

      // Trip Name filter
      if (tripName && !trip.name.toLowerCase().includes(tripName.toLowerCase())) {
        return false;
      }

      // Status filter
      if (status && trip.status !== status) {
        return false;
      }

      // Date range filter
      if (startDate && trip.date < startDate) {
        return false;
      }
      if (endDate && trip.date > endDate) {
        return false;
      }

      // Hub filter
      if (hub && trip.hub !== hub) {
        return false;
      }

      // City filter (assuming city is part of the name or hub for this example)
      if (
        city &&
        !trip.name.toLowerCase().includes(city.toLowerCase()) &&
        !trip.hub.toLowerCase().includes(city.toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    setFilteredTrips(filtered);
  };

  // Update filtered trips when original trips change
  React.useEffect(() => {
    setFilteredTrips(trips);
  }, [trips]);

  const createTrip = () => {
    setTripCounter(tripCounter + 1);
    const newTrip = {
      id: `KBT${tripCounter + 1}`,
      name: '—',
      totalOrders: 0,
      date: '—',
      driver: '—',
      hub: '—',
      lastUpdate: '—',
      status: 'Pending',
      lastStatus: 'Pending',
    };
    setTrips([...trips, newTrip]);
  };

  const modifyTrip = () => {
    if (!selectedTrip) {
      alert('Please select a trip to modify.');
      return;
    }
    setModalType('modify');
    setShowModal(true);
  };

  const terminateTrip = () => {
    if (!selectedTrip) {
      alert('Please select a trip to terminate.');
      return;
    }
    const trip = trips.find((t) => t.id === selectedTrip);
    if (trip.status === 'Completed') {
      alert('Completed trips cannot be terminated.');
      return;
    }
    if (window.confirm('Are you sure you want to terminate this trip?')) {
      setTrips(
        trips.map((t) =>
          t.id === selectedTrip
            ? { ...t, status: 'Terminated', lastStatus: t.status }
            : t
        )
      );
    }
  };

  const deleteTrip = () => {
    if (!selectedTrip) {
      alert('Please select a trip to delete.');
      return;
    }
    const trip = trips.find((t) => t.id === selectedTrip);
    if (trip.totalOrders !== 0) {
      alert('Only trips with 0 orders can be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setTrips(trips.filter((t) => t.id !== selectedTrip));
      setSelectedTrip(null);
    }
  };

  const retrieveTrip = () => {
    if (!selectedTrip) {
      alert('Please select a trip to retrieve.');
      return;
    }
    const trip = trips.find((t) => t.id === selectedTrip);
    if (trip.status !== 'Terminated') {
      alert('Only terminated trips can be retrieved.');
      return;
    }
    if (window.confirm(`Retrieve trip and change status to "${trip.lastStatus}"?`)) {
      setTrips(
        trips.map((t) =>
          t.id === selectedTrip ? { ...t, status: t.lastStatus } : t
        )
      );
    }
  };

  const assignTrip = () => {
    if (!selectedTrip) {
      alert('Please select a trip to assign.');
      return;
    }
    const trip = trips.find((t) => t.id === selectedTrip);
    if (trip.status !== 'Pending') {
      alert('Only pending trips can be assigned.');
      return;
    }
    if (trip.totalOrders <= 0) {
      alert('Trips with zero orders cannot be assigned.');
      return;
    }
    setModalType('assign');
    setShowModal(true);
  };

  const showTrip = (tripId) => {
    setSelectedTrip(tripId);
    setModalType('details');
    setShowModal(true);
  };

  const handleSaveModify = (tripName, driver) => {
    if (!tripName) {
      alert('Trip name cannot be empty.');
      return;
    }
    setTrips(
      trips.map((t) =>
        t.id === selectedTrip
          ? { ...t, name: tripName, driver: driver || '—' }
          : t
      )
    );
    setShowModal(false);
  };

  const handleSaveAssign = (driver) => {
    if (!driver) {
      alert('Please select a driver.');
      return;
    }
    setTrips(
      trips.map((t) =>
        t.id === selectedTrip ? { ...t, driver } : t
      )
    );
    setShowModal(false);
  };

  const handleTripDetailsAction = (action) => {
    console.log(`Performing action: ${action}`);
    setShowModal(false);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase().replace(' ', '-')) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'in-transit':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'terminated':
        return 'bg-red-500 text-white';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h2 className="text-2xl font-bold mb-4">Trip Management Dashboard</h2>

      {/* Search Section */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium">Trip ID</label>
          <input
            type="text"
            name="tripId"
            placeholder="KBT1, KBT2..."
            className="w-full p-2 border rounded"
            value={searchFilters.tripId}
            onChange={handleFilterChange}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium">Trip Name</label>
          <input
            type="text"
            name="tripName"
            placeholder="Enter trip name"
            className="w-full p-2 border rounded"
            value={searchFilters.tripName}
            onChange={handleFilterChange}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            className="w-full p-2 border rounded"
            value={searchFilters.status}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            name="startDate"
            className="w-full p-2 border rounded"
            value={searchFilters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            name="endDate"
            className="w-full p-2 border rounded"
            value={searchFilters.endDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium">Select Hub</label>
          <select
            name="hub"
            className="w-full p-2 border rounded"
            value={searchFilters.hub}
            onChange={handleFilterChange}
          >
            <option value="">All Hubs</option>
            <option value="Andheri">Andheri</option>
            <option value="Mulund">Mulund</option>
            <option value="South Mumbai">South Mumbai</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium">City</label>
          <select
            name="city"
            className="w-full p-2 border rounded"
            value={searchFilters.city}
            onChange={handleFilterChange}
          >
            <option value="">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>
        <button
          onClick={filterTrips}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-6"
        >
          Search Trips
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={assignTrip}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Assign Trip
        </button>
        <button
          onClick={createTrip}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create Trip
        </button>
        <button
          onClick={modifyTrip}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Modify Trip
        </button>
        <button
          onClick={terminateTrip}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Terminate Trip
        </button>
        <button
          onClick={deleteTrip}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Delete Trip
        </button>
        <button
          onClick={retrieveTrip}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Retrieve Trip
        </button>
      </div>

      {/* Trip Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="border p-2 text-center">Select</th>
              <th className="border p-2 text-center">ID</th>
              <th className="border p-2 text-center">Trip Name</th>
              <th className="border p-2 text-center">Total Orders</th>
              <th className="border p-2 text-center">Trip Date</th>
              <th className="border p-2 text-center">Driver</th>
              <th className="border p-2 text-center">Hub</th>
              <th className="border p-2 text-center">Last Update</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((trip) => (
              <tr key={trip.id}>
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTrip === trip.id}
                    onChange={() =>
                      setSelectedTrip(selectedTrip === trip.id ? null : trip.id)
                    }
                  />
                </td>
                <td className="border p-2 text-center">{trip.id}</td>
                <td className="border p-2 text-center">{trip.name}</td>
                <td className="border p-2 text-center">{trip.totalOrders}</td>
                <td className="border p-2 text-center">{trip.date}</td>
                <td className="border p-2 text-center">{trip.driver}</td>
                <td className="border p-2 text-center">{trip.hub}</td>
                <td className="border p-2 text-center">{trip.lastUpdate}</td>
                <td
                  className={`border p-2 text-center rounded ${getStatusClass(
                    trip.status
                  )}`}
                >
                  {trip.status}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => showTrip(trip.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Show Trip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Assign/Modify/Details */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {modalType === 'assign' && (
            <AssignTripModal
              tripId={selectedTrip}
              onSave={handleSaveAssign}
              onClose={() => setShowModal(false)}
            />
          )}
          {modalType === 'modify' && (
            <ModifyTripModal
              trip={trips.find((t) => t.id === selectedTrip)}
              onSave={handleSaveModify}
              onClose={() => setShowModal(false)}
            />
          )}
          {modalType === 'details' && (
            <TripDetailsModal
              trip={trips.find((t) => t.id === selectedTrip)}
              tripDetailsData={tripDetailsData}
              setTripDetailsData={setTripDetailsData}
              onAction={handleTripDetailsAction}
              onClose={() => setShowModal(false)}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default IntracityPartloadSDD;