import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const IntracityRental = () => {
  const navigate = useNavigate()
  const [selectedAction, setSelectedAction] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)

  const handleAction = (action, tripId, paymentType) => {
    setSelectedTrip({ id: tripId, paymentType })
    
    switch (action) {
      case 'assign':
        setShowModal(true)
        break
      case 'edit':
        navigate(`/admin/deployment/edit/${tripId}`)
        break
      case 'terminate':
        handleTerminate(tripId, paymentType)
        break
      case 'settle':
        navigate(`/admin/deployment/settle/${tripId}`)
        break
      case 'view':
        navigate(`/admin/deployment/view/${tripId}`)
        break
      default:
        break
    }
    setSelectedAction('')
  }

  const handleTerminate = (tripId, paymentType) => {
    let message = `Are you sure you want to terminate Trip ID ${tripId}?`
    if (paymentType === 'Prepaid') {
      message += "\nAs this is a prepaid trip, you can deduct charges before refunding the amount."
    }
    
    if (window.confirm(message)) {
      if (paymentType === 'Prepaid') {
        let charges = window.prompt("Enter charges to deduct before refunding (leave blank for full refund):", "0")
        if (charges !== null) {
          // TODO: Add API call to terminate trip with charges
          alert(`Trip ID ${tripId} terminated. Refund processed with ₹${charges} deducted.`)
        }
      } else {
        // TODO: Add API call to terminate trip
        alert(`Trip ID ${tripId} terminated successfully.`)
      }
    }
  }

  const deploymentData = [
    {
      tripId: 'KBRT001',
      vehicle: 'TATA ACE',
      startDateTime: '2025-03-20 10:00 AM',
      endDateTime: '2025-03-20 10:00 PM',
      duration: '12',
      customer: 'ABC Logistics',
      deployedBy: 'Admin',
      paymentType: 'Prepaid',
      status: 'Pending'
    },
    {
      tripId: 'KBRT001',
      vehicle: 'TATA ACE',
      startDateTime: '2025-03-20 10:00 AM',
      endDateTime: '2025-03-20 10:00 PM',
      duration: '12',
      customer: 'ABC Logistics',
      deployedBy: 'Admin',
      paymentType: 'Prepaid',
      status: 'Pending'
    },
    {
      tripId: 'KBRT001',
      vehicle: 'TATA ACE',
      startDateTime: '2025-03-20 10:00 AM',
      endDateTime: '2025-03-20 10:00 PM',
      duration: '12',
      customer: 'ABC Logistics',
      deployedBy: 'Admin',
      paymentType: 'Prepaid',
      status: 'Pending'
    },
    {
      tripId: 'KBRT001',
      vehicle: 'TATA ACE',
      startDateTime: '2025-03-20 10:00 AM',
      endDateTime: '2025-03-20 10:00 PM',
      duration: '12',
      customer: 'ABC Logistics',
      deployedBy: 'Admin',
      paymentType: 'Postpaid',
      status: 'Pending'
    }
  ]

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-normal text-[#1f1f1f]">Deployment List</h1>
      </header>

      <div className="bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#e0e0e0]">
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">Trip ID</th>
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">Vehicle</th>
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">Start Date/Time</th>
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">End Date/Time</th>
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">Duration (Hrs)</th>
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">Customer</th>
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">Deployed by</th>
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">Payment Type</th>
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">Status</th>
                <th className="py-4 text-left text-sm font-medium text-[#1f1f1f]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deploymentData.map((deployment, index) => (
                <tr key={index} className="border-b border-[#e0e0e0]">
                  <td className="py-5 text-sm text-[#1f1f1f]">{deployment.tripId}</td>
                  <td className="py-5 text-sm text-[#1f1f1f]">{deployment.vehicle}</td>
                  <td className="py-5 text-sm text-[#1f1f1f]">{deployment.startDateTime}</td>
                  <td className="py-5 text-sm text-[#1f1f1f]">{deployment.endDateTime}</td>
                  <td className="py-5 text-sm text-[#1f1f1f]">{deployment.duration}</td>
                  <td className="py-5 text-sm text-[#1f1f1f]">{deployment.customer}</td>
                  <td className="py-5 text-sm text-[#1f1f1f]">{deployment.deployedBy}</td>
                  <td className="py-5 text-sm text-[#1f1f1f]">{deployment.paymentType}</td>
                  <td className="py-5">
                    <span className="px-2 py-1 text-sm text-white bg-[#2196f3] rounded">
                      {deployment.status}
                    </span>
                  </td>
                  <td className="py-5">
                    <div className="relative w-[140px]">
                      <select
                        className="w-full py-1 text-sm text-[#1f1f1f] bg-transparent border-b border-[#1f1f1f] focus:outline-none cursor-pointer [appearance:none]"
                        value={selectedAction}
                        onChange={(e) => handleAction(e.target.value, deployment.tripId, deployment.paymentType)}
                      >
                        <option value="" disabled>Select Action</option>
                        <option value="assign">Assign Driver</option>
                        <option value="edit">Edit Deployment</option>
                        <option value="terminate">Terminate Trip</option>
                        <option value="settle">Settle Trip</option>
                        <option value="view">View Trip</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Driver Modal */}
      {showModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-medium mb-4 text-[#1f1f1f]">Assign Driver</h2>
            <p className="mb-6 text-[#666666]">Assign a driver for Trip ID: {selectedTrip.id}</p>
            
            <div className="relative">
              <select className="w-full p-2 text-sm text-[#1f1f1f] border border-[#e0e0e0] rounded focus:outline-none focus:border-[#2196f3] mb-6">
                <option value="" disabled selected>Select Driver</option>
                <option value="driver1">John Doe</option>
                <option value="driver2">Jane Smith</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#666666] hover:text-[#1f1f1f]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Driver assigned successfully!')
                  setShowModal(false)
                }}
                className="px-4 py-2 text-sm text-white bg-[#2196f3] rounded hover:bg-[#1976d2]"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IntracityRental; 
