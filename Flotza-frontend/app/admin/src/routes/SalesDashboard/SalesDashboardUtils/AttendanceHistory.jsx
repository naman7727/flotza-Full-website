const attendanceData = [
  {
    userId: "U001",
    date: "2025-06-04",
    time: "09:00 AM",
    latitude: 19.0760,
    longitude: 72.8777,
    address: "Churchgate, Mumbai",
    photoUrl: "https://via.placeholder.com/100?text=Photo1",
  },
  {
    userId: "U002",
    date: "2025-06-03",
    time: "09:05 AM",
    latitude: 28.7041,
    longitude: 77.1025,
    address: "Karol Bagh, Delhi",
    photoUrl: "https://via.placeholder.com/100?text=Photo2",
  },
  {
    userId: "U003",
    date: "2025-06-02",
    time: "08:55 AM",
    latitude: 13.0827,
    longitude: 80.2707,
    address: "Adyar, Chennai",
    photoUrl: "https://via.placeholder.com/100?text=Photo3",
  },
];

const AttendanceHistory = () => {
  return (
    <div className="p-6 w-full max-w-6xl bg-white shadow-lg rounded-2xl mt-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">📋 Attendance History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-800 border-separate border-spacing-y-2">
          <thead className="bg-indigo-100 text-indigo-800 text-sm font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">User ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3 rounded-r-lg">Map</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((entry, index) => (
              <tr
                key={index}
                className="bg-white hover:bg-gray-100 shadow rounded-lg"
              >
                <td className="px-4 py-2">{entry.userId}</td>
                <td className="px-4 py-2">{entry.date}</td>
                <td className="px-4 py-2">{entry.time}</td>
                <td className="px-4 py-2">{entry.address}</td>
                <td className="px-4 py-2">
                  <a
                    href={entry.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                  >
                    📷 View Photo
                  </a>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`,
                        "_blank"
                      )
                    }
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition"
                  >
                    🗺️ View Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceHistory;