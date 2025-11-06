import React, { useState, useEffect, useRef } from "react";
import { useGetAllOrdersQuery, useGetOrderByIdQuery } from "../../../../lib/api/apiSlice";
import {
  FaClipboardList,
  FaSearch,
  FaTruck,
  FaCamera,
  FaBox,
  FaFileInvoiceDollar,
  FaHistory,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaFileDownload,
  FaPaperPlane,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

// --- Reusable Helper Components (Unchanged) ---

// Section Component for displaying key-value pairs
const Section = ({ title, children }) => (
  <div className="mt-8">
    <div className="flex items-center gap-3 mb-4">
      <h5 className="text-xl font-bold text-blue-600 flex items-center gap-2">
        {title}
      </h5>
      <div className="flex-grow h-px bg-blue-100"></div>
    </div>
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      {children}
    </div>
  </div>
);

// DetailRow Component for consistent layout in Sections
const DetailRow = ({ label, value, isBadge = false, badgeClass = "" }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-3 rounded-lg transition-colors duration-200">
    <span className="font-semibold text-gray-700 mb-1 sm:mb-0">{label}:</span>
    {isBadge ? (
      <span className={`order-module ${badgeClass}`}>{value}</span>
    ) : (
      <span className="text-gray-600 font-medium text-right">{value || 'N/A'}</span>
    )}
  </div>
);

// PhotoUploader Component
const PhotoUploader = ({ title, allowUpload = true, uploadLabel = 'Upload Proof' }) => {
  const [proofs, setProofs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => { setShowModal(false); setSelectedFiles([]); };

  const handleStagingFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeStagingFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitFiles = () => {
    if (!selectedFiles.length) { closeModal(); return; }
    const newProofs = selectedFiles.map(file => ({
      src: URL.createObjectURL(file),
      name: file.name,
      type: file.type || ''
    }));
    setProofs(prev => [...prev, ...newProofs]);
    setSelectedFiles([]);
    setShowModal(false);
  };

  useEffect(() => {
    return () => {
      proofs.forEach(p => URL.revokeObjectURL(p.src));
    };
  }, [proofs]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h5 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          {title}
        </h5>
        <div className="flex-grow h-px bg-blue-100"></div>
      </div>
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[140px]">
        <div className="proof-box">
          {proofs.length === 0 ? (
            <div className="proof-placeholder">
              <FaCamera className="text-4xl text-gray-300 mb-2" />
              <p className="text-gray-500">Images/PDFs will be loaded from backend</p>
            </div>
          ) : (
            <div className="proof-scroll">
              {proofs.map((proof, index) => (
                <div key={index} className="thumb-container group">
                  {proof.type && proof.type.startsWith('image/') ? (
                    <img src={proof.src} alt={proof.name} className="thumb" onClick={() => window.open(proof.src, '_blank')} />
                  ) : (
                    <div className="thumb flex items-center justify-center text-sm text-gray-600" onClick={() => window.open(proof.src, '_blank')}>{proof.name}</div>
                  )}
                  <p className="text-xs text-gray-600 mt-1 truncate w-28" title={proof.name}>{proof.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {allowUpload && (
          <div className="flex justify-center mt-4">
            <button className="btn btn-primary btn-sm" onClick={openModal}>{uploadLabel}</button>
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Upload Files</h3>
            <input type="file" accept="image/*,application/pdf" multiple ref={fileInputRef} onChange={handleStagingFileChange} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow" type="button">Select Files</button>
            <div className="mt-4 flex flex-wrap gap-4">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="relative border rounded-lg p-2 w-28 text-center text-xs shadow bg-gray-50">
                  <img src={URL.createObjectURL(file)} alt={file.name} className="mx-auto max-h-20 object-cover rounded" />
                  <button onClick={() => removeStagingFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs shadow" type="button">×</button>
                  <p className="truncate mt-1" title={file.name}>{file.name}</p>
                </div>
              ))}
              {!selectedFiles.length && <p className="text-gray-500 text-sm">No files selected yet.</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={submitFiles} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow disabled:opacity-50" disabled={!selectedFiles.length} type="button">Submit</button>
              <button onClick={closeModal} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg" type="button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Order Management Component ---

function OrderManagementSystem() {
  const [searchQuery, setSearchQuery] = useState(""); // Current value in the search input
  const [activeSearchId, setActiveSearchId] = useState(""); // The order ID that has been submitted for search
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Fetch all orders for autocomplete suggestions. This is fetched once.
  const { 
    data: allOrders = [], 
    isLoading: isLoadingAllOrders, 
    error: allOrdersError 
  } = useGetAllOrdersQuery();

  // Fetch a specific order only when an activeSearchId is set.
  const { 
    data: searchedOrder, 
    isLoading: isLoadingSearchedOrder, 
    error: searchedOrderError 
  } = useGetOrderByIdQuery(activeSearchId, {
    skip: !activeSearchId, // Crucial: prevents fetching on component load
  });

  // --- Event Handlers ---

  // Update suggestions as user types and convert to uppercase
  const handleSearchChange = (e) => {
    const query = e.target.value.toUpperCase(); // Convert input to uppercase
    setSearchQuery(query);
    if (query.length > 0) {
      const filteredSuggestions = allOrders.filter(order => 
        order.order_id.toUpperCase().includes(query)
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Trigger the search for a specific order ID
  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    setActiveSearchId(searchQuery);
    setShowSuggestions(false);
  };
  
  // Handle clicking on a suggestion
  const handleSuggestionClick = (orderId) => {
    setSearchQuery(orderId);
    setActiveSearchId(orderId);
    setShowSuggestions(false);
  };

  // Clear the search and reset the view
  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearchId("");
    setShowSuggestions(false);
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // --- Helper Functions ---
  const getModuleClass = (module) => module?.toLowerCase() === "fixed" ? "fixed-module" : "dynamic-module";
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  // --- Render Logic ---

  // Overall loading state (initially for all orders)
  if (isLoadingAllOrders) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-6xl mx-auto text-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
        <p className="text-xl text-gray-600">Loading Order Data...</p>
      </div>
    );
  }

  // Handle error in fetching the initial list of orders
  if (allOrdersError) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-6xl mx-auto text-center">
        <FaExclamationTriangle className="text-4xl text-red-600 mx-auto mb-4" />
        <h3 className="text-xl text-red-600 font-semibold">Error Loading Initial Data</h3>
        <p className="text-gray-600">{allOrdersError.message || 'Failed to fetch order list for suggestions.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-6xl mx-auto">
      {/* --- Global Styles for this component --- */}
      <style>{`
        .order-module { font-weight: bold; padding: 3px 8px; border-radius: 5px; color: white; font-size: 0.75rem; }
        .fixed-module { background-color: #007bff; }
        .dynamic-module { background-color: #28a745; }
        .proof-box { height: 160px; width: 100%; box-sizing: border-box; overflow-x: hidden; overflow-y: hidden; display: block; }
        .proof-scroll { display: flex; align-items: center; gap: 12px; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; padding: 8px; min-width: 0; max-width: 100%; box-sizing: border-box; height: 100%; }
        .proof-scroll::-webkit-scrollbar { display: none; }
        .proof-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .proof-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6c757d; font-size: 14px; min-width: 0; width: 100%; box-sizing: border-box; }
        .thumb-container { position: relative; flex: 0 0 auto; width: 120px; box-sizing: border-box; min-width: 0; display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; }
        .thumb { width: 120px; height: 120px; object-fit: cover; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; transition: transform 0.2s; display:block; }
        .thumb:hover { transform: scale(1.05); }
        .btn { padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer; font-weight: 500; transition: background-color 0.2s; }
        .btn-primary { background-color: #007bff; color: white; }
        .btn-primary:hover { background-color: #0056b3; }
        .btn-success { background-color: #28a745; color: white; }
        .btn-success:hover { background-color: #1e7e34; }
        .btn-warning { background-color: #ffc107; color: black; }
        .btn-warning:hover { background-color: #d39e00; }
      `}</style>

      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Order Management System
      </h2>

      {/* Search Section with Autocomplete */}
      <div className="flex justify-center items-start gap-3 mb-8 max-w-2xl mx-auto" ref={searchContainerRef}>
        <div className="relative w-full">
            <input
              type="text"
              placeholder="Enter Order ID to search..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-80 overflow-y-auto shadow-lg">
                    {suggestions.map(order => (
                        <li 
                            key={order.id}
                            className="p-3 cursor-pointer hover:bg-sky-50 border-b last:border-b-0 transition-colors duration-150"
                            onClick={() => handleSuggestionClick(order.order_id)}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-blue-700 text-lg">{order.order_id}</h4>
                                <span className={`order-module ${getModuleClass(order.price_module_type)}`}>
                                    {order.price_module_type?.toUpperCase() || 'N/A'}
                                </span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
                                <p><strong className="font-semibold text-gray-800">Customer:</strong> {order.customer_snapshot?.full_name || 'N/A'}</p>
                                <p><strong className="font-semibold text-gray-800">ID:</strong> {order.customer_id || 'N/A'}</p>
                            </div>
                            <p className="text-right font-bold text-green-600 text-xl mt-2">
                                {formatCurrency(order.final_payable)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2 px-6 py-3"
          onClick={handleSearchSubmit}
          disabled={!searchQuery}
        >
          <FaSearch /> Search
        </button>
        {activeSearchId && (
          <button 
            className="btn btn-warning flex items-center gap-2 px-4 py-3"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        )}
      </div>

      {/* --- Conditional Content Display --- */}
      
      {/* Default View: No active search */}
      {!activeSearchId && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <FaSearch className="text-5xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Search for an Order</h3>
            <p className="text-gray-500 mt-2">Enter an Order ID in the search bar above to view its details.</p>
        </div>
      )}

      {/* Loading state for a specific searched order */}
      {activeSearchId && isLoadingSearchedOrder && (
         <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Fetching order details for "{activeSearchId}"...</p>
        </div>
      )}

      {/* Error state for a specific searched order */}
      {activeSearchId && !isLoadingSearchedOrder && (searchedOrderError || !searchedOrder) && (
        <div className="text-center py-12 bg-red-50 border border-red-200 rounded-xl">
            <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700">Order Not Found</h3>
            <p className="text-gray-600 mt-2">Could not find any details for Order ID "{activeSearchId}".</p>
            <p className="text-gray-500 text-sm mt-1">Please check the ID and try again.</p>
        </div>
      )}

      {/* Display Order Details ONLY when search is successful */}
      {activeSearchId && !isLoadingSearchedOrder && !searchedOrderError && searchedOrder && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 w-full">
            <>
              <div className="bg-blue-600 text-white text-2xl font-bold text-center py-3 rounded-xl mb-6 shadow-md">
                Order Details - {searchedOrder.order_id}
              </div>

              {/* Service Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {searchedOrder.express_delivery && (
                  <span className="text-white font-bold py-2 px-4 rounded" style={{ backgroundColor: 'rgb(37 153 24)' }}>EXPRESS</span>
                )}
                {searchedOrder.cod_collection && (
                  <span className="text-white font-bold py-2 px-4 rounded" style={{ backgroundColor: 'rgb(170 51 51)' }}>COD-{formatCurrency(searchedOrder.cod_amount)}</span>
                )}
                {searchedOrder.challan_return && (
                  <span className="text-white font-bold py-2 px-4 rounded" style={{ backgroundColor: 'rgb(172 101 0)' }}>CHALLAN RETURN</span>
                )}
              </div>

              {/* Order Information Section */}
              <Section title={<><FaClipboardList /> Order Information</>}>
                <DetailRow label="Order ID" value={searchedOrder.order_id} />
                <DetailRow label="Order Module" value={searchedOrder.price_module_type?.toUpperCase()} isBadge={true} badgeClass={getModuleClass(searchedOrder.price_module_type)} />
                <DetailRow label="Customer ID" value={searchedOrder.customer_id} />
                <DetailRow label="Customer Name" value={searchedOrder.customer_snapshot?.full_name} />
                <DetailRow label="Customer Mobile" value={searchedOrder.customer_snapshot?.mobile_number} />
                <DetailRow label="Customer Company" value={searchedOrder.customer_snapshot?.company_name} />
                <DetailRow label="Customer Address" value={searchedOrder.customer_snapshot?.full_address} />
                <DetailRow label="Current Hub" value={searchedOrder.current_hub || searchedOrder.hub} />
                <DetailRow label="Scheduled Date" value={formatDate(searchedOrder.schedule_date)} />
                <DetailRow label="Creation Date" value={formatDate(searchedOrder.order_creation_date)} />
                <DetailRow label="Order Status" value={searchedOrder.order_status?.toUpperCase()} />
                <DetailRow label="Last Updated" value={formatDate(searchedOrder.updated_at)} />
              </Section>

              {/* Shipper Details Section */}
              <Section title={<><FaTruck /> Shipper Details</>}>
                <DetailRow label="Place ID" value={searchedOrder.pickup_place_id} />
                <DetailRow label="Company Name" value={searchedOrder.pickup_snapshot?.company_name} />
                <DetailRow label="Contact Person" value={searchedOrder.pickup_snapshot?.contact_person} />
                <DetailRow label="Address" value={searchedOrder.pickup_snapshot?.address} />
                <DetailRow label="Contact Mobile" value={searchedOrder.pickup_snapshot?.contact_mobile} />
                <DetailRow label="Latitude" value={searchedOrder.pickup_latitude} />
                <DetailRow label="Longitude" value={searchedOrder.pickup_longitude} />
                <DetailRow label="Pickup Time" value={searchedOrder.preferred_pickup_time} />
                <DetailRow label="Pickup Note" value={searchedOrder.pickup_note} />
              </Section>

              {/* Photo Uploaders */}
              <PhotoUploader title={<><FaPaperPlane /> Customer Challan</>} allowUpload={false} />
              <PhotoUploader title={<><FaCamera /> Proof of Pick-up</>} uploadLabel="Add Manual POP" />

              {/* Consignee Details Section */}
              <Section title={<><FaBox /> Consignee Details</>}>
                <DetailRow label="Place ID" value={searchedOrder.drop_place_id} />
                <DetailRow label="Company Name" value={searchedOrder.drop_snapshot?.company_name} />
                <DetailRow label="Contact Person" value={searchedOrder.drop_snapshot?.contact_person} />
                <DetailRow label="Address" value={searchedOrder.drop_snapshot?.address} />
                <DetailRow label="Contact Mobile" value={searchedOrder.drop_snapshot?.contact_mobile} />
                <DetailRow label="Latitude" value={searchedOrder.drop_latitude} />
                <DetailRow label="Longitude" value={searchedOrder.drop_longitude} />
                <DetailRow label="Closing Time" value={searchedOrder.consignee_closing_time} />
                <DetailRow label="Drop Note" value={searchedOrder.drop_note} />
              </Section>

              {/* More Photo Uploaders */}
              <PhotoUploader title={<><FaCamera /> Proof of Delivery</>} uploadLabel="Add Manual POD" />
              <PhotoUploader title={<><FaPaperPlane /> POD Challan</>} uploadLabel="Add Manual POD Challan" />

              {/* Dimensions Section */}
              {searchedOrder.dimensions && searchedOrder.dimensions.length > 0 && (
                <div className="mt-8">
                  <h5 className="text-xl font-bold text-blue-600 flex items-center gap-2 mb-4"><FaBox /> Dimensions</h5>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full text-sm text-left text-gray-700 min-w-[900px]">
                      <thead className="bg-gray-100 text-gray-800 uppercase text-xs">
                        <tr>
                          {["#", "Length (cm)", "Breadth (cm)", "Height (cm)", "Units", "Per Unit Wt (kg)", "Total Wt (kg)", "Total Volume (cm³)", "Charge/Unit"].map((head) => (
                            <th key={head} className="px-4 py-3 font-semibold whitespace-nowrap">{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {searchedOrder.dimensions.map((dim, index) => (
                          <tr key={index} className="bg-white border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{index + 1}</td>
                            <td className="px-4 py-3">{dim.length}</td>
                            <td className="px-4 py-3">{dim.breadth}</td>
                            <td className="px-4 py-3">{dim.height}</td>
                            <td className="px-4 py-3">{dim.units}</td>
                            <td className="px-4 py-3">{parseFloat(dim.perUnitWeight || 0).toFixed(2)}</td>
                            <td className="px-4 py-3">{parseFloat(dim.totalWeight || 0).toFixed(2)}</td>
                            <td className="px-4 py-3">{parseInt(dim.totalVolume || 0).toLocaleString()}</td>
                            <td className="px-4 py-3">{formatCurrency(dim.charges)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-200 font-bold text-gray-800">
                        <tr>
                          <td colSpan="4" className="px-4 py-3 text-right">TOTAL</td>
                          <td className="px-4 py-3">{searchedOrder.total_units}</td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3">{parseFloat(searchedOrder.total_gross_weight || 0).toFixed(2)}</td>
                          <td className="px-4 py-3">{parseInt(searchedOrder.total_volume || 0).toLocaleString()}</td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Shipment Summary Section */}
              <Section title={<><FaFileInvoiceDollar /> Shipment Summary</>}>
                <DetailRow label="Commodity" value={searchedOrder.commodity?.join(', ')} />
                <DetailRow label="Total Units" value={`${searchedOrder.total_units} Units`} />
                <DetailRow label="Total Gross Weight" value={`${searchedOrder.total_gross_weight} KG`} />
                <DetailRow label="Total Volumetric Weight" value={`${searchedOrder.total_vol_weight} KG`} />
                <DetailRow label="Total Volume" value={`${searchedOrder.total_volume} cm³`} />
                <DetailRow label="Chargeable Weight" value={`${searchedOrder.chargeable_weight} KG`} />
                <DetailRow label="Transport Charges" value={formatCurrency(searchedOrder.transportation_charges)} />
                {searchedOrder.applied_coupon && <DetailRow label="Applied Coupon" value={searchedOrder.applied_coupon} />}
                {searchedOrder.coupon_discount > 0 && <DetailRow label="Coupon Discount" value={`-${formatCurrency(searchedOrder.coupon_discount)}`} />}
                {searchedOrder.express_delivery && <DetailRow label="Express Charges" value={formatCurrency(searchedOrder.express_charges)} />}
                {searchedOrder.challan_return && <DetailRow label="Challan Return Charges" value={formatCurrency(searchedOrder.challan_charges)} />}
                {searchedOrder.cod_collection && <DetailRow label="COD Charges" value={formatCurrency(searchedOrder.cod_charges)} />}
                <DetailRow label="Pre-Tax Amount" value={formatCurrency(searchedOrder.pre_tax_amount)} />
                <DetailRow label={`GST (${searchedOrder.gst_percentage}%)`} value={formatCurrency(searchedOrder.gst_amount)} />
                <DetailRow label="Final Payable" value={<span className="text-xl font-bold text-green-600">{formatCurrency(searchedOrder.final_payable)}</span>} />
              </Section>

              {/* Order History Section */}
              <div className="mt-8">
                <h5 className="text-xl font-bold text-blue-600 flex items-center gap-2 mb-4"><FaHistory /> Order History</h5>
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 text-gray-800 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 font-semibold flex items-center gap-2"><FaCalendarAlt /> Date</th>
                        <th className="px-4 py-3 font-semibold"><FaClock className="inline mr-1" /> Time</th>
                        <th className="px-4 py-3 font-semibold">Activity</th>
                        <th className="px-4 py-3 font-semibold"><FaUser className="inline mr-1" /> Activity By</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{formatDate(searchedOrder.order_creation_date).split(',')[0]}</td>
                        <td className="px-4 py-3">{formatDate(searchedOrder.order_creation_date).split(',')[1]}</td>
                        <td className="px-4 py-3">Order Created</td>
                        <td className="px-4 py-3">Customer ({searchedOrder.customer_id})</td>
                      </tr>
                      {searchedOrder.last_updated_by && (
                        <tr className="bg-white border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{formatDate(searchedOrder.updated_at).split(',')[0]}</td>
                          <td className="px-4 py-3">{formatDate(searchedOrder.updated_at).split(',')[1]}</td>
                          <td className="px-4 py-3">Order Updated</td>
                          <td className="px-4 py-3">{searchedOrder.last_updated_by}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-center items-center gap-4 mt-8">
                <button className="btn btn-success flex items-center gap-2 px-6 py-3"><FaFileDownload /> Download Invoice</button>
              </div>
            </>
        </div>
      )}
    </div>
  );
}

export default OrderManagementSystem;
