import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback
} from "react";

// Table headers with column search support
const tableHeaders = [
  { key: "select", label: "" },
  { key: "srNo", label: "Sr. No", searchable: true },
  { key: "orderId", label: "Order ID", searchable: true },
  { key: "tripId", label: "Trip ID", searchable: true },
  { key: "driver", label: "Driver Name-Number", searchable: true },
  { key: "scheduledDate", label: "Scheduled Date", searchable: true },
  { key: "senderNameNo", label: "Shipper Name-Number", searchable: true },
  { key: "senderAddress", label: "Pick Address", searchable: true },
  { key: "receiverName", label: "Consignee Name-Number", searchable: true },
  { key: "receiverAddress", label: "Drop Address", searchable: true },
  { key: "express", label: "Express", searchable: true },
  { key: "hub", label: "Base Hub", searchable: true },
  { key: "currentHub", label: "Current Hub", searchable: true },
  { key: "shipmentPosition", label: "Shipment Position", searchable: true },
  { key: "orderStatus", label: "Status", searchable: true },
  { key: "action", label: "Action" },
];

const OrderTable = forwardRef(({ 
  orders = [], 
  dcs = [], // New prop for delivery centers
  isFullscreen = false, 
  selectedHub = '', 
  selectedStatus = '',
  onHubChange = () => {},
  onStatusChange = () => {}
}, ref) => {
  const [isFullscreenState, setIsFullscreen] = useState(isFullscreen);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentHubFilter, setCurrentHubFilter] = useState(selectedHub);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [headers, setHeaders] = useState(tableHeaders);
  const [draggedItem, setDraggedItem] = useState(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeColumn, setResizeColumn] = useState(null);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const tableContainerRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "srNo", direction: "asc" });
  const [columnSearches, setColumnSearches] = useState({});
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
    pickedUp: 0
  });
  const containerRef = useRef(null);
  
  // FIXED: Use the orders directly without re-transformation
  useEffect(() => {
    console.log('OrderTable received orders:', orders);
    // Format the scheduled date properly
    const formattedData = orders.map((order) => ({
      ...order,
      scheduledDate: order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : 'N/A'
    }));
    console.log('OrderTable formatted data:', formattedData);
    setTableData(formattedData);
  }, [orders]);
  
  // Sync selectedHub and status filters with parent
  useEffect(() => {
    setCurrentHubFilter(selectedHub || 'all');
    setStatusFilter(selectedStatus || 'all');
  }, [selectedHub, selectedStatus]);
  
  const handleColumnSearch = (key, value) => {
    setColumnSearches(prev => ({ ...prev, [key]: value.toLowerCase() }));
  };
  
  const handleSort = (key) => {
    if (key === "select") return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const highlightSearch = (text, key) => {
    if (!text) return text;
    const searchValue = columnSearches[key];
    if (!searchValue) return text;
    const searchRegex = new RegExp(`(${searchValue})`, 'gi');
    return text.toString().split(searchRegex).map((part, i) => 
      part.toLowerCase() === searchValue.toLowerCase() ? 
        <span key={i} className="bg-yellow-200">{part}</span> : 
        part
    );
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    onStatusChange(status === 'all' ? '' : status);
  };
  
  const statusOptions = useMemo(() => {
    const statuses = new Set(['all', 'pending', 'picked up', 'in transit', 'delivered']);
    tableData.forEach(item => {
      if (item.orderStatus) statuses.add(item.orderStatus.toLowerCase());
    });
    return Array.from(statuses);
  }, [tableData]);
  
  const hubOptions = useMemo(() => {
    const hubs = new Set(['all']);
    dcs.forEach(dc => { if (dc.branch_name) hubs.add(dc.branch_name); });
    return Array.from(hubs);
  }, [dcs]);

  const finalFilteredData = useMemo(() => {
    return tableData.filter(item => {
      if (statusFilter !== 'all' && item.orderStatus?.toLowerCase() !== statusFilter) {
        return false;
      }
      if (currentHubFilter !== 'all' && item.currentHub !== currentHubFilter) {
        return false;
      }
      return Object.entries(columnSearches).every(([key, searchValue]) => {
        if (!searchValue) return true;
        const itemValue = item[key];
        return itemValue && itemValue.toString().toLowerCase().includes(searchValue);
      });
    });
  }, [tableData, statusFilter, currentHubFilter, columnSearches]);

  const sortedData = useMemo(() => {
    return [...finalFilteredData].sort((a, b) => {
      const { key, direction } = sortConfig;
      if (!a[key] || !b[key]) return 0;
      const valA = a[key].toString().toLowerCase();
      const valB = b[key].toString().toLowerCase();
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [finalFilteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfFirstRow + rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers;
  };

  const toggleSelectAll = () => {
    setSelectedRowIds(
      selectedRowIds.length === sortedData.length
        ? []
        : sortedData.map(item => item.orderId)
    );
  };

  const toggleRowSelect = (orderId) => {
    setSelectedRowIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  useImperativeHandle(ref, () => ({
    scrollToTop: () => containerRef.current?.scrollIntoView({ behavior: "smooth" }),
  }));

  useEffect(() => {
    const filteredForStats = currentHubFilter !== 'all'
      ? tableData.filter(order => order.currentHub === currentHubFilter)
      : tableData;
    
    setStats({
      totalOrders: filteredForStats.length,
      pending: filteredForStats.filter(o => o.orderStatus?.toLowerCase() === 'pending').length,
      inTransit: filteredForStats.filter(o => o.orderStatus?.toLowerCase() === 'in transit').length,
      delivered: filteredForStats.filter(o => o.orderStatus?.toLowerCase() === 'delivered').length,
      pickedUp: filteredForStats.filter(o => o.orderStatus?.toLowerCase() === 'picked up').length
    });
  }, [tableData, currentHubFilter]);

  // Column reordering and resizing handlers - simplified for now
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
  };

  const handleDragOver = (index) => (e) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const startResize = (e, columnKey) => {
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeColumn(columnKey);
    setResizeStartWidth(columnWidths[columnKey] || 150);
    e.stopPropagation();
  };

  const handleResize = useCallback((e) => {
    if (!isResizing || !resizeColumn) return;
    const diff = e.clientX - resizeStartX;
    const newWidth = Math.max(50, resizeStartWidth + diff);
    setColumnWidths(prev => ({ ...prev, [resizeColumn]: newWidth }));
  }, [isResizing, resizeStartX, resizeStartWidth, resizeColumn]);

  const stopResize = useCallback(() => {
    setIsResizing(false);
    setResizeColumn(null);
  }, []);
  
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', stopResize);
    }
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, handleResize, stopResize]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await tableContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className={`bg-gray-50 p-2 rounded ${isFullscreenState ? 'fixed inset-0 z-50 bg-white p-0 overflow-hidden' : ''}`}>
      <div
        ref={tableContainerRef}
        className={`border border-gray-200 rounded shadow ${
          isFullscreenState 
            ? 'fixed inset-0 z-50 bg-white m-0 rounded-none flex flex-col h-screen' 
            : 'relative bg-white mx-auto w-full max-w-full'
        }`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: isFullscreenState ? '100vh' : 'calc(100vh - 250px)',
          padding: isFullscreenState ? '1.5rem' : '0',
        }}
      >
        {/* Stats Cards */}
        <div className={`${isFullscreenState ? 'grid grid-cols-2 md:grid-cols-5 gap-3 mb-4' : 'grid grid-cols-2 md:grid-cols-5 gap-1.5 mb-2 p-2'}`}>
          {/* Total Orders */}
          <div className={`p-1.5 bg-white rounded-lg shadow-md cursor-pointer ${statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => handleStatusChange('all')}>
            <div className="text-xs text-gray-600">Total Orders</div>
            <div className="text-base font-bold text-gray-800">{stats.totalOrders}</div>
          </div>
          {/* Pending */}
          <div className={`p-1.5 bg-white rounded-lg shadow-md cursor-pointer ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`} onClick={() => handleStatusChange('pending')}>
            <div className="text-xs text-gray-600">Pending</div>
            <div className="text-base font-bold text-yellow-600">{stats.pending}</div>
          </div>
          {/* In Transit */}
          <div className={`p-1.5 bg-white rounded-lg shadow-md cursor-pointer ${statusFilter === 'in transit' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => handleStatusChange('in transit')}>
            <div className="text-xs text-gray-600">In Transit</div>
            <div className="text-base font-bold text-blue-600">{stats.inTransit}</div>
          </div>
          {/* Picked Up */}
          <div className={`p-1.5 bg-white rounded-lg shadow-md cursor-pointer ${statusFilter === 'picked up' ? 'ring-2 ring-purple-500' : ''}`} onClick={() => handleStatusChange('picked up')}>
            <div className="text-xs text-gray-600">Picked Up</div>
            <div className="text-base font-bold text-purple-600">{stats.pickedUp}</div>
          </div>
          {/* Delivered */}
          <div className={`p-1.5 bg-white rounded-lg shadow-md cursor-pointer ${statusFilter === 'delivered' ? 'ring-2 ring-green-500' : ''}`} onClick={() => handleStatusChange('delivered')}>
            <div className="text-xs text-gray-600">Delivered</div>
            <div className="text-base font-bold text-green-600">{stats.delivered}</div>
          </div>
        </div>
        
        {/* Table Controls */}
        <div className="bg-white p-1.5 rounded shadow mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)} className="p-1 border rounded text-xs h-7">
              {statusOptions.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
            </select>
            <select value={currentHubFilter} onChange={(e) => { setCurrentHubFilter(e.target.value); onHubChange(e.target.value === 'all' ? '' : e.target.value); }} className="p-1 border rounded text-xs h-7">
              {hubOptions.map(hub => <option key={hub} value={hub}>{hub === 'all' ? 'All Hubs' : hub}</option>)}
            </select>
            <button onClick={() => { setColumnSearches({}); setStatusFilter('all'); setCurrentHubFilter('all'); onHubChange(''); onStatusChange(''); }} className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs h-7">Clear All</button>
            <button onClick={toggleFullscreen} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center gap-1 ml-auto" title={isFullscreenState ? 'Exit Fullscreen' : 'Fullscreen'}>
              {isFullscreenState ? 'Exit' : 'Fullscreen'}
            </button>
          </div>
        </div>

        <div className="w-full flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="border-separate border-spacing-0 text-sm w-full" style={{ tableLayout: 'fixed' }}>
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {headers.map(({ key, label, searchable = false }, index) => (
                    <th key={key} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver(index)} onDragEnd={handleDragEnd} className={`relative group px-1 py-0.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b ${key === 'select' ? 'w-6' : ''}`} style={{ width: columnWidths[key] ? `${columnWidths[key]}px` : 'auto', cursor: 'move' }}>
                      <div className="flex flex-col">
                        <div className="font-medium flex items-center justify-between cursor-pointer" onClick={() => handleSort(key)}>
                          {key === "select" ? (<input type="checkbox" checked={selectedRowIds.length === sortedData.length && sortedData.length > 0} onChange={toggleSelectAll} className="h-4 w-4" />) : (<span>{label}{sortConfig.key === key && (sortConfig.direction === "asc" ? " ↑" : " ↓")}</span>)}
                        </div>
                        {searchable && <div className="mt-0.5"><input type="text" className="w-full px-1 py-0.5 border rounded text-xs" placeholder="..." value={columnSearches[key] || ''} onChange={(e) => handleColumnSearch(key, e.target.value)} /></div>}
                      </div>
                      <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300" onMouseDown={(e) => startResize(e, key)}></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr><td colSpan={headers.length} className="py-4 text-center text-gray-500">No orders found matching your criteria</td></tr>
                ) : (
                  currentRows.map((order) => (
                    <tr key={order.orderId} className={`border-b hover:bg-gray-50 ${selectedRowIds.includes(order.orderId) ? 'bg-blue-50' : ''}`}>
                      {headers.map((header) => {
                        const cellValue = order[header.key];
                        if (header.key === 'select') {
                          return <td key={header.key} className="px-2"><input type="checkbox" checked={selectedRowIds.includes(order.orderId)} onChange={() => toggleRowSelect(order.orderId)} className="h-4 w-4" /></td>;
                        }
                        if (header.key === 'action') {
                          return <td key={header.key} className="px-1"><button className="px-2 py-1 bg-gray-100 text-xs rounded hover:bg-gray-200">Action</button></td>;
                        }
                        if (header.key === 'orderStatus') {
                          const status = (cellValue || '').toLowerCase();
                          let statusClass = 'bg-gray-100 text-gray-800';
                          if (status.includes('pending')) statusClass = 'bg-yellow-100 text-yellow-800';
                          else if (status.includes('in transit')) statusClass = 'bg-blue-100 text-blue-800';
                          else if (status.includes('delivered')) statusClass = 'bg-green-100 text-green-800';
                          else if (status.includes('picked up')) statusClass = 'bg-purple-100 text-purple-800';
                          return <td key={header.key} className="px-2 py-1 text-xs"><span className={`px-2 py-0.5 rounded-full font-medium ${statusClass}`}>{cellValue}</span></td>;
                        }
                        return (
                          <td key={header.key} className="px-1.5 py-1 text-sm text-gray-700 truncate" title={String(cellValue || '')}>
                            {highlightSearch(cellValue, header.key)}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {sortedData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t bg-white">
              <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to <span className="font-medium">{Math.min(indexOfFirstRow + rowsPerPage, sortedData.length)}</span> of <span className="font-medium">{sortedData.length}</span> results
                </span>
                <select className="border rounded px-2 py-1 text-sm" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <button onClick={() => paginate(1)} disabled={currentPage === 1} className="px-3 py-1 rounded disabled:text-gray-400">&laquo;</button>
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded disabled:text-gray-400">&lsaquo;</button>
                {getPageNumbers().map(number => <button key={number} onClick={() => paginate(number)} className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>{number}</button>)}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded disabled:text-gray-400">&rsaquo;</button>
                <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded disabled:text-gray-400">&raquo;</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default OrderTable;