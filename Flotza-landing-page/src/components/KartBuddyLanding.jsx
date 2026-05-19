import React, { useState, useEffect } from "react";
import {
  Truck,
  Box,
  Clock,
  ShieldCheck,
  Headphones,
  Flag,
  MapPin,
  Building,
  Car,
  PackageCheck,
  PackageOpen,
  Facebook,
} from "lucide-react";
import logo from "../assets/images/logo.png";
import axios from "axios";

const KartBuddyLanding = () => {
  const addres="Sakinaka, Mumbai 400072";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const [currentJob, setCurrentJob] = useState("");
  const [msg_id, setMsgID] = useState("");
  
  // Job application form states
  const [applicationName, setApplicationName] = useState("");
  const [applicationMobile, setApplicationMobile] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [applicationResume, setApplicationResume] = useState(null);
  const [referralSource, setReferralSource] = useState("");
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const url = "https://api.kartbuddy.in/api/contact";

  // Services complete  data
  const services = [
    {
      id: 1,
      icon: <Truck className="w-12 h-12 text-blue-600" />,
      title: "Full & Part Load Transport",
      description: "Efficient transport solutions for shipments of all sizes",
    },
    {
      id: 2,
      icon: <Box className="w-12 h-12 text-blue-600" />,
      title: "Warehousing Solutions",
      description: "Secure storage facilities with inventory management",
    },
    {
      id: 3,
      icon: <Clock className="w-12 h-12 text-blue-600" />,
      title: "Express Delivery",
      description: "Rapid delivery services for time-sensitive shipments",
    },
    {
      id: 4,
      icon: <PackageCheck className="w-12 h-12 text-blue-600" />,
      title: "Last-Mile Delivery",
      description: "Efficient final-stage delivery to end customers",
    },
    {
      id: 5,
      icon: <Building className="w-12 h-12 text-blue-600" />,
      title: "Corporate & Industrial Transport",
      description: "Specialized logistics for businesses of all sizes",
    },
    {
      id: 6,
      icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
      title: "Secure Transport",
      description: "Enhanced security measures for valuable shipments",
    },
    {
      id: 7,
      icon: <Headphones className="w-12 h-12 text-blue-600" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service for all your needs",
    },
    {
      id: 8,
      icon: <Flag className="w-12 h-12 text-blue-600" />,
      title: "Pan India Reach",
      description: "Extensive network covering all regions of India",
    },
    {
      id: 9,
      icon: <PackageOpen className="w-12 h-12 text-blue-600" />,
      title: "Fast Delivery",
      description: "Swift transportation for all your shipping needs",
    },
    {
      id: 10,
      icon: <Car className="w-12 h-12 text-blue-600" />,
      title: "Vehicle Insurance Service",
      description: "Comprehensive coverage for your transport fleet",
    },
    {
      id: 11,
      icon: <Clock className="w-12 h-12 text-blue-600" />,
      title: "Same Day Delivery",
      description: "Order and forget stress",
    },
  ];

  // Timeline data
  const timeline = [
    {
      year: 2008,
      title: "Our Humble Beginnings",
      description:
        "Founded with a single goal—making logistics simple & stress-free.",
    },
    {
      year: 2015,
      title: "Expanding Horizons",
      description:
        "Introduced last-mile delivery & nationwide freight solutions.",
    },
    {
      year: 2023,
      title: "Innovation at Its Best",
      description:
        "AI-powered logistics tracking & eco-friendly transport solutions.",
    },
  ];

  // Handle tracking form submission
  const handleTracking = (e) => {
    e.preventDefault();
    alert(`Tracking information for ID: ${trackingId} will be displayed here.`);
  };

  // Handle mobile number input validation for 10 digits only
  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
       if (value === '' || (/^\d+$/.test(value) && value.length <= 10)) {
  setMobileNumber(value);
   // ✅ shows the latest input
}
  };
  
  // Handle application mobile number validation
  const handleApplicationMobileChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    if (value === '' || (/^\d+$/.test(value) && value.length <= 10)) {
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
      referralSource: referralSource
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

  // Handle Form Data
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const endpoint = "http://localhost:1337/api/form/contact";
  
      const payload = {
        full_name: full_name,            // ✅ use correct key names
        email: email,
        phone_number: mobileNumber,     // ✅ not "mobileNumber"
        message: message,
      };
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",   // ✅ tells server to expect JSON
        },
        body: JSON.stringify(payload),          // ✅ send JSON data
      });
      
      console.log("Sending JSON:", JSON.stringify(payload));

      const result = await response.json();
      console.log(result.data.message_id)
      setMsgID(result.data.message_id)
      console.log("API Response:", result);  // ✅ Log server response
  
      if (response.ok && result.success !== false) {
        // alert("Message posted successfully!");
  
        // Clear form fields
        setFullName("");
        setEmail("");
        setMobileNumber("");
        setMessage("");
  
        // Show success message
        setShowSuccess(true);
  
        setTimeout(() => {
          setShowSuccess(false);
        }, 30000);
      } else {
        alert(`Error: ${result?.message || "Submission failed"}`);
      }
  
    } catch (error) {
      console.error("API Error:", error);
      alert("Something went wrong while sending the message.");
    }
  };
  
  
  
  


  const closeSuccessMessage = () => {
    setShowSuccess(false);
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

  // CSS for a moving line along the border of the popup
  const spinnerStyles = `
    /* Top border animation */
    @keyframes topLine {
      0% { width: 0; left: 0; opacity: 1; }
      24.9% { width: 100%; left: 0; opacity: 1; }
      25% { width: 0; left: 100%; opacity: 0; }
      100% { width: 0; left: 100%; opacity: 0; }
    }
    
    /* Right border animation */
    @keyframes rightLine {
      0%, 24.9% { height: 0; top: 0; opacity: 0; }
      25% { height: 0; top: 0; opacity: 1; }
      49.9% { height: 100%; top: 0; opacity: 1; }
      50% { height: 0; top: 100%; opacity: 0; }
      100% { height: 0; top: 100%; opacity: 0; }
    }
    
    /* Bottom border animation */
    @keyframes bottomLine {
      0%, 49.9% { width: 0; right: 0; opacity: 0; }
      50% { width: 0; right: 0; opacity: 1; }
      74.9% { width: 100%; right: 0; opacity: 1; }
      75% { width: 0; right: 100%; opacity: 0; }
      100% { width: 0; right: 100%; opacity: 0; }
    }
    
    /* Left border animation */
    @keyframes leftLine {
      0%, 74.9% { height: 0; bottom: 0; opacity: 0; }
      75% { height: 0; bottom: 0; opacity: 1; }
      99.9% { height: 100%; bottom: 0; opacity: 1; }
      100% { height: 0; bottom: 100%; opacity: 0; }
    }
    
    .top-line {
      position: absolute;
      top: 0;
      left: 0;
      height: 3px;
      background-color: #3B82F6;
      animation: topLine 3s linear infinite;
      z-index: 20;
    }
    
    .right-line {
      position: absolute;
      right: 0;
      top: 0;
      width: 3px;
      background-color: #3B82F6;
      animation: rightLine 3s linear infinite;
      z-index: 20;
    }
    
    .bottom-line {
      position: absolute;
      bottom: 0;
      right: 0;
      height: 3px;
      background-color: #3B82F6;
      animation: bottomLine 3s linear infinite;
      z-index: 20;
    }
    
    .left-line {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 3px;
      background-color: #3B82F6;
      animation: leftLine 3s linear infinite;
      z-index: 20;
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{spinnerStyles}</style>
      {/* Header with Navigation */}
     <header className="fixed w-full z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-md py-2">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <div className="h-16 w-16 bg-transparent flex items-center justify-center mr-2">
          <img
            src={logo}
            alt="Flotza logo"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-10">
        {["Home", "Services", "About", "Contact"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-white text-xl font-bold hover:text-cyan-400 transition-colors duration-300 py-2"
          >
            {item}
          </a>
        ))}
        <a
          href="/career"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white text-xl font-bold hover:text-cyan-400 transition-colors duration-300 py-2"
        >
          Join Us
        </a>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              window.location.href = "https://app.kartbuddy.in/login";
            }}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-md font-medium transition-colors duration-300"
          >
            Login
          </button>
          <button
            onClick={() => {
              window.location.href = "https://app.kartbuddy.in/register";
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-md font-medium transition-colors duration-300"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Mobile menu button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white hover:text-cyan-400 focus:outline-none"
        >
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
              d={
                isMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>
    </div>

    {/* Mobile Navigation */}
    {isMenuOpen && (
      <nav className="md:hidden bg-gray-900/90 backdrop-blur-md shadow-lg rounded-lg mt-2 p-4 absolute left-0 right-0 mx-4 border border-gray-700 z-50">
        <div className="flex flex-col space-y-3">
          {["Home", "Services", "About", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-white hover:text-cyan-400 font-medium transition-colors duration-300 py-2 border-b border-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <a
            href="/career"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-cyan-400 font-medium transition-colors duration-300 py-2 border-b border-gray-700"
          >
            Join Us
          </a>
          <div className="flex flex-col space-y-2 pt-2">
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-300">
              Login
            </button>
            <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-300">
              Register
            </button>
          </div>
        </div>
      </nav>
    )}
  </div>
</header>


      {/* Hero Section */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }

          @keyframes spinSlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes pulseGlow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .animate-spin-slow {
            animation: spinSlow 20s linear infinite;
          }

          .animate-pulse-glow {
            animation: pulseGlow 4s ease-in-out infinite;
          }
        `}
      </style>

      <section
        id="home"
        className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
      >
        {/* Floating Circles */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-24 h-24 bg-cyan-500 rounded-full opacity-30 animate-pulse-glow"></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-amber-400 rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full opacity-10 animate-spin-slow"></div>
          <div className="absolute top-10 right-40 w-20 h-20 bg-cyan-300 rounded-full opacity-25 animate-float"></div>
          <div className="absolute bottom-10 left-1/4 w-28 h-28 bg-amber-300 rounded-full opacity-20 animate-pulse-glow"></div>
          <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-white rounded-full opacity-10 animate-spin-slow"></div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-20 w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Connecting <br />
                Parcels, <br />
                <span className="text-amber-400">Connecting people.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-md">
                Professional logistics solutions tailored to meet your business needs with reliability and efficiency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#services"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-medium text-center transition-all duration-300 shadow-md hover:shadow-amber-500/30"
                >
                  Our Services
                </a>
                <a
                  href="#about"
                  className="relative group bg-white text-black px-8 py-4 rounded-xl font-medium text-center overflow-hidden transition-all duration-300"
                >
                  <span className="relative z-10">About Us</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              </div>
            </div>

            {/* Right Content - Tracking Card */}
            <div className="flex justify-center">
              
              
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
     <section id="services" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
  <div className="max-w-7xl mx-auto px-6">
    {/* Section Header */}
    <div className="text-center mb-20">
      <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
        Our Services
      </h2>
      <div className="mt-4 mb-6 flex justify-center">
        <span className="inline-block h-1 w-28 bg-cyan-400 rounded-full"></span>
      </div>
      <p className="text-lg text-slate-300 max-w-2xl mx-auto">
        Professional logistics solutions tailored to meet your business needs
      </p>
    </div>

    {/* Services Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {services.map((service) => (
        <div
          key={service.id}
          className="group relative bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 hover:border-cyan-400 transition-all duration-500 ease-in-out transform hover:-translate-y-2 hover:shadow-cyan-500/30 flex flex-col items-center text-center"
          onMouseEnter={() => setActiveService(service.id)}
          onMouseLeave={() => setActiveService(null)}
        >
          {/* Icon Container */}
          <div
            className={`flex items-center justify-center w-20 h-20 rounded-full mb-6 transition-transform duration-500 ${
              activeService === service.id ? "bg-cyan-600 scale-110 animate-pulse" : "bg-slate-700"
            }`}
          >
            <div className="text-cyan-300 group-hover:text-white transition-colors duration-300">
              {service.icon}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
            {service.title}
          </h3>
          <p className="text-slate-400 leading-relaxed">
            {service.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* About Section */}
   <section id="about" className="relative py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
  {/* Background Glow */}
  <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-gray-800/30 to-gray-900/40 pointer-events-none"></div>

  <div className="max-w-6xl mx-auto px-6 relative z-10">
    {/* Hero Intro */}
    <div className="text-center mb-20">
      <h2 className="text-5xl font-extrabold text-white tracking-tight mb-4">
        About Flotza
      </h2>
      <p className="text-xl text-cyan-300 italic font-medium">
        "CONNECTING PARCELS, CONNECTING PEOPLE"
      </p>
      <div className="mt-6 flex justify-center">
        <span className="inline-block h-1 w-32 bg-cyan-400 rounded-full"></span>
      </div>
    </div>

    {/* Feature Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
      <div className="bg-gray-800 border border-cyan-500 rounded-2xl p-6 shadow-lg hover:shadow-cyan-500/30 transition duration-500 transform hover:-translate-y-2">
        <h3 className="text-xl font-bold text-cyan-400 mb-3">15+ Years of Excellence</h3>
        <p className="text-slate-300">
          Flotza has built a legacy of reliability, efficiency, and customer satisfaction in logistics.
        </p>
      </div>
      <div className="bg-gray-800 border border-cyan-500 rounded-2xl p-6 shadow-lg hover:shadow-cyan-500/30 transition duration-500 transform hover:-translate-y-2">
        <h3 className="text-xl font-bold text-cyan-400 mb-3">Tech-Driven Innovation</h3>
        <p className="text-slate-300">
          We integrate real-time tracking, AI route optimization, and seamless order management.
        </p>
      </div>
      <div className="bg-gray-800 border border-cyan-500 rounded-2xl p-6 shadow-lg hover:shadow-cyan-500/30 transition duration-500 transform hover:-translate-y-2">
        <h3 className="text-xl font-bold text-cyan-400 mb-3">Strategic Partnerships</h3>
        <p className="text-slate-300">
          Flotza empowers businesses with long-term relationships and efficient supply chains.
        </p>
      </div>
    </div>

    {/* Journey Milestones */}
    <div className="space-y-12">
      <h3 className="text-3xl font-bold text-center text-cyan-400 mb-10">Our Journey</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {timeline.map((item, index) => (
          <div key={index} className="bg-gray-800 border-l-4 border-cyan-500 p-6 rounded-xl shadow-md hover:shadow-cyan-500/30 transition duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-cyan-500 text-white font-bold text-lg shadow">
                {item.year}
              </div>
              <h4 className="ml-4 text-xl font-bold text-white">{item.title}</h4>
            </div>
            <p className="text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>



      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-count-up">
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <div className="text-blue-200">Years of Experience</div>
            </div>
            <div className="animate-count-up delay-100">
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Business Partners</div>
            </div>
            <div className="animate-count-up delay-200">
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-200">Deliveries per Month</div>
            </div>
            <div className="animate-count-up delay-300">
              <div className="text-4xl md:text-5xl font-bold mb-2">28</div>
              <div className="text-blue-200">States Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
   <section id="contact" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
  <div className="max-w-7xl mx-auto px-6">
    {/* Header */}
    <div className="text-center mb-16">
      <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
        Contact Us
      </h2>
      <div className="h-1 w-28 bg-cyan-400 mx-auto mb-6 rounded-full"></div>
      <p className="text-lg text-slate-300 max-w-2xl mx-auto">
        Have questions? We're here to help!
      </p>
    </div>

    {/* Grid Layout */}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Contact Info Card */}
      <div className="bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-700 hover:shadow-cyan-500/30 transition duration-500">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-cyan-400 mb-2">GET IN TOUCH</h3>
          <p className="text-slate-300">We'd love to hear from you</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-600 p-3 rounded-full">
              {/* Phone Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-slate-400">Phone</div>
              <div className="font-medium text-white">+91 7727918430</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-cyan-600 p-3 rounded-full">
              {/* Email Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-slate-400">Email</div>
              <div className="font-medium text-white">connect@Flotza.in</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-cyan-600 p-3 rounded-full">
              {/* Location Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-slate-400">Location</div>
              <div className="font-medium text-white">Jaipur, Rajasthan</div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 rounded-xl overflow-hidden shadow-lg">
          <iframe
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Jaipur,%20Rajasthan&output=embed"
          />
        </div>
      </div>

      {/* Contact Form Card */}
      <div className="bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-700 hover:shadow-amber-500/30 transition duration-500">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-amber-400 mb-2">SEND US A MESSAGE</h3>
          <p className="text-slate-300">We'll get back to you as soon as possible</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => handleSubmit(e)}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Your name"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-slate-300 mb-1">Mobile Number</label>
            <input
              id="mobileNumber"
              type="text"
              className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="10-digit mobile number"
              value={mobileNumber}
              onChange={handleMobileNumberChange}
              pattern="[0-9]{10}"
              title="Please enter a 10-digit mobile number"
              required
            />
            <p className="text-xs text-slate-400 mt-1">Enter a 10-digit mobile number</p>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">Message</label>
            <textarea
              id="message"
              rows={4}
              className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-md font-medium transition-colors duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
        </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center relative overflow-hidden">
            {/* Single line moving clockwise around the border */}
            <div className="absolute inset-0">
              <div className="top-line"></div>
              <div className="right-line"></div>
              <div className="bottom-line"></div>
              <div className="left-line"></div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">
              Thanks for contacting us.
            </h3>
            <p className="text-gray-600 mb-6 relative z-10">
              Your message has been posted successfully.
            </p>
            <p className="text-gray-600 mb-8 relative z-10">
              Your Message reference is {msg_id}
            </p>
            <button
              onClick={closeSuccessMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md font-medium transition duration-200 relative z-10"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Apply Now Popup */}
      {showApplyPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Apply for {currentJob}</h3>
              <button 
                onClick={closeApplyPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {!applicationSubmitted ? (
              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                {/* Name field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
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
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">Resume Upload</label>
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
                  <label htmlFor="referral" className="block text-sm font-medium text-gray-700 mb-1">How did you hear about us?</label>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h4>
                <p className="text-gray-600 mb-6">We are glad to see your interest being a part of our Team. Soon, you would hear from our HR.</p>
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
      <section className="py-12 md:py-16 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-patterns"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to streamline your logistics?
            </h2>
            <p className="text-blue-100 text-xl max-w-3xl mx-auto">
              Partner with KartBuddy for all your transport and logistics needs
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <a
                href="#contact"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-md font-medium text-lg transition-colors duration-300"
              >
                Contact Us
              </a>
              <a
                href="#services"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-md font-medium text-lg transition-colors duration-300"
              >
                Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
            <div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-yellow-500">
                  Flotza
                </div>
                <p className="text-gray-400 mt-2">
                  Connecting Parcels, Connecting People
                </p>
              </div>
              <p className="text-gray-400 text-sm">
                Flotza provides professional logistics solutions tailored to
                meet your business needs with unwavering reliability.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                {["Home", "Services", "About", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/career"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                  >
                    Career
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-white">
                Our Services
              </h3>
              <ul className="space-y-2">
                {[
                  "Full & Part Load Transport",
                  "Warehousing Solutions",
                  "Express Delivery",
                  "Last-Mile Delivery",
                  "24/7 Support",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#services"
                      className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 text-white">
                Contact Info
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500 mr-3 mt-1 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-gray-400">+91 7727918430</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500 mr-3 mt-1 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-400">connect@Flotza.com</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500 mr-3 mt-1 flex-shrink-0"
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
                  <span className="text-gray-400">Jaipur, Rajasthan-302003</span>
                </li>
              </ul>

              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3 text-white">Follow Us</h3>
                <div className="flex space-x-4">
                  {[
                    "facebook", 'linkedin',
                    //'twitter', 'instagram'
                  ].map((social) => (
                    <a
                      key={social}
                      href={
                        social === "facebook"
                          ? "https://www.facebook.com/profile.php?id=61561855412558"
                          :social=="linkedin"?"https://www.linkedin.com/company/kartbuddy-logistics-pvt-ltd/?viewAsMember=true": `#${social}`
                      }
                      target={"_blank"}
                      rel={"noopener noreferrer"}
                      className="bg-gray-800 hover:bg-blue-600 transition-colors duration-300 rounded-full w-8 h-8 flex items-center justify-center text-white"
                    >
                      {(social === "facebook" && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-4 h-4 fill-current">
                          <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                        </svg>
                      ))||(social==="linkedin"&&( <svg
          className="w-5 h-5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path d="M100.28 448H7.4V148.9h92.88zM53.79 
          108.1C24.09 108.1 0 83.74 0 
          54.22 0 24.48 24.4 0 54.69 
          0s53.79 24.48 53.79 54.22c-.1 
          29.52-24 53.88-54.69 53.88zM447.9 
          448h-92.68V302.4c0-34.7-.7-79.2-48.25-79.2-48.3 
          0-55.7 37.7-55.7 76.6V448h-92.6V148.9h88.9v40.8h1.3c12.4-23.5 
          42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />
        </svg>))
                    }                      
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 Flotza | All Rights Reserved
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-gray-300 text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-gray-300 text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-gray-300 text-sm"
                  >
                    Sitemap
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

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

export default KartBuddyLanding;