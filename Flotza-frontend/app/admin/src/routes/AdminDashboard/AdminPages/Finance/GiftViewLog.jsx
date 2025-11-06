import React, { useState, useMemo, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

// ---------- Dummy Data (Structure remains similar) ----------
// Kept outside the component to prevent re-declaration on re-renders
const initialLogs = [
  // The 'order' field is no longer displayed but can be kept for data integrity if needed.
  // For this example, I'll keep it in the data but exclude it from UI and exports.
  {date:"2025-08-16T17:45", code:"GIFT-ABC123",     amount:100, cid:"KBU1", cname:"Ravi Kumar",       order:"KB0105"},
  {date:"2025-08-15T16:20", code:"GIFT-ABC123",      amount:250, cid:"KBU2", cname:"Amit Sharma",      order:"KB0104"},
  {date:"2025-08-14T12:30", code:"WELGIFT-ABC123COME20",  amount: 75, cid:"KBU3", cname:"Sneha Patel",      order:"KB0103"},
  {date:"2025-08-13T19:40", code:"GIFT-ABC123",     amount:150, cid:"KBU4", cname:"Pooja Singh",      order:"KB0102"},
  {date:"2025-08-13T10:15", code:"GIFT-ABC123",    amount:300, cid:"KBU5", cname:"Karan Mehta",      order:"KB0101"},
  {date:"2025-08-12T15:10", code:"SAVE10",     amount:120, cid:"KBU6", cname:"Arjun Verma",      order:"KB0100"},
  {date:"2025-08-11T18:05", code:"NEW50",      amount:250, cid:"KBU7", cname:"Anita Rao",        order:"KB0099"},
  {date:"2025-08-11T11:25", code:"OFFER30",    amount:200, cid:"KBU8", cname:"Rahul Yadav",      order:"KB0098"},
  {date:"2025-08-10T09:50", code:"WELCOME20",  amount: 80, cid:"KBU9", cname:"Deepak Joshi",     order:"KB0097"},
  {date:"2025-08-09T17:35", code:"SAVEGIFT-ABC12310",     amount:110, cid:"KBU10", cname:"Meena Gupta",      order:"KB0096"},
  {date:"2025-08-09T14:00", code:"OFFER30",    amount:180, cid:"KBU11", cname:"Suresh Reddy",     order:"KB0095"},
  {date:"2025-08-08T13:15", code:"NEW50",      amount:220, cid:"KBU12", cname:"Sunita Sharma",    order:"KB0094"},
  {date:"2025-08-07T20:25", code:"WELCGIFT-ABC123OME20",  amount: 90, cid:"KBU13", cname:"Alok Tiwari",      order:"KB0093"},
  {date:"2025-08-07T10:45", code:"SAVEGIFT-ABC12310",     amount:160, cid:"KBU14", cname:"Ritika Jain",      order:"KB0092"},
  {date:"2025-08-06T15:30", code:"OFFER30",    amount:250, cid:"KBU15", cname:"Vikas Malhotra",   order:"KB0091"},
  {date:"2025-08-05T16:40", code:"NEW50",      amount:200, cid:"KBU16", cname:"Priya Desai",      order:"KB0090"},
  {date:"2025-08-04T18:00", code:"SAVE10",     amount:130, cid:"KBU17", cname:"Rohit Agarwal",    order:"KB0089"},
  {date:"2025-08-04T09:20", code:"WELCOME20",  amount: 70, cid:"KBU18", cname:"Kavita Nair",      order:"KB0088"},
  {date:"2025-08-03T12:15", code:"OFFER30",    amount:190, cid:"KBU19", cname:"Sanjay Kulkarni",  order:"KB0087"},
  {date:"2025-08-02T17:10", code:"NEW50",      amount:260, cid:"KBU20", cname:"Geeta Mishra",     order:"KB0086"},
  {date:"2025-08-01T11:45", code:"SAVEGIFT-ABC12310",     amount:140, cid:"KBU21", cname:"Aakash Gupta",     order:"KB0085"},
  {date:"2025-07-31T13:25", code:"WELCOME20",  amount: 85, cid:"KBU22", cname:"Nisha Chauhan",    order:"KB0084"},
  {date:"2025-07-30T19:35", code:"OFFER30",    amount:210, cid:"KBU23", cname:"Mahesh Joshi",     order:"KB0083"},
  {date:"2025-07-29T09:10", code:"SAVE10",     amount:170, cid:"KBU24", cname:"Sonia Bhatia",     order:"KB0082"},
  {date:"2025-07-28T14:50", code:"NEW50GIFT-ABC123",      amount:240, cid:"KBU25", cname:"Vinod Kapoor",     order:"KB0081"},
  {date:"2025-07-27T15:25", code:"WELCOME20",  amount: 95, cid:"KBU26", cname:"Rekha Das",        order:"KB0080"},
  {date:"2025-07-26T10:30", code:"SAVE10",     amount:150, cid:"KBU27", cname:"Manoj Pillai",     order:"KB0079"},
  {date:"2025-07-25T18:40", code:"OFFEGIFT-ABC123R30",    amount:270, cid:"KBU28", cname:"Tarun Bansal",     order:"KB0078"},
  {date:"2025-07-24T16:00", code:"NEW50",      amount:240, cid:"KBU29", cname:"Anjali Singh",     order:"KB0077"},
  {date:"2025-07-23T13:55", code:"WELCOME20",  amount:100, cid:"KBU30", cname:"Rajeev Menon",     order:"KB0076"}
];


function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(v => {
    const s = String(v ?? '');
    // Escape quotes, commas, and newlines
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }).join(',')).join('\n');

  // Create a Blob and download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href); // Clean up the object URL
}

function downloadXLSXLike(filename, rows) {
  // Creates a simple XML-based spreadsheet file that Excel can open.
  let xml = `<?xml version="1.0"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Worksheet ss:Name="Report"><Table>`;
  rows.forEach(r => {
    xml += '<Row>';
    r.forEach(c => {
      // Escape XML special characters
      const val = String(c ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      xml += `<Cell><Data ss:Type="String">${val}</Data></Cell>`;
    });
    xml += '</Row>';
  });
  xml += `</Table></Worksheet></Workbook>`;
  
  // Create a Blob and download link
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href); // Clean up
}

// ---------- Main React Component ----------
function GiftViewLog({ onBack }) {
  // ---------- State Management ----------
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isDownloadSummaryModalOpen, setDownloadSummaryModalOpen] = useState(false);
  const [isDownloadReportModalOpen, setDownloadReportModalOpen] = useState(false);
  const [summaryCouponCode, setSummaryCouponCode] = useState('');
  const [summaryResult, setSummaryResult] = useState(null);
  const [dateSort, setDateSort] = useState('desc'); // 'desc' newest first, 'asc' oldest first

  // ---------- Derived State & Filtering (Memoized) ----------
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = initialLogs.filter(log => {
      const searchHit = query === '' ||
        log.cname.toLowerCase().includes(query) ||
        log.code.toLowerCase().includes(query) ||
        String(log.amount).includes(query) ||
        log.cid.toLowerCase().includes(query);
      const logDate = new Date(log.date);
      const isAfterStartDate = !startDate || logDate >= new Date(startDate);
      const isBeforeEndDate = !endDate || logDate <= new Date(endDate + 'T23:59:59');
      return searchHit && isAfterStartDate && isBeforeEndDate;
    });
    filtered.sort((a,b) => dateSort === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
    return filtered;
  }, [searchQuery, startDate, endDate, dateSort]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate, pageSize, dateSort]);

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
      setSummaryResult({ error: "Please enter a gift code." });
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

    const rows = [["Gift Code", "Total Uses", "Unique Customers", "Total Allocated", "First Use", "Last Use"]];
    Object.keys(grouped).sort().forEach(code => {
      const g = grouped[code];
      rows.push([code, g.uses, g.customers.size, g.discount, formatDT(g.first), formatDT(g.last)]);
    });

    if (format === 'csv') downloadCSV('gift_code_summary.csv', rows);
    else downloadXLSXLike('gift_code_summary.xlsx', rows);
    setDownloadSummaryModalOpen(false);
  };
  
  const handleDownloadReport = (format) => {
    // Updated headers for the report
    const rows = [["Sr. No", "Date & Time of Utilisation", "Gift Code", "Allocated Amount", "To Customer ID", "To Customer Name"]];
    const total = filteredData.length;
    filteredData.forEach((r, idx) => {
      const sr = total - idx;
      // Updated data row to match new headers
  // For CSV we exclude the rupee symbol to prevent mojibake like â‚¹ in Excel when opened with default ANSI encoding.
  const amountValue = format === 'csv' ? r.amount : `₹${r.amount}`;
  rows.push([sr, formatDT(r.date), r.code, amountValue, r.cid, r.cname]);
    });
    
    if (format === 'csv') downloadCSV('gift_code_detailed_report.csv', rows);
    else downloadXLSXLike('gift_code_detailed_report.xlsx', rows);
    setDownloadReportModalOpen(false);
  };

  // ---------- Component UI (JSX) ----------
  // Match styling with CouponViewLog for consistent look
  const commonInputStyles = "px-2.5 py-1.5 border border-gray-300 rounded-lg min-h-[38px] bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
  const commonButtonStyles = "px-3 py-1.5 border-none rounded-lg bg-blue-600 text-white cursor-pointer min-h-[38px] transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // New headers based on the image
  const tableHeaders = ["Sr. No", "Date & Time of Utilisation", "Gift Code", "Allocated Amount", "To Customer ID", "To Customer Name"];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Back button (optional) */}
      <div className="px-4 sm:px-6 pt-3">
        <div className="relative flex items-center justify-center mb-3 min-h-[48px]">
          {typeof onBack === 'function' && (
            <button
              onClick={onBack}
              className="absolute left-0 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow"
            >
              <FaArrowLeft className="text-lg" />
              <span className="font-medium">Back</span>
            </button>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center px-4">Gift Code Utilisation Logs</h2>
        </div>


  <div id="uiArea">
          {/* Toolbar - single line like CouponViewLog */}
          <div className="flex flex-nowrap gap-2 items-center bg-white p-3 border border-gray-200 rounded-xl shadow-md w-full max-w-none overflow-x-auto">
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
            <button onClick={() => setDownloadSummaryModalOpen(true)} title="Download gift code summary for the selected date range" className={commonButtonStyles + " whitespace-nowrap flex-shrink-0"}>Download Summary</button>
            <button onClick={() => setDownloadReportModalOpen(true)} title="Download the exact filtered/searched rows" className={commonButtonStyles + " whitespace-nowrap flex-shrink-0"}>Download Report</button>
            <span className="text-gray-500 text-sm whitespace-nowrap">Rows/page</span>
            <select id="pageSize" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className={`${commonInputStyles} w-20 flex-shrink-0`}>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
            <button onClick={openSummaryModal} className={commonButtonStyles + " whitespace-nowrap flex-shrink-0"}>See Summary</button>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden mt-3">
            <div className="overflow-x-auto">
              <table aria-label="Gift code logs" className="w-full border-collapse">
                <thead>
                  <tr>
                    {tableHeaders.map(h => {
                      if (h === 'Date & Time of Utilisation') {
                        return (
                          <th key={h} className="bg-blue-600 text-white p-3 text-center font-semibold whitespace-nowrap sticky top-0">
                            <button
                              type="button"
                              onClick={() => setDateSort(s => s === 'desc' ? 'asc' : 'desc')}
                              className="inline-flex items-center gap-1 hover:text-yellow-200 focus:outline-none"
                              title={dateSort === 'desc' ? 'Newest first (click for oldest first)' : 'Oldest first (click for newest first)'}
                            >
                              <span>{h}</span>
                              <span className="text-xs select-none px-1 py-0.5 rounded bg-blue-500/40">{dateSort === 'desc' ? '↓' : '↑'}</span>
                            </button>
                          </th>
                        );
                      }
                      return (
                        <th key={h} className="bg-blue-600 text-white p-3 text-center font-semibold whitespace-nowrap sticky top-0">{h}</th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, i) => {
                    const sr = totalRows - (startIdx + i);
                    return (
                      <tr key={`${row.cid}-${i}`} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-3 text-center border-t border-gray-200">{sr}</td>
                        <td className="p-3 text-center border-t border-gray-200 whitespace-nowrap">{formatDT(row.date)}</td>
                        <td className="p-3 text-center border-t border-gray-200 font-mono">{row.code}</td>
                        <td className="p-3 text-center border-t border-gray-200">₹{row.amount}</td>
                        <td className="p-3 text-center border-t border-gray-200">{row.cid}</td>
                        <td className="p-3 text-center border-t border-gray-200 whitespace-nowrap">{row.cname}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
             {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between p-3 gap-3 border-t border-gray-200">
              <div className="flex gap-2 items-center">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="bg-blue-100 text-blue-800 rounded-lg px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-blue-200">
                  Prev
                </button>
                <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="bg-blue-100 text-blue-800 rounded-lg px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-blue-200">
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-600">{totalRows} row{totalRows !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSummaryModalOpen(false)} className="absolute right-4 top-2 text-2xl text-gray-500 cursor-pointer hover:text-gray-800">&times;</button>
            <h3 className="text-xl font-bold mb-3">Gift Code Summary</h3>
            <input
              type="text"
              placeholder="Enter Gift Code"
              value={summaryCouponCode}
              onChange={e => setSummaryCouponCode(e.target.value)}
              className={commonInputStyles + " w-full mb-2"}
              autoFocus
            />
            <button onClick={handleGenerateSummary} className={commonButtonStyles + " w-full"}>Generate</button>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3 min-h-[100px]">
              {summaryResult?.error ? (
                <span className="text-red-600 font-medium">{summaryResult.error}</span>
              ) : summaryResult ? (
                <div className="space-y-1 text-sm">
                  <div><b>Gift Code:</b> {summaryResult.code}</div>
                  <div><b>Total Uses:</b> {summaryResult.totalUses}</div>
                  <div><b>Unique Customers:</b> {summaryResult.uniqueCustomers}</div>
                  <div><b>Total Allocated:</b> ₹{summaryResult.totalDiscount}</div>
                  <div><b>First Use:</b> {summaryResult.firstUse}</div>
                  <div><b>Last Use:</b> {summaryResult.lastUse}</div>
                  <div><b>Average Amount/Use:</b> ₹{summaryResult.avg}</div>
                </div>
              ) : <span className="text-gray-400">Enter a code to see its summary.</span>}
            </div>
            <p className="text-xs text-gray-500 mt-3">Note: This summary uses <b>all data</b> (ignores date filter).</p>
          </div>
        </div>
      )}

      {isDownloadSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDownloadSummaryModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDownloadSummaryModalOpen(false)} className="absolute right-4 top-2 text-2xl text-gray-500 cursor-pointer hover:text-gray-800">&times;</button>
            <h3 className="text-xl font-bold mb-2">Download Summary</h3>
            <p className="text-sm text-gray-600 mb-4">Gift code totals for the selected date range.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDownloadSummary('csv')} className={commonButtonStyles + " flex-1"}>CSV</button>
              <button onClick={() => handleDownloadSummary('xlsx')} className={commonButtonStyles + " flex-1"}>XLSX</button>
            </div>
          </div>
        </div>
      )}

      {isDownloadReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDownloadReportModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDownloadReportModalOpen(false)} className="absolute right-4 top-2 text-2xl text-gray-500 cursor-pointer hover:text-gray-800">&times;</button>
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
  );
}

export default GiftViewLog;
