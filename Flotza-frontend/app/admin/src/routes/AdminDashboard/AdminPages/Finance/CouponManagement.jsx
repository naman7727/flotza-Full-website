import React, { useState, useEffect } from 'react';
import DiscountCoupons from './DiscountCoupons';
import GiftCodes from './GiftCodes';
import ReferralSettings from './ReferralSettings';

const CouponManagement = () => {
  const [activeView, setActiveView] = useState('discount');

  // Get initial view from URL hash or default to discount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'gift-codes') {
      setActiveView('gift');
    } else if (hash === 'referral-settings') {
      setActiveView('referral');
    } else {
      setActiveView('discount');
    }
  }, []);

  const handleViewChange = (view) => {
    setActiveView(view);
    // Update URL hash for routing
    if (view === 'gift') {
      window.location.hash = 'gift-codes';
    } else if (view === 'referral') {
      window.location.hash = 'referral-settings';
    } else {
      window.location.hash = 'discount-coupons';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Coupon & Gift Code Management
            </h1>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => handleViewChange('referral')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'referral'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🤝 Referral setting
              </button>
              <button
                onClick={() => handleViewChange('discount')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'discount'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎫 Discount Coupons
              </button>
              <button
                onClick={() => handleViewChange('gift')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'gift'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎁 Gift Codes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {activeView === 'discount' && <DiscountCoupons />}
        {activeView === 'gift' && <GiftCodes />}
        {activeView === 'referral' && <ReferralSettings />}
      </div>
    </div>
  );
};

export default CouponManagement;
