import React, { useState, useEffect } from "react";
import axios from 'axios'

function Button({ name, classes, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${classes} text-white px-3 py-1 rounded mx-1`}
    >
      {name}
    </button>
  );
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return date.toLocaleString(undefined, options);
};

const FirstContact = () => {
  const [users, setUsers] = useState([]);
  const [viewingMessageIndex, setViewingMessageIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const url = 'http://localhost:1337/api/form/contact';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
  
      try {
        console.log(`🔐 Token: ${token}`);
  
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response?.data) {
          throw new Error("Response data is missing");
        }
  
        const outerData = response.data.data;
        if (!outerData || !Array.isArray(outerData.data)) {
          throw new Error("Unexpected response structure: data.data is not an array");
        }
  
        const messageList = [...outerData.data]; // clone to avoid mutating original
  
        // Sort by creation date, newest first
        messageList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
        setUsers(messageList);
        console.log("✅ Messages loaded:", messageList);
  
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
        setError(err?.response?.data?.message || err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, [url, token]);
  

  
  if (loading) return <p>Loading...</p>;  //loding show kare ga
  if (error) return <p>Error: {error}</p>;




  /*Updating status of buttons*/
  const updateStatus = (index, newStatus) => {
    const newUsers = [...users];
    newUsers[index].status = newStatus;
    setUsers(newUsers);
  };

  const MessageModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg p-6 w-full max-w-md shadow-lg z-50">
        <h2 className="text-xl font-bold mb-4">Customer Message</h2>
        <p className="mb-6 text-gray-700">{user.message}</p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-1/2 md:w-full">
      <div>
        <h2 className="text-center text-2xl font-bold my-6">
          Received Messages
        </h2>
      </div>
      <div className="flex justify-center mt-10 overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full max-w-8xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-center">Msg_id</th>
              <th className="border px-4 py-2 text-center">Full Name</th>
              <th className="border px-4 py-2 text-center">Phone Number</th>
              <th className="border px-4 py-2 text-center">Email</th>
              <th className="border px-4 py-2 text-center">Status</th>
              <th className="border px-4 py-2 text-center">Date & Time</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center">{user.message_id}</td>
                <td className="border px-4 py-2 text-center">{user.full_name}</td>
                <td className="border px-4 py-2 text-center">{user.phone_number}</td>
                <td className="border px-4 py-2 text-center">{user.email}</td>
                <td className="border px-4 py-2 text-center">{user.status || 'Pending'}</td>
                <td className="border px-4 py-2 text-center">
                  {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </td>
                <td className="border px-4 py-2 text-center">
                  <Button
                    name="Message"
                    classes="bg-amber-500 hover:bg-indigo-500"
                    onClick={() => {
                      updateStatus(index, "Processing");
                      setViewingMessageIndex(index);
                    }}
                  />
                  <Button
                    name="Assign"
                    classes="bg-green-500 hover:bg-yellow-500"
                    onClick={() => {
                      updateStatus(index, "Processing");
                    }}
                  />
                  <Button
                    name="Mark Completed"
                    classes="bg-blue-500 hover:bg-green-500"
                    onClick={() => updateStatus(index, "Completed")}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MessageModal
        user={viewingMessageIndex !== null ? users[viewingMessageIndex] : null}
        onClose={() => setViewingMessageIndex(null)}
      />
    </div>
  );
};

export default FirstContact;
