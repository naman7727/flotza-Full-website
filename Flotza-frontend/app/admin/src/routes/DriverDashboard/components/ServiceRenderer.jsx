import React from 'react';
import IntraSDD from '../pages/intraSDD';
import IntraNDD from '../pages/intraNDD';
import IntraFTL from '../pages/intraFTL';
import IntraRental from '../pages/intraRental';
import IntraPTL from '../pages/intraPTL';
import IntraBidding from '../pages/intraBidding';

const ServiceRenderer = ({ selectedService }) => {
  const renderServiceComponent = () => {
    switch (selectedService) {
      case 'Intra SDD':
        return <IntraSDD />;
      case 'Intra NDD':
        return <IntraNDD />;
      case 'Intra FTL':
        return <IntraFTL />;
      case 'Intra Rental':
        return <IntraRental />;
      case 'Intra PTL':
        return <IntraPTL />;
      case 'Intra Bidding':
        return <IntraBidding />;
      default:
        return <IntraSDD />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          {selectedService} Services
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          Manage your {selectedService.toLowerCase()} deliveries and trips
        </p>
      </div>
      <div className="p-0">
        {renderServiceComponent()}
      </div>
    </div>
  );
};

export default ServiceRenderer;
