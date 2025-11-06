import React, { useState, useRef, useEffect, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  useGetMeQuery, 
  useUpdateProfileMutation, 
  useChangePasswordMutation 
} from "../../../lib/api/apiSlice";
import { updateUser } from "../../../lib/auth/authSlice";

// Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const borderColor = type === "success" ? "border-green-400" : "border-red-400";
  const textColor = type === "success" ? "text-green-700" : "text-red-700";
  const title = type === "success" ? "Success!" : "Error!";

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed top-4 right-4 ${bgColor} ${borderColor} ${textColor} px-4 py-3 rounded z-50 shadow-lg`}
      role="alert"
    >
      <div className="flex items-center">
        {type === "success" ? (
          <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        <strong>{title}</strong>
      </div>
      <p className="mt-1 text-sm">{message}</p>
    </motion.div>
  );
};

const UserProfile = (props) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  const { 
    data: profileData, 
    isLoading: isProfileLoading, 
    error: profileError 
  } = useGetMeQuery(undefined, {
    skip: !token,
  });
  
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const outletContext = useOutletContext();
  const updateUserSession = props.updateUserSession || (outletContext && outletContext.updateUserSession);
  const initialData = Object.keys(props.initialData || {}).length > 0 ? props.initialData : profileData || {};
  const isAdmin = props.isAdmin || false;

  const [editing, setEditing] = useState(false);
  const [showAccessPopup, setShowAccessPopup] = useState(false);
  const [showFixedPriceOptions, setShowFixedPriceOptions] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const normalizedInitialData = {
    userId: initialData.customer_id || initialData.userId || "",
    appRole: initialData.app_role || initialData.appRole || "customer",
    firstName: initialData.first_name || initialData.firstName || "",
    lastName: initialData.last_name || initialData.lastName || "",
    mobileNumber: initialData.mobile_number || initialData.mobileNumber || "",
    altMobileNumber: initialData.alternate_number || initialData.altMobileNumber || "",
    emailId: initialData.email || initialData.emailId || "",
    companyName: initialData.company_name || initialData.companyName || "",
    firstLineAddress: initialData.first_line_address || initialData.firstLineAddress || "",
    secondLineAddress: initialData.second_line_address || initialData.secondLineAddress || "",
    state: initialData.state || "",
    city: initialData.city || "",
    pincode: initialData.pin_code || initialData.pinCode || initialData.pincode || "",
    gstNo: initialData.gst_no || initialData.gstNo || "",
    adhaarNo: initialData.adhar_no || initialData.adhaarNo || "",
    panCardNo: initialData.pan_card_no || initialData.panNo || initialData.panCardNo || "",
    walletBalance: initialData.wallet_balance || initialData.walletBalance || "0",
    referralCode: initialData.referral_code || initialData.referralCode || "",
    referenceCode: initialData.reference_code || initialData.referenceCode || "",
    registrationDate: initialData.created_at || initialData.accountDate || "",
    status: initialData.status || "Under review",
    statusRemark: initialData.status_remarks || initialData.statusRemark || "",
    updatedAt: initialData.updated_at || initialData.lastUpdated || "",
    profileImage: initialData.profile_picture ? 
      (initialData.profile_picture.startsWith('http') ? 
        initialData.profile_picture : 
        `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${initialData.profile_picture}`) 
      : "",
    adharFrontPhoto: initialData.adhar_front_photo ? 
      (initialData.adhar_front_photo.startsWith('http') ? 
        initialData.adhar_front_photo : 
        `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${initialData.adhar_front_photo}`) 
      : "",
    adharBackPhoto: initialData.adhar_back_photo ? 
      (initialData.adhar_back_photo.startsWith('http') ? 
        initialData.adhar_back_photo : 
        `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${initialData.adhar_back_photo}`) 
      : "",
    panCardPhoto: initialData.pan_card_photo ? 
      (initialData.pan_card_photo.startsWith('http') ? 
        initialData.pan_card_photo : 
        `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${initialData.pan_card_photo}`) 
      : "",
  };

  const [userData, setUserData] = useState(normalizedInitialData);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirmPassword: "",
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [adharFrontPhotoFile, setAdharFrontPhotoFile] = useState(null);
  const [adharBackPhotoFile, setAdharBackPhotoFile] = useState(null);
  const [panCardPhotoFile, setPanCardPhotoFile] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profileData) {
      const normalized = {
        userId: profileData.customer_id || "",
        appRole: profileData.app_role || "customer",
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        mobileNumber: profileData.mobile_number || "",
        altMobileNumber: profileData.alternate_number || "",
        emailId: profileData.email || "",
        companyName: profileData.company_name || "",
        firstLineAddress: profileData.first_line_address || "",
        secondLineAddress: profileData.second_line_address || "",
        state: profileData.state || "",
        city: profileData.city || "",
        pincode: profileData.pin_code || "",
        gstNo: profileData.gst_no || "",
        adhaarNo: profileData.adhar_no || "",
        panCardNo: profileData.pan_card_no || "",
        walletBalance: profileData.wallet_balance || "0",
        referralCode: profileData.referral_code || "",
        referenceCode: profileData.reference_code || "",
        registrationDate: profileData.created_at || "",
        status: profileData.status || "Under review",
        statusRemark: profileData.status_remarks || "",
        updatedAt: profileData.updated_at || "",
        profileImage: profileData.profile_picture ? 
          (profileData.profile_picture.startsWith('http') ? 
            profileData.profile_picture : 
            `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${profileData.profile_picture}`) 
          : "",
        adharFrontPhoto: profileData.adhar_front_photo ? 
          (profileData.adhar_front_photo.startsWith('http') ? 
            profileData.adhar_front_photo : 
            `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${profileData.adhar_front_photo}`) 
          : "",
        adharBackPhoto: profileData.adhar_back_photo ? 
          (profileData.adhar_back_photo.startsWith('http') ? 
            profileData.adhar_back_photo : 
            `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${profileData.adhar_back_photo}`) 
          : "",
        panCardPhoto: profileData.pan_card_photo ? 
          (profileData.pan_card_photo.startsWith('http') ? 
            profileData.pan_card_photo : 
            `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${profileData.pan_card_photo}`) 
          : "",
      };
      setUserData(normalized);
      dispatch(updateUser(normalized));
    }
  }, [profileData, dispatch]);

  const username = `${userData.firstName} ${userData.lastName}`.trim() || "Not provided";
  const loading = isProfileLoading || isUpdating || isChangingPassword;

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleUsernameChange = (value) => {
    const [firstName, ...lastNameParts] = value.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';
    setUserData(prev => ({
      ...prev,
      firstName: firstName || '',
      lastName,
    }));
  };

  const handleSave = async () => {
    try {
      if (!userData.firstName) {
        throw new Error('First name is required.');
      }

      const currentUserId = userData.userId;
      if (!currentUserId) {
        throw new Error('User ID not available. Profile update cannot proceed.');
      }

      const profileData = {
        first_name: userData.firstName,
        last_name: userData.lastName || '',
        company_name: userData.companyName || '',
        pan_card_no: userData.panCardNo || '',
        reference_code: userData.referralCode || '',
        alternate_number: userData.altMobileNumber || '',
        first_line_address: userData.firstLineAddress || '',
        second_line_address: userData.secondLineAddress || '',
        state: userData.state || '',
        city: userData.city || '',
        pin_code: userData.pincode || '',
        gst_no: userData.gstNo || '',
        adhar_no: userData.adhaarNo || '',
        adhar_front_photo: adharFrontPhotoFile,
        adhar_back_photo: adharBackPhotoFile,
        pan_card_photo: panCardPhotoFile,
        profile_picture: profilePictureFile,
      };

      console.log('UserProfile: Sending update request with:', {
        userId: currentUserId,
        profileData: { ...profileData, profile_picture: profilePictureFile ? 'FILE_OBJECT' : null }
      });

      const result = await updateProfile({ 
        userId: currentUserId, 
        profileData 
      }).unwrap();


      showNotification('Your profile has been updated successfully.', 'success');

      if (result) {
        
        const updatedUser = {
          userId: result.customer_id || currentUserId,
          firstName: result.first_name || userData.firstName,
          profileImage: result.profile_picture ? 
            (result.profile_picture.startsWith('http') ? 
              result.profile_picture : 
              `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${result.profile_picture}`) 
            : userData.profileImage,
          adharFrontPhoto: result.adhar_front_photo ? 
            (result.adhar_front_photo.startsWith('http') ? 
              result.adhar_front_photo : 
              `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${result.adhar_front_photo}`) 
            : userData.adharFrontPhoto,
          adharBackPhoto: result.adhar_back_photo ? 
            (result.adhar_back_photo.startsWith('http') ? 
              result.adhar_back_photo : 
              `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${result.adhar_back_photo}`) 
            : userData.adharBackPhoto,
          panCardPhoto: result.pan_card_photo ? 
            (result.pan_card_photo.startsWith('http') ? 
              result.pan_card_photo : 
              `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${result.pan_card_photo}`) 
            : userData.panCardPhoto,
          gstNo: userData.gstNo,
          firstLineAddress: result.first_line_address || userData.firstLineAddress,
          secondLineAddress: result.second_line_address || userData.secondLineAddress,
          state: result.state || userData.state,
          city: result.city || userData.city,
          pincode: result.pin_code || userData.pincode,
          adhaarNo: result.adhar_no || userData.adhaarNo,
          panCardNo: result.pan_card_no || userData.panCardNo,
          referralCode: result.referral_code || userData.referralCode,
          appRole: result.app_role || userData.appRole,
          walletBalance: result.wallet_balance || userData.walletBalance,
        };


        setUserData(updatedUser);
        dispatch(updateUser(updatedUser));

        if (updateUserSession) {
          updateUserSession(updatedUser);
        }
      } 

      setProfilePictureFile(null);
      setAdharFrontPhotoFile(null);
      setAdharBackPhotoFile(null);
      setPanCardPhotoFile(null);
      
      setEditing(false);
    } catch (error) {
      showNotification(error.message || 'Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirmPassword) {
        throw new Error("New password and confirm password do not match.");
      }
      if (passwordData.new_password.length < 8) {
        throw new Error("New password must be at least 8 characters long.");
      }

      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      }).unwrap();

      setShowChangePassword(false);
      setPasswordData({ 
        current_password: "", 
        new_password: "", 
        confirmPassword: "" 
      });
      showNotification('Password changed successfully.', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to change password', 'error');
    }
  };

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      
      // Update the profile picture file state
      setProfilePictureFile(file);
      
      // Create preview URL for immediate display
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserData(prev => ({ ...prev, profileImage: event.target.result }));
      };
      reader.readAsDataURL(file);
      
      // Create a temporary profile data object with the new file
      const currentUserId = userData.userId;
      if (!currentUserId) {
        showNotification('User ID not available. Profile update cannot proceed.', 'error');
        return;
      }

      const profileData = {
        first_name: userData.firstName,
        last_name: userData.lastName || '',
        company_name: userData.companyName || '',
        pan_card_no: userData.panCardNo || '',
        reference_code: userData.referralCode || '',
        alternate_number: userData.altMobileNumber || '',
        first_line_address: userData.firstLineAddress || '',
        second_line_address: userData.secondLineAddress || '',
        state: userData.state || '',
        city: userData.city || '',
        pin_code: userData.pincode || '',
        gst_no: userData.gstNo || '',
        adhar_no: userData.adhaarNo || '',
        adhar_front_photo: adharFrontPhotoFile,
        adhar_back_photo: adharBackPhotoFile,
        pan_card_photo: panCardPhotoFile,
        profile_picture: file, // Use the file directly
      };

      try {
        
        const result = await updateProfile({ 
          userId: currentUserId, 
          profileData 
        }).unwrap();


        if (result) {
          const updatedUser = {
            userId: result.customer_id || currentUserId,
            firstName: result.first_name || userData.firstName,
            lastName: result.last_name || userData.lastName,
            mobileNumber: result.mobile_number || userData.mobileNumber,
            emailId: result.email || userData.emailId,
            companyName: result.company_name || userData.companyName,
            gstNo: result.gst_no || userData.gstNo,
            firstLineAddress: result.first_line_address || userData.firstLineAddress,
            secondLineAddress: result.second_line_address || userData.secondLineAddress,
            state: result.state || userData.state,
            city: result.city || userData.city,
            pincode: result.pin_code || userData.pincode,
            adhaarNo: result.adhar_no || userData.adhaarNo,
            panCardNo: result.pan_card_no || userData.panCardNo,
            referralCode: result.referral_code || userData.referralCode,
            appRole: result.app_role || userData.appRole,
            walletBalance: result.wallet_balance || userData.walletBalance,
            profileImage: result.profile_picture ? 
              (result.profile_picture.startsWith('http') ? 
                result.profile_picture : 
                `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${result.profile_picture}`) 
              : userData.profileImage,
          };

          setUserData(updatedUser);
          dispatch(updateUser(updatedUser));

          if (updateUserSession) {
            updateUserSession(updatedUser);
          }

          showNotification('Profile picture updated successfully!', 'success');
        }

        // Clear the file state after successful upload
        setProfilePictureFile(null);
        
      } catch (error) {
        showNotification(error.message || 'Failed to upload profile picture', 'error');
        
        // Reset the preview on error
        setUserData(prev => ({ ...prev, profileImage: prev.profileImage }));
        setProfilePictureFile(null);
      }
    }
  };

  const handleFileChange = (setter, fileType) => async (e) => {
    const file = e.target.files[0];
    if (file) {
      
      // Update the file state
      setter(file);
      
      const currentUserId = userData.userId;
      if (!currentUserId) {
        showNotification('User ID not available. Profile update cannot proceed.', 'error');
        return;
      }

      const profileData = {
        first_name: userData.firstName,
        last_name: userData.lastName || '',
        company_name: userData.companyName || '',
        pan_card_no: userData.panCardNo || '',
        reference_code: userData.referralCode || '',
        alternate_number: userData.altMobileNumber || '',
        first_line_address: userData.firstLineAddress || '',
        second_line_address: userData.secondLineAddress || '',
        state: userData.state || '',
        city: userData.city || '',
        pin_code: userData.pincode || '',
        gst_no: userData.gstNo || '',
        adhar_no: userData.adhaarNo || '',
        adhar_front_photo: fileType === 'adhar_front_photo' ? file : adharFrontPhotoFile,
        adhar_back_photo: fileType === 'adhar_back_photo' ? file : adharBackPhotoFile,
        pan_card_photo: fileType === 'pan_card_photo' ? file : panCardPhotoFile,
        profile_picture: profilePictureFile,
      };

      try {
        
        const result = await updateProfile({ 
          userId: currentUserId, 
          profileData 
        }).unwrap();

        if (result) {
          const updatedUser = {
            userId: result.customer_id || currentUserId,
            firstName: result.first_name || userData.firstName,
            lastName: result.last_name || userData.lastName,
            mobileNumber: result.mobile_number || userData.mobileNumber,
            emailId: result.email || userData.emailId,
            companyName: result.company_name || userData.companyName,
            gstNo: result.gst_no || userData.gstNo,
            firstLineAddress: result.first_line_address || userData.firstLineAddress,
            secondLineAddress: result.second_line_address || userData.secondLineAddress,
            state: result.state || userData.state,
            city: result.city || userData.city,
            pincode: result.pin_code || userData.pincode,
            adhaarNo: result.adhar_no || userData.adhaarNo,
            panCardNo: result.pan_card_no || userData.panCardNo,
            referralCode: result.referral_code || userData.referralCode,
            appRole: result.app_role || userData.appRole,
            walletBalance: result.wallet_balance || userData.walletBalance,
            profileImage: result.profile_picture ? 
              (result.profile_picture.startsWith('http') ? 
                result.profile_picture : 
                `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${result.profile_picture}`) 
              : userData.profileImage,
            adharFrontPhoto: result.adhar_front_photo ? 
              (result.adhar_front_photo.startsWith('http') ? 
                result.adhar_front_photo : 
                `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${result.adhar_front_photo}`) 
              : userData.adharFrontPhoto,
            adharBackPhoto: result.adhar_back_photo ? 
              (result.adhar_back_photo.startsWith('http') ? 
                result.adhar_back_photo : 
                `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${result.adhar_back_photo}`) 
              : userData.adharBackPhoto,
            panCardPhoto: result.pan_card_photo ? 
              (result.pan_card_photo.startsWith('http') ? 
                result.pan_card_photo : 
                `${import.meta.env.VITE_BASE_URL || 'https://api.kartbuddy.in'}/${result.pan_card_photo}`) 
              : userData.panCardPhoto,
          };

          setUserData(updatedUser);
          dispatch(updateUser(updatedUser));

          if (updateUserSession) {
            updateUserSession(updatedUser);
          }

          showNotification(`${fileType.replace('_', ' ')} updated successfully!`, 'success');
        }
        
      } catch (error) {
        showNotification(error.message || `Failed to upload ${fileType.replace('_', ' ')}`, 'error');
        
        // Reset the file state on error
        setter(null);
      }
    }
  };

  const handleInvite = () => {
    const inviteLink = `${window.location.origin}/register?referral=${userData.referralCode}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => showNotification('Invite link copied to clipboard!', 'success'))
      .catch((err) => showNotification(`Failed to copy link: ${err.message}`, 'error'));
  };

  const toggleAccessPopup = () => setShowAccessPopup(!showAccessPopup);
  const toggleChangePassword = () => setShowChangePassword(!showChangePassword);

  return (
    <div className="container max-w-6xl px-4 py-6 mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-3xl font-bold text-center text-gray-800"
      >
        User Profile
      </motion.h2>

      {isProfileLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-16 h-16 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <span className="ml-4 text-lg text-gray-600">Loading profile...</span>
        </div>
      )}

      {profileError && !isProfileLoading && (
        <div className="p-4 mb-6 border-l-4 border-red-500 rounded-md bg-red-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-medium text-red-700">Failed to load profile data</p>
          </div>
          <p className="mt-1 text-sm text-red-600">
            {profileError?.data?.message || profileError?.message || 'Please try refreshing the page.'}
          </p>
        </div>
      )}

      {!isProfileLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl"
        >
          <div className="flex flex-col gap-8 p-8 lg:flex-row">
            <div className="flex-shrink-0 w-full p-6 text-center shadow-sm bg-gradient-to-b from-blue-50 to-white rounded-xl lg:w-1/4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative flex items-center justify-center w-40 h-40 mx-auto overflow-hidden border-4 border-blue-500 rounded-full shadow-md"
              >
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt="Profile Photo"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                    <span className="text-5xl font-semibold text-white">
                      {userData.firstName ? userData.firstName.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                )}
                {editing && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-2.5 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
                aria-label="Upload profile photo"
              />

              {editing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current.click()}
                  className="w-full px-5 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Change Photo'}
                </motion.button>
              )}
            </div>

            <div className="flex-1 p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div>
                  <label className="mb-1 text-sm text-gray-500" htmlFor="username-input">User Name</label>
                  <h3
                    id="username-input"
                    className={`text-2xl font-bold text-gray-800 ${editing && !userData.firstName ? 'border-b-2 border-red-400' : editing ? 'border-b-2 border-yellow-400 p-1 rounded bg-yellow-50' : ''}`}
                    contentEditable={editing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleUsernameChange(e.target.textContent)}
                    aria-label="User Name"
                  >
                    {username}
                  </h3>
                </div>

                <div className="flex gap-2 ml-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEdit}
                    className={`px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-amber-600 transition-colors ${editing ? 'hidden' : ''}`}
                    disabled={loading}
                  >
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className={`px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-emerald-600 transition-colors ${editing ? '' : 'hidden'}`}
                    disabled={loading}
                  >
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {loading ? 'Saving...' : 'Save'}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleChangePassword}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-purple-500 rounded-lg shadow-sm hover:bg-purple-600"
                    disabled={loading}
                  >
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 2-4 2-4 2 .896 2 2zm0 0c0 1.104-.896 2-2 2s-2-.896-2-2 2-4 2-4 2 .896 2 2zm0 0v6m6-6v6m-12 0h12" />
                      </svg>
                      Change Password
                    </span>
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ProfileField label="Customer ID" value={userData.userId} />
                <ProfileField
                  label="First Name"
                  value={userData.firstName}
                  field="firstName"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                  required={true}
                />
                <ProfileField
                  label="Last Name"
                  value={userData.lastName}
                  field="lastName"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                <ProfileField label="App Role" value={userData.appRole} />
                <ProfileField label="Mobile Number" value={userData.mobileNumber} />
                <ProfileField
                  label="Alternate Mobile Number"
                  value={userData.altMobileNumber}
                  field="altMobileNumber"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                <ProfileField label="Email ID" value={userData.emailId} />
                <ProfileField
                  label="Company Name"
                  value={userData.companyName}
                  field="companyName"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                <ProfileField
                  label="First Line Address"
                  value={userData.firstLineAddress}
                  field="firstLineAddress"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                <ProfileField
                  label="Second Line Address"
                  value={userData.secondLineAddress}
                  field="secondLineAddress"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                <ProfileField
                  label="State"
                  value={userData.state}
                  field="state"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                <ProfileField
                  label="City"
                  value={userData.city}
                  field="city"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                <ProfileField
                  label="Pincode"
                  value={userData.pincode}
                  field="pincode"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                <ProfileField
                  label="GST No."
                  value={userData.gstNo}
                  field="gstNo"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                <ProfileField
                  label="Aadhar No."
                  value={userData.adhaarNo}
                  field="adhaarNo"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                {/* Aadhar Front Photo */}
                <div className="mb-4">
                  <label htmlFor="adharFront" className="mb-2 text-sm font-medium text-gray-700">Aadhar Front Photo</label>
                  
                  {/* Preview Image */}
                  {(userData.adharFrontPhoto || adharFrontPhotoFile) && (
                    <div className="relative mb-3">
                      <img
                        src={adharFrontPhotoFile ? URL.createObjectURL(adharFrontPhotoFile) : userData.adharFrontPhoto}
                        alt="Aadhar Front Preview"
                        className="object-cover w-32 h-20 border-2 border-gray-300 rounded-lg shadow-sm"
                      />
                      {editing && (
                        <button
                          type="button"
                          onClick={() => {
                            setAdharFrontPhotoFile(null);
                            setUserData(prev => ({ ...prev, adharFrontPhoto: '' }));
                          }}
                          className="absolute flex items-center justify-center w-6 h-6 text-xs text-white transition-colors bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                  
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="adharFront"
                        onChange={handleFileChange(setAdharFrontPhotoFile, 'adhar_front_photo')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept="image/*"
                        disabled={loading}
                      />
                      {adharFrontPhotoFile && (
                        <p className="text-xs text-green-600">✓ Selected: {adharFrontPhotoFile.name}</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 border rounded-lg bg-gray-50">
                      {userData.adharFrontPhoto ? (
                        <p className="text-sm text-green-600">✓ Uploaded</p>
                      ) : (
                        <p className="text-sm italic text-gray-500">Not uploaded</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Aadhar Back Photo */}
                <div className="mb-4">
                  <label htmlFor="adharBack" className="mb-2 text-sm font-medium text-gray-700">Aadhar Back Photo</label>
                  
                  {/* Preview Image */}
                  {(userData.adharBackPhoto || adharBackPhotoFile) && (
                    <div className="relative mb-3">
                      <img
                        src={adharBackPhotoFile ? URL.createObjectURL(adharBackPhotoFile) : userData.adharBackPhoto}
                        alt="Aadhar Back Preview"
                        className="object-cover w-32 h-20 border-2 border-gray-300 rounded-lg shadow-sm"
                      />
                      {editing && (
                        <button
                          type="button"
                          onClick={() => {
                            setAdharBackPhotoFile(null);
                            setUserData(prev => ({ ...prev, adharBackPhoto: '' }));
                          }}
                          className="absolute flex items-center justify-center w-6 h-6 text-xs text-white transition-colors bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                  
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="adharBack"
                        onChange={handleFileChange(setAdharBackPhotoFile, 'adhar_back_photo')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept="image/*"
                        disabled={loading}
                      />
                      {adharBackPhotoFile && (
                        <p className="text-xs text-green-600">✓ Selected: {adharBackPhotoFile.name}</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 border rounded-lg bg-gray-50">
                      {userData.adharBackPhoto ? (
                        <p className="text-sm text-green-600">✓ Uploaded</p>
                      ) : (
                        <p className="text-sm italic text-gray-500">Not uploaded</p>
                      )}
                    </div>
                  )}
                </div>
                <ProfileField
                  label="PAN Card No."
                  value={userData.panCardNo}
                  field="panCardNo"
                  editable={true}
                  editing={editing}
                  onChange={handleInputChange}
                />
                {/* PAN Card Photo */}
                <div className="mb-4">
                  <label htmlFor="panCard" className="mb-2 text-sm font-medium text-gray-700">PAN Card Photo</label>
                  
                  {/* Preview Image */}
                  {(userData.panCardPhoto || panCardPhotoFile) && (
                    <div className="relative mb-3">
                      <img
                        src={panCardPhotoFile ? URL.createObjectURL(panCardPhotoFile) : userData.panCardPhoto}
                        alt="PAN Card Preview"
                        className="object-cover w-32 h-20 border-2 border-gray-300 rounded-lg shadow-sm"
                      />
                      {editing && (
                        <button
                          type="button"
                          onClick={() => {
                            setPanCardPhotoFile(null);
                            setUserData(prev => ({ ...prev, panCardPhoto: '' }));
                          }}
                          className="absolute flex items-center justify-center w-6 h-6 text-xs text-white transition-colors bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                  
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="panCard"
                        onChange={handleFileChange(setPanCardPhotoFile, 'pan_card_photo')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept="image/*"
                        disabled={loading}
                      />
                      {panCardPhotoFile && (
                        <p className="text-xs text-green-600">✓ Selected: {panCardPhotoFile.name}</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 border rounded-lg bg-gray-50">
                      {userData.panCardPhoto ? (
                        <p className="text-sm text-green-600">✓ Uploaded</p>
                      ) : (
                        <p className="text-sm italic text-gray-500">Not uploaded</p>
                      )}
                    </div>
                  )}
                </div>
                <ProfileField label="Wallet Balance" value={`₹${userData.walletBalance}`} />
                <ProfileField label="Referral Code" value={userData.referralCode} />
                <ProfileField label="Referred By" value={userData.referenceCode} />
                <ProfileField label="Registration Date" value={userData.registrationDate} />
                <ProfileField label="Status" value={userData.status} />
                {userData.statusRemark && (
                  <ProfileField label="Status Remark" value={userData.statusRemark} />
                )}
                <ProfileField label="Last Updated" value={userData.updatedAt} />
              </div>

              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInvite}
                  className="w-full px-5 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5-2z" />
                    </svg>
                    Invite via Referral Code
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showAccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && toggleAccessPopup()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-2xl rounded-xl"
            >
              <h4 className="pb-3 mb-6 text-xl font-bold text-gray-800 border-b">Manage Access</h4>
              <div className="p-4 mb-4 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 mr-3 text-blue-600 rounded form-checkbox focus:ring-blue-500"
                    disabled={!isAdmin}
                    aria-label="Rental Postpaid Access"
                  />
                  <div>
                    <span className="font-medium text-blue-800">Rental Postpaid Access</span>
                    <p className="mt-1 text-sm text-blue-600">Allow user to make postpaid rental transactions</p>
                  </div>
                </label>
              </div>
              <div className="p-4 mb-4 transition-colors rounded-lg bg-purple-50 hover:bg-purple-100">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 mr-3 text-purple-600 rounded form-checkbox focus:ring-purple-500"
                    checked={showFixedPriceOptions}
                    onChange={() => setShowFixedPriceOptions(!showFixedPriceOptions)}
                    disabled={!isAdmin}
                    aria-label="Fixed Price Module Access"
                  />
                  <div>
                    <span className="font-medium text-purple-800">Fixed Price Module Access</span>
                    <p className="mt-1 text-sm text-purple-600">Allow user to access fixed pricing options</p>
                  </div>
                </label>
              </div>
              <AnimatePresence>
                {showFixedPriceOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 pl-5 mt-4 ml-2 bg-white border-l-2 border-purple-300 rounded-lg shadow-sm"
                  >
                    <div className="mb-4">
                      <label htmlFor="cartonRate" className="block mb-2 text-sm font-medium text-gray-700">Carton Wise Rate:</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                        <input
                          type="text"
                          id="cartonRate"
                          className="pl-8 block w-full rounded-lg border border-gray-300 py-2.5 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all"
                          placeholder="Enter Rate"
                          disabled={!isAdmin || loading}
                          aria-label="Carton Wise Rate"
                        />
                      </div>
                    </div>
                    <div className="mb-2">
                      <label htmlFor="dimensionCapping" className="block mb-2 text-sm font-medium text-gray-700">Dimension & Weight Cappings:</label>
                      <textarea
                        id="dimensionCapping"
                        className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all min-h-[80px]"
                        placeholder="Enter dimension and weight limits"
                        disabled={!isAdmin || loading}
                        aria-label="Dimension and Weight Cappings"
                      ></textarea>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {isAdmin ? (
                <div className="flex justify-between mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={toggleAccessPopup}
                    className="px-5 py-2.5 bg-gray-500 text-white rounded-lg font-medium shadow-md hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </span>
                  </motion.button>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="p-4 mb-4 border-l-4 border-red-500 rounded-md bg-red-50" role="alert">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="font-medium text-red-700">Only administrators can modify access settings</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={toggleAccessPopup}
                    className="w-full px-5 py-2.5 bg-gray-500 text-white rounded-lg font-medium shadow-md hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Close
                    </span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChangePassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && toggleChangePassword()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-2xl rounded-xl"
            >
              <h4 className="pb-3 mb-6 text-xl font-bold text-gray-800 border-b">Change Password</h4>
              <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.current_password}
                    onChange={(e) => handlePasswordChange("current_password", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all"
                    placeholder="Enter current password"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.new_password}
                    onChange={(e) => handlePasswordChange("new_password", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all"
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all"
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-between mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={toggleChangePassword}
                    type="button"
                    className="px-5 py-2.5 bg-gray-500 text-white rounded-lg font-medium shadow-md hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {loading ? 'Saving...' : 'Save Password'}
                    </span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileField = ({ label, value: initialValue, field, editable = false, editing = false, onChange, required = false }) => {
  const [value, setValue] = useState(initialValue || "");
  const [focused, setFocused] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  const handleBlur = (e) => {
    setFocused(false);
    const newValue = e.target.textContent.trim();
    if (newValue !== value) {
      setValue(newValue);
      if (onChange) onChange(field, newValue);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    if (!value && contentRef.current) {
      contentRef.current.innerText = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      contentRef.current?.blur();
    }
  };

  return (
    <div className="p-3 mb-4 transition-colors border border-gray-100 rounded-lg shadow-sm bg-gray-50 hover:border-gray-200">
      <div className="mb-1 text-sm text-gray-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </div>
      {editable && editing ? (
        <div
          ref={contentRef}
          className={`border-b-2 ${required && !value ? 'border-red-400' : 'border-yellow-400'} p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all min-h-[1.5em]`}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyPress={handleKeyPress}
          aria-label={label}
          role="textbox"
          dangerouslySetInnerHTML={{ __html: !focused && !value ? '<span class="text-gray-400 italic">Enter your details</span>' : value }}
        />
      ) : (
        <div className="p-1 font-medium text-gray-800">
          {value || <span className="italic text-gray-400">Not provided</span>}
        </div>
      )}
    </div>
  );
};

export default UserProfile;