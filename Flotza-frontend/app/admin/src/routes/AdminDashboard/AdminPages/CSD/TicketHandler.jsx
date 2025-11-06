import React, { useState } from 'react';

const TicketHandler = () => {
  const loggedInExecId = '2';
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets] = useState([
    {
      id: 'KBTKT101', subject: 'Late Delivery Issue', handlerId: '2', status: 'Pending',
      raiseTime: '2025-05-27 08:30', assignedTime: '2025-05-27 09:00', lastConversation: '-', chat: []
    },
    {
      id: 'KBTKT102', subject: 'Wrong Item Received', handlerId: '2', status: 'In Progress',
      raiseTime: '2025-05-27 08:45', assignedTime: '2025-05-27 09:15', lastConversation: '2025-05-27 10:00',
      chat: [
        { sender: 'Executive', text: 'Can you share an image?' },
        { sender: 'Admin', text: 'Sure, sending it now.' }
      ]
    },
    {
      id: 'KBTKT103', subject: 'Invoice Not Received', handlerId: '2', status: 'Resolved',
      raiseTime: '2025-05-27 07:00', assignedTime: '2025-05-27 07:30', lastConversation: '2025-05-27 08:00',
      chat: [
        { sender: 'Executive', text: 'Your invoice has been emailed.' },
        { sender: 'Admin', text: 'Got it. Thanks!' }
      ]
    },
    {
      id: 'KBTKT104', subject: 'Unhelpful Resolution', handlerId: '2', status: 'Retained',
      raiseTime: '2025-05-27 06:00', assignedTime: '2025-05-27 06:15', lastConversation: '2025-05-27 07:30',
      chat: [
        { sender: 'Executive', text: 'Issue resolved.' },
        { sender: 'Admin', text: 'Still not working, reopening.' }
      ]
    },
  ]);
  // const [selectedTicket, setSelectedTicket] = useState(null);
  // const [showChat, setShowChat] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
const [newMessage, setNewMessage] = useState('');
const [isChatting, setIsChatting] = useState(false);
const [statusFilter, setStatusFilter] = useState('');
const [subjectFilter, setSubjectFilter] = useState('');



  const updateStatusAutomatically = (ticket) => {
    if (ticket.status === 'Resolved' || ticket.status === 'Retained') return;
    ticket.status = ticket.chat.length === 0 ? 'Pending' : 'In Progress';
  };

  // const assignedTickets = tickets.filter(t => t.handlerId === loggedInExecId);
  // assignedTickets.forEach(updateStatusAutomatically);
   const assignedTickets = tickets.filter(t =>
  t.handlerId === loggedInExecId &&
  (statusFilter === '' || t.status === statusFilter) &&
  (subjectFilter === '' || t.subject === subjectFilter)
);

  // Filter based on searchTerm
  const filteredTickets = assignedTickets.filter(ticket =>
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
 


  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6">My Assigned Tickets</h2>

   {/* 🔍 Search, Status Filter, and Subject Filter in a Row */}
<div className="flex flex-wrap gap-4 mb-4 items-end">
  <div className="w-[250px]">
    <label className="block font-semibold mb-1">Search Ticket ID</label>
    <input
      type="text"
      placeholder="Search..."
      className="w-full px-4 py-2 border rounded shadow-sm"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  <div className="w-[200px]">
    <label className="block font-semibold mb-1">Filter by Status</label>
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full border rounded px-2 py-2"
    >
      <option value="">All</option>
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Resolved">Resolved</option>
      <option value="Retained">Retained</option>
    </select>
  </div>

  <div className="w-[250px]">
    <label className="block font-semibold mb-1">Filter by Subject</label>
    <select
      value={subjectFilter}
      onChange={(e) => setSubjectFilter(e.target.value)}
      className="w-full border rounded px-2 py-2"
    >
      <option value="">All</option>
      {[...new Set(tickets.map(t => t.subject))].map(subject => (
        <option key={subject} value={subject}>{subject}</option>
      ))}
    </select>
  </div>
</div>
xS

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-md">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-4 py-2 text-left">Ticket ID</th>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Raise Time</th>
              <th className="px-4 py-2 text-left">Assigned Time</th>
              <th className="px-4 py-2 text-left">Last Conversation</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4">No matching tickets.</td></tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-t">
                  <td className="px-4 py-2">{ticket.id}</td>
                  <td className="px-4 py-2">{ticket.subject}</td>
                  <td className="px-4 py-2">{ticket.status}</td>
                  <td className="px-4 py-2">{ticket.raiseTime}</td>
                  <td className="px-4 py-2">{ticket.assignedTime}</td>
                  <td className="px-4 py-2">{ticket.lastConversation}</td>
                  <td className="px-4 py-2">
                    <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded">
                    View
                 </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* popup  */}
      {selectedTicket && (
  <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm  flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
      {/* Close Button */}
      <button
        onClick={() => {
          setSelectedTicket(null);
          setIsChatting(false);
          setNewMessage('');
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
      >
        &times;
      </button>

      {/* Ticket Info */}
      <h3 className="text-xl font-semibold mb-4">Ticket ID: {selectedTicket.id}</h3>

      {/* Chat Messages */}
      <div className="mb-4 max-h-64 overflow-y-auto border rounded p-2 space-y-2">
        {selectedTicket.chat.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          selectedTicket.chat.map((msg, idx) => (
            <div key={idx} className="p-2 bg-gray-100 rounded">
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))
        )}
      </div>

      {/* Chat Input (only if chatting is active) */}
      {isChatting && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 px-4 py-2 rounded"
          />
          <button
            onClick={() => {
              if (newMessage.trim() === '') return;
              const updatedTicket = {
                ...selectedTicket,
                chat: [...selectedTicket.chat, { sender: 'Executive', text: newMessage }],
                lastConversation: new Date().toISOString().slice(0, 16).replace('T', ' ')
              };
              const updatedTickets = tickets.map(t =>
                t.id === updatedTicket.id ? updatedTicket : t
              );
              setSelectedTicket(updatedTicket);
              setNewMessage('');
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => setIsChatting(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Chat
        </button>
        <button
          onClick={() => {
            const resolvedTicket = { ...selectedTicket, status: 'Resolved' };
            const updatedTickets = tickets.map(t =>
              t.id === resolvedTicket.id ? resolvedTicket : t
            );
            setSelectedTicket(resolvedTicket);
            setIsChatting(false);
            alert('Ticket marked as Resolved.');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Resolve
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default TicketHandler;
