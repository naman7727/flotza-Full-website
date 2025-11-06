import { useState, useRef } from "react";
import AttendanceHistory from "../SalesDashboardUtils/AttendanceHistory";

// Helper to calculate distance using Haversine formula
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
  // return 1;
};

const Attendance = () => {
  const [loading, setLoading] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const [attendanceMarked, setAttendancemarked] = useState(false);
  const [attendanceInfo, setAttendanceInfo] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showCaptureBtn, setShowCaptureBtn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const userId = "USER123"; // Replace with dynamic ID if needed
  const allowedLat = 19.201667;
  const allowedLon =  72.870278;

  const handleMarkAttendance = async () => {
    setLoading(true);
    setAttendanceInfo(null);
    setPhotoData(null);

    try {
      // 1. Get location
      const getLocation = () =>
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

      const position = await getLocation();
      const { latitude, longitude } = position.coords;

      // Save location
      setCurrentLocation({ latitude, longitude });

      // 2. Check if within range
      const distance = getDistanceFromLatLonInKm(
        latitude,
        longitude,
        allowedLat,
        allowedLon
      );

      if (distance > 2) {
        alert(`You are outside the allowed attendance area.\n Distance: ${distance} meters`);
        setLoading(false);
        return;
      }

      // 3. Start camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
      setShowCaptureBtn(true);
    } catch (error) {
      alert("Failed to start attendance: " + error.message);
      setLoading(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!currentLocation) {
      alert("Location not available.");
      return;
    }
    

    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");

    // Stop camera
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    const info = {
      userId,
      date,
      time,
      location: currentLocation,
      photo: imageData,
    };
    setAttendancemarked(true);
    alert("Your Attendance has been marked");

    setPhotoData(imageData);
    setAttendanceInfo(info);
    setCameraActive(false);
    setShowCaptureBtn(false);
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-indigo-100 via-white to-indigo-100 space-y-6 p-6">
      {/* Attendance Card */}
      <div className="mt-20 px-10 py-10 rounded-2xl text-center w-full max-w-lg bg-white text-gray-800 shadow-xl border border-indigo-200">
        <div className="text-indigo-700 text-3xl font-bold mb-4">
          Mark Your Attendance
        </div>
        {attendanceMarked ? (
          <div className="text-green-600 font-semibold text-lg">✅ Your attendance has been marked</div>
        ) : (
          <button
            onClick={handleMarkAttendance}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition-all duration-300 text-lg font-medium shadow-md"
          >
            {loading ? "Processing..." : "📍 Mark Attendance"}
          </button>
        )}
      </div>
  
      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        className={`w-80 h-60 rounded-md mb-2 border-4 border-indigo-300 shadow-md transition ${cameraActive ? "block" : "hidden"}`}
      />
  
      {showCaptureBtn && (
        <button
          onClick={handleCapturePhoto}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-500 transition text-md shadow"
        >
          📸 Capture Photo
        </button>
      )}
  
      <canvas ref={canvasRef} className="hidden" />
  
      {/* Captured Data Card */}
      {photoData && attendanceInfo && (
        <div className="bg-white shadow-xl p-6 rounded-xl w-full max-w-md border border-gray-200">
          <p className="mb-2"><strong className="text-indigo-600">User ID:</strong> {attendanceInfo.userId}</p>
          <p className="mb-2"><strong className="text-indigo-600">Date:</strong> {attendanceInfo.date}</p>
          <p className="mb-2"><strong className="text-indigo-600">Time:</strong> {attendanceInfo.time}</p>
          <p className="mb-2">
            <strong className="text-indigo-600">Location:</strong> {parseFloat(attendanceInfo.location.latitude).toFixed(4)},
            {parseFloat(attendanceInfo.location.longitude).toFixed(4)}
          </p>
          <img src={photoData} alt="Captured" className="mt-4 rounded-md shadow-md border border-gray-300" />
          <iframe
            className="mt-4 rounded-md shadow"
            width="100%"
            height="300"
            src={`https://www.google.com/maps?q=${attendanceInfo.location.latitude},${attendanceInfo.location.longitude}&hl=es;z=14&output=embed`}
          ></iframe>
        </div>
      )}
  
      {/* Attendance History */}
      <AttendanceHistory />
    </div>
  );
};

export default Attendance;
