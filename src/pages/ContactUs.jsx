// src/pages/ContactUs.jsx
import React, { useEffect, useState } from 'react';
import '../styles/ContactUs.css';

/* ----- Inline icons (no external libs) ----- */
const IconMail = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h20v16H2zM4 6l8 6 8-6"/></svg>
);
const IconPhone = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2 11 11 0 003.5 1.1 1 1 0 01.99 1V20a2 2 0 01-2 2A18 18 0 014 6a2 2 0 012-2h3.9a1 1 0 011 .99 11 11 0 011.1 3.5 1 1 0 01-.2 1.1L6.6 10.8z"/></svg>
);
const IconMapPin = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9a2 2 0 112-2 2 2 0 01-2 2z"/></svg>
);
const IconClock = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 11h5v-2h-4V7h-2v6z"/></svg>
);
const IconSend = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
);

export default function ContactUs() {
  // reveal animation
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // 'ok' | 'err' | null
  const [statusMsg, setStatusMsg] = useState('');

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return alert('Please fill name, email, and message.');
    }
    setSending(true);
    setStatus(null);
    setStatusMsg('');

    // API Configuration
    const LOCAL_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
    const DEPLOY_BASE = (import.meta.env.VITE_API_DEPLOY_URL || "https://charity-backend-c05j.onrender.com/api").replace(/\/$/, "");
    const isLocalHost = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
    const BASE = isLocalHost ? LOCAL_BASE : DEPLOY_BASE;

    try {
      // Send the contact form data to your backend
      const res = await fetch(`${BASE}/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // This will trigger the email to be sent to your admin email
          toAdmin: true,
          recipientEmail: 'mucjisoduusho123@gmail.com' // Your email address
        }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) throw new Error(data?.message || 'Failed to send message');

      setStatus('ok');
      setStatusMsg('Thanks! Your message has been sent. We\'ll get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('err');
      setStatusMsg(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setSending(false);
    }
  }

  // Map
  const lat = 51.990705;
  const lon = -0.801065;
  const dLat = 0.01, dLon = 0.01;
  const bbox = {
    minLon: lon - dLon, minLat: lat - dLat, maxLon: lon + dLon, maxLat: lat + dLat,
  };
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLon}%2C${bbox.minLat}%2C${bbox.maxLon}%2C${bbox.maxLat}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <main className="contact">
      {/* HERO */}
      <section className="c-hero">
        <div className="c-hero-inner container-wide">
          <span className="badge reveal">Contact Us</span>
          <h1 className="title reveal">We'd love to hear from you</h1>
          <p className="sub reveal">
            Questions, ideas, partnership requests, or media? Send a message—our team will get back soon.
          </p>
          <div className="spark a">✨</div>
          <div className="spark b">📍</div>
        </div>
      </section>

      {/* GRID: form + info/map */}
      <section className="section container-wide c-grid">
        {/* FORM */}
        <form className="card c-form reveal" onSubmit={onSubmit}>
          <h2 className="form-title"><IconSend /> Send a message</h2>

          <div className="grid-2">
            <div className="form-row">
              <label className="label">Full Name</label>
              <input 
                name="name" 
                value={form.name} 
                onChange={onChange} 
                placeholder="e.g., Abdimahad Hussein" 
                required 
              />
            </div>
            <div className="form-row">
              <label className="label">Email</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={onChange} 
                placeholder="you@email.com" 
                required 
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-row">
              <label className="label">Phone (optional)</label>
              <input 
                type="tel" 
                name="phone" 
                value={form.phone} 
                onChange={onChange} 
                placeholder="61xxxxxxx" 
              />
            </div>
            <div className="form-row">
              <label className="label">Subject</label>
              <input 
                name="subject" 
                value={form.subject} 
                onChange={onChange} 
                placeholder="How can we help?" 
              />
            </div>
          </div>

          <div className="form-row">
            <label className="label">Message</label>
            <textarea 
              rows="4" 
              name="message" 
              value={form.message} 
              onChange={onChange} 
              placeholder="Type your message…" 
              required 
            />
          </div>

          <div className="submit-row">
            <button className="btn btn-primary sheen" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send Message'}
            </button>
            {status && <div className={`status ${status}`}>{statusMsg}</div>}
          </div>
        </form>

        {/* SIDEBAR: info + map */}
        <aside className="c-aside reveal">
          <div className="info-cards">
            <div className="icard i1">
              <div className="iicon"><IconMapPin /></div>
              <div>
                <h4>Address</h4>
                <p className="address-lines">
                  Flat 8<br />
                  2 Potter Lane<br />
                  Tattenhoe Park<br />
                  Milton Keynes<br />
                  MK4 4SR
                </p>
              </div>
            </div>

            <div className="icard i2">
              <div className="iicon"><IconPhone /></div>
              <div>
                <h4>Phone</h4>
                <p>07805860980</p>
              </div>
            </div>

            <div className="icard i3">
              <div className="iicon"><IconMail /></div>
              <div>
                <h4>Email</h4>
                <p>mucjisoduusho123@gmail.com</p>
              </div>
            </div>

            <div className="icard i4">
              <div className="iicon"><IconClock /></div>
              <div>
                <h4>Hours</h4>
                <p>Sat–Thu: 9:00–17:00<br />Fri: Closed</p>
              </div>
            </div>
          </div>

          <div className="map-card">
            <div className="map-title">
              <IconMapPin /> Our location
            </div>
            <div className="map-embed">
              <iframe
                title="Office location (OpenStreetMap)"
                src={osmEmbed}
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              className="map-link"
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in OpenStreetMap →
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}