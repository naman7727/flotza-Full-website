import { useState, useEffect, useRef } from 'react';
import { FiX, FiChevronDown } from 'react-icons/fi';

const WalletTopUp = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [requests, setRequests] = useState([]);
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    screenshot: null,
    selectedBankId: '',
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });
  const [showFullImage, setShowFullImage] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch bank details and recharge requests on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchBanks(); // Fetch banks first
      await fetchRequests(); // Then fetch requests
    };
    loadData();
  }, []);

  const fetchBanks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/wallet-manager/banking-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) {
        console.error("Banking details endpoint not found");
        setBanks([]);
        return;
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch banking details");

      const bankList = data.data.map((bank) => ({
        id: bank.bank_id,
        name: bank.bank_name,
        accountName: bank.account_name,
        accountNumber: bank.account_number,
        ifscCode: bank.ifsc_code,
        upiId: bank.upi_id || '',
        qrCode: bank.qr_code_image || '',
        primaryStatus: bank.primary_status,
        status: bank.status,
      }));

      setBanks(bankList);
      const primaryBank = bankList.find((bank) => bank.primaryStatus && bank.status === 'Active') || bankList[0];
      setSelectedBank(primaryBank);
      setFormData((prev) => ({ ...prev, selectedBankId: primaryBank?.id || '' }));
    } catch (error) {
      console.error("Error fetching banks:", error);
      setSubmitMessage({ text: "Failed to fetch banking details.", type: 'error' });
      setTimeout(() => setSubmitMessage({ text: '', type: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/wallet-manager/manual-recharge-request-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) {
        console.error("Recharge requests endpoint not found");
        setRequests([]);
        return;
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch requests");

      const requestList = data.data.map((req) => ({
        id: req.request_id,
        date: req.updated_at || req.created_at,
        amount: req.amount,
        bankId: req.selected_bank_id,
        bankName: banks.find((bank) => bank.id === req.selected_bank_id)?.name || 'Unknown Bank',
        screenshot: req.screenshot || '',
        status: req.status.toLowerCase(),
        remarks: req.status_remark || '',
        transactionId: req.transaction_id || '',
      }));

      setRequests(requestList);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setSubmitMessage({ text: "Failed to fetch previous requests.", type: 'error' });
      setTimeout(() => setSubmitMessage({ text: '', type: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, screenshot: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.screenshot || !formData.selectedBankId) {
      setSubmitMessage({ text: "Please fill all required fields (Amount, Screenshot, Bank).", type: 'error' });
      setTimeout(() => setSubmitMessage({ text: '', type: '' }), 5000);
      return;
    }

    setIsLoading(true);
    const formPayload = new FormData();
    formPayload.append('amount', formData.amount);
    formPayload.append('selected_bank_id', formData.selectedBankId);
    formPayload.append('screenshot', formData.screenshot);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/wallet-manager/recharge-request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });
      if (res.status === 404) {
        throw new Error("Recharge request endpoint not found");
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to submit request");

      setSubmitMessage({ text: "Your payment request has been submitted successfully!", type: 'success' });
      setFormData({ amount: '', screenshot: null, selectedBankId: selectedBank?.id || '' });
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchRequests();
      setTimeout(() => setSubmitMessage({ text: '', type: '' }), 5000);
    } catch (error) {
      console.error("Error submitting request:", error);
      setSubmitMessage({ text: "Failed to submit payment request.", type: 'error' });
      setTimeout(() => setSubmitMessage({ text: '', type: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl);
    setShowFullImage(true);
  };

  const toggleBankDropdown = () => {
    setShowBankDropdown(!showBankDropdown);
  };

  const selectBank = (bank) => {
    setSelectedBank(bank);
    setFormData((prev) => ({ ...prev, selectedBankId: bank.id }));
    setShowBankDropdown(false);
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100 sm:px-6">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <div className="w-12 h-12 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
      <div className={`mx-auto bg-white rounded-xl shadow-md overflow-hidden ${showHistory ? 'max-w-6xl' : 'max-w-3xl'}`}>
        <div className="p-8">
          {!showHistory ? (
            <>
              <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Wallet Top-Up Request</h2>

              {submitMessage.text && (
                <div className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${
                  submitMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              <div className="flex flex-col gap-6 mb-6 md:flex-row">
                <div className="flex-1">
                  <p className="mb-2 text-center text-gray-600 md:text-left">Scan UPI QR Code to make payment:</p>
                  {selectedBank?.qrCode ? (
                    <img
                      src={selectedBank.qrCode}
                      alt="UPI QR Code"
                      className="object-cover w-48 h-48 mx-auto border border-gray-300 rounded-lg cursor-pointer md:mx-0"
                      onClick={() => handleImageClick(selectedBank.qrCode)}
                    />
                  ) : (
                    <p className="text-sm text-center text-gray-500 md:text-left">No QR Code available</p>
                  )}
                  <p className="mt-2 text-sm font-medium text-center text-gray-700 md:text-left">
                    UPI ID: {selectedBank?.upiId || 'Not available'}
                  </p>
                </div>

                <div className="flex-1">
                  <h3 className="mb-3 text-lg font-semibold text-gray-700">Bank Transfer</h3>
                  {selectedBank ? (
                    <div className="p-4 mb-3 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="font-medium">Bank Name:</span>
                        <span>{selectedBank.name}</span>
                        <span className="font-medium">Account Name:</span>
                        <span>{selectedBank.accountName}</span>
                        <span className="font-medium">Account Number:</span>
                        <span>{selectedBank.accountNumber}</span>
                        <span className="font-medium">IFSC Code:</span>
                        <span>{selectedBank.ifscCode}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 mb-3 text-center text-gray-500 rounded-lg bg-gray-50">
                      Select a bank to view details
                    </div>
                  )}
                  <div className="relative">
                    <button
                      onClick={toggleBankDropdown}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm transition bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      <span>{selectedBank ? selectedBank.name : 'Select a Bank'}</span>
                      <FiChevronDown className="ml-1" />
                    </button>
                    {showBankDropdown && (
                      <div className="absolute z-10 w-full mt-1 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                        {banks.filter(bank => bank.status === 'Active').map(bank => (
                          <div
                            key={bank.id}
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                            onClick={() => selectBank(bank)}
                          >
                            {bank.name} {bank.primaryStatus && '(Primary)'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Amount Paid (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Upload Payment Screenshot</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={isLoading}
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 mt-2 border border-gray-300 rounded-lg cursor-pointer"
                      onClick={() => handleImageClick(previewUrl)}
                    />
                  )}
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 font-medium text-white transition duration-300 bg-blue-600 rounded-md hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHistory(true)}
                    className="flex-1 px-4 py-3 font-medium text-white transition duration-300 bg-purple-600 rounded-md hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    View History
                  </button>
                </div>
              </form>
            </>
          ) : (
            <HistoryView
              requests={requests}
              banks={banks}
              onBack={() => setShowHistory(false)}
              onImageClick={handleImageClick}
            />
          )}
        </div>
      </div>

      {showFullImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 "
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-3xl max-h-[80vh] bg-white rounded-lg p-4">
            <button
              className="absolute p-2 text-white bg-gray-400 rounded-full top-2 right-2 hover:bg-gray-500"
              onClick={() => setShowFullImage(false)}
            >
              <FiX size={20} />
            </button>
            <img
              src={currentImage}
              alt="Full screenshot"
              className="w-full max-h-[75vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryView = ({ requests, banks, onBack, onImageClick }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Previous Requests</h3>
        <button
          onClick={onBack}
          className="p-1 text-gray-500 transition duration-200 rounded-full hover:text-gray-700 hover:bg-gray-100"
        >
          <FiX size={24} />
        </button>
      </div>

      {requests.length === 0 ? (
        <p className="py-4 text-center text-gray-500">No previous requests found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Request ID</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date | Time</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount (₹)</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Payment Method</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Screenshot</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Transaction ID</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{request.id}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(request.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">₹{request.amount}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{request.bankName}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {request.screenshot && (
                      <img
                        src={request.screenshot}
                        alt="Payment proof"
                        className="object-cover w-16 h-10 rounded cursor-pointer"
                        onClick={() => onImageClick(request.screenshot)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {request.transactionId || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{request.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WalletTopUp;