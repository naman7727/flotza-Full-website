import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const UpdateBanking = () => {
  const [accounts, setAccounts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [form, setForm] = useState({
    upiId: "",
    qrSrc: null,
    bankName: "",
    holder: "",
    accNum: "",
    ifsc: "",
    remarks: "",
    primaryStatus: false,
    active: true,
  });

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/wallet-manager/banking-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setAccounts(
          result.data.map((account) => ({
            bankId: account.bank_id,
            upiId: account.upi_id || "",
            qrSrc: account.qr_code_image || "",
            bankName: account.bank_name,
            holder: account.account_name,
            accNum: account.account_number,
            ifsc: account.ifsc_code,
            remarks: account.status_remark || "",
            additionDate: account.addition_date,
            primaryStatus: account.primary_status,
            active: account.status === "Active",
          }))
        );
      } else {
        throw new Error(result.message || "Failed to fetch accounts.");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      alert("An error occurred while fetching accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQR = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, qrSrc: file }));
  };

  const saveAccount = async () => {
    if (editIndex === null && (!form.bankName || !form.holder || !form.accNum || !form.ifsc)) {
      alert("Please fill all required fields (Bank Name, Account Holder, Account Number, IFSC).");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();

    if (editIndex !== null) {
      const currentAccount = accounts[editIndex];
      if (form.upiId !== currentAccount.upiId) formData.append("upi_id", form.upiId);
      if (form.bankName !== currentAccount.bankName) formData.append("bank_name", form.bankName);
      if (form.holder !== currentAccount.holder) formData.append("account_name", form.holder);
      if (form.accNum !== currentAccount.accNum) formData.append("account_number", form.accNum);
      if (form.ifsc !== currentAccount.ifsc) formData.append("ifsc_code", form.ifsc);
      if (form.remarks !== currentAccount.remarks) formData.append("status_remark", form.remarks);
      if (form.primaryStatus !== currentAccount.primaryStatus)
        formData.append("primary_status", form.primaryStatus);
      if (form.active !== currentAccount.active) formData.append("status", form.active ? "Active" : "Inactive");
      if (form.qrSrc && typeof form.qrSrc !== "string") formData.append("qr_code_image", form.qrSrc);
    } else {
      formData.append("upi_id", form.upiId);
      formData.append("bank_name", form.bankName);
      formData.append("account_name", form.holder);
      formData.append("account_number", form.accNum);
      formData.append("ifsc_code", form.ifsc);
      formData.append("status_remark", form.remarks);
      formData.append("primary_status", form.primaryStatus);
      formData.append("status", form.active ? "Active" : "Inactive");
      if (form.qrSrc && typeof form.qrSrc !== "string") formData.append("qr_code_image", form.qrSrc);
    }

    try {
      const token = localStorage.getItem("token");
      const url =
        editIndex !== null
          ? `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/banking-details/${accounts[editIndex].bankId}`
          : `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/banking-details`;
      const method = editIndex !== null ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        await fetchAccounts();
        closePopup();
      } else {
        alert(result.message || "Failed to save account.");
      }
    } catch (error) {
      console.error("Error saving account:", error);
      alert("An error occurred while saving the account.");
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setForm({
      upiId: "",
      qrSrc: null,
      bankName: "",
      holder: "",
      accNum: "",
      ifsc: "",
      remarks: "",
      primaryStatus: false,
      active: true,
    });
    setEditIndex(null);
    setShowPopup(false);
  };

  const editAccount = (index) => {
    setForm({
      upiId: accounts[index].upiId || "",
      qrSrc: accounts[index].qrSrc,
      bankName: accounts[index].bankName,
      holder: accounts[index].holder,
      accNum: accounts[index].accNum,
      ifsc: accounts[index].ifsc,
      remarks: accounts[index].remarks || "",
      primaryStatus: accounts[index].primaryStatus,
      active: accounts[index].active,
    });
    setEditIndex(index);
    setShowPopup(true);
  };

  const deleteAccount = async (index) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/banking-details/${accounts[index].bankId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (result.success) {
        await fetchAccounts();
      } else {
        alert(result.message || "Failed to delete account.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting the account.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (index) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("status", accounts[index].active ? "Inactive" : "Active");

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/banking-details/${accounts[index].bankId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const result = await response.json();
      if (result.success) {
        await fetchAccounts();
      } else {
        alert(result.message || "Failed to toggle active status.");
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
      alert("An error occurred while toggling active status.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrimary = async (index) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("primary_status", !accounts[index].primaryStatus);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/banking-details/${accounts[index].bankId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const result = await response.json();
      if (result.success) {
        await fetchAccounts();
      } else {
        alert(result.message || "Failed to toggle primary status.");
      }
    } catch (error) {
      console.error("Error toggling primary status:", error);
      alert("An error occurred while toggling primary status.");
    } finally {
      setIsLoading(false);
    }
  };

  const openImagePopup = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImagePopup(true);
  };

  const closeImagePopup = () => {
    setShowImagePopup(false);
    setSelectedImage("");
  };

  return (
    <div className="relative p-6 bg-white border border-green-200 rounded-md shadow-md">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <div className="w-12 h-12 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-green-700">Banking Details</h3>
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
          onClick={() => setShowPopup(true)}
          disabled={isLoading}
        >
          <FaPlus /> Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm italic text-gray-500">No accounts added yet.</p>
      ) : (
        <div className="grid gap-6">
          {accounts.map((acc, index) => (
            <div
              key={acc.bankId}
              className={`flex flex-col sm:flex-row gap-4 p-4 rounded-md border ${
                acc.active ? "border-green-500" : "border-gray-300"
              } bg-gray-50 relative`}
            >
              {/* Left Column: QR Code */}
              <div className="flex flex-col items-center sm:w-1/3">
                {acc.qrSrc ? (
                  <>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">QR Code</h4>
                    <img
                      src={acc.qrSrc}
                      alt="QR Code"
                      className="w-32 h-32 border border-gray-300 rounded-md cursor-pointer"
                      onClick={() => openImagePopup(acc.qrSrc)}
                    />
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No QR Code</p>
                )}
              </div>

              {/* Right Column: Banking Details */}
              <div className="sm:w-2/3">
                <h4 className="mb-3 text-sm font-bold">
                  {acc.bankName} ({acc.active ? "Active" : "Inactive"})
                  {acc.primaryStatus && " - Primary"}
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
                  <div>
                    <p><b>Bank Name:</b> {acc.bankName}</p>
                    <p><b>Account Holder:</b> {acc.holder}</p>
                    <p><b>Account Number:</b> {acc.accNum}</p>
                    <p><b>IFSC Code:</b> {acc.ifsc}</p>
                  </div>
                  <div>
                    {acc.upiId && <p><b>UPI ID:</b> {acc.upiId}</p>}
                    {acc.remarks && <p><b>Remarks:</b> {acc.remarks}</p>}
                    <p><b>Added On:</b> {new Date(acc.additionDate).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4 sm:mt-0 sm:absolute sm:top-2 sm:right-2">
                  <button
                    onClick={() => editAccount(index)}
                    className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                    disabled={isLoading}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => toggleActive(index)}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                      acc.active
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                    disabled={isLoading}
                  >
                    {acc.active ? (
                      <>
                        <FaTimes /> Deactivate
                      </>
                    ) : (
                      <>
                        <FaCheck /> Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => togglePrimary(index)}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                      acc.primaryStatus
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                    disabled={isLoading}
                  >
                    {acc.primaryStatus ? (
                      <>
                        <FaTimes /> Remove Primary
                      </>
                    ) : (
                      <>
                        <FaCheck /> Make Primary
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteAccount(index)}
                    className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                    disabled={isLoading}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup for Add/Edit Account */}
      {showPopup && (
        <>
          <div className="fixed inset-0 z-40 bg-white/70"></div>
          <div className="fixed z-50 w-full max-w-lg p-6 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg top-1/2 left-1/2">
            <h3 className="mb-4 text-lg font-semibold text-green-700">
              {editIndex !== null ? "Edit Account" : "Add New Account"}
            </h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  UPI ID
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={form.upiId}
                  onChange={handleInput}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                  placeholder="e.g. name@upi"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="qrInput"
                  className="inline-block px-4 py-2 mb-1 text-sm font-semibold text-white bg-green-600 rounded-md cursor-pointer select-none hover:bg-green-700"
                >
                  Upload QR Code
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="qrInput"
                  onChange={handleQR}
                  className="hidden"
                  disabled={isLoading}
                />
                {form.qrSrc && (
                  <img
                    src={typeof form.qrSrc === "string" ? form.qrSrc : URL.createObjectURL(form.qrSrc)}
                    alt="QR Preview"
                    className="w-24 h-24 mt-2 border border-gray-300 rounded-md"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleInput}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                  placeholder="e.g. Union Bank of India"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="holder"
                  value={form.holder}
                  onChange={handleInput}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                  placeholder="e.g. Kartbuddy L1"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accNum"
                  value={form.accNum}
                  onChange={handleInput}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                  placeholder="e.g. 78945612301236"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ifsc"
                  value={form.ifsc}
                  onChange={handleInput}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                  placeholder="e.g. UBIN6543110"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status Remark
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleInput}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                  placeholder="e.g. Manual remark"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Make Primary
                </label>
                <input
                  type="checkbox"
                  name="primaryStatus"
                  checked={form.primaryStatus}
                  onChange={(e) => setForm((prev) => ({ ...prev, primaryStatus: e.target.checked }))}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Active Status
                </label>
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={saveAccount}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                disabled={isLoading}
              >
                Save
              </button>
              <button
                onClick={closePopup}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-400 rounded-md hover:bg-gray-500"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Popup for QR Code Preview */}
      {showImagePopup && (
        <>
          <div className="fixed inset-0 z-40 bg-white/70"></div>
          <div className="fixed z-50 w-full max-w-3xl p-6 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg top-1/2 left-1/2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-700">QR Code Preview</h3>
              <button
                onClick={closeImagePopup}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-400 rounded-md hover:bg-gray-500"
                disabled={isLoading}
              >
                Close
              </button>
            </div>
            <img
              src={selectedImage}
              alt="QR Code Preview"
              className="w-full max-h-[70vh] object-contain rounded"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UpdateBanking;