
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../lib/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState("email"); // email or phone
  const [userType, setUserType] = useState("customer"); // customer, vendor, driver, admin
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    setEmail("");
    setPhoneNumber("");
    setError(null);
  }, [userType, loginType]);

  const handleSubmit = async (e, userType) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const identifierKey = loginType === "email" ? "email" : "mobile_number";
      const identifierValue = loginType === "email" ? email : phoneNumber;
// Determine correct endpointUserType
let endpointUserType = userType;

if (userType === "admin") {
  endpointUserType = "employee";
} else if (userType === "sdddriver") {
  endpointUserType = "driver";
}

const endpoint = `${baseURL}/api/auth/${endpointUserType}/login`;
console.log("Login Endpoint:", endpoint);

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

      console.log("Requesting:", endpoint, {
        [identifierKey]: identifierValue,
        password,
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          [identifierKey]: identifierValue,
          password,
        }),
      });

      // Log response status and headers for debugging
      console.log("Response Status:", response.status, response.statusText);
      console.log("Response Headers:", Object.fromEntries(response.headers));

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          `Invalid response: Expected JSON, got ${contentType || "unknown"}`
        );
      }

      const result = await response.json();
      console.log("Response JSON:", result);

     if (result.success) {
  const userKey = userType === "admin" ? "employee" : userType === "sdddriver" ? "driver" : userType;
  const userData = result.data[userKey];
  const roleField = userKey === "employee" ? "app_roles" : "app_role";
  const appRole = userData[roleField];
  const normalizedRole = appRole === "driver" ? "sdddriver" : appRole;

  // Role mismatch check
  if (normalizedRole.toLowerCase() !== userType.toLowerCase()) {
    alert("Please log in through the correct login page.");
    setIsLoading(false);
    return;
  }

  // Save to localStorage
  localStorage.setItem("token", result.data.token);
  localStorage.setItem("user", normalizedRole);

  const credPayload = {
    jwt: result.data.token,
    user: {
      approle: normalizedRole,
    },
  };

  console.log("Cred Payload", credPayload);
  dispatch(setCredentials(credPayload));



  // Navigate based on role
  switch (userKey) {
     case "customer":
            navigate("/customer-dashboard");
            break;
    case "vendor":
      navigate("/vendor-dashboard");
      break;
    case "sdddriver":
      navigate("/driver-dashboard");
      break;
    case "driver":
      navigate("/driver-dashboard");
      break;
    case "employee":
      navigate("/admin-dashboard");
      break;
    default:
      console.error("Unknown role");
      break;
  }
}

         
        //   case "vendor":
        //     navigate("/vendor-dashboard");
        //     break;
        //   case "driver":
        //     navigate("/driver-dashboard");
        //     break;
        //   case "admin":
        //     navigate("/admin-dashboard");
        //     break;
        //   default:
        //     console.error("Unknown user type");
        // }
      else {
        setError(result.message || "Login failed: Unknown error");
      }
    } catch (err) {
      setError(err.message || "Login failed: Network or server error");
      console.error("Failed to login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = () => {
    window.location.href = "https://kartbuddy.in";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-800">
            Login to Flotza
          </h2>
          <div
            className="group relative cursor-pointer"
            onClick={handleLogoClick}
            title="Go to Homepage"
          >
            <img
              src={logo}
              alt="Flotza Home"
              className="h-12 w-auto transition-all duration-300 group-hover:scale-110 group-hover:opacity-90 group-active:scale-95"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-color/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="mb-4 text-blue-600 bg-blue-100 p-2 rounded">
            Logging in...
          </div>
        )}

        <div className="flex mb-4">
          <button
            type="button"
            onClick={() => setUserType("customer")}
            className={`flex-1 py-2 text-center ${
              userType === "customer"
                ? "bg-primary-color text-white"
                : "bg-gray-200 text-gray-700"
            } rounded-l-lg transition duration-300`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setUserType("vendor")}
            className={`flex-1 py-2 text-center ${
              userType === "vendor"
                ? "bg-primary-color text-white"
                : "bg-gray-200 text-gray-700"
            } transition duration-300`}
          >
            Vendor
          </button>
          <button
            type="button"
            onClick={() => setUserType("sdddriver")}
            className={`flex-1 py-2 text-center ${
              userType === "sdddriver"
                ? "bg-primary-color text-white"
                : "bg-gray-200 text-gray-700"
            } transition duration-300`}
          >
            Driver
          </button>
          <button
            type="button"
            onClick={() => setUserType("admin")}
            className={`flex-1 py-2 text-center ${
              userType === "admin"
                ? "bg-primary-color text-white"
                : "bg-gray-200 text-gray-700"
            } rounded-r-lg transition duration-300`}
          >
            Admin
          </button>
        </div>

        <div className="flex mb-4">
          <button
            type="button"
            onClick={() => setLoginType("email")}
            className={`flex-1 py-2 text-center ${
              loginType === "email"
                ? "bg-primary-color text-white"
                : "bg-gray-200 text-gray-700"
            } rounded-l-lg transition duration-300`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginType("phone")}
            className={`flex-1 py-2 text-center ${
              loginType === "phone"
                ? "bg-primary-color text-white"
                : "bg-gray-200 text-gray-700"
            } rounded-r-lg transition duration-300`}
          >
            Phone
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-5">
          {loginType === "email" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91234567890"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ""))
                }
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link
              to="/reset-password"
              className="text-sm text-primary-color hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-2/3 mx-auto block bg-primary-color text-white py-1.5 rounded-lg hover:bg-secondary-hover-color transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative"
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Login</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-color font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
