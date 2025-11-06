import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../lib/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [referenceCode, setReferenceCode] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState("Customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!selectedForm) return "Please select a user type.";
    if (!firstName.trim()) return "First name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email is required.";
    if (!phoneNumber.trim() || !/^\d{10}$/.test(phoneNumber)) return "Valid 10-digit phone number is required.";
    if (!password || password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match!";
    return null;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    setIsLoading(false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", email);
    formData.append("mobile_number", phoneNumber);
    formData.append("password", password);
    // Only append reference_code if it's not a vendor registration
    if (selectedForm.toLowerCase() !== "vendor") {
      formData.append("reference_code", referenceCode);
    }

    const endpoint = `http://localhost:1337/api/auth/${selectedForm.toLowerCase()}/register`;

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(
        `Invalid response: Expected JSON, got ${contentType || "unknown"}: ${text.substring(0, 100)}...`
      );
    }

    const result = await response.json();
    console.log("Full result:", result); // Log the entire result object

    if (result.success) {
      const userKey = selectedForm.toLowerCase();
      console.log("User key:", userKey); // Log the user key
      console.log("Result data:", result.data); // Log the result.data object

      const userData = result.data[userKey];
      if (!userData) {
        throw new Error(`User data not found for key: ${userKey}`);
      }

      console.log("User data:", userData); // Log the user data

      const appRole = userData.app_role;
      const normalizedRole = appRole === "sdddriver" ? "driver" : appRole;

      // Store full user data and role in localStorage
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify({ ...userData, role: normalizedRole }));

      // Dispatch to Redux
      dispatch(
        setCredentials({
          jwt: result.data.token,
          user: { ...userData, approle: normalizedRole },
        })
      );

      // Reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
      setSelectedForm("");

      alert("Registered successfully!");
      navigate("/login");
    } else {
      setError(result.message || "Registration failed: Unknown error");
    }
  } catch (err) {
    console.error("Registration error:", err);
    setError(err.message || "Registration failed: Network or server error");
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (form) => {
    setSelectedForm(form);
    setError(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-10 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-6 text-3xl font-bold text-center text-slate-800">
          Flotza Register
        </h2>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => handleChange("Customer")}
            className={`py-2 px-6 rounded-l-lg text-center cursor-pointer transition duration-300 ${selectedForm === "Customer"
                ? "bg-primary-color text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Customer
          </button>
          <button
            onClick={() => handleChange("Vendor")}
            className={`py-2 px-6 text-center cursor-pointer transition duration-300 ${selectedForm === "Vendor"
                ? "bg-primary-color text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Vendor
          </button>
          <button
            onClick={() => handleChange("Driver")}
            className={`py-2 px-6 rounded-r-lg text-center cursor-pointer transition duration-300 ${selectedForm === "Driver"
                ? "bg-primary-color text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Driver
          </button>
        </div>

        {selectedForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-light text-center">
              {selectedForm} Registration
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="p-2 border-gray-300 rounded-lg input focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="p-2 border-gray-300 rounded-lg input focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border-gray-300 rounded-lg input focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="p-2 border-gray-300 rounded-lg input focus:outline-none focus:ring-2 focus:ring-orange"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 pr-10 border-gray-300 rounded-lg input focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/3000/svg">
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.977 9.977 0 011.563-3.029m2.697-1.797A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.977 9.977 0 01-1.563 3.029" />
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 pr-10 border-gray-300 rounded-lg input focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.977 9.977 0 011.563-3.029m2.697-1.797A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.977 9.977 0 01-1.563 3.029" />
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeWidth="2" stroke="black" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

            </div>
            {selectedForm != "Vendor" && <div className="flex justify-center">
              <input
                type="text"
                placeholder="Referral Code"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className="p-2 border-gray-300 rounded-lg input focus:outline-none focus:ring-2 focus:ring-orange"
                required
              />
            </div>}
            {error && <p className="text-sm text-center text-red-600">{error}</p>}
            <div className="text-center space-x-4">
              <button
                type="submit"
                className="relative px-6 py-2 text-white rounded bg-primary-color disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="opacity-0">Register</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                    </div>
                  </>
                ) : (
                  "Register"
                )}
              </button>
              <button
                type="login"
                className="relative px-6 py-2 text-white rounded bg-primary-color disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={() => { navigate("/login") }}
              >
                {(
                  <>
                    Login
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;