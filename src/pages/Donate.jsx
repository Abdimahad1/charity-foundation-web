import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Donate.css';
import Swal from 'sweetalert2';

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

/* ---------- Brand images ---------- */
import evcLogo from '../assets/evc.png';
import edahabLogo from '../assets/e-dahab.png';

/* ---------- Simple inline icons ---------- */
const IconShield = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l7 3v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5l7-3z"/>
  </svg>
);
const IconInfo = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9a10 10 0 100 20 10 10 0 000-20z"/>
  </svg>
);
const IconSearch = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

export default function Donate() {
  const [method, setMethod] = useState('EVC'); // 'EVC' | 'EDAHAB'
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'SOS'
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // msisdn
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [agree, setAgree] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [txRef, setTxRef] = useState(null);
  const [status, setStatus] = useState(null); // 'pending' | 'success' | 'failed'
  const pollRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const res = await API.get('/charities');
        setProjects(res.data.items || res.data || []);
      } catch (err) {
        console.error('Error fetching projects', err);
        setProjectsError('Failed to load projects');
      } finally {
        setProjectsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Check for project ID in URL or session storage
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const projectIdFromUrl = urlParams.get('projectId');
    
    if (projectIdFromUrl) {
      setProjectId(projectIdFromUrl);
      // Find and set the selected project
      const project = projects.find(p => p._id === projectIdFromUrl);
      if (project) {
        setSelectedProject(project);
      }
    } else {
      const storedProjectId = sessionStorage.getItem('selectedProjectId');
      if (storedProjectId) {
        setProjectId(storedProjectId);
        // Find and set the selected project
        const project = projects.find(p => p._id === storedProjectId);
        if (project) {
          setSelectedProject(project);
        }
        sessionStorage.removeItem('selectedProjectId');
      }
    }
  }, [location, projects]);

  // Reveal-on-scroll animation
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.15 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const presets = useMemo(
    () => (currency === 'USD' ? [5, 10, 25, 50, 100] : [100, 250, 500, 1000, 2000]),
    [currency]
  );

  const finalAmount = useMemo(() => {
    const chosen = custom ? Number(custom) : Number(amount);
    return Number.isFinite(chosen) && chosen > 0 ? chosen : 0;
  }, [amount, custom]);

  const fee = useMemo(() => {
    const base = Math.round(finalAmount * 0.015 * 100) / 100;
    return Math.min(base, currency === 'USD' ? 3 : 100); // cap fee
  }, [finalAmount, currency]);

  const totalAmount = useMemo(() => finalAmount + (fee || 0), [finalAmount, fee]);

  function handlePresetClick(v) {
    setAmount(v);
    setCustom('');
  }

  function formatMoney(x) {
    const opts = { style: 'currency', currency, minimumFractionDigits: 0 };
    try { return new Intl.NumberFormat(undefined, opts).format(x); }
    catch { return `${x} ${currency}`; }
  }

  function clearPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function startPolling(id) {
    clearPolling();
    pollRef.current = setInterval(async () => {
      try {
        const r = await API.get(`/payments/status/${encodeURIComponent(id)}`);
        const data = r.data;
        if (data.status === 'success' || data.status === 'failed') {
          setStatus(data.status);
          clearPolling();
        }
      } catch (_) {}
    }, 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!agree) return alert('Please accept the terms.');
    if (!finalAmount) return alert('Please enter a valid amount.');
    if (!phone) return alert('Please enter your mobile number.');

    setLoading(true);
    setStatus('pending');
    setTxRef(null);

    const payload = {
      method,
      amount: Number(finalAmount),
      currency,
      name: name?.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      note: note?.trim(),
      projectId: projectId || undefined // Only include if a project is selected
    };

    try {
      const res = await API.post('/payments/mobile/initiate', payload);

      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }

      const id = res.data.reference || res.data.txRef || res.data.id;
      if (id) {
        setTxRef(id);
        setStatus(res.data.status || 'pending');
        await startPolling(id);
      } else {
        setStatus(res.data.status || 'success');
        clearPolling();
      }
    } catch (err) {
      console.error(err);
      setStatus('failed');
      alert(err.response?.data?.message || err.message || 'Payment initiation failed');
      clearPolling();
    } finally {
      setLoading(false);
    }
  }

  // Cleanup polling on unmount
  useEffect(() => () => clearPolling(), []);

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(p => 
      p.title?.toLowerCase().includes(query) || 
      p.location?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleProjectSelect = (project) => {
    setProjectId(project._id);
    setSelectedProject(project);
    setShowProjectSelector(false);
  };

  const handleRemoveProject = () => {
    setProjectId(null);
    setSelectedProject(null);
  };

  return (
    <main className="donate">
      {/* HERO */}
      <section className="donate-hero">
        <div className="donate-hero-inner container-wide">
          <h1 className="title reveal">Donate</h1>
          <p className="sub reveal">
            Your contribution fuels education, healthcare, clean water, and empowerment programs.
          </p>
          {selectedProject && (
            <div className="charity-info reveal">
              <strong>Donating to: {selectedProject.title}</strong>
              <span className="location">{selectedProject.location}</span>
            </div>
          )}
          <div className="secure reveal">
            <span className="shield"><IconShield /></span>
            Secure mobile payments via Hormuud EVC Plus & E-Dahab
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="section container-wide form-grid">
        {/* Left: Payment form */}
        <form className="card form reveal" onSubmit={handleSubmit}>
          {/* Project Selection */}
          <div className="form-row">
            <label className="label">Select a Project (Optional)</label>
            {selectedProject ? (
              <div className="selected-project">
                <div className="project-info">
                  <h4>{selectedProject.title}</h4>
                  <p className="project-category">{selectedProject.category} • {selectedProject.location}</p>
                </div>
                <button 
                  type="button" 
                  className="remove-project"
                  onClick={handleRemoveProject}
                >
                  ×
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="btn-select-project"
                onClick={() => setShowProjectSelector(true)}
              >
                Select a specific project
              </button>
            )}
          </div>

          {showProjectSelector && (
            <div className="project-selector-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Select a Project</h3>
                  <button 
                    className="close-modal"
                    onClick={() => setShowProjectSelector(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="search-box">
                  <IconSearch />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="projects-list">
                  {projectsLoading ? (
                    <div className="loading">Loading projects...</div>
                  ) : projectsError ? (
                    <div className="error">{projectsError}</div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="no-projects">No projects found</div>
                  ) : (
                    filteredProjects.map(project => (
                      <div 
                        key={project._id} 
                        className="project-item"
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="project-details">
                          <h4>{project.title}</h4>
                          <p>{project.category} • {project.location}</p>
                        </div>
                        <div className="project-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ 
                                width: `${project.goal ? Math.min(100, Math.round((Number(project.raised || 0) / Number(project.goal || 1)) * 100)) : 0}%` 
                              }}
                            ></div>
                          </div>
                          <div className="progress-text">
                            ${Number(project.raised || 0).toLocaleString()} of ${Number(project.goal || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <label className="label">Payment Method</label>
            <div className="tabs">
              <button
                type="button"
                className={`tab ${method === 'EVC' ? 'active evc' : ''}`}
                onClick={() => setMethod('EVC')}
                aria-pressed={method === 'EVC'}
              >
                <span className="brand-logo" aria-hidden="true">
                  <img src={evcLogo} alt="" />
                </span>
                <span className="tab-text">EVC Plus</span>
              </button>

              <button
                type="button"
                className={`tab ${method === 'EDAHAB' ? 'active edahab' : ''}`}
                onClick={() => setMethod('EDAHAB')}
                aria-pressed={method === 'EDAHAB'}
              >
                <span className="brand-logo" aria-hidden="true">
                  <img src={edahabLogo} alt="" />               
               </span>
                <span className="tab-text">E-Dahab</span>
              </button>
            </div>
          </div>

          <div className="form-row">
            <label className="label">Currency</label>
            <div className="inline">
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="SOS">SOS</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="label">Choose Amount</label>
            <div className="presets">
              {presets.map(v => (
                <button
                  key={v}
                  type="button"
                  className={`pill ${!custom && amount === v ? 'active' : ''}`}
                  onClick={() => handlePresetClick(v)}
                >
                  {formatMoney(v)}
                </button>
              ))}
              <div className="custom-amount">
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Custom"
                  value={custom}
                  onChange={e => setCustom(e.target.value)}
                />
                <span className="cur">{currency}</span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-row">
              <label className="label">Full Name (optional)</label>
              <input
                type="text"
                placeholder="e.g., Abdimahad Hussein Abdulle"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="label">Email (receipt)</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <label className="label">
              {method === 'EVC' ? 'EVC Phone Number' : 'E-Dahab Phone Number'}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder={method === 'EVC' ? '61xxxxxxx' : '65 / 66 xxxxxxx'}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <p className="hint"><IconInfo /> You'll receive a prompt on your phone to approve the payment.</p>
          </div>

          <div className="form-row">
            <label className="label">Note (optional)</label>
            <textarea
              rows="3"
              placeholder="Leave a message with your donation..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="form-row agree-row">
            <label className="agree">
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                required
              />
              <span>I agree to the terms and understand mobile prompts may be sent to my phone.</span>
            </label>
          </div>

          <div className="submit-row">
            <button 
              className="btn btn-primary sheen" 
              type="button" // Change type to button to prevent form submission
              onClick={() => {
                Swal.fire({
                  title: "Donation Not Ready",
                  text: "Sorry, the donation program is not yet implemented. We will soon do it.",
                  icon: "info",
                  confirmButtonText: "OK",
                  backdrop: 'rgba(0,0,0,0.5)', // Optional: darken the background
                });
              }}
            >
              {loading ? 'Processing...' : `Donate ${formatMoney(finalAmount)}`}
            </button>
            {status && (
              <div className={`status ${status}`}>
                {status === 'pending' && <>Waiting for confirmation...</>}
                {status === 'success' && <>Payment received. Thank you! 🎉</>}
                {status === 'failed' && <>Payment failed. Please try again.</>}
            </div>
            )}
          </div>

          {txRef && (
            <div className="txref">
              Reference: <strong>{txRef}</strong>
            </div>
          )}
        </form>

        {/* Right: Summary / Info */}
        <aside className="card summary reveal">
          <h3>Summary</h3>
          {selectedProject && (
            <div className="selected-project-summary">
              <h4>Donating to:</h4>
              <p>{selectedProject.title}</p>
              <div className="project-progress-summary">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${selectedProject.goal ? Math.min(100, Math.round((Number(selectedProject.raised || 0) / Number(selectedProject.goal || 1)) * 100)) : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  ${Number(selectedProject.raised || 0).toLocaleString()} raised of ${Number(selectedProject.goal || 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          <ul className="summary-list">
            <li><span>Amount</span><strong>{formatMoney(finalAmount || 0)}</strong></li>
            <li><span>Fee</span><strong>{formatMoney(fee || 0)}</strong></li>
            <li className="total"><span>Total</span><strong>{formatMoney(totalAmount || 0)}</strong></li>
          </ul>

          <div className="gateways">
            <div className={`gw evc ${method === 'EVC' ? 'active' : ''}`}>
              <img className="brand-img" src={evcLogo} alt="EVC Plus" />
              <span>EVC Plus</span>
            </div>
            <div className={`gw edahab ${method === 'EDAHAB' ? 'active' : ''}`}>
              <img className="brand-img" src={edahabLogo} alt="E-Dahab" />
              <span>E-Dahab</span>
            </div>
          </div>

          <div className="tip">
            Donations are processed securely. For large gifts or bank transfers, please contact us.
          </div>
        </aside>
      </section>
    </main>
  );
}