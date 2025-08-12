import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Donate.css';

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

  const [loading, setLoading] = useState(false);
  const [txRef, setTxRef] = useState(null);
  const [status, setStatus] = useState(null); // 'pending' | 'success' | 'failed'
  const pollRef = useRef(null);

  const [rows, setRows] = useState([]);      // stores charity list
  const [q, setQ] = useState('');            // search query
  const [total, setTotal] = useState(0);     // total charities count
  const [error, setError] = useState('');    // error message

  // New state for pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50); // adjust if you add UI for it
  const [charityTotal, setCharityTotal] = useState(0);

  // Fetch charities with params
  const fetchRows = async ({ q = "", status = "all", page = 1, limit = 50 } = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/charities`, {
        params: { q, status, page, limit },
      });
      setRows(data.items || data);
      setTotal(data.total || data.length);
    } catch (error) {
      console.error(error);
      setError("Failed to load charities.");
    } finally {
      setLoading(false);
    }
  };

  // Load once on mount
  useEffect(() => {
    fetchRows({ q: '', status: 'all', page, limit });
  }, []);

  // Refetch when status or page changes
  useEffect(() => {
    fetchRows({ q: '', status, page, limit });
  }, [status, page]);

  // Debounce search (q)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchRows({ q, status, page: 1, limit });
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Reveal-on-scroll
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
    const base = import.meta.env.VITE_API_URL || '';
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${base}/payments/status/${encodeURIComponent(id)}`);
        if (!r.ok) return;
        const data = await r.json();
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

    const base = import.meta.env.VITE_API_URL || '';
    const payload = {
      method,
      amount: Number(finalAmount),     // ensure number
      currency,
      name: name?.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      note: note?.trim()
    };

    try {
      const res = await fetch(`${base}/payments/mobile/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Payment initiation failed');
      }

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      const id = data.reference || data.txRef || data.id;
      if (id) {
        setTxRef(id);
        setStatus(data.status || 'pending');
        await startPolling(id);
      } else {
        setStatus(data.status || 'success');
        clearPolling();
      }
    } catch (err) {
      console.error(err);
      setStatus('failed');
      alert(err.message);
      clearPolling();
    } finally {
      setLoading(false);
    }
  }

  // Cleanup polling on unmount
  useEffect(() => () => clearPolling(), []);

  return (
    <main className="donate">
      {/* HERO */}
      <section className="donate-hero">
        <div className="donate-hero-inner container-wide">
          <h1 className="title reveal">Donate</h1>
          <p className="sub reveal">
            Your contribution fuels education, healthcare, clean water, and empowerment programs.
          </p>
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
                placeholder="e.g., Ayaan Ali"
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
            />
            <p className="hint"><IconInfo /> You’ll receive a prompt on your phone to approve the payment.</p>
          </div>

          <div className="form-row">
            <label className="label">Note (optional)</label>
            <textarea
              rows="3"
              placeholder="Leave a message with your donation…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Terms checkbox (you had the state, adding the UI) */}
          <div className="form-row agree-row">
            <label className="agree">
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
              />
              <span>I agree to the terms and understand mobile prompts may be sent to my phone.</span>
            </label>
          </div>

          <div className="submit-row">
            <button className="btn btn-primary sheen" type="submit" disabled={loading || !finalAmount || !agree}>
              {loading ? 'Processing…' : `Donate ${formatMoney(finalAmount)}`}
            </button>
            {status && (
              <div className={`status ${status}`}>
                {status === 'pending' && <>Waiting for confirmation…</>}
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
          <ul className="summary-list">
            <li><span>Amount</span><strong>{formatMoney(finalAmount || 0)}</strong></li>
            <li><span>Fee</span><strong>{formatMoney(fee || 0)}</strong></li>
            <li className="total"><span>Total</span><strong>{formatMoney(total || 0)}</strong></li>
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
