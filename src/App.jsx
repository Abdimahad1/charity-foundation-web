import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Donate from './pages/Donate';
import Volunteers from './pages/Volunteers';
import ContactUs from './pages/ContactUs';
import DetailInfo from "./pages/DetailInfo";


function App() {
  return (
    <>
      <Header />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/events/:id" element={<DetailInfo />} />
        </Routes>
    </>
  );
}

export default App;
