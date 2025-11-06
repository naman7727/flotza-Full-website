import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setVendorProfile } from "../../../lib/auth/authSlice";

// Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const borderColor =
    type === "success" ? "border-green-400" : "border-red-400";
  const textColor = type === "success" ? "text-green-700" : "text-red-700";
  const title = type === "success" ? "Success!" : "Error!";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} ${borderColor} ${textColor} px-4 py-3 rounded z-50 shadow-lg max-w-md`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === "success" ? (
            <svg
              className="w-5 h-5 mt-0.5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 mt-0.5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="ml-2 flex-1">
          <strong className="block font-medium">{title}</strong>
          <p className="mt-1 text-sm leading-5 whitespace-pre-line">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Helper functions for professional error formatting
const formatProfessionalError = (errorMessage) => {
  if (!errorMessage) return "An unexpected error occurred";
  
  const message = errorMessage.toLowerCase();
  
  // Handle unique constraint violations
  if (message.includes('duplicate') || message.includes('unique') || message.includes('already exists')) {
    if (message.includes('pan') || message.includes('pan_card')) {
      return "PAN Card number already exists in our system. Please verify your PAN number or contact support if this is an error";
    }
    if (message.includes('gst') || message.includes('gst_number')) {
      return "GST number already exists in our system. Please verify your GST number or contact support if this is an error";
    }
    if (message.includes('aadhar') || message.includes('adhar')) {
      return "Aadhar number already exists in our system. Please verify your Aadhar number or contact support if this is an error";
    }
    if (message.includes('email')) {
      return "Email address already exists in our system. Please use a different email or contact support if this is an error";
    }
    if (message.includes('mobile') || message.includes('phone')) {
      return "Mobile number already exists in our system. Please verify your mobile number or contact support if this is an error";
    }
    if (message.includes('business_name')) {
      return "Business name already exists in our system. Please use a different business name or contact support if this is an error";
    }
    return "The information you entered already exists in our system. Please verify your details or contact support";
  }
  
  // Handle validation errors
  if (message.includes('invalid format') || message.includes('format')) {
    if (message.includes('pan')) {
      return "PAN Card number format is invalid. Please enter in format: AAAAA0000A";
    }
    if (message.includes('gst')) {
      return "GST number format is invalid. Please enter in format: 22AAAAA0000A1Z5";
    }
    if (message.includes('aadhar')) {
      return "Aadhar number format is invalid. Please enter exactly 12 digits";
    }
    if (message.includes('email')) {
      return "Email format is invalid. Please enter a valid email address";
    }
    if (message.includes('mobile') || message.includes('phone')) {
      return "Mobile number format is invalid. Please enter exactly 10 digits";
    }
  }
  
  // Handle required field errors
  if (message.includes('required') || message.includes('mandatory')) {
    return errorMessage.replace(/is required|required/gi, 'is mandatory and cannot be left empty');
  }
  
  // Handle length validation errors
  if (message.includes('too short') || message.includes('minimum length')) {
    return errorMessage.replace(/too short|minimum length/gi, 'does not meet the minimum length requirement');
  }
  
  // Handle file upload errors
  if (message.includes('file') && (message.includes('size') || message.includes('large'))) {
    return "File size is too large. Please upload a file smaller than 5MB";
  }
  
  if (message.includes('file') && (message.includes('type') || message.includes('format'))) {
    return "File type not supported. Please upload a JPG, PNG, or PDF file";
  }
  
  // Handle network/server errors
  if (message.includes('network') || message.includes('connection')) {
    return "Network connection issue. Please check your internet connection and try again";
  }
  
  if (message.includes('server') || message.includes('internal')) {
    return "Server is temporarily unavailable. Please try again in a few moments";
  }
  
  // Handle permission errors
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return "You don't have permission to perform this action. Please contact your administrator";
  }
  
  // Handle timeout errors
  if (message.includes('timeout') || message.includes('expired')) {
    return "Request timed out. Please try again";
  }
  
  // Return original message if no specific pattern matches, but capitalize first letter
  return errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
};

const getFieldLabel = (fieldName) => {
  const fieldLabels = {
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'business_name': 'Business Name',
    'business_address': 'Business Address',
    'gst_number': 'GST Number',
    'pan_card_no': 'PAN Card Number',
    'adhar_no': 'Aadhar Number',
    'mobile_number': 'Mobile Number',
    'alternate_no': 'Alternate Number',
    'email': 'Email Address',
    'profile_photo': 'Profile Photo',
    'aadhar_front_photo_upload': 'Aadhar Front Photo',
    'aadhar_back_photo_upload': 'Aadhar Back Photo',
    'pan_card_photo_upload': 'PAN Card Photo'
  };
  
  return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const VendorProfile = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:1337";

  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const fileInputRef = useRef(null);
  const aadharFrontInputRef = useRef(null);
  const aadharBackInputRef = useRef(null);
  const panCardInputRef = useRef(null);

  // File states for uploads
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [aadharFrontFile, setAadharFrontFile] = useState(null);
  const [aadharBackFile, setAadharBackFile] = useState(null);
  const [panCardFile, setPanCardFile] = useState(null);

  // Preview states for documents
  const [aadharFrontPreview, setAadharFrontPreview] = useState("");
  const [aadharBackPreview, setAadharBackPreview] = useState("");
  const [panCardPreview, setPanCardPreview] = useState("");

  // Upload status tracking - tracks if documents have been uploaded from frontend
  const [documentsUploaded, setDocumentsUploaded] = useState({
    aadharFront: false,
    aadharBack: false,
    panCard: false,
  });

  // Track which documents are saved to backend (permanent)
  const [documentsSavedToBackend, setDocumentsSavedToBackend] = useState({
    aadharFront: false,
    aadharBack: false,
    panCard: false,
  });

  // Initialize vendorData from Redux state or empty defaults
  const [vendorData, setVendorData] = useState({
    vendor_id: "",
    first_name: "",
    last_name: "",
    business_name: "",
    business_address: "",
    gst_number: "",
    pan_card_no: "",
    adhar_no: "",
    mobile_number: "",
    alternate_no: "",
    email: "",
    aadhar_front_photo_upload: "",
    aadhar_back_photo_upload: "",
    pan_card_photo_upload: "",
    profile_photo: "",
  });

  // Fetch vendor profile on component mount - always fetch fresh data
  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(`${baseURL}/api/auth/vendor/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          let errorMessage = "Failed to fetch vendor profile";
          
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = formatProfessionalError(errorData.message);
            } else if (errorData.error) {
              errorMessage = formatProfessionalError(errorData.error);
            }
          } catch {
            // Handle different status codes with meaningful messages
            switch (response.status) {
              case 401:
                errorMessage = "Session expired. Please log in again.";
                break;
              case 403:
                errorMessage = "Access denied. Please contact support.";
                break;
              case 404:
                errorMessage = "Vendor profile not found. Please contact support.";
                break;
              case 500:
                errorMessage = "Server error. Please try again later.";
                break;
              default:
                errorMessage = `Unable to load profile (Error ${response.status}). Please try again.`;
            }
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const profileData = data.data;

        // Handle profile image URL - if it's a relative path, prepend baseURL
        let profileImageUrl = profileData.profile_photo || "";
        if (profileImageUrl && !profileImageUrl.startsWith("http")) {
          profileImageUrl = `${baseURL}/${profileImageUrl}`;
        }

        // Handle document preview URLs from backend (for saved documents)
        let aadharFrontUrl = profileData.aadhar_front_photo_upload || "";
        if (aadharFrontUrl && !aadharFrontUrl.startsWith("http")) {
          aadharFrontUrl = `${baseURL}/${aadharFrontUrl}`;
        }

        let aadharBackUrl = profileData.aadhar_back_photo_upload || "";
        if (aadharBackUrl && !aadharBackUrl.startsWith("http")) {
          aadharBackUrl = `${baseURL}/${aadharBackUrl}`;
        }

        let panCardUrl = profileData.pan_card_photo_upload || "";
        if (panCardUrl && !panCardUrl.startsWith("http")) {
          panCardUrl = `${baseURL}/${panCardUrl}`;
        }

        // Update local state with backend data
        setVendorData(profileData);
        setProfileImage(profileImageUrl);

        // Set document previews and upload status from backend
        if (aadharFrontUrl) {
          setAadharFrontPreview(aadharFrontUrl);
          setDocumentsUploaded((prev) => ({ ...prev, aadharFront: true }));
          setDocumentsSavedToBackend((prev) => ({
            ...prev,
            aadharFront: true,
          }));
        }
        if (aadharBackUrl) {
          setAadharBackPreview(aadharBackUrl);
          setDocumentsUploaded((prev) => ({ ...prev, aadharBack: true }));
          setDocumentsSavedToBackend((prev) => ({ ...prev, aadharBack: true }));
        }
        if (panCardUrl) {
          setPanCardPreview(panCardUrl);
          setDocumentsUploaded((prev) => ({ ...prev, panCard: true }));
          setDocumentsSavedToBackend((prev) => ({ ...prev, panCard: true }));
        }

        // Check if profile is complete
        const requiredFields = [
          "first_name",
          "last_name",
          "business_name",
          "business_address",
          "gst_number",
          "pan_card_no",
          "adhar_no",
          "alternate_no",
        ];
        const isComplete = requiredFields.every(
          (field) => profileData[field] && profileData[field].trim() !== ""
        ) && aadharFrontUrl && aadharBackUrl && panCardUrl && profileImageUrl;
        setIsProfileComplete(isComplete);

        // Store in Redux - this will update header immediately
        dispatch(setVendorProfile(profileData));
      } catch (error) {
        setNotification({
          message: `Failed to load profile data: ${error.message}`,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchVendorProfile();
  }, [token, dispatch, baseURL]);

  // Enhanced validation function with specific field validation
  const validateFields = () => {
    const requiredFields = [
      { field: "first_name", label: "First Name", minLength: 2 },
      { field: "last_name", label: "Last Name", minLength: 2 },
      { field: "business_name", label: "Business Name", minLength: 3 },
      { field: "business_address", label: "Business Address", minLength: 10 },
      { field: "gst_number", label: "GST Number", pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/ },
      { field: "pan_card_no", label: "PAN Card Number", pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ },
      { field: "adhar_no", label: "Aadhar Number", pattern: /^[0-9]{12}$/ },
      { field: "alternate_no", label: "Alternate Number", pattern: /^[0-9]{10}$/ },
    ];

    const errors = [];

    // Validate required fields
    requiredFields.forEach(({ field, label, minLength, pattern }) => {
      const value = vendorData[field];
      
      if (!value || value.trim() === "") {
        errors.push(`${label} is required`);
        return;
      }

      if (minLength && value.trim().length < minLength) {
        errors.push(`${label} must be at least ${minLength} characters long`);
        return;
      }

      if (pattern && !pattern.test(value.trim())) {
        switch (field) {
          case "gst_number":
            errors.push(`${label} format is invalid. Expected format: 22AAAAA0000A1Z5`);
            break;
          case "pan_card_no":
            errors.push(`${label} format is invalid. Expected format: AAAAA0000A`);
            break;
          case "adhar_no":
            errors.push(`${label} must be exactly 12 digits`);
            break;
          case "alternate_no":
            errors.push(`${label} must be exactly 10 digits`);
            break;
          default:
            errors.push(`${label} format is invalid`);
        }
      }
    });

    // Validate email format if provided
    if (vendorData.email && vendorData.email.trim() !== "") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(vendorData.email.trim())) {
        errors.push("Email format is invalid");
      }
    }

    // Validate documents
    const missingDocuments = [];
    if (!documentsUploaded.aadharFront) missingDocuments.push("Aadhar Front Photo");
    if (!documentsUploaded.aadharBack) missingDocuments.push("Aadhar Back Photo");
    if (!documentsUploaded.panCard) missingDocuments.push("PAN Card Photo");
    if (!profileImageFile && !profileImage) missingDocuments.push("Profile Photo");

    if (missingDocuments.length > 0) {
      errors.push(`Missing documents: ${missingDocuments.join(", ")}`);
    }

    return { 
      isValid: errors.length === 0, 
      errors: errors 
    };
  };

  const handleEdit = () => setEditing(true);

  const handleSave = async () => {
    // Validate fields before saving
    const { isValid, errors } = validateFields();

    if (!isValid) {
      setNotification({
        message: errors.join(". "),
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("first_name", vendorData.first_name || "");
      formData.append("last_name", vendorData.last_name || "");
      formData.append("business_name", vendorData.business_name || "");
      formData.append("business_address", vendorData.business_address || "");
      formData.append("gst_number", vendorData.gst_number || "");
      formData.append("pan_card_no", vendorData.pan_card_no || "");
      formData.append("adhar_no", vendorData.adhar_no || "");
      formData.append("mobile_number", vendorData.mobile_number || "");
      formData.append("alternate_no", vendorData.alternate_no || "");
      formData.append("email", vendorData.email || "");

      // Append file uploads if they exist
      if (profileImageFile) {
        formData.append("profile_photo", profileImageFile);
      }
      if (aadharFrontFile) {
        formData.append("aadhar_front_photo_upload", aadharFrontFile);
      }
      if (aadharBackFile) {
        formData.append("aadhar_back_photo_upload", aadharBackFile);
      }
      if (panCardFile) {
        formData.append("pan_card_photo_upload", panCardFile);
      }

      const updateUrl = `${baseURL}/api/auth/vendor/${vendorData.vendor_id}`;

      const response = await fetch(updateUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to update vendor profile";
        
        try {
          const errorData = await response.json();
          
          // Handle different types of error responses
          if (errorData.message) {
            errorMessage = formatProfessionalError(errorData.message);
          } else if (errorData.error) {
            errorMessage = formatProfessionalError(errorData.error);
          } else if (errorData.errors) {
            // Handle validation errors array
            if (Array.isArray(errorData.errors)) {
              const fieldErrors = errorData.errors.map(err => {
                if (err.field && err.message) {
                  return `${err.field}: ${formatProfessionalError(err.message)}`;
                }
                return formatProfessionalError(err.message || err);
              });
              errorMessage = fieldErrors.join('. ');
            } else if (typeof errorData.errors === 'object') {
              // Handle validation errors object
              const fieldErrors = Object.entries(errorData.errors).map(([field, message]) => {
                const fieldLabel = getFieldLabel(field);
                const formattedMessage = Array.isArray(message) ? message.join(', ') : message;
                return `${fieldLabel}: ${formatProfessionalError(formattedMessage)}`;
              });
              errorMessage = fieldErrors.join('. ');
            }
          }
        } catch {
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await response.text();
            if (errorText && errorText.trim() !== '') {
              errorMessage = formatProfessionalError(errorText);
            }
          } catch {
            // Fall back to status-based error messages
            switch (response.status) {
              case 400:
                errorMessage = "Invalid data provided. Please check all fields and try again.";
                break;
              case 401:
                errorMessage = "Authentication failed. Please log in again.";
                break;
              case 403:
                errorMessage = "You don't have permission to perform this action.";
                break;
              case 404:
                errorMessage = "Vendor profile not found. Please contact support.";
                break;
              case 409:
                errorMessage = "Data conflict detected. Some information you entered may already exist in our system.";
                break;
              case 422:
                errorMessage = "Data validation failed. Please check your input and try again.";
                break;
              case 500:
                errorMessage = "Server error occurred. Please try again later.";
                break;
              default:
                errorMessage = `Update failed with status ${response.status}. Please try again.`;
            }
          }
        }
        
        throw new Error(errorMessage);
      }

      const updatedData = await response.json();

      // Clear file states after successful upload
      setProfileImageFile(null);
      setAadharFrontFile(null);
      setAadharBackFile(null);
      setPanCardFile(null);

      // Update local state with fresh data from response
      const newProfileData =
        updatedData.data || updatedData.vendor || updatedData;
      setVendorData(newProfileData);

      // Handle updated profile image URL
      let updatedProfileImageUrl = newProfileData.profile_photo || "";
      if (
        updatedProfileImageUrl &&
        !updatedProfileImageUrl.startsWith("http")
      ) {
        updatedProfileImageUrl = `${baseURL}/${updatedProfileImageUrl}`;
      }
      setProfileImage(updatedProfileImageUrl);

      // Handle updated document URLs and set upload status
      let updatedAadharFrontUrl =
        newProfileData.aadhar_front_photo_upload || "";
      if (updatedAadharFrontUrl && !updatedAadharFrontUrl.startsWith("http")) {
        updatedAadharFrontUrl = `${baseURL}/${updatedAadharFrontUrl}`;
      }
      if (updatedAadharFrontUrl) {
        setAadharFrontPreview(updatedAadharFrontUrl);
        setDocumentsUploaded((prev) => ({ ...prev, aadharFront: true }));
        setDocumentsSavedToBackend((prev) => ({ ...prev, aadharFront: true }));
      }

      let updatedAadharBackUrl = newProfileData.aadhar_back_photo_upload || "";
      if (updatedAadharBackUrl && !updatedAadharBackUrl.startsWith("http")) {
        updatedAadharBackUrl = `${baseURL}/${updatedAadharBackUrl}`;
      }
      if (updatedAadharBackUrl) {
        setAadharBackPreview(updatedAadharBackUrl);
        setDocumentsUploaded((prev) => ({ ...prev, aadharBack: true }));
        setDocumentsSavedToBackend((prev) => ({ ...prev, aadharBack: true }));
      }

      let updatedPanCardUrl = newProfileData.pan_card_photo_upload || "";
      if (updatedPanCardUrl && !updatedPanCardUrl.startsWith("http")) {
        updatedPanCardUrl = `${baseURL}/${updatedPanCardUrl}`;
      }
      if (updatedPanCardUrl) {
        setPanCardPreview(updatedPanCardUrl);
        setDocumentsUploaded((prev) => ({ ...prev, panCard: true }));
        setDocumentsSavedToBackend((prev) => ({ ...prev, panCard: true }));
      }

      // Update Redux store - this will immediately update header
      dispatch(setVendorProfile(newProfileData));

      setIsProfileComplete(true);
      setNotification({
        message: "Profile updated successfully.",
        type: "success",
      });
      setEditing(false);
    } catch (error) {
      setNotification({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setVendorData({ ...vendorData, [field]: value });
  };

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAadharFrontChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAadharFrontFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAadharFrontPreview(event.target.result);
      setDocumentsUploaded((prev) => ({ ...prev, aadharFront: true }));
    };
    reader.readAsDataURL(file);
  };

  const handleAadharBackChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAadharBackFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAadharBackPreview(event.target.result);
      setDocumentsUploaded((prev) => ({ ...prev, aadharBack: true }));
    };
    reader.readAsDataURL(file);
  };

  const handlePanCardChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPanCardFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPanCardPreview(event.target.result);
      setDocumentsUploaded((prev) => ({ ...prev, panCard: true }));
    };
    reader.readAsDataURL(file);
  };

  // Delete functions for unsaved documents
  const handleDeleteAadharFront = () => {
    setAadharFrontFile(null);
    setAadharFrontPreview("");
    setDocumentsUploaded((prev) => ({ ...prev, aadharFront: false }));
    if (aadharFrontInputRef.current) {
      aadharFrontInputRef.current.value = "";
    }
  };

  const handleDeleteAadharBack = () => {
    setAadharBackFile(null);
    setAadharBackPreview("");
    setDocumentsUploaded((prev) => ({ ...prev, aadharBack: false }));
    if (aadharBackInputRef.current) {
      aadharBackInputRef.current.value = "";
    }
  };

  const handleDeletePanCard = () => {
    setPanCardFile(null);
    setPanCardPreview("");
    setDocumentsUploaded((prev) => ({ ...prev, panCard: false }));
    if (panCardInputRef.current) {
      panCardInputRef.current.value = "";
    }
  };

  const handleRequestAlteration = () => {
    setIsModalOpen(true);
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      setNotification({
        message: "Please enter a detailed query describing the changes you need before submitting your request.",
        type: "error",
      });
      return;
    }

    if (query.trim().length < 10) {
      setNotification({
        message: "Please provide a more detailed description of the changes you need (minimum 10 characters).",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/api/auth/vendor/request-alteration`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to submit alteration request";
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = formatProfessionalError(errorData.message);
          } else if (errorData.error) {
            errorMessage = formatProfessionalError(errorData.error);
          }
        } catch {
          // Handle different status codes with meaningful messages
          switch (response.status) {
            case 400:
              errorMessage = "Invalid request. Please check your query and try again.";
              break;
            case 401:
              errorMessage = "Session expired. Please log in again.";
              break;
            case 403:
              errorMessage = "Access denied. You don't have permission to make this request.";
              break;
            case 429:
              errorMessage = "Too many requests. Please wait and try again later.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = `Request failed (Error ${response.status}). Please try again.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      setNotification({
        message: "Your alteration request has been submitted successfully. Our team will review your request and contact you within 2-3 business days.",
        type: "success",
      });
      setIsModalOpen(false);
      setQuery("");
    } catch (error) {
      setNotification({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-3xl px-2 py-6 mt-8 bg-white border border-gray-100 shadow-lg rounded-xl sm:px-4 md:px-8">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 sm:text-3xl sm:mb-8">
          Vendor Profile
        </h2>
        {loading && (
          <div className="mb-4 text-center">
            <span className="text-blue-600">Loading profile data...</span>
          </div>
        )}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Left column - Profile image and edit button */}
          <div className="relative w-full max-w-sm p-4 mx-auto mb-6 text-center shadow-sm bg-gradient-to-b from-blue-50 to-white sm:p-6 rounded-xl lg:mb-0 sm:max-w-md lg:max-w-xl lg:mx-0 lg:mr-10">
            <div className="mb-2 text-sm font-medium text-gray-700">
              Profile Photo
              {editing && <span className="text-red-500">*</span>}
            </div>
            <div className="relative flex items-center justify-center mx-auto overflow-hidden transition-transform border-4 border-blue-500 rounded-full shadow-md cursor-pointer w-28 h-28 sm:w-32 sm:h-32 hover:scale-105">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                  <span className="text-3xl font-semibold text-white sm:text-4xl">
                    {vendorData.first_name
                      ? vendorData.first_name.charAt(0).toUpperCase()
                      : "V"}
                  </span>
                </div>
              )}
              {editing && (
                <div
                  className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-2.5 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg hover:scale-110"
                  onClick={handleImageClick}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
              required={editing}
            />
            {editing && (
              <button
                onClick={handleImageClick}
                className="mt-4 sm:mt-6 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-full shadow-md hover:scale-105"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Change Photo"}
              </button>
            )}
          </div>

          {/* Right column - Vendor details */}
          <div className="p-4 bg-white border border-gray-100 shadow-sm lg:col-span-3 rounded-xl sm:p-6">
            <div className="flex flex-wrap items-center justify-end gap-3 mb-4 sm:mb-6">
              {!editing ? (
                isProfileComplete ? (
                  <button
                    onClick={handleRequestAlteration}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-sm bg-purple-500 hover:bg-purple-600 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Request Alteration"}
                  </button>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-sm bg-amber-500 hover:bg-amber-600 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Update Profile"}
                  </button>
                )
              ) : (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-sm bg-emerald-500 hover:bg-emerald-600 hover:scale-105"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
              <ProfileField
                label="Vendor ID"
                value={vendorData.vendor_id}
                field="vendor_id"
                editable={false}
                editing={editing}
                onChange={handleInputChange}
              />
              <ProfileField
                label="First Name"
                value={vendorData.first_name}
                field="first_name"
                editable={true}
                editing={editing}
                onChange={handleInputChange}
                required={true}
              />
              <ProfileField
                label="Last Name"
                value={vendorData.last_name}
                field="last_name"
                editable={true}
                editing={editing}
                onChange={handleInputChange}
                required={true}
              />
              <ProfileField
                label="Business Name"
                value={vendorData.business_name}
                field="business_name"
                editable={true}
                editing={editing}
                onChange={handleInputChange}
                required={true}
              />
              <ProfileField
                label="Email"
                value={vendorData.email}
                field="email"
                editable={false}
                editing={editing}
                onChange={handleInputChange}
              />
              <ProfileField
                label="Mobile Number"
                value={vendorData.mobile_number}
                field="mobile_number"
                editable={false}
                editing={editing}
                onChange={handleInputChange}
              />
              <ProfileField
                label="Alternate Number"
                value={vendorData.alternate_no}
                field="alternate_no"
                editable={true}
                editing={editing}
                onChange={handleInputChange}
                required={true}
              />
              <ProfileField
                label="Business Address"
                value={vendorData.business_address}
                field="business_address"
                editable={true}
                editing={editing}
                onChange={handleInputChange}
                required={true}
              />
              <ProfileField
                label="GST Number"
                value={vendorData.gst_number}
                field="gst_number"
                editable={true}
                editing={editing}
                onChange={handleInputChange}
                required={true}
              />
              <ProfileField
                label="Aadhar Number"
                value={vendorData.adhar_no}
                field="adhar_no"
                editable={true}
                editing={editing}
                onChange={handleInputChange}
                required={true}
              />
              <ProfileField
                label="PAN Card Number"
                value={vendorData.pan_card_no}
                field="pan_card_no"
                editable={true}
                editing={editing}
                onChange={handleInputChange}
                required={true}
              />

              {/* Document Management Section */}
              <div className="md:col-span-2">
                <h3 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b">
                  Document Management
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Aadhar Front Photo */}
                  <div className="flex flex-col items-center">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Aadhar Front Photo
                      {editing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative w-full">
                      {documentsUploaded.aadharFront && aadharFrontPreview ? (
                        <div className="relative group">
                          <img
                            src={aadharFrontPreview}
                            alt="Aadhar Front"
                            className="w-full h-32 object-cover border-2 border-green-300 rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium bg-green-600 px-2 py-1 rounded">
                              {documentsSavedToBackend.aadharFront
                                ? "✓ Saved to Backend"
                                : "✓ Ready to Save"}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 bg-green-600 rounded-full p-1">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          {editing && !documentsSavedToBackend.aadharFront && (
                            <button
                              onClick={handleDeleteAadharFront}
                              className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 rounded-full p-1 transition-colors shadow-lg"
                              title="Delete document"
                            >
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div
                          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() =>
                            editing && aadharFrontInputRef.current?.click()
                          }
                        >
                          {editing ? (
                            <>
                              <svg
                                className="w-8 h-8 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Click to Upload
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No document uploaded
                            </span>
                          )}
                        </div>
                      )}
                      <input
                        type="file"
                        ref={aadharFrontInputRef}
                        onChange={handleAadharFrontChange}
                        className="hidden"
                        accept="image/*"
                        required={editing}
                      />
                    </div>
                  </div>

                  {/* Aadhar Back Photo */}
                  <div className="flex flex-col items-center">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Aadhar Back Photo
                      {editing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative w-full">
                      {documentsUploaded.aadharBack && aadharBackPreview ? (
                        <div className="relative group">
                          <img
                            src={aadharBackPreview}
                            alt="Aadhar Back"
                            className="w-full h-32 object-cover border-2 border-green-300 rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium bg-green-600 px-2 py-1 rounded">
                              {documentsSavedToBackend.aadharBack
                                ? "✓ Saved to Backend"
                                : "✓ Ready to Save"}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 bg-green-600 rounded-full p-1">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          {editing && !documentsSavedToBackend.aadharBack && (
                            <button
                              onClick={handleDeleteAadharBack}
                              className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 rounded-full p-1 transition-colors shadow-lg"
                              title="Delete document"
                            >
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div
                          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() =>
                            editing && aadharBackInputRef.current?.click()
                          }
                        >
                          {editing ? (
                            <>
                              <svg
                                className="w-8 h-8 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Click to Upload
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No document uploaded
                            </span>
                          )}
                        </div>
                      )}
                      <input
                        type="file"
                        ref={aadharBackInputRef}
                        onChange={handleAadharBackChange}
                        className="hidden"
                        accept="image/*"
                        required={editing}
                      />
                    </div>
                  </div>

                  {/* PAN Card Photo */}
                  <div className="flex flex-col items-center">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      PAN Card Photo
                      {editing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative w-full">
                      {documentsUploaded.panCard && panCardPreview ? (
                        <div className="relative group">
                          <img
                            src={panCardPreview}
                            alt="PAN Card"
                            className="w-full h-32 object-cover border-2 border-green-300 rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium bg-green-600 px-2 py-1 rounded">
                              {documentsSavedToBackend.panCard
                                ? "✓ Saved to Backend"
                                : "✓ Ready to Save"}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 bg-green-600 rounded-full p-1">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          {editing && !documentsSavedToBackend.panCard && (
                            <button
                              onClick={handleDeletePanCard}
                              className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 rounded-full p-1 transition-colors shadow-lg"
                              title="Delete document"
                            >
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div
                          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() =>
                            editing && panCardInputRef.current?.click()
                          }
                        >
                          {editing ? (
                            <>
                              <svg
                                className="w-8 h-8 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Click to Upload
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No document uploaded
                            </span>
                          )}
                        </div>
                      )}
                      <input
                        type="file"
                        ref={panCardInputRef}
                        onChange={handlePanCardChange}
                        className="hidden"
                        accept="image/*"
                        required={editing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Assigned DC Centers Section */}
            <div className="p-4 mt-6 bg-gray-50 border rounded-lg md:col-span-2">
              <h3 className="text-lg font-semibold mb-3">
                Assigned DC Centers
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Sakinaka DC - KBDC1</li>
                <li>Vasai DC - KBDC2</li>
                <li>Bhiwandi DC - KBDC3</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Request Alteration */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Profile Alteration</h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              rows="5"
              placeholder="Enter your query or reason for alteration..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleQuerySubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Display */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

// Helper component for profile fields with validation
const ProfileField = ({
  label,
  value,
  field,
  editable = false,
  editing = false,
  onChange,
  required = false,
}) => {
  const [fieldError, setFieldError] = useState("");

  const validateField = (fieldValue) => {
    if (!fieldValue || fieldValue.trim() === "") {
      if (required) {
        setFieldError(`${label} is required`);
        return false;
      }
      setFieldError("");
      return true;
    }

    // Field-specific validation
    switch (field) {
      case "first_name":
      case "last_name":
        if (fieldValue.trim().length < 2) {
          setFieldError(`${label} must be at least 2 characters long`);
          return false;
        }
        break;
      case "business_name":
        if (fieldValue.trim().length < 3) {
          setFieldError(`${label} must be at least 3 characters long`);
          return false;
        }
        break;
      case "business_address":
        if (fieldValue.trim().length < 10) {
          setFieldError(`${label} must be at least 10 characters long`);
          return false;
        }
        break;
      case "gst_number":
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(fieldValue.trim())) {
          setFieldError(`${label} format is invalid. Expected: 22AAAAA0000A1Z5`);
          return false;
        }
        break;
      case "pan_card_no":
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(fieldValue.trim())) {
          setFieldError(`${label} format is invalid. Expected: AAAAA0000A`);
          return false;
        }
        break;
      case "adhar_no":
        if (!/^[0-9]{12}$/.test(fieldValue.trim())) {
          setFieldError(`${label} must be exactly 12 digits`);
          return false;
        }
        break;
      case "alternate_no":
        if (!/^[0-9]{10}$/.test(fieldValue.trim())) {
          setFieldError(`${label} must be exactly 10 digits`);
          return false;
        }
        break;
      case "email":
        if (fieldValue.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue.trim())) {
          setFieldError(`${label} format is invalid`);
          return false;
        }
        break;
    }

    setFieldError("");
    return true;
  };

  const handleFieldChange = (newValue) => {
    onChange(field, newValue);
    if (editing) {
      // Debounce validation to avoid too frequent updates
      setTimeout(() => validateField(newValue), 300);
    }
  };

  return (
    <div className="p-3 mb-4 transition-colors border border-gray-100 rounded-lg shadow-sm bg-gray-50 hover:border-gray-200">
      <div className="mb-1 text-sm text-gray-500">
        {label}
        {editing && required && <span className="text-red-500">*</span>}
      </div>
      {editable && editing ? (
        <>
          <input
            className={`w-full p-2 transition-all bg-white border-b-2 rounded focus:outline-none focus:ring-2 ${
              fieldError 
                ? 'border-red-400 focus:ring-red-300' 
                : 'border-yellow-400 focus:ring-yellow-300'
            }`}
            value={value}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder={`Enter ${label}`}
            required={required}
          />
          {fieldError && (
            <div className="mt-1 text-xs text-red-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fieldError}
            </div>
          )}
        </>
      ) : (
        <div className="font-medium text-gray-800 p-1 min-h-[28px]">
          {value || (
            <span className="italic text-gray-400">Enter your details</span>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorProfile;