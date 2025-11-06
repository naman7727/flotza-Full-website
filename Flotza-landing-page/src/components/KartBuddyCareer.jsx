import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";

const KartBuddyCareer = () => {
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const [currentJob, setCurrentJob] = useState("");

  // Job application form states
  const [applicationName, setApplicationName] = useState("");
  const [applicationMobile, setApplicationMobile] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [applicationResume, setApplicationResume] = useState(null);
  const [referralSource, setReferralSource] = useState("");
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Handle application mobile number validation
  const handleApplicationMobileChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    if (value === "" || (/^\d+$/.test(value) && value.length <= 10)) {
      setApplicationMobile(value);
    }
  };

  // Handle resume file upload
  const handleResumeUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setApplicationResume(e.target.files[0]);
    }
  };

  // Handle job application submission
  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the data to your backend
    console.log({
      job: currentJob,
      name: applicationName,
      mobile: applicationMobile,
      email: applicationEmail,
      resume: applicationResume,
      referralSource: referralSource,
    });

    // Show success and reset form
    setApplicationSubmitted(true);

    // Reset form after submission (optional)
    // setTimeout(() => {
    //   setApplicationName("");
    //   setApplicationMobile("");
    //   setApplicationEmail("");
    //   setApplicationResume(null);
    //   setReferralSource("");
    //   closeApplyPopup();
    //   setApplicationSubmitted(false);
    // }, 3000);
  };

  const openApplyPopup = (jobTitle) => {
    setCurrentJob(jobTitle);
    setShowApplyPopup(true);
    setApplicationSubmitted(false); // Reset submission status when opening
  };

  const closeApplyPopup = () => {
    setShowApplyPopup(false);
    // Reset form fields when closing
    setApplicationName("");
    setApplicationMobile("");
    setApplicationEmail("");
    setApplicationResume(null);
    setReferralSource("");
    setApplicationSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header with Navigation */}
      <header className="fixed w-full z-50 bg-white shadow-md py-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="h-16 w-16 bg-transparent flex items-center justify-center mr-2">
                <img
                  src={logo}
                  alt="Flotza logo"
                  className="h-full w-full object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-10">
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-colors duration-300"
              >
                Back to Home
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Apply Now Popup */}
      {showApplyPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Apply for {currentJob}
              </h3>
              <button onClick={closeApplyPopup} className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {!applicationSubmitted ? (
              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                {/* Name field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={applicationName}
                    onChange={(e) => setApplicationName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Mobile Number field */}
                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    value={applicationMobile}
                    onChange={handleApplicationMobileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Email field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email ID
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={applicationEmail}
                    onChange={(e) => setApplicationEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Resume upload */}
                <div>
                  <label
                    htmlFor="resume"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Resume Upload
                  </label>
                  <input
                    type="file"
                    id="resume"
                    onChange={handleResumeUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx"
                    required
                  />
                </div>

                {/* Referral source dropdown */}
                <div>
                  <label
                    htmlFor="referral"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    How did you hear about us?
                  </label>
                  <select
                    id="referral"
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="recruitment">Recruitment Website</option>
                    <option value="family-friend">Family/Friend</option>
                  </select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-300 flex-1"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={closeApplyPopup}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4 text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Application Submitted!
                </h4>
                <p className="text-gray-600 mb-6">
                  We are glad to see your interest being a part of our Team. Soon,
                  you would hear from our HR.
                </p>
                <button
                  onClick={closeApplyPopup}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-md font-medium transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Career Section */}
      <section id="join-team" className="relative pt-20">
        {/* Hero background with gradient overlay */}
        <div className="bg-blue-600 text-white text-center py-2 px-6 rounded-b-xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-patterns"></div>
          </div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: "url(\'https://source.unsplash.com/1600x900/?team,career\')",
            }}
          ></div>
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Join the Flotza Team
            </h2>
            <p className="text-lg md:text-xl italic opacity-90">
              Build your career with a team that values growth, innovation, and
              success.
            </p>
          </div>
          {/* Decorative shapes */}
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-200 opacity-60 rounded-full"></div>
          <div className="absolute top-10 right-10 w-16 h-16 bg-yellow-200 opacity-60 rounded-full"></div>
        </div>

        {/* Career content */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-blue-50 p-6 text-center border-b border-blue-100">
              <h3 className="text-3xl font-bold text-blue-900 mb-2">
                Current Openings
              </h3>
              <p className="text-blue-700">
                Take the next step in your career journey with us
              </p>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Job Listing 1 */}
                <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  <div className="bg-blue-600 h-2 w-full group-hover:bg-yellow-500 transition-colors duration-300"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-bold text-blue-900">
                        Logistics Coordinator
                      </h4>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Full-Time
                      </span>
                    </div>
                    <div className="flex items-center mb-3 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Mumbai, India
                    </div>
                    <p className="text-gray-700 mb-6">
                      Manage and streamline logistics operations to ensure timely
                      deliveries.
                    </p>
                    <button
                      onClick={() => openApplyPopup("Logistics Coordinator")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition-colors duration-300 flex items-center justify-center"
                    >
                      <span>Apply Now</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Job Listing 2 */}
                <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  <div className="bg-blue-600 h-2 w-full group-hover:bg-yellow-500 transition-colors duration-300"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-bold text-blue-900">
                        Customer Support Executive
                      </h4>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Full-Time
                      </span>
                    </div>
                    <div className="flex items-center mb-3 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Bangalore, India
                    </div>
                    <p className="text-gray-700 mb-6">
                      Provide exceptional support to customers and enhance their
                      experience.
                    </p>
                    <button
                      onClick={() => openApplyPopup("Customer Support Executive")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition-colors duration-300 flex items-center justify-center"
                    >
                      <span>Apply Now</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Job Listing 3 */}
                <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group md:col-span-2">
                  <div className="bg-blue-600 h-2 w-full group-hover:bg-yellow-500 transition-colors duration-300"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-bold text-blue-900">
                        Operations Manager
                      </h4>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Full-Time
                      </span>
                    </div>
                    <div className="flex items-center mb-3 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Delhi, India
                    </div>
                    <p className="text-gray-700 mb-6">
                      Lead the operations team and optimize supply chain
                      management.
                    </p>
                    <button
                      onClick={() => openApplyPopup("Operations Manager")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition-colors duration-300 flex items-center justify-center"
                    >
                      <span>Apply Now</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits section */}
          <div className="mt-16 bg-gray-50 rounded-xl p-8 shadow-md">
            <h3 className="text-2xl font-bold text-center text-blue-900 mb-8">
              Why Join Flotza ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  Growth Opportunities
                </h4>
                <p className="text-gray-600">
                  Continuous learning and career advancement paths for all team
                  members
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  Collaborative Culture
                </h4>
                <p className="text-gray-600">
                  Work with a diverse team that values your input and innovative
                  ideas
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  Competitive Benefits
                </h4>
                <p className="text-gray-600">
                  Attractive compensation and benefits package to support your
                  wellbeing
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 1s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 1s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .animate-count-up {
          opacity: 0;
          animation: fadeInUp 1s ease-out forwards;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .bg-patterns {
          background-image: linear-gradient(30deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%, rgba(255, 255, 255, 0.1)),
            linear-gradient(150deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%, rgba(255, 255, 255, 0.1)),
            linear-gradient(30deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%, rgba(255, 255, 255, 0.1)),
            linear-gradient(150deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%, rgba(255, 255, 255, 0.1)),
            linear-gradient(60deg, rgba(255, 255, 255, 0.1) 25%, transparent 25.5%, transparent 75%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.1)),
            linear-gradient(60deg, rgba(255, 255, 255, 0.1) 25%, transparent 25.5%, transparent 75%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.1));
          background-size: 30px 51.96px;
          background-position: 0 0, 0 0, 15px 25.98px, 15px 25.98px, 0 0, 15px 25.98px;
        }
        
        /* Rotating border animation */
        .rotating-border {
          position: relative;
        }
        
        .rotating-border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 3px;
          background: #3B82F6;
          animation: rotatingBorder 12s linear forwards;
        }
        
        @keyframes rotatingBorder {
          0% { width: 0; height: 3px; top: 0; left: 0; }
          25% { width: 100%; height: 3px; top: 0; left: 0; }
          25.001% { width: 3px; height: 0; top: 0; right: 0; left: auto; }
          50% { width: 3px; height: 100%; top: 0; right: 0; left: auto; }
          50.001% { width: 0; height: 3px; bottom: 0; right: 0; top: auto; left: auto; }
          75% { width: 100%; height: 3px; bottom: 0; right: auto; top: auto; left: 0; }
          75.001% { width: 3px; height: 0; bottom: 0; right: auto; top: auto; left: 0; }
          100% { width: 3px; height: 100%; bottom: auto; right: auto; top: 0; left: 0; }
        }
      `}</style>
    </div>
  );
};

export default KartBuddyCareer; 