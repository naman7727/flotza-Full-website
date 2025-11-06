import React, { useState, useRef, useEffect } from "react";

const DeliveryCenterOffSettings = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const [weekOffs, setWeekOffs] = useState([]);
    const [customOffs, setCustomOffs] = useState([]);
    const [rangeOffs, setRangeOffs] = useState([]);
    const [selectedYear, setSelectedYear] = useState("default"); // "default" = rolling 25 months
    const [selectedMonth, setSelectedMonth] = useState(""); // for jump-to-month

    const [customDate, setCustomDate] = useState("");
    const [customRemark, setCustomRemark] = useState("");
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [rangeRemark, setRangeRemark] = useState("");

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // --- Refs for scroll-to-month ---
    const monthRefs = useRef({});

    // --- Add/Delete Functions ---
    const addCustomOff = () => {
        if (!customDate) return;
        if (!customOffs.some(o => o.date === customDate)) {
            setCustomOffs([...customOffs, { date: customDate, remark: customRemark }]);
        }
        setCustomDate("");
        setCustomRemark("");
    };

    const addRangeOff = () => {
        if (!rangeStart || !rangeEnd) return;
        setRangeOffs([...rangeOffs, { start: rangeStart, end: rangeEnd, remark: rangeRemark }]);
        setRangeStart("");
        setRangeEnd("");
        setRangeRemark("");
    };

    const deleteOff = (type, key) => {
        if (type === "week") setWeekOffs(weekOffs.filter(d => d !== key));
        if (type === "custom") setCustomOffs(customOffs.filter(o => o.date !== key));
        if (type === "range") setRangeOffs(rangeOffs.filter((_, i) => i !== key));
    };

    // --- Scroll to selected month ---
    useEffect(() => {
        if (selectedMonth !== "" && monthRefs.current[selectedMonth]) {
            monthRefs.current[selectedMonth].scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [selectedMonth, selectedYear]);

    // --- Calendar Generator ---
    const generateCalendar = () => {
        const months = [];
        let startYear, startMonth, endYear, endMonth;

        if (selectedYear === "default") {
            startYear = currentYear - 1;
            startMonth = currentMonth;
            endYear = currentYear + 1;
            endMonth = currentMonth;
        } else {
            startYear = parseInt(selectedYear);
            startMonth = 0;
            endYear = parseInt(selectedYear);
            endMonth = 11;
        }

        let year = startYear;
        let month = startMonth;

        while (year < endYear || (year === endYear && month <= endMonth)) {
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const rows = [];
            let cells = [];

            for (let i = 0; i < firstDay; i++) cells.push(<td key={`e${i}`}></td>);

            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month, d);
                const iso = [
                    date.getFullYear(),
                    String(date.getMonth() + 1).padStart(2, "0"),
                    String(date.getDate()).padStart(2, "0")
                ].join("-");

                let classes = "relative border border-gray-300 text-center p-1 group";
                let remarks = [];

                if (weekOffs.includes(date.getDay())) {
                    classes += " bg-red-300";
                    remarks.push("Weekly Off");
                }
                const co = customOffs.find(o => o.date === iso);
                if (co) {
                    classes += " bg-red-200";
                    remarks.push(co.remark || "Custom Off");
                }
                rangeOffs.forEach(r => {
                    if (iso >= r.start && iso <= r.end) {
                        classes += " bg-red-200";
                        remarks.push(r.remark || "Range Off");
                    }
                });

                const today = new Date();
                const isToday =
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();

                if (isToday) {
                    classes += " ring-2 ring-green-500 bg-green-100 font-bold";
                }

                cells.push(
                    <td key={iso} className={classes}>
                        {d}
                        {remarks.length > 0 && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 invisible group-hover:visible bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {remarks.join(", ")}
                            </div>
                        )}
                    </td>
                );

                if (cells.length % 7 === 0) {
                    rows.push(<tr key={`r${d}`}>{cells}</tr>);
                    cells = [];
                }
            }
            if (cells.length > 0) rows.push(<tr key="last">{cells}</tr>);

            const refKey = `${year}-${month}`;
            months.push(
                <div key={refKey} ref={(el) => (monthRefs.current[refKey] = el)} className="mb-6">
                    <h4 className="sticky top-0 z-10 bg-white border-b py-2 text-lg font-semibold">
                        {new Date(year, month).toLocaleString("default", { month: "long" })} {year}
                    </h4>
                    <table className="border-collapse w-full text-xs">
                        <thead className="sticky top-9 bg-blue-600 z-10">
                            <tr>
                                {days.map((d) => (
                                    <th key={d} className="text-white p-1">
                                        {d.slice(0, 3)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </table>
                </div>
            );

            month++;
            if (month > 11) {
                month = 0;
                year++;
            }
        }

        return months;
    };

    // --- Year Options (dropdown) ---
    const yearOptions = [];
    for (let y = currentYear - 10; y <= currentYear + 10; y++) {
        yearOptions.push(y);
    }

    // --- Jump to Today ---
    const jumpToToday = () => {
        const refKey = `${currentYear}-${currentMonth}`;
        if (monthRefs.current[refKey]) {
            monthRefs.current[refKey].scrollIntoView({ behavior: "smooth", block: "start" });
            setSelectedYear("default");
            setSelectedMonth(refKey);
        }
    };

    return (
        <div className="p-6 bg-blue-100 font-sans">
            {/* Header with Year + Month Selector + Today button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                <h3 className="text-xl font-bold text-gray-800">
                    No Order Settings
                </h3>

                <div className="flex gap-2 mr-2">
                    <select className="border rounded text-sm" >
                        <option value="default">Select Hub</option>
                        <option value="HUB 1">Hub 1</option>
                        <option value="HUB 2">Hub 2</option>
                        <option value="HUB 3">Hub 3</option>
                        <option value="HUB 4">Hub 4</option>
                        <option value="HUB 5">Hub 5</option>
                    </select>
                    {/* Year Dropdown */}
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setSelectedMonth(""); // reset month when year changes
                        }}
                        className="border rounded text-sm"
                    >
                        <option value="default">Year </option>
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>

                    {/* Month Dropdown */}
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border rounded p-2 text-sm"
                    >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <option
                                key={i}
                                value={`${selectedYear === "default" ? currentYear : selectedYear}-${i}`}
                            >
                                {new Date(2000, i, 1).toLocaleString("default", { month: "long" })}
                            </option>
                        ))}
                    </select>

                    {/* Today Button */}
                    <button
                        onClick={jumpToToday}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:opacity-90 text-sm"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Responsive Layout */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Settings */}
                <div className="bg-white p-4 rounded-xl shadow-md w-full lg:w-72">
                    <h3 className="font-semibold mb-2">Week Off Settings</h3>
                    <div className="space-y-1 mb-3">
                        <label className="block text-sm">
                            <input
                                type="checkbox"
                                checked={weekOffs.length === 0}
                                onChange={() => setWeekOffs([])}
                                className="mr-1"
                            />
                            None
                        </label>
                        {days.map((d, i) => (
                            <label key={i} className="block text-sm">
                                <input
                                    type="checkbox"
                                    checked={weekOffs.includes(i)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setWeekOffs([...weekOffs, i]);
                                        } else {
                                            setWeekOffs(weekOffs.filter((x) => x !== i));
                                        }
                                    }}
                                    className="mr-1"
                                />
                                {d}
                            </label>
                        ))}
                    </div>

                    <h3 className="font-semibold mb-2">Custom Off (Single Date)</h3>
                    <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="border rounded p-1 w-full mb-1"
                    />
                    <input
                        type="text"
                        placeholder="Remark"
                        value={customRemark}
                        onChange={(e) => setCustomRemark(e.target.value)}
                        className="border rounded p-1 w-full mb-2"
                    />
                    <button
                        onClick={addCustomOff}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:opacity-90 text-sm"
                    >
                        Add Custom Off
                    </button>

                    <h3 className="font-semibold mt-4 mb-2">Custom Date Range Off</h3>
                    <label className="text-sm block">
                        Start:{" "}
                        <input
                            type="date"
                            value={rangeStart}
                            onChange={(e) => setRangeStart(e.target.value)}
                            className="border rounded p-1 w-full mb-1"
                        />
                    </label>
                    <label className="text-sm block">
                        End:{" "}
                        <input
                            type="date"
                            value={rangeEnd}
                            onChange={(e) => setRangeEnd(e.target.value)}
                            className="border rounded p-1 w-full mb-1"
                        />
                    </label>
                    <input
                        type="text"
                        placeholder="Remark"
                        value={rangeRemark}
                        onChange={(e) => setRangeRemark(e.target.value)}
                        className="border rounded p-1 w-full mb-2"
                    />
                    <button
                        onClick={addRangeOff}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:opacity-90 text-sm"
                    >
                        Add Range Off
                    </button>
                </div>

                {/* Calendar */}
                <div className="flex-1 max-h-[650px] overflow-y-auto bg-white p-4 rounded-xl shadow-md">
                    {generateCalendar()}
                </div>

                {/* List */}
                <div className="w-full lg:w-72 max-h-[650px] overflow-y-auto bg-white p-4 rounded-xl shadow-md">
                    <h3 className="font-semibold mb-3">All Offs</h3>
                    {weekOffs.map((d) => (
                        <div key={d} className="flex justify-between items-center border-b py-1 text-sm">
                            <span>Weekly Off: {days[d]}</span>
                            <button
                                className="bg-red-600 text-white px-2 py-0.5 rounded text-xs"
                                onClick={() => deleteOff("week", d)}
                            >
                                x
                            </button>
                        </div>
                    ))}
                    {customOffs.map((o) => (
                        <div key={o.date} className="flex justify-between items-center border-b py-1 text-sm">
                            <span>
                                Custom Off: {o.date} {o.remark ? `- ${o.remark}` : ""}
                            </span>
                            <button
                                className="bg-red-600 text-white px-2 py-0.5 rounded text-xs"
                                onClick={() => deleteOff("custom", o.date)}
                            >
                                x
                            </button>
                        </div>
                    ))}
                    {rangeOffs.map((r, i) => (
                        <div key={i} className="flex justify-between items-center border-b py-1 text-sm">
                            <span>
                                Range Off: {r.start} → {r.end} {r.remark ? `- ${r.remark}` : ""}
                            </span>
                            <button
                                className="bg-red-600 text-white px-2 py-0.5 rounded text-xs"
                                onClick={() => deleteOff("range", i)}
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeliveryCenterOffSettings;
