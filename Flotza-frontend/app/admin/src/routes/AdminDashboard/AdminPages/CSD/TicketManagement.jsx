import React, { useState } from 'react';

const executives = [
  { id: '1', name: 'Rahul Sharma' },
  { id: '2', name: 'Aarti Mehta' },
  { id: '3', name: 'Vikram Joshi' }
];

const initialTickets = [
  { id: 'KBTKT101', subject: 'Delivery delayed', priority: 'High', handler: 'Unassigned', status: 'Open', chat: [] },
  { id: 'KBTKT102', subject: 'Damaged parcel', priority: 'Medium', handler: 'Unassigned', status: 'Open', chat: [] },
  { id: 'KBTKT103', subject: 'Pickup not done', priority: 'Low', handler: 'Unassigned', status: 'Open', chat: [] },
];

const AdminPanel = () => {
  const [tickets, setTickets] = useState(initialTickets);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedExecs, setSelectedExecs] = useState({});

  const handleAssignOrTransfer = (index) => {
    const execId = selectedExecs[index];
    if (!execId) return alert('Please select an executive.');

    const exec = executives.find(e => e.id === execId);
    const updatedTickets = [...tickets];
    const ticket = updatedTickets[index];

    ticket.handler = `Assigned to ${exec.name}`;
    if (ticket.status === 'Open') ticket.status = 'In Progress';

    setTickets(updatedTickets);
    alert(`${ticket.handler.includes('Assigned') ? '✅ Assigned' : '🔄 Transferred'} ticket ${ticket.id} to ${exec.name}`);
  };

  const handleIntervene = (index) => {
    const updatedTickets = [...tickets];
    updatedTickets[index].handler = 'Handled by Admin';
    updatedTickets[index].status = 'In Progress';
    setTickets(updatedTickets);
    setCurrentTicketIndex(index);
    setModalVisible(true);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const updatedTickets = [...tickets];
    updatedTickets[currentTicketIndex].chat.push({ sender: 'Admin', text: message });
    setTickets(updatedTickets);
    setMessage('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin Panel – Assign or Handle Tickets</h2>
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Ticket ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Subject</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Priority</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Handler</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Assign/Transfer</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket, index) => {
              const isClosed = ticket.status === 'Closed';
              const buttonLabel = ticket.handler === 'Unassigned' ? 'Assign' : 'Transfer';

              return (
                <tr key={ticket.id} className={ticket.handler === 'Handled by Admin' ? 'bg-blue-50' : ticket.handler.startsWith('Assigned to') ? 'bg-green-50' : ''}>
                  <td className="px-4 py-2">{ticket.id}</td>
                  <td className="px-4 py-2">{ticket.subject}</td>
                  <td className="px-4 py-2">{ticket.priority}</td>
                  <td className="px-4 py-2">{ticket.handler}</td>
                  <td className="px-4 py-2">{ticket.status}</td>
                  <td className="px-4 py-2">
                    <select
                      disabled={isClosed}
                      value={selectedExecs[index] || ''}
                      onChange={(e) => setSelectedExecs({ ...selectedExecs, [index]: e.target.value })}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="">Select Executive</option>
                      {executives.map((exec) => (
                        <option key={exec.id} value={exec.id}>{exec.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      disabled={isClosed}
                      onClick={() => handleAssignOrTransfer(index)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      {buttonLabel}
                    </button>
                    <button
                      disabled={isClosed}
                      onClick={() => handleIntervene(index)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      Intervene
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalVisible && currentTicketIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <h3 className="text-xl font-semibold mb-4">
              Handling Ticket: {tickets[currentTicketIndex].id} – {tickets[currentTicketIndex].subject}
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
              {tickets[currentTicketIndex].chat.map((msg, i) => (
                <div key={i} className="p-2 bg-gray-100 rounded shadow-sm text-sm">{msg.text}</div>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              placeholder="Type your message..."
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <div className="flex justify-between">
              <button
                onClick={sendMessage}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Send
              </button>
              <button
                onClick={() => setModalVisible(false)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
