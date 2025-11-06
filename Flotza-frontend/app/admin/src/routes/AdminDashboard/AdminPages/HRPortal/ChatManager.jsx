import React, { useState } from 'react';
import { staffList } from '../../../AdminDashboard/AdminPages/UserDirectories/Staff';

// Helper to generate random messages
const randomMessages = [
  'Hello!',
  'How are you?',
  "Let's catch up soon.",
  'Can you send the report?',
  'Thanks!',
  'See you at the meeting.',
  'Good morning!',
  "I'll get back to you.",
  "Let's discuss this.",
  'Sure, no problem.'
];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Generate all unique staff pairs
const allStaffNames = Array.from(new Set(staffList.map(staff => staff.name)));
const staffPairs = [];
for (let i = 0; i < allStaffNames.length; i++) {
  for (let j = i + 1; j < allStaffNames.length; j++) {
    staffPairs.push([allStaffNames[i], allStaffNames[j]]);
  }
}

// Generate random chat data for each pair
const MOCK_CHATS = staffPairs.map((pair, idx) => ({
  id: idx + 1,
  parties: pair,
  messages: Array.from({ length: getRandomInt(5) + 3 }, (_, m) => {
    const from = pair[getRandomInt(2)];
    return {
      from,
      text: randomMessages[getRandomInt(randomMessages.length)]
    };
  })
}));

const ChatManager = () => {
  // Sidebar state
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [filteredChats, setFilteredChats] = useState(MOCK_CHATS);
  const [selectedChatId, setSelectedChatId] = useState(null);

  // Access/suspend state
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeResults, setEmployeeResults] = useState([]);
  const [accessList, setAccessList] = useState([]);
  const [accessStatus, setAccessStatus] = useState({ msg: '', color: '' });

  // Admin chat state
  const [adminMessage, setAdminMessage] = useState('');
  const [chats, setChats] = useState(MOCK_CHATS);

  // Filter chats by parties
  const searchChats = () => {
    const filtered = chats.filter(chat => {
      if (!partyA && !partyB) return true;
      return (
        (chat.parties[0] === partyA && chat.parties[1] === partyB) ||
        (chat.parties[1] === partyA && chat.parties[0] === partyB)
      );
    });
    setFilteredChats(filtered);
    setSelectedChatId(null);
  };

  // Select chat
  const selectChat = (id) => {
    setSelectedChatId(id);
  };

  // Admin send message
  const handleAdminSend = () => {
    if (!adminMessage.trim() || !selectedChatId) return;
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { from: 'Admin', text: adminMessage }
              ]
            }
          : chat
      )
    );
    setFilteredChats(prevFiltered =>
      prevFiltered.map(chat =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { from: 'Admin', text: adminMessage }
              ]
            }
          : chat
      )
    );
    setAdminMessage('');
  };

  // Search employees
  const searchEmployees = (query) => {
    setEmployeeSearch(query);
    if (!query.trim()) {
      setEmployeeResults([]);
      return;
    }
    const q = query.toLowerCase();
    const results = staffList.filter(emp =>
      emp.id.toLowerCase().includes(q) ||
      emp.name.toLowerCase().includes(q) ||
      (emp.email && emp.email.toLowerCase().includes(q)) ||
      (emp.contact && emp.contact.toLowerCase().includes(q))
    );
    setEmployeeResults(results);
  };

  // Grant access
  const grantAccess = (empId) => {
    if (accessList.includes(empId)) {
      setAccessStatus({ msg: 'Employee already has access.', color: 'orange' });
      return;
    }
    setAccessList(prev => [...prev, empId]);
    setAccessStatus({ msg: 'Access granted.', color: 'green' });
    setEmployeeSearch('');
    setEmployeeResults([]);
  };

  // Suspend access
  const suspendAccess = (empId) => {
    setAccessList(prev => prev.filter(id => id !== empId));
    setAccessStatus({ msg: 'Employee suspended from chat.', color: 'red' });
  };

  // Selected chat for display
  const selectedChat = filteredChats.find(chat => chat.id === selectedChatId);

  return (
    <div className="flex h-[80vh] bg-white text-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1">Select Party A</label>
          <select 
            className="w-full bg-white border border-gray-300 rounded px-2 py-1 mb-2" 
            value={partyA} 
            onChange={e => setPartyA(e.target.value)}
          >
            <option value="">All</option>
            {allStaffNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          
          <label className="block text-xs font-semibold mb-1">Select Party B</label>
          <select 
            className="w-full bg-white border border-gray-300 rounded px-2 py-1 mb-2" 
            value={partyB} 
            onChange={e => setPartyB(e.target.value)}
          >
            <option value="">All</option>
            {allStaffNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          
          <button 
            className="w-full bg-blue-500 text-white font-bold px-3 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={searchChats}
          >
            Search
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded bg-white">
          <ul>
            {filteredChats.map(chat => (
              <li
                key={chat.id}
                className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedChatId === chat.id ? 'bg-blue-100' : 'hover:bg-blue-50'
                }`}
                onClick={() => selectChat(chat.id)}
              >
                {chat.parties[0]} ↔ {chat.parties[1]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Chat View Section */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-blue-700">Chat View</h4>
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 h-48 overflow-y-auto">
            {selectedChat ? (
              selectedChat.messages.map((msg, idx) => (
                <div key={idx} className="mb-2">
                  <span className={`font-bold ${
                    msg.from === 'Admin' ? 'text-red-600' : 'text-blue-700'
                  }`}>
                    {msg.from}:
                  </span> <span>{msg.text}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Select a chat from the list to view messages.</p>
            )}
          </div>
          
          {/* Admin Message Input */}
          {selectedChat && (
            <div className="flex mt-2 gap-2">
              <input
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                type="text"
                placeholder="Type a message as Admin..."
                value={adminMessage}
                onChange={e => setAdminMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdminSend(); }}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                onClick={handleAdminSend}
                disabled={!adminMessage.trim()}
              >
                Send
              </button>
            </div>
          )}
        </div>

        {/* Employee Search Section */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-blue-700">Staff Access Management</h4>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            type="text"
            placeholder="Search by ID, name, email, or contact number"
            value={employeeSearch}
            onChange={e => searchEmployees(e.target.value)}
            autoComplete="off"
          />
          
          {employeeSearch && (
            <div className="divide-y divide-gray-100 rounded border border-gray-100 bg-gray-50 max-h-60 overflow-y-auto">
              {employeeResults.length === 0 ? (
                <div className="p-3 text-gray-400 text-center">
                  No employees found for "{employeeSearch}".
                </div>
              ) : (
                employeeResults.map(emp => (
                  <div key={emp.id} className="flex justify-between items-center px-3 py-2 hover:bg-gray-100">
                    <span>
                      <span className="font-medium">{emp.name}</span>{' '}
                      <span className="text-xs text-gray-500">({emp.id})</span>
                    </span>
                    <button 
                      className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600"
                      onClick={() => grantAccess(emp.id)}
                    >
                      Grant Access
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          
          {accessStatus.msg && (
            <p className={`mt-2 text-center text-sm font-semibold text-${accessStatus.color}-600`}>
              {accessStatus.msg}
            </p>
          )}
        </div>

        {/* Employees with Access Section - Fixed Scrolling */}
        <div className="flex flex-col flex-1 min-h-0">
          <h4 className="font-semibold mb-2 text-blue-700">Employees with Access</h4>
          <div className="rounded border border-gray-200 bg-gray-50 flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-blue-50 z-10">
                  <tr>
                    <th className="p-2 font-medium text-left">ID</th>
                    <th className="p-2 font-medium text-left">Name</th>
                    <th className="p-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accessList.length > 0 ? (
                    accessList.map(empId => {
                      const emp = staffList.find(e => e.id === empId);
                      return emp ? (
                        <tr key={emp.id} className="even:bg-blue-50 hover:bg-blue-100">
                          <td className="p-2">{emp.id}</td>
                          <td className="p-2">{emp.name}</td>
                          <td className="p-2 text-right">
                            <button
                              className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600"
                              onClick={() => suspendAccess(emp.id)}
                            >
                              Suspend
                            </button>
                          </td>
                        </tr>
                      ) : null;
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-400">
                        No employees have access yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatManager;