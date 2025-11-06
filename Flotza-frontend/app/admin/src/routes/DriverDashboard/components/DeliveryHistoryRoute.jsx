import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DeliveryHistory from './DeliveryHistory';

const DeliveryHistoryRoute = () => {
  const context = useOutletContext() || {};
  const {
    fromDate = '',
    setFromDate = () => {},
    toDate = '',
    setToDate = () => {},
    searchTerm = '',
    setSearchTerm = () => {},
    filteredHistory = []
  } = context;

  return (
    <DeliveryHistory
      fromDate={fromDate}
      setFromDate={setFromDate}
      toDate={toDate}
      setToDate={setToDate}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filteredHistory={filteredHistory}
    />
  );
};

export default DeliveryHistoryRoute; 