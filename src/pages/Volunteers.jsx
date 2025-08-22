import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Volunteers.css';
//imort axios
import axios from 'axios';
/* ---------- API Configuration ---------- */
const LOCAL_BASE =
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const DEPLOY_BASE =
  (import.meta.env.VITE_API_DEPLOY_URL || "https://charity-backend-30xl.onrender.com/api").replace(/\/$/, "");

// If the app runs on localhost, use local API; otherwise use deployed API.
const isLocalHost = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
const BASE = isLocalHost ? LOCAL_BASE : DEPLOY_BASE;

// Create axios instance with base URL
const API = axios.create({ baseURL: BASE });

/* --------- Inline icons (no external libs) --------- */
const IconHandsHeart = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12l5-5 5 5-5 5-5-5zm10 0l5-5 5 5-5 5-5-5z"/></svg>
);
const IconUser = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 10-5-5 5 5 0 005 5zm0 2c-4 0-9 2-9 6v2h18v-2c0-4-5-6-9-6z"/></svg>
);
const IconMail = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h20v16H2zM4 6l8 6 8-6"/></svg>
);
const IconPhone = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2 11 11 0 003.5 1.1 1 1 0 011 .99V20a2 2 0 01-2 2A18 18 0 014 6a2 2 0 012-2h3.9a1 1 0 011 .99 11 11 0 011.1 3.5 1 1 0 01-.2 1.1L6.6 10.8z"/></svg>
);
const IconMapPin = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9a2 2 0 112-2 2 2 0 01-2 2z"/></svg>
);
const IconClock = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 11h5v-2h-4V7h-2v6z"/></svg>
);
const IconUpload = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l4 4h-3v6h-2V7H8l4-4zM4 19h16v2H4z"/></svg>
);
const IconInfo = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9a10 10 0 100 20 10 10 0 000-20z"/></svg>
);
const IconCheck = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5 1.5-1.5L9 14l9.5-9.5z"/></svg>
);

export default function Volunteers() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------- Form state ---------- */
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mogadishu');
  const [district, setDistrict] = useState('Hodan');
  const [availability, setAvailability] = useState('Weekends');
  const [role, setRole] = useState('Field Volunteer');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');
  const [cv, setCv] = useState(null);
  const [agree, setAgree] = useState(false);

  const INTERESTS = useMemo(
    () => ['Education', 'Health', 'Water & Sanitation', 'Food Relief', 'Women & Youth', 'Logistics', 'Fundraising', 'Tech Support'],
    []
  );
  const [interests, setInterests] = useState(['Education']);

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  function toggleInterest(tag) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function onCvChange(e) {
    const file = e.target.files?.[0];
    if (!file) return setCv(null);
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Max 2MB.');
      e.target.value = '';
      return setCv(null);
    }
    setCv(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      return alert('Full name, email, and phone are required.');
    }
    if (!agree) return alert('Please accept the terms.');

    setSubmitting(true);
    setStatus(null);
    setStatusMsg('');

    try {
      const formData = new FormData();
      
      // Append all form data
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('city', city);
      formData.append('district', district);
      formData.append('availability', availability);
      formData.append('role', role);
      formData.append('skills', skills);
      formData.append('message', message);
      formData.append('interests', JSON.stringify(interests));
      
      // Append CV file if exists
      if (cv) {
        formData.append('cv', cv);
      }

      // Use the centralized API configuration
      const response = await API.post('/volunteers/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        setStatus('success');
        setStatusMsg(response.data.message || 'Thanks! Your application has been received.');

        // Reset form
        setFullName('');
        setEmail('');
        setPhone('');
        setSkills('');
        setMessage('');
        setCv(null);
        setInterests(['Education']);
        setAgree(false);
      } else {
        throw new Error(response.data?.message || 'Submission failed');
      }
    } catch (err) {
      setStatus('error');
      setStatusMsg(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="volunteers">
      {/* HERO */}
      <section className="v-hero">
        <div className="v-hero-inner container-wide">
          <span className="badge reveal">Volunteer</span>
          <h1 className="title reveal">Join Our Community of Helpers</h1>
          <p className="sub reveal">
            Lend your time and skills to education, healthcare, clean water, and empowerment programs.
          </p>
          <div className="spark a">✨</div>
          <div className="spark b">🤝</div>
        </div>
      </section>

      {/* GRID: Form + Sidebar */}
      <section className="section container-wide v-grid">
        {/* FORM CARD */}
        <form className="card v-form reveal" onSubmit={handleSubmit}>
          <h2 className="form-title"><IconHandsHeart /> Volunteer Application</h2>

          <div className="grid-2">
            <div className="form-row">
              <label className="label"><IconUser /> Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g., Abdimahad Hussein" required />
            </div>
            <div className="form-row">
              <label className="label"><IconMail /> Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-row">
              <label className="label"><IconPhone /> Phone</label>
              <input type="tel" inputMode="numeric" value={phone} onChange={e => setPhone(e.target.value)} placeholder="61xxxxxxx" required />
            </div>
            <div className="form-row">
              <label className="label"><IconMapPin /> City / District</label>
              <div className="inline-2">
                <select value={city} onChange={e => setCity(e.target.value)}>
                  <option>Mogadishu</option><option>Hargeisa</option><option>Garowe</option>
                  <option>Kismayo</option><option>Baidoa</option>
                </select>
                <select value={district} onChange={e => setDistrict(e.target.value)}>
                  <option>Hodan</option><option>Wadajir</option><option>Karaan</option>
                  <option>Daynile</option><option>Hamarweyne</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-row">
              <label className="label"><IconClock /> Availability</label>
              <select value={availability} onChange={e => setAvailability(e.target.value)}>
                <option>Weekdays</option><option>Weekends</option><option>Evenings</option><option>Flexible</option>
              </select>
            </div>
            <div className="form-row">
              <label className="label"><IconInfo /> Preferred Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option>Field Volunteer</option><option>Medical Support</option><option>Education Tutor</option>
                <option>Logistics</option><option>Fundraising</option><option>Tech Support</option><option>Media & Comms</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="label">Interests</label>
            <div className="chips">
              {INTERESTS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`chip ${interests.includes(tag) ? 'active' : ''}`}
                  aria-pressed={interests.includes(tag)}
                >
                  {interests.includes(tag) ? <IconCheck /> : null}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label className="label">Skills & Experience</label>
            <textarea rows="3" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Tell us about your skills, languages, certifications…"></textarea>
          </div>

          <div className="form-row">
            <label className="label">Why do you want to volunteer?</label>
            <textarea rows="3" value={message} onChange={e => setMessage(e.target.value)} placeholder="A short note helps us match roles better."></textarea>
          </div>

          <div className="form-row">
            <label className="label"><IconUpload /> CV / Resume (optional, max 2MB)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={onCvChange} />
          </div>

          <div className="form-row checkbox">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
            <label>I agree to the terms & conditions</label>
          </div>

          <div className="submit-row">
            <button className="btn btn-primary sheen" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
            {status && <div className={`status ${status}`}>{statusMsg}</div>}
          </div>
        </form>

        {/* SIDEBAR */}
        <aside className="card v-aside reveal">
          <h3>Why Volunteer?</h3>
          <ul className="bullets">
            <li><strong>Real Impact:</strong> support Disability, Religious Activities, education, health, and clean water projects.</li>
            <li><strong>Grow Your Skills:</strong> leadership, teamwork, and hands-on experience.</li>
            <li><strong>Community:</strong> join a caring network of change-makers.</li>
          </ul>

          <div className="perk-grid">
            <div className="perk p1">🎓 Training</div>
            <div className="perk p2">🧰 Tools</div>
            <div className="perk p3">📜 Certificate</div>
            <div className="perk p4">🤝 Mentorship</div>
          </div>

          <div className="note">
            After you submit, our team will review your application and contact you within a few days.
          </div>
        </aside>
      </section>
    </main>
  );
}