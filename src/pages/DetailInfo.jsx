import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import "../styles/DetailInfo.css";
import axios from "axios";

/* ---------- API base detection ---------- */
const LOCAL_BASE =
  (import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api").replace(/\/$/, "");
const DEPLOY_BASE =
  (import.meta.env.VITE_API_DEPLOY_URL ||
    import.meta.env.VITE_API_DEPLOY ||
    "https://charity-backend-c05j.onrender.com/api").replace(/\/$/, "");
const isLocalHost = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
const API_BASE = isLocalHost ? LOCAL_BASE : DEPLOY_BASE;
const API = axios.create({ baseURL: API_BASE });

/* ---------- helpers ---------- */
const isBlobLike = (u = "") => /^blob:|^data:/i.test(String(u));
const formatImageUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http") || isBlobLike(url)) return url;
  if (url.startsWith("/uploads")) return `${API_BASE.replace("/api", "")}${url}`;
  return `${API_BASE.replace("/api", "")}/uploads/${url}`;
};
const pickEventCover = (e) => {
  if (e?.coverImage) return formatImageUrl(e.coverImage);
  const img0 = Array.isArray(e?.images) ? e.images[0] : undefined;
  const img0Url = img0 && typeof img0 === "object" ? (img0.url ?? img0.src ?? img0.path) : img0;
  const candidate = e?.cover?.url ?? e?.image ?? img0Url ?? (e?.filename ? `/uploads/images/${e.filename}` : "");
  return formatImageUrl(candidate);
};

/* ---------- light sanitiser for server HTML ---------- */
function sanitize(html = "") {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  tmp.querySelectorAll("script, style, iframe, object, embed").forEach((el) => el.remove());
  tmp.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
    });
  });
  return tmp.innerHTML;
}

/* ---------- Footer Component ---------- */
const Footer = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo" aria-label="Home">
              <span className="logo-dot" /> Charity
              <span className="logo-bold">Hope</span>
            </Link>
            <p className="footer-intro">
              Transparent, community-driven aid. We partner locally to deliver education, healthcare,
              clean water, and opportunity—responsibly and at scale.
            </p>

            <div className="footer-social" aria-label="Social media">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" className="social-ic"><path d="M13 22v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2h-3a5 5 0 0 0-5 5v3H6v4h3v8z"/></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)">
                <svg viewBox="0 0 24 24" className="social-ic"><path d="M14.7 3h4.3l-9.4 10.7L19 21h-4.3l-6.1-7-2.8 3.2V21H2V3h3.8v9.1z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" className="social-ic"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1 5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z"/></svg>
              </a>
              <a href="https://wa.me/252" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" className="social-ic"><path d="M20 4a10 10 0 0 0-16 12L3 21l5-1a10 10 0 0 0 12-16zm-3.1 12.5c-.4 1-2.4 1-3.3.8s-2.2-.8-3.7-2.2-2-2.6-2.2-3.7.2-2.9.8-3.3.8-.3 1.1 0l1.6 1.8c.1.1.2.4.1.6s-.5 1-.7 1.2-.2.4 0 .7a7.3 7.3 0 0 0 2.1 2.1c.3.2.5.2.7 0s1-.6 1.2-.7.5 0 .6.1l1.8 1.6c.2.3.2.8-.1 1.1z"/></svg>
              </a>
            </div>
          </div>

          <nav className="footer-links" aria-label="Quick links">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/volunteers">Volunteer</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>

          <div className="footer-donate">
            <h4>Make an Impact</h4>
            <p>Your support provides essentials today and builds resilience for tomorrow.</p>
            <Link to="/donate" className="btn btn-primary sheen footer-donate-btn">Donate Now</Link>
          </div>

          <div className="footer-news">
            <h4>Newsletter</h4>
            <p>Get field stories and project updates (1–2×/month).</p>
            <form className="news-form">
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                aria-label="Email address"
              />
              <button className="btn btn-ghost" type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-row">
          <span>© {new Date().getFullYear()} AVUUBI NGO. All rights reserved.</span>
          <div className="legal-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/donor-policy">Donor Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function DetailInfo() {
  const { id } = useParams();
  const { state } = useLocation();
  const [item, setItem] = useState(state?.event || null);
  const [loading, setLoading] = useState(!state?.event);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state?.event) return; // we were navigated with data already
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        // Try common endpoints. Adjust if your backend differs.
        const endpoints = [`/events/${id}`, `/events/public/${id}`];
        let data = null;

        for (const ep of endpoints) {
          try {
            const res = await API.get(ep);
            data = Array.isArray(res.data)
              ? res.data[0]
              : (res.data?.item || res.data?.event || res.data);
            if (data) break;
          } catch {
            /* keep trying */
          }
        }
        if (!data) throw new Error("Not found");

        const normalized = {
          id: data?._id || data?.id || id,
          title: String(data?.title || data?.name || "Untitled"),
          cover: pickEventCover(data),
          when: data?.date || data?.publishedAt || data?.createdAt || null,
          location: data?.location || data?.city || "",
          category: (data?.category && (data.category.name || data.category)) || "Event",
          descriptionHtml: data?.description || data?.content || data?.excerpt || "",
        };

        if (!cancelled) setItem(normalized);
      } catch (e) {
        if (!cancelled) setError("Could not load this event.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, state?.event]);

  const fmtDateLong = (d) => {
    const dt = d ? new Date(d) : null;
    if (!dt || Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="detail">
        <header className="detail-hero">
          <div className="container">
            <div className="crumbs skeleton-line" aria-hidden="true" />
            <div className="detail-title skeleton-line" style={{ width: "60%" }} aria-hidden="true" />
            <div className="detail-meta skeleton-line" style={{ width: "40%" }} aria-hidden="true" />
          </div>
        </header>
        <section className="container detail-body">
          <div className="detail-cover skeleton-block" />
          <div className="detail-content">
            <p className="skeleton-line" />
            <p className="skeleton-line" />
            <p className="skeleton-line" style={{ width: "80%" }} />
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="detail">
        <section className="container detail-body">
          <div className="error-box">
            <h2>Event unavailable</h2>
            <p>{error || "We couldn't find details for this event."}</p>
            <div className="actions">
              <Link to="/" className="btn btn-primary">Go Home</Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="detail">
      {/* Header/breadcrumbs & title */}
      <header className="detail-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <span aria-current="page">{item.title}</span>
          </nav>

          <h1 className="detail-title">{item.title}</h1>

          <div className="detail-meta">
            {item.when && (
              <time dateTime={new Date(item.when).toISOString()} className="when">
                {fmtDateLong(item.when)}
              </time>
            )}
            {item.location && <span className="loc">📍 {item.location}</span>}
            <span className="badge">{item.category}</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <section className="container detail-body">
        {item.cover && (
          <figure className="detail-cover">
            <img src={item.cover} alt={item.title} loading="eager" decoding="async" />
          </figure>
        )}

        <article
          className="detail-content"
          dangerouslySetInnerHTML={{ __html: sanitize(item.descriptionHtml) }}
        />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}