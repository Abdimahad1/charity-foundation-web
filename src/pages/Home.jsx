import React, { useEffect, useState, useRef } from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import axios from "axios";
// ⬇️ add these
import ImgHealth from "../assets/health.jpg";
import ImgNutrition from "../assets/hero-1.jpg";     // replace with your real nutrition image
import ImgProtection from "../assets/hero-2.jpg";   // replace with your real protection image
// local partner logos (src/assets/*)
import LogoDRC from "../assets/DRC.png";
import LogoOCHA from "../assets/OCHA.png";
import Logowfp from "../assets/wfp.png";
import LogoUNICEF from "../assets/UNICEF.png";


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

/* ---------- URL helpers ---------- */
const isBlobLike = (u = "") => /^blob:|^data:/i.test(String(u));
const formatImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || isBlobLike(url)) return url;
  if (url.startsWith("/uploads")) return `${API_BASE.replace("/api", "")}${url}`;
  return `${API_BASE.replace("/api", "")}/uploads/${url}`;
};
const pickSlideSrc = (s) => {
  if (s?.src) return formatImageUrl(s.src);
  const img0 = Array.isArray(s?.images) ? s.images[0] : undefined;
  const img0Url = img0 && typeof img0 === "object" ? (img0.url ?? img0.src ?? img0.path) : img0;
  const candidate =
    s?.image ??
    s?.url ??
    s?.file?.url ??
    img0Url ??
    (s?.filename ? `/uploads/images/${s.filename}` : "");
  return formatImageUrl(candidate);
};
const pickEventCover = (e) => {
  if (e?.coverImage) return formatImageUrl(e.coverImage);
  const img0 = Array.isArray(e?.images) ? e.images[0] : undefined;
  const img0Url = img0 && typeof img0 === "object" ? (img0.url ?? img0.src ?? img0.path) : img0;
  const candidate = e?.cover?.url ?? e?.image ?? img0Url ?? (e?.filename ? `/uploads/images/${e.filename}` : "");
  return formatImageUrl(candidate);
};

/* ---------- Tiny CountUp ---------- */
function CountUp({ end, start = 0, duration = 1500, compact = false, suffix = "" }) {
  const ref = useRef(null);
  const [text, setText] = useState(compact ? "0" : "0");
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const format = (val) => {
      const nf = compact
        ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
        : new Intl.NumberFormat("en");
      const out = nf.format(val);
      return compact ? out.toLowerCase() : out;
    };

    if (prefersReduced) {
      setText(format(end) + suffix);
      return;
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const t0 = performance.now();
            const ease = (t) => 1 - Math.pow(1 - t, 3);
            const step = (now) => {
              const p = Math.min((now - t0) / duration, 1);
              const value = Math.round(start + (end - start) * ease(p));
              setText(format(value) + (p >= 1 ? suffix : ""));
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            io.disconnect();
          }
        }),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, start, duration, compact, suffix]);

  return <span ref={ref}>{text}</span>;
}

/* ---------- Page ---------- */
export default function Home() {
  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  /* SLIDES: fetch published & sorted (max 3) */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get("/slides");
        const raw = Array.isArray(data) ? data : data?.items || data?.slides || [];
        const normalized = raw
          .filter((s) => s?.published === true)
          .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
          .slice(0, 3)
          .map((s, i) => {
            const src = pickSlideSrc(s);
            return {
              id: s?._id || s?.id || i,
              src,
              alt: s?.alt || "Slide",
              title: s?.title || "",
              subtitle: s?.subtitle || "",
              overlay: Number(s?.overlay ?? 62), // darker by default so text pops
            };
          });
        if (mounted) setSlides(normalized);
      } catch {
        if (mounted) setSlides([]);
      } finally {
        if (mounted) setLoadingSlides(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  /* EVENTS */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setEventsLoading(true);
        setEventsError("");
        const { data } = await API.get("/events/public", { params: { limit: 6 } });
        const list = Array.isArray(data) ? data : data?.items || data?.events || [];
        const stripTags = (html = "") => html.replace(/<[^>]*>/g, " ");
        const truncate = (s = "", n = 160) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
        const fmtDate = (d) => {
          const dt = d ? new Date(d) : null;
          if (!dt || Number.isNaN(dt.getTime())) return "";
          return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
        };
        const norm = list.map((e, i) => ({
          id: e?._id || e?.id || i,
          title: String(e?.title || e?.name || "Untitled"),
          cover: formatImageUrl(pickEventCover(e)),
          category: (e?.category && (e.category.name || e.category)) || "Event",
          location: e?.location || e?.city || "",
          whenLabel: fmtDate(e?.date || e?.publishedAt || e?.createdAt || null),
          desc: truncate(stripTags(e?.description || e?.excerpt || ""), 160),
        }));
        if (mounted) setEvents(norm);
      } catch {
        if (mounted) setEventsError("Could not load events right now.");
      } finally {
        if (mounted) setEventsLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  /* slider autoplay */
  useEffect(() => {
    let interval;
    if (isAutoPlaying && slides.length > 1) {
      interval = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 6000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const go = (i) => {
    setCurrentSlide(i);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };
  const prev = () => go((currentSlide - 1 + slides.length) % slides.length);
  const next = () => go((currentSlide + 1) % slides.length);

  /* WHAT WE DO – static images + links (match your sample) */
/* WHAT WE DO – static images + links (local assets) */
const whatWeDo = [
  { key: "health",     title: "HEALTH",     image: ImgHealth,     to: "/projects?tag=health" },
  { key: "nutrition",  title: "NUTRITION",  image: ImgNutrition,  to: "/projects?tag=nutrition" },
  { key: "protection", title: "PROTECTION", image: ImgProtection, to: "/projects?tag=protection" },
];


  /* PARTNERS – auto-scroll strip; you can load from API if you have one */
// PARTNERS – local assets
const [partners] = useState([
  { name: "DRC",    logo: LogoDRC },
  { name: "OCHA",        logo: LogoOCHA },
  { name: "WFP",      logo: Logowfp },
  { name: "UNICEF",logo: LogoUNICEF },
]);


  // If you later expose /partners/public, uncomment:
  /*
  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/partners/public");
        const list = Array.isArray(data) ? data : data?.items || [];
        if (list.length) {
          setPartners(
            list.map((p, i) => ({
              name: p?.name || `Partner ${i + 1}`,
              logo: formatImageUrl(p?.logo || p?.image || ""),
            }))
          );
        }
      } catch {}
    })();
  }, []);
  */

  /* Newsletter (footer) */
  const onSubscribe = (e) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    if (!email) return;
    alert(`Thanks! We'll keep you updated at ${email}`);
    e.currentTarget.reset();
  };

  const showSlides = !loadingSlides && slides.length > 0;
  const slide = slides[currentSlide] || null;

  return (
    <>
      <main className="home" role="main">
        {/* ================= HERO SLIDER (dark image, big text) ================= */}
        <section className="hero-slider">
          {showSlides ? (
            <>
{slides.map((s, i) => (
  <div
    key={s.id}
    className={`slide ${i === currentSlide ? "active" : ""}`}
    style={{ '--overlay': Math.min(Math.max(s.overlay ?? 62, 20), 90) }}
  >
    <img
      src={s.src}
      alt={s.alt || "Slide"}
      className="slide-img"
      loading={i === 0 ? "eager" : "lazy"}
      fetchPriority={i === 0 ? "high" : "low"}
      decoding="async"
    />
    <div className="slide-shade" />
    <div className="container slide-inner">
      <div className="slide-text">
        <h1 className="slide-title">{s.title}</h1>
        {s.subtitle && <p className="slide-sub">{s.subtitle}</p>}
        <div className="slide-actions">
          {/* buttons… */}
        </div>
      </div>
    </div>
  </div>
))}


              {slides.length > 1 && (
                <>
                  <button className="nav-arrow left" onClick={prev} aria-label="Previous slide">‹</button>
                  <button className="nav-arrow right" onClick={next} aria-label="Next slide">›</button>
                  <div className="dots" role="tablist" aria-label="Choose slide">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        className={`dot ${idx === currentSlide ? "active" : ""}`}
                        onClick={() => go(idx)}
                        role="tab"
                        aria-selected={idx === currentSlide}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="slide skeleton">
              <div className="slide-shade" />
              <div className="slide-inner container-wide">
                <div className="slide-text">
                  <h1 className="slide-title">Loading…</h1>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================= WHAT WE DO (3 image tiles with blue caption) ================= */}
        <section className="section container what-grid" aria-labelledby="what-we-do">
          <h2 id="what-we-do" className="center what-title">WHAT WE DO</h2>

          <div className="what-cards">
          {whatWeDo.map((w) => (
            <Link key={w.key} to={w.to} className="what-card">
              <div className="what-media">
                <img src={w.image} alt={w.title} loading="lazy" decoding="async" />
              </div>
              <div className="what-cap">{w.title}</div>
            </Link>
          ))}
        </div>

        </section>

        {/* ================= RECENT EVENTS (kept from your page) ================= */}
<section className="section container mission" aria-labelledby="recent-events-title">
  <div className="mission-head">
    <h2 id="recent-events-title">Recent Events</h2>
  </div>

  {eventsLoading && (
    <div className="events-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <article key={i} className="event-card skeleton" aria-hidden="true">
          <div className="cover" />
          <div className="meta">
            <div className="date" />
            <div className="title" />
            <div className="desc" />
          </div>
        </article>
      ))}
    </div>
  )}

  {!eventsLoading && eventsError && <div className="events-error">{eventsError}</div>}

  {!eventsLoading && !eventsError && events.length === 0 && (
    <div className="events-empty">No events yet. Please check back soon.</div>
  )}

  {!eventsLoading && !eventsError && events.length > 0 && (
    <div className="events-grid">
      {events.map((ev) => (
        <Link
          key={ev.id}
          to={`/events/${ev.id}`}
          state={{ event: { ...ev, when: ev.when ?? ev.whenLabel ?? null } }}
          className="event-card hover-pop"
          aria-label={`Open details for ${ev.title}`}
        >
          <div className="cover" aria-hidden="true">
            {ev.cover ? (
              <img
                className="cover-img"
                src={ev.cover}
                alt={ev.title}
                loading="lazy"
                decoding="async"
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              />
            ) : null}
          </div>

          <div className="meta">
            <div className="top">
              <span className="badge">{ev.category}</span>
              {ev.whenLabel && <span>{ev.whenLabel}</span>}
            </div>
            <h3 className="title">{ev.title}</h3>
            <p className="desc">{ev.desc}</p>
            {ev.location && <small className="loc">📍 {ev.location}</small>}
          </div>
        </Link>
      ))}
    </div>
  )}
</section>


        {/* ================= MISSION / STATS / CTAs (kept) ================= */}
        <section className="section container mission" aria-labelledby="mission-title-2">
          <h2 id="mission-title-2">Our Mission</h2>
          <p className="mission-text">
            To empower children and families through access to quality education, essential healthcare, and sustainable
            community projects—delivered with transparency, dignity, and local partnership.
          </p>
          <ul className="pill-list" aria-label="Mission focus areas">
            <li>Education</li>
            <li>Health</li>
            <li>Water &amp; Sanitation</li>
            <li>Women &amp; Youth</li>
          </ul>
        </section>

        <section className="section container stats" aria-label="Impact statistics">
          <article className="stat hover-pop">
            <span className="num"><CountUp end={120} suffix="+" /></span>
            <span className="label">Projects Funded</span>
          </article>
          <article className="stat hover-pop">
            <span className="num"><CountUp end={30000} compact suffix="+" /></span>
            <span className="label">People Reached</span>
          </article>
          <article className="stat hover-pop">
            <span className="num"><CountUp end={50} suffix="+" /></span>
            <span className="label">Active Volunteers</span>
          </article>
          <article className="stat hover-pop">
            <span className="num"><CountUp end={15} /></span>
            <span className="label">Partner Communities</span>
          </article>
        </section>

        <section className="section container get-involved" aria-label="Get involved">
          <div className="cta-grid">
            <Link to="/donate" className="cta-card shine">
              <h3>Donate</h3>
              <p>Your gift funds urgent needs and long-term solutions.</p>
              <span className="cta-btn">Give Now</span>
            </Link>
            <Link to="/volunteers" className="cta-card outline">
              <h3>Volunteer</h3>
              <p>Join hands-on projects or remote support teams.</p>
              <span className="cta-btn">Join Us</span>
            </Link>
          </div>
        </section>

        <section className="section container cta">
          <h3>See our latest work</h3>
          <p>Browse ongoing initiatives and real stories from the field.</p>
          <div className="cta-actions">
            <Link to="/projects" className="btn btn-primary sheen">View Projects</Link>
            <Link to="/contact" className="btn btn-ghost">Contact Us</Link>
          </div>
        </section>
      </main>

{/* ================= PARTNERS (auto-scrolling logos) ================= */}
<section className="section partners-wrap" aria-label="Our Partners">
  <div className="container">
    <h2 className="partners-title">OUR PARTNERS</h2>
  </div>

  <div className="partners-track">
    {(() => {
      // one lane = your partners duplicated so it's wider than the screen
      const lane = partners.concat(partners);
      return (
        <>
          {/* lane A */}
          <ul className="partners-row">
            {lane.map((p, i) => (
              <li key={`laneA-${p.name}-${i}`} className="partner">
                <img src={p.logo} alt={p.name} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>

          {/* lane B (same content), phase-shifted so there’s no gap */}
          <ul className="partners-row clone" aria-hidden="true">
            {lane.map((p, i) => (
              <li key={`laneB-${p.name}-${i}`} className="partner">
                <img src={p.logo} alt={p.name} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
        </>
      );
    })()}
  </div>
</section>


      {/* FOOTER stays as-is in your layout */}
      <footer className="site-footer" role="contentinfo">
        <div className="footer-top">
          <div className="container footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo" aria-label="Home">
                <span className="logo-dot" /> Charity<span className="logo-bold">Hope</span>
              </Link>
              <p className="footer-intro">
                Transparent, community-driven aid. We partner locally to deliver education, healthcare,
                clean water, and opportunity—responsibly and at scale.
              </p>
              <form className="news-form" onSubmit={onSubscribe}>
                <input type="email" name="email" placeholder="Your email address" required />
                <button className="btn btn-ghost" type="submit">Subscribe</button>
              </form>
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
              <form className="news-form" onSubmit={onSubscribe}>
                <input type="email" name="email" placeholder="Your email address" required />
                <button className="btn btn-ghost" type="submit">Subscribe</button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container footer-bottom-row">
            <span>© {new Date().getFullYear()} CharityHope. All rights reserved.</span>
            <div className="legal-links">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/donor-policy">Donor Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      <div className="floating-donate">
        <Link to="/donate" className="floating-donate-btn sheen" aria-label="Donate">
          <span>❤</span> <span>Donate</span>
        </Link>
      </div>
    </>
  );
}
