import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KartBuddyLanding from './components/KartBuddyLanding';
import KartBuddyCareer from './components/KartBuddyCareer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<KartBuddyLanding />} />
        <Route path="/career" element={<KartBuddyCareer />} />
      </Routes>
    </Router>
  );
}

export default App;

