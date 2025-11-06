import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// SVG Icon Components to replace react-icons
const FiArrowLeft = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const FiCamera = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);


const ProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    driverId: "",
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    alternateNumber: "",
    profilePic: null,
    address1: "",
    address2: "",
    state: "",
    city: "",
    pincode: "",
    currentAddress: "",
    currentAddressProof: null,
    currentHub: "",
    vendorCode: "",
    vendorName: "",
    pancardNumber: "",
    pancardPhoto: null,
    aadharNumber: "",
    aadharFrontPhoto: null,
    aadharBackPhoto: null,
    drivingLicenseNumber: "",
    drivingLicensePhoto: null,
    codHolding: "",
    chalaanHanding: "",
    customerRating: 0,
    totalDeliveries: 0,
    referCode: "",
    referenceCode: "",
    status: "",
    statusRemark: "",
    lastDeviceUsed: "",
    currentDevice: "",
    createdAt: "",
    updatedAt: "",
  });
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // State for the new checkbox
  const [sameAsLocal, setSameAsLocal] = useState(false);

  // Helper: Convert file to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Helper: Compress image to reduce file size
  const compressImage = (file, maxSizeMB = 0.5) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 600px width/height for more aggressive compression)
        let { width, height } = img;
        const maxDimension = 600;

        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality 0.6 (60%) for more aggressive compression
        canvas.toBlob(
          (blob) => {
            // Check if still too large
            if (blob.size > maxSizeMB * 1024 * 1024) {
              // Further compress with even lower quality
              canvas.toBlob(
                (compressedBlob) => {
                  resolve(compressedBlob);
                },
                "image/jpeg",
                0.3
              );
            } else {
              resolve(blob);
            }
          },
          "image/jpeg",
          0.6
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Helper: Convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper: Render file name as a clickable link for view/download
  const renderFileNameLink = (file, defaultLabel = "View File") => {
    if (!file) return null;
    let src = "";
    let fileName = defaultLabel;
    if (typeof file === "string") {
      src = file;
      // Try to extract file name from data URL or fallback
      if (file.startsWith("data:")) {
        const ext = file.substring(5, file.indexOf(";"));
        fileName = `UploadedFile.${ext.split("/")[1] || "file"}`;
      } else if (file.startsWith("http") || file.startsWith("/")) {
        fileName = file.split("/").pop().split("?")[0] || defaultLabel;
      } else {
        fileName = defaultLabel;
      }
    } else if (typeof file === "object" && file !== null && file.name) {
      src = URL.createObjectURL(file);
      fileName = file.name;
    }
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        download={fileName}
        className="ml-2 text-blue-600 underline hover:text-blue-800 text-sm break-all"
        title="Click to view or download"
      >
        {fileName}
      </a>
    );
  };

  // Fetch driver profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/auth/driver/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!data.success)
          throw new Error(data.message || "Failed to load profile");
        const d = data.data;
        const mapped = {
          driverId: d.driver_id || "",
          firstName: d.first_name || "",
          lastName: d.last_name || "",
          email: d.email || "",
          mobileNumber: d.mobile_number || "",
          alternateNumber: d.alternate_number || "",
          profilePic: d.profile_picture || null,
          address1: d.address_line_1 || "",
          address2: d.address_line_2 || "",
          state: d.state || "",
          city: d.city || "",
          pincode: d.pin_code || "",
          currentAddress: d.current_address || "",
          currentAddressProof: d.current_address_proof || null,
          currentHub: d.current_hub || "",
          vendorCode: d.vendor_code || "",
          vendorName: d.vendor_name || "",
          pancardNumber: d.pan_card_no || "",
          pancardPhoto: d.pan_card_photo || null,
          aadharNumber: d.aadhar_no || "",
          aadharFrontPhoto: d.aadhar_front_photo || null,
          aadharBackPhoto: d.aadhar_back_photo || null,
          drivingLicenseNumber: d.driving_licence_no || "",
          drivingLicensePhoto: d.driving_licence_photo || null,
          codHolding: d.cod_holdings || "",
          chalaanHanding: d.chalan_holdings || "",
          customerRating: d.customer_ratings || 0,
          totalDeliveries: d.total_deliveries || 0,
          referCode: d.referral_code || "",
          referenceCode: d.reference_code || "",
          status: d.status || "",
          statusRemark: d.status_remark || "",
          lastDeviceUsed: d.last_device_used || "",
          currentDevice: d.current_device_using || "",
          createdAt: d.created_at || "",
          updatedAt: d.updated_at || "",
        };
        setFormData(mapped);
        setOriginalData(mapped);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Effect to sync permanent address when local address changes and checkbox is ticked
  useEffect(() => {
    if (sameAsLocal) {
        const { address1, address2, city, state, pincode } = formData;
        const localAddressParts = [address1, address2, city, state].filter(part => part && part.trim() !== '');
        const addressString = localAddressParts.join(', ');
        const fullAddress = pincode ? `${addressString} - ${pincode}` : addressString;

        // Update permanent address only if there's content to add
        if (fullAddress.trim() && fullAddress.trim() !== '-') {
             setFormData(prev => ({ ...prev, currentAddress: fullAddress }));
        } else {
             setFormData(prev => ({ ...prev, currentAddress: "" }));
        }
    }
  }, [formData.address1, formData.address2, formData.city, formData.state, formData.pincode, sameAsLocal]);


  // Handle input changes
  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    
    // If user manually edits permanent address, uncheck the box
    if (name === "currentAddress") {
        setSameAsLocal(false);
    }

    if (files && files[0]) {
      const file = files[0];

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError(
          `File size must be less than 5MB. Current size: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB`
        );
        return;
      }

      // Validate file type for images
      if (name.includes("Photo") || name === "profilePic") {
        if (!file.type.startsWith("image/")) {
          setError("Please select a valid image file (JPG, PNG, GIF)");
          return;
        }

        try {
          // Always compress images to ensure they're under 500KB
          const processedFile = await compressImage(file, 0.5);
          const base64 = await blobToBase64(processedFile);

          // Allow up to 7MB base64 string (for compressed images)
          if (base64.length > 7 * 1024 * 1024) {
            setError(
              "Image is still too large after compression (max 7MB base64). Please try a smaller image."
            );
            return;
          }

          setFormData((prev) => ({
            ...prev,
            [name]: base64,
          }));
          setError(""); // Clear any previous errors
        } catch (err) {
          setError("Failed to process image. Please try again.");
        }
      } else {
        // For non-image files (like PDFs)
        const base64 = await fileToBase64(file);

        // Allow up to 7MB base64 string for non-image files
        if (base64.length > 7 * 1024 * 1024) {
          setError("File is too large (max 7MB base64). Please use a smaller file.");
          return;
        }

        setFormData((prev) => ({
          ...prev,
          [name]: base64,
        }));
        setError(""); // Clear any previous errors
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAlternateNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      alternateNumber: value,
    }));
  };

  // Handler for the "Same as Local Address" checkbox
  const handleSameAsLocalChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsLocal(isChecked);

    if (isChecked) {
        const { address1, address2, city, state, pincode } = formData;
        const localAddressParts = [address1, address2, city, state].filter(part => part && part.trim() !== '');
        const addressString = localAddressParts.join(', ');
        const fullAddress = pincode ? `${addressString} - ${pincode}` : addressString;
        
        setFormData((prev) => ({
            ...prev,
            currentAddress: (fullAddress.trim() && fullAddress.trim() !== '-') ? fullAddress : "",
        }));
    } else {
        // Revert to original permanent address or clear it
        setFormData((prev) => ({
            ...prev,
            currentAddress: originalData?.currentAddress || "",
        }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Save handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Calculate total payload size before sending
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        alternate_number: formData.alternateNumber,
        profile_picture: formData.profilePic,
        address_line_1: formData.address1,
        address_line_2: formData.address2,
        state: formData.state,
        city: formData.city,
        pin_code: formData.pincode,
        current_address: formData.currentAddress,
        current_address_proof: formData.currentAddressProof,
        pan_card_no: formData.pancardNumber,
        pan_card_photo: formData.pancardPhoto,
        aadhar_no: formData.aadharNumber,
        aadhar_front_photo: formData.aadharFrontPhoto,
        aadhar_back_photo: formData.aadharBackPhoto,
        driving_licence_no: formData.drivingLicenseNumber,
        driving_licence_photo: formData.drivingLicensePhoto,
      };

      // Check total payload size
      const payloadString = JSON.stringify(payload);
      const payloadSizeKB = payloadString.length / 1024;

      if (payloadSizeKB > 500) {
        // 500KB limit
        setError(
          `Total data size (${payloadSizeKB.toFixed(
            1
          )}KB) is too large. Please reduce image sizes or remove some files.`
        );
        setSaving(false);
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/driver/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: payloadString,
        }
      );

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error(
            "Data size too large. Please compress your images or use smaller files."
          );
        } else if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        } else {
          const errorData = await res.json();
          throw new Error(errorData.message || `Update failed (${res.status})`);
        }
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Update failed");
      setSuccess(true);
      setEditMode(false);
      setOriginalData(formData);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit: revert to original data
  const handleCancel = () => {
    setFormData(originalData);
    setEditMode(false);
    setError("");
    setSameAsLocal(false); // Also reset the checkbox state
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  if (error && !saving) { // Prevent error flash during save attempt
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  // Helper for disabling fields
  const isFieldEditable = (name) => {
    // Only allow document uploads if not already uploaded
    const editableFields = [
      "firstName",
      "lastName",
      "alternateNumber",
      "profilePic",
      "address1",
      "address2",
      "state",
      "city",
      "pincode",
      "currentAddress",
      ...(!formData.currentAddressProof ? ["currentAddressProof"] : []),
      "pancardNumber",
      ...(!formData.pancardPhoto ? ["pancardPhoto"] : []),
      "aadharNumber",
      ...(!formData.aadharFrontPhoto ? ["aadharFrontPhoto"] : []),
      ...(!formData.aadharBackPhoto ? ["aadharBackPhoto"] : []),
      "drivingLicenseNumber",
      ...(!formData.drivingLicensePhoto ? ["drivingLicensePhoto"] : []),
    ];
    return editMode && editableFields.includes(name);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-4xl mx-auto">
      {/* Top section: Heading and Back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold mb-2">Driver Profile</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
          >
            <FiArrowLeft className="mr-2 h-5 w-5" /> Back
          </button>
        </div>
        {/* Profile picture and change photo */}
        <div className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100 w-full sm:w-auto">
          <div className="flex-shrink-0 h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
            {formData.profilePic ? (
              <img
                src={
                  typeof formData.profilePic === "string"
                    ? formData.profilePic
                    : URL.createObjectURL(new Blob([formData.profilePic])) // Handle base64 and file object
                }
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div>
            {editMode && (
              <label className="cursor-pointer text-blue-600 text-sm font-medium hover:text-blue-700 inline-flex items-center mt-1">
                <FiCamera className="mr-1 h-4 w-4" />
                Change Photo
                <input
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                  disabled={!isFieldEditable("profilePic")}
                />
              </label>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Max 5MB, will be compressed
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 md:p-6 mb-6">
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
              <strong>Success!</strong> Profile updated.
            </div>
          )}

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Driver ID
                </label>
                <input
                  type="text"
                  value={formData.driverId || ""}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={!isFieldEditable("firstName")}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={!isFieldEditable("lastName")}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.mobileNumber || ""}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Alternate Number
                </label>
                <input
                  type="tel"
                  name="alternateNumber"
                  value={formData.alternateNumber}
                  onChange={handleAlternateNumberChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  maxLength="10"
                  pattern="\d{10}"
                  disabled={!isFieldEditable("alternateNumber")}
                />
              </div>
            </div>
            <div className="mt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Current Hub
                  </label>
                  <input
                    type="text"
                    value={formData.currentHub || ""}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Vendor Code
                  </label>
                  <input
                    type="text"
                    value={formData.vendorCode || ""}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={formData.vendorName || ""}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-2">
                <span className="block text-xs text-red-600 font-medium text-center">
                  Current Hub, Vendor Code &amp; Vendor Name will be assigned by admin
                </span>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
              Local Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="address1"
                  value={formData.address1}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={!isFieldEditable("address1")}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  disabled={!isFieldEditable("address2")}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={!isFieldEditable("state")}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={!isFieldEditable("city")}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  pattern="\d{6}"
                  required
                  disabled={!isFieldEditable("pincode")}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Local Address Proof
                </label>
                {formData.currentAddressProof && typeof formData.currentAddressProof === "string" && formData.currentAddressProof.startsWith("data:image") ? (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={formData.currentAddressProof} alt="Address Proof" className="h-16 w-16 object-cover rounded border border-gray-300 shadow-sm" />
                  </div>
                ) : !formData.currentAddressProof && isFieldEditable("currentAddressProof") ? (
                  <label className="cursor-pointer inline-flex items-center bg-blue-50 px-3 py-2 rounded border border-blue-200 text-blue-700 hover:bg-blue-100">
                    <FiCamera className="mr-2 h-5 w-5" />
                    Upload Address Proof
                    <input
                      type="file"
                      name="currentAddressProof"
                      onChange={handleInputChange}
                      accept="image/*"
                      disabled={!isFieldEditable("currentAddressProof")}
                      className="hidden"
                      required={false}
                    />
                  </label>
                ) : null}
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB, will be compressed automatically
                </p>
              </div>
              
            </div>
          </div>

          {/* Document Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
              Document Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* --- MODIFIED PERMANENT ADDRESS SECTION --- */}
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="currentAddress" className="block text-gray-700 text-sm font-bold">
                        Permanent Address *
                    </label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="sameAsLocal"
                            checked={sameAsLocal}
                            onChange={handleSameAsLocalChange}
                            disabled={!editMode}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="sameAsLocal" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                            Same as Local Address
                        </label>
                    </div>
                </div>
                <textarea
                  id="currentAddress"
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  rows="3"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={!isFieldEditable("currentAddress")}
                ></textarea>
              </div>
              {/* --- END OF MODIFIED SECTION --- */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  PAN Card Number {isFieldEditable("pancardNumber") ? "*" : ""}
                </label>
                <input
                  type="text"
                  name="pancardNumber"
                  value={formData.pancardNumber}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable("pancardNumber")}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    !isFieldEditable("pancardNumber") ? "bg-gray-100" : ""
                  }`}
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  title="Enter valid PAN (e.g., ABCDE1234F)"
                  required={isFieldEditable("pancardNumber")}
                />
              </div>
              <div className="flex items-center gap-2">
                {formData.pancardPhoto && typeof formData.pancardPhoto === "string" && formData.pancardPhoto.startsWith("data:image") ? (
                  <img src={formData.pancardPhoto} alt="PAN Photo" className="h-16 w-16 object-cover rounded border border-gray-300 shadow-sm" />
                ) : !formData.pancardPhoto && isFieldEditable("pancardPhoto") ? (
                  <label className="cursor-pointer inline-flex items-center bg-blue-50 px-3 py-2 rounded border border-blue-200 text-blue-700 hover:bg-blue-100">
                    <FiCamera className="mr-2 h-5 w-5" />
                    Upload PAN Photo
                    <input
                      type="file"
                      name="pancardPhoto"
                      onChange={handleInputChange}
                      accept="image/*"
                      disabled={!isFieldEditable("pancardPhoto")}
                      className="hidden"
                      required={false}
                    />
                  </label>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 col-span-2">
                {/* Aadhar Card Number */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Aadhar Card Number{" "}
                    {isFieldEditable("aadharNumber") ? "*" : ""}
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    disabled={!isFieldEditable("aadharNumber")}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      !isFieldEditable("aadharNumber") ? "bg-gray-100" : ""
                    }`}
                    pattern="[0-9]{12}"
                    title="Enter 12-digit Aadhar number"
                    required={isFieldEditable("aadharNumber")}
                  />
                </div>
                {/* Aadhar Front Photo */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Aadhar Front Photo{" "}
                    {isFieldEditable("aadharFrontPhoto") ? "*" : ""}
                  </label>
                  {formData.aadharFrontPhoto && typeof formData.aadharFrontPhoto === "string" && formData.aadharFrontPhoto.startsWith("data:image") ? (
                    <img src={formData.aadharFrontPhoto} alt="Aadhar Front" className="h-16 w-16 object-cover rounded border border-gray-300 shadow-sm" />
                  ) : !formData.aadharFrontPhoto && isFieldEditable("aadharFrontPhoto") ? (
                    <label className="cursor-pointer inline-flex items-center bg-blue-50 px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-100">
                      <FiCamera className="mr-1 h-5 w-5" />
                      Upload Aadhar Front
                      <input
                        type="file"
                        name="aadharFrontPhoto"
                        onChange={handleInputChange}
                        accept="image/*"
                        disabled={!isFieldEditable("aadharFrontPhoto")}
                        className="hidden"
                        required={false}
                      />
                    </label>
                  ) : null}
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB, will be compressed
                  </p>
                </div>
                {/* Aadhar Back Photo */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Aadhar Back Photo{" "}
                    {isFieldEditable("aadharBackPhoto") ? "*" : ""}
                  </label>
                  {formData.aadharBackPhoto && typeof formData.aadharBackPhoto === "string" && formData.aadharBackPhoto.startsWith("data:image") ? (
                    <img src={formData.aadharBackPhoto} alt="Aadhar Back" className="h-16 w-16 object-cover rounded border border-gray-300 shadow-sm" />
                  ) : !formData.aadharBackPhoto && isFieldEditable("aadharBackPhoto") ? (
                    <label className="cursor-pointer inline-flex items-center bg-blue-50 px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-100">
                      <FiCamera className="mr-1 h-5 w-5" />
                      Upload Aadhar Back
                      <input
                        type="file"
                        name="aadharBackPhoto"
                        onChange={handleInputChange}
                        accept="image/*"
                        disabled={!isFieldEditable("aadharBackPhoto")}
                        className="hidden"
                        required={false}
                      />
                    </label>
                  ) : null}
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB, will be compressed
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Driving License Number{" "}
                  {isFieldEditable("drivingLicenseNumber") ? "*" : ""}
                </label>
                <input
                  type="text"
                  name="drivingLicenseNumber"
                  value={formData.drivingLicenseNumber}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable("drivingLicenseNumber")}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    !isFieldEditable("drivingLicenseNumber")
                      ? "bg-gray-100"
                      : ""
                  }`}
                  required={isFieldEditable("drivingLicenseNumber")}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Driving License Photo{" "}
                  {isFieldEditable("drivingLicensePhoto") ? "*" : ""}
                </label>
                {formData.drivingLicensePhoto && typeof formData.drivingLicensePhoto === "string" && formData.drivingLicensePhoto.startsWith("data:image") ? (
                  <img src={formData.drivingLicensePhoto} alt="License Photo" className="h-16 w-16 object-cover rounded border border-gray-300 shadow-sm" />
                ) : !formData.drivingLicensePhoto && isFieldEditable("drivingLicensePhoto") ? (
                  <label className="cursor-pointer inline-flex items-center bg-blue-50 px-3 py-2 rounded border border-blue-200 text-blue-700 hover:bg-blue-100">
                    <FiCamera className="mr-2 h-5 w-5" />
                    Upload License Photo
                    <input
                      type="file"
                      name="drivingLicensePhoto"
                      onChange={handleInputChange}
                      accept="image/*"
                      disabled={!isFieldEditable("drivingLicensePhoto")}
                      className="hidden"
                      required={false}
                    />
                  </label>
                ) : null}
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB, will be compressed automatically
                </p>
              </div>
            </div>
          </div>

          {/* Stats & Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
              Stats & Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  COD Holding
                </label>
                <input
                  type="text"
                  value={formData.codHolding || "N/A"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Chalaan Handling
                </label>
                <input
                  type="text"
                  value={formData.chalaanHanding || "N/A"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Customer Rating
                </label>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(Number(formData.customerRating) || 0)
                            ? "★"
                            : "☆"}
                        </span>
                      ))}
                  </span>
                  <span className="ml-2">
                    ({formData.customerRating || "0"}/5)
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Total Deliveries
                </label>
                <input
                  type="text"
                  value={formData.totalDeliveries || "0"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Refer Code
                </label>
                <input
                  type="text"
                  value={formData.referCode || "N/A"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Reference Code
                </label>
                <input
                  type="text"
                  value={formData.referenceCode || "N/A"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full mr-2 ${
                      formData.status === "Active"
                        ? "bg-green-500"
                        : formData.status === "Inactive"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  <span>{formData.status || "N/A"}</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status Remark
                </label>
                <input
                  type="text"
                  value={formData.statusRemark || "N/A"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Last Device Used
                </label>
                <input
                  type="text"
                  value={formData.lastDeviceUsed || "N/A"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Current Device
                </label>
                <input
                  type="text"
                  value={formData.currentDevice || "N/A"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Created Date
                </label>
                <input
                  type="text"
                  value={formatDate(formData.createdAt) || "N/A"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Last Updated
                </label>
                <input
                  type="text"
                  value={formatDate(formData.updatedAt) || "N/A"}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
