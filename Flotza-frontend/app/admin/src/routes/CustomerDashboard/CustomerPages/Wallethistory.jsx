import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const WalletHistory = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [originalTransactions, setOriginalTransactions] = useState([]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    if (isNaN(date)) return "N/A";
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const customerId = decoded.id || decoded.customer_id || "";

    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/${customerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data || []);
          setOriginalTransactions(data.data || []);
        } else {
          console.error("Fetch error:", data.message);
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
      }
    };

    if (customerId) fetchTransactions();
  }, []);

  const downloadExcel = () => {
    const headers = [
      "Date",
      "Transaction ID",
      "Transaction Type",
      "Amount",
      "Reference",
      "Payment Method",
      "Status",
      "Balance After Transaction",
      "Remarks",
    ];
    const rows = transactions.map((txn) =>
      [
        txn.transaction_date || txn.date || "N/A",
        txn.transaction_id || txn.id || "N/A",
        txn.credit_debit || txn.type || "N/A",
        txn.amount || "0",
        txn.portal_transaction_remarks_1 || txn.reference || "N/A",
        txn.payment_method || "N/A",
        "Successful",
        txn.user_wallet_balance || "N/A",
        txn.remarks || "N/A",
      ].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wallet_transactions.csv";
    a.click();
  };

  const showTransactions = () => {
    if (!fromDate || !toDate) return;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const filtered = originalTransactions.filter((txn) => {
      const txnDate = new Date(txn.transaction_date || txn.date);
      return txnDate >= from && txnDate <= to;
    });

    setTransactions(filtered);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Wallet Transaction History</h1>
      <div style={styles.filter}>
        <label>
          From:{" "}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={styles.input}
          />
        </label>
        <label>
          To:{" "}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={styles.input}
          />
        </label>
        <button onClick={showTransactions} style={styles.buttonBlue}>
          Show
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {[
                "Date",
                "Time",
                "Transaction ID",
                "Transaction Type",
                "Amount",
                "Reference",
                "Payment Method",
                "Status",
                "Balance After Transaction",
                "Remarks",
              ].map((heading) => (
                <th key={heading} style={styles.th}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr key={index} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                <td style={styles.td}>{formatDate(txn.transaction_date)}</td>
                <td style={styles.td}>{txn.transaction_time || txn.time || "N/A"}</td>
                <td style={styles.td}>{txn.transaction_id || txn.id || "N/A"}</td>
                <td style={styles.td}>{txn.credit_debit || txn.type || "N/A"}</td>
                <td style={styles.td}>{"₹" + (txn.amount || "0")}</td>
                <td style={styles.td}>
                  {txn.portal_transaction_remarks_1 || txn.reference || "N/A"}
                </td>
                <td style={styles.td}>{txn.payment_method || "N/A"}</td>
                <td style={styles.td}>{"Successful"}</td>
                <td style={styles.td}>₹{txn.user_wallet_balance || "N/A"}</td>
                <td style={styles.td}>{txn.remarks || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={downloadExcel} style={styles.buttonGreen}>
        Download Excel Report
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "50px auto",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  heading: {
    color: "#007bff",
    fontSize: "24px",
    marginBottom: "10px",
  },
  filter: {
    margin: "20px 0",
  },
  input: {
    padding: "10px",
    margin: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  buttonBlue: {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  buttonGreen: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    minWidth: "900px",
    marginTop: "20px",
    borderCollapse: "collapse",
  },
  th: {
    background: "#007bff",
    color: "white",
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  td: {
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  trEven: {
    backgroundColor: "#f9f9f9",
  },
  trOdd: {
    backgroundColor: "#ffffff",
  },
};

export default WalletHistory;
