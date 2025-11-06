import React, { useState, useMemo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

// ---------- Dummy Data (Updated Customer IDs) ----------
// Kept outside the component to prevent re-declaration on re-renders
const initialLogs = [
  {date:"2025-08-16T17:45", code:"SAVE10",     amount:100, cid:"KBU1", cname:"Ravi Kumar",       order:"KB0105"},
  {date:"2025-08-15T16:20", code:"NEW50",      amount:250, cid:"KBU2", cname:"Amit Sharma",      order:"KB0104"},
  {date:"2025-08-14T12:30", code:"WELCOME20",  amount: 75, cid:"KBU3", cname:"Sneha Patel",      order:"KB0103"},
  {date:"2025-08-13T19:40", code:"SAVE10",     amount:150, cid:"KBU4", cname:"Pooja Singh",      order:"KB0102"},
  {date:"2025-08-13T10:15", code:"OFFER30",    amount:300, cid:"KBU5", cname:"Karan Mehta",      order:"KB0101"},
  {date:"2025-08-12T15:10", code:"SAVE10",     amount:120, cid:"KBU6", cname:"Arjun Verma",      order:"KB0100"},
  {date:"2025-08-11T18:05", code:"NEW50",      amount:250, cid:"KBU7", cname:"Anita Rao",        order:"KB0099"},
  {date:"2025-08-11T11:25", code:"OFFER30",    amount:200, cid:"KBU8", cname:"Rahul Yadav",      order:"KB0098"},
  {date:"2025-08-10T09:50", code:"WELCOME20",  amount: 80, cid:"KBU9", cname:"Deepak Joshi",     order:"KB0097"},
  {date:"2025-08-09T17:35", code:"SAVE10",     amount:110, cid:"KBU10", cname:"Meena Gupta",      order:"KB0096"},
  {date:"2025-08-09T14:00", code:"OFFER30",    amount:180, cid:"KBU11", cname:"Suresh Reddy",     order:"KB0095"},
  {date:"2025-08-08T13:15", code:"NEW50",      amount:220, cid:"KBU12", cname:"Sunita Sharma",    order:"KB0094"},
  {date:"2025-08-07T20:25", code:"WELCOME20",  amount: 90, cid:"KBU13", cname:"Alok Tiwari",      order:"KB0093"},
  {date:"2025-08-07T10:45", code:"SAVE10",     amount:160, cid:"KBU14", cname:"Ritika Jain",      order:"KB0092"},
  {date:"2025-08-06T15:30", code:"OFFER30",    amount:250, cid:"KBU15", cname:"Vikas Malhotra",   order:"KB0091"},
  {date:"2025-08-05T16:40", code:"NEW50",      amount:200, cid:"KBU16", cname:"Priya Desai",      order:"KB0090"},
  {date:"2025-08-04T18:00", code:"SAVE10",     amount:130, cid:"KBU17", cname:"Rohit Agarwal",    order:"KB0089"},
  {date:"2025-08-04T09:20", code:"WELCOME20",  amount: 70, cid:"KBU18", cname:"Kavita Nair",      order:"KB0088"},
  {date:"2025-08-03T12:15", code:"OFFER30",    amount:190, cid:"KBU19", cname:"Sanjay Kulkarni",  order:"KB0087"},
  {date:"2025-08-02T17:10", code:"NEW50",      amount:260, cid:"KBU20", cname:"Geeta Mishra",     order:"KB0086"},
  {date:"2025-08-01T11:45", code:"SAVE10",     amount:140, cid:"KBU21", cname:"Aakash Gupta",     order:"KB0085"},
  {date:"2025-07-31T13:25", code:"WELCOME20",  amount: 85, cid:"KBU22", cname:"Nisha Chauhan",    order:"KB0084"},
  {date:"2025-07-30T19:35", code:"OFFER30",    amount:210, cid:"KBU23", cname:"Mahesh Joshi",     order:"KB0083"},
  {date:"2025-07-29T09:10", code:"SAVE10",     amount:170, cid:"KBU24", cname:"Sonia Bhatia",     order:"KB0082"},
  {date:"2025-07-28T14:50", code:"NEW50",      amount:240, cid:"KBU25", cname:"Vinod Kapoor",     order:"KB0081"},
  {date:"2025-07-27T15:25", code:"WELCOME20",  amount: 95, cid:"KBU26", cname:"Rekha Das",        order:"KB0080"},
  {date:"2025-07-26T10:30", code:"SAVE10",     amount:150, cid:"KBU27", cname:"Manoj Pillai",     order:"KB0079"},
  {date:"2025-07-25T18:40", code:"OFFER30",    amount:270, cid:"KBU28", cname:"Tarun Bansal",     order:"KB0078"},
  {date:"2025-07-24T16:00", code:"NEW50",      amount:240, cid:"KBU29", cname:"Anjali Singh",     order:"KB0077"},
  {date:"2025-07-23T13:55", code:"WELCOME20",  amount:100, cid:"KBU30", cname:"Rajeev Menon",     order:"KB0076"}
];

// ---------- Download Helpers (Pure functions) ----------
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(v => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadXLSXLike(filename, rows) {
  let xml = `<?xml version="1.0"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Worksheet ss:Name="Report"><Table>`;
  rows.forEach(r => {
    xml += '<Row>';
    r.forEach(c => {
      const val = String(c ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      xml += `<Cell><Data ss:Type="String">${val}</Data></Cell>`;
    });
    xml += '</Row>';
  });
  xml += `</Table></Worksheet></Workbook>`;
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- Main React Component ----------
function ViewLog({ onBack }) {
  // ---------- State Management ----------
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateSort, setDateSort] = useState('desc'); // 'desc' newest first, 'asc' oldest first

  // Modal states
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isDownloadSummaryModalOpen, setDownloadSummaryModalOpen] = useState(false);
  const [isDownloadReportModalOpen, setDownloadReportModalOpen] = useState(false);

  // State for the coupon summary modal
  const [summaryCouponCode, setSummaryCouponCode] = useState('');
  const [summaryResult, setSummaryResult] = useState(null);

  // ---------- Derived State & Filtering (Memoized) ----------
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    // Reset page to 1 whenever filters change
    setCurrentPage(1);

    const filtered = initialLogs.filter(log => {
      // Search filter (now includes Customer ID and Order ID)
      const searchHit = query === '' ||
        log.cname.toLowerCase().includes(query) ||
        log.code.toLowerCase().includes(query) ||
        String(log.amount).includes(query) ||
        log.cid.toLowerCase().includes(query) ||
        log.order.toLowerCase().includes(query);

      // Date range filter
      const logDate = new Date(log.date);
      const isAfterStartDate = !startDate || logDate >= new Date(startDate);
      const isBeforeEndDate = !endDate || logDate <= new Date(endDate + 'T23:59:59');

      return searchHit && isAfterStartDate && isBeforeEndDate;
    });
    // Sort by date according to toggle
    filtered.sort((a,b) => dateSort === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
    return filtered;
  }, [searchQuery, startDate, endDate, dateSort]);

  // ---------- Pagination Calculations ----------
  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedData = filteredData.slice(startIdx, endIdx);

  // ---------- Helper Functions ----------
  const formatDT = (dtISO) => dtISO.replace('T', ' ');

  // ---------- Event Handlers ----------
  const handleGenerateSummary = () => {
    const code = summaryCouponCode.trim().toUpperCase();
    if (!code) {
      setSummaryResult({ error: "Please enter a coupon code." });
      return;
    }

    const list = initialLogs.filter(r => r.code.toUpperCase() === code);
    if (list.length === 0) {
      setSummaryResult({ error: `No data found for ${code}.` });
      return;
    }

    const totalUses = list.length;
    const uniqueCustomers = new Set(list.map(r => r.cid)).size;
    const totalDiscount = list.reduce((s, r) => s + r.amount, 0);
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const firstUse = formatDT(sorted[0].date);
    const lastUse = formatDT(sorted[sorted.length - 1].date);
    const avg = (totalDiscount / totalUses).toFixed(2);

    setSummaryResult({
      code, totalUses, uniqueCustomers, totalDiscount, firstUse, lastUse, avg
    });
  };
  
  const openSummaryModal = () => {
    setSummaryCouponCode('');
    setSummaryResult(null);
    setSummaryModalOpen(true);
  };

  const handleDownloadSummary = (format) => {
    const dateFiltered = initialLogs.filter(r => {
      const d = new Date(r.date);
      const okStart = startDate ? d >= new Date(startDate) : true;
      const okEnd = endDate ? d <= new Date(endDate + 'T23:59:59') : true;
      return okStart && okEnd;
    });

    const grouped = {};
    dateFiltered.forEach(r => {
      if (!grouped[r.code]) grouped[r.code] = { uses: 0, customers: new Set(), discount: 0, first: r.date, last: r.date };
      const g = grouped[r.code];
      g.uses++;
      g.customers.add(r.cid);
      g.discount += r.amount;
      if (r.date < g.first) g.first = r.date;
      if (r.date > g.last) g.last = r.date;
    });

    const rows = [["Coupon Code", "Total Uses", "Unique Customers", "Total Discount", "First Use", "Last Use"]];
    Object.keys(grouped).sort().forEach(code => {
      const g = grouped[code];
      rows.push([code, g.uses, g.customers.size, g.discount, formatDT(g.first), formatDT(g.last)]);
    });

    if (format === 'csv') downloadCSV('coupon_summary.csv', rows);
    else downloadXLSXLike('coupon_summary.xlsx', rows);
    setDownloadSummaryModalOpen(false);
  };
  
  const handleDownloadReport = (format) => {
    const rows = [["Sr. No", "Date & Time", "Coupon Code", "Discounted Amount", "Customer ID", "Customer Name", "Order ID"]];
    const total = filteredData.length;
    filteredData.forEach((r, idx) => {
      const sr = total - idx; // descending across full filtered set
      // Remove the rupee symbol specifically for CSV to avoid encoding artifacts like â‚¹ in Excel.
      const amountValue = format === 'csv' ? r.amount : `₹${r.amount}`;
      rows.push([sr, formatDT(r.date), r.code, amountValue, r.cid, r.cname, r.order]);
    });

    if (format === 'csv') downloadCSV('coupon_detailed_report.csv', rows);
    else downloadXLSXLike('coupon_detailed_report.xlsx', rows);
    setDownloadReportModalOpen(false);
  };


  // ---------- Component UI (JSX) ----------
  const commonInputStyles = "px-2.5 py-1.5 border border-gray-300 rounded-lg min-h-[38px] bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
  const commonButtonStyles = "px-3 py-1.5 border-none rounded-lg bg-blue-600 text-white cursor-pointer min-h-[38px] transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="w-full">
        {/* Header: Back + Centered Heading */}
        <div className="px-6 pt-4 pb-1">
          <div className="relative flex items-center justify-center mb-3 min-h-[48px]">
            <button
              onClick={onBack}
              className="absolute left-0 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
              <span className="font-medium">Back</span>
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center px-4">Discount Coupon Use Logs</h2>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6 pt-0">

          <div id="uiArea">
            {/* Toolbar - All components in single line */}
            <div className="flex flex-nowrap gap-2 items-center bg-white p-3 border border-gray-200 rounded-xl shadow-md mx-auto w-full max-w-none overflow-x-auto">
              <input
                id="searchInput"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={commonInputStyles + " w-48 flex-shrink-0"}
              />
              <span className="text-gray-500 text-sm whitespace-nowrap">From</span>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={commonInputStyles + " w-36 flex-shrink-0"}
              />
              <span className="text-gray-500 text-sm whitespace-nowrap">To</span>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={commonInputStyles + " w-36 flex-shrink-0"}
              />
              <button onClick={() => setDownloadSummaryModalOpen(true)} title="Download coupon-wise summary for the selected date range" className={commonButtonStyles + " whitespace-nowrap"}>Download Summary</button>
              <button onClick={() => setDownloadReportModalOpen(true)} title="Download the exact filtered/searched rows" className={commonButtonStyles + " whitespace-nowrap"}>Download Report</button>
              <span className="text-gray-500 text-sm whitespace-nowrap">Rows/page</span>
              <select id="pageSize" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className={`${commonInputStyles} w-20 flex-shrink-0`}>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
              <button onClick={openSummaryModal} className={commonButtonStyles + " whitespace-nowrap"}>See Summary</button>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table aria-label="Coupon logs" className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Sr. No", "Date & Time", "Coupon Code", "Discount", "Customer ID", "Customer Name", "Order ID"].map(h => {
                      if (h === "Date & Time") {
                        return (
                          <th key={h} className="bg-blue-600 text-white p-3 text-center font-semibold whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setDateSort(s => s === 'desc' ? 'asc' : 'desc')}
                              className="inline-flex items-center gap-1 hover:text-yellow-200 focus:outline-none"
                              title={dateSort === 'desc' ? 'Newest first (click for oldest first)' : 'Oldest first (click for newest first)'}
                            >
                              <span>{h}</span>
                              <span className="text-xs select-none px-1 py-0.5 rounded bg-blue-500/40">
                                {dateSort === 'desc' ? '↓' : '↑'}
                              </span>
                            </button>
                          </th>
                        );
                      }
                      return (
                        <th key={h} className="bg-blue-600 text-white p-3 text-center font-semibold whitespace-nowrap">{h}</th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, i) => {
                    const sr = totalRows - (startIdx + i);
                    return (
                      <tr key={row.order} className="hover:bg-blue-50/50">
                        <td className="p-3 text-center border-t border-gray-200">{sr}</td>
                        <td className="p-3 text-center border-t border-gray-200 whitespace-nowrap">{formatDT(row.date)}</td>
                        <td className="p-3 text-center border-t border-gray-200">{row.code}</td>
                        <td className="p-3 text-center border-t border-gray-200">₹{row.amount}</td>
                        <td className="p-3 text-center border-t border-gray-200">{row.cid}</td>
                        <td className="p-3 text-center border-t border-gray-200 whitespace-nowrap">{row.cname}</td>
                        <td className="p-3 text-center border-t border-gray-200">{row.order}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
             {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between p-3 gap-3 border-t border-gray-200">
              <div className="flex gap-2 items-center">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1} className="bg-blue-100 text-blue-800 rounded-lg px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  Prev
                </button>
                <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="bg-blue-100 text-blue-800 rounded-lg px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-600">{totalRows} row{totalRows !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

      {/* Coupon Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
            <span onClick={() => setSummaryModalOpen(false)} className="absolute right-4 top-2 text-2xl text-gray-500 cursor-pointer hover:text-gray-700">&times;</span>
            <h3 className="text-xl font-bold mb-3">Coupon Code Summary</h3>
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={summaryCouponCode}
              onChange={e => setSummaryCouponCode(e.target.value)}
              className={commonInputStyles + " w-full mb-2"}
            />
            <button onClick={handleGenerateSummary} className={commonButtonStyles + " w-full"}>Generate</button>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3 min-h-[100px]">
              {summaryResult?.error ? (
                <span className="text-red-600">{summaryResult.error}</span>
              ) : summaryResult ? (
                <div className="space-y-1 text-sm">
                  <div><b>Coupon Code:</b> {summaryResult.code}</div>
                  <div><b>Total Uses:</b> {summaryResult.totalUses}</div>
                  <div><b>Unique Customers:</b> {summaryResult.uniqueCustomers}</div>
                  <div><b>Total Discount Given:</b> ₹{summaryResult.totalDiscount}</div>
                  <div><b>First Use:</b> {summaryResult.firstUse}</div>
                  <div><b>Last Use:</b> {summaryResult.lastUse}</div>
                  <div><b>Average Discount/Use:</b> ₹{summaryResult.avg}</div>
                </div>
              ) : null}
            </div>
            <p className="text-xs text-gray-500 mt-3">Note: This summary uses <b>all data</b> (ignores date filter).</p>
          </div>
        </div>
      )}

      {/* Download Summary Modal */}
       {isDownloadSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDownloadSummaryModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
            <span onClick={() => setDownloadSummaryModalOpen(false)} className="absolute right-4 top-2 text-2xl text-gray-500 cursor-pointer">&times;</span>
            <h3 className="text-xl font-bold mb-2">Download Summary</h3>
            <p className="text-sm text-gray-600 mb-4">Coupon-wise totals for the selected date range.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDownloadSummary('csv')} className={commonButtonStyles + " flex-1"}>CSV</button>
              <button onClick={() => handleDownloadSummary('xlsx')} className={commonButtonStyles + " flex-1"}>XLSX</button>
            </div>
          </div>
        </div>
      )}

      {/* Download Report Modal */}
      {isDownloadReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDownloadReportModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
            <span onClick={() => setDownloadReportModalOpen(false)} className="absolute right-4 top-2 text-2xl text-gray-500 cursor-pointer">&times;</span>
            <h3 className="text-xl font-bold mb-2">Download Report</h3>
            <p className="text-sm text-gray-600 mb-4">Exports the exact filtered/searched rows (not limited by pagination).</p>
            <div className="flex gap-3">
              <button onClick={() => handleDownloadReport('csv')} className={commonButtonStyles + " flex-1"}>CSV</button>
              <button onClick={() => handleDownloadReport('xlsx')} className={commonButtonStyles + " flex-1"}>XLSX</button>
            </div>
          </div>
        </div>
      )}
      
      </div>
    </div>
  );
}

export default ViewLog;