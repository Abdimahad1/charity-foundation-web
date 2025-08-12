// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import axios from "axios";

/* ---------- Base URLs like your admin page ---------- */
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const LOCAL_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const DEPLOY_BASE = (import.meta.env.VITE_API_DEPLOY || "https://charity-backend-30xl.onrender.com/api").replace(/\/$/, "");

/* Never use localhost in production */
const API_BASE = import.meta.env.PROD ? DEPLOY_BASE : (isLocalHost ? LOCAL_BASE : DEPLOY_BASE);

/* For static files (strip /api) */
const API_ORIGIN = API_BASE.replace(/\/api(?:\/.*)?$/, "");

/* Axios instance (same idea as admin page) */
const API = axios.create({ baseURL: API_BASE });

/* --- Minimal, robust absolutizer for legacy/relative paths --- */
const absolutizeUploadUrl = (u) => {
  if (!u) return "";

  // Trim and normalize slashes
  let s = String(u).trim().replace(/\\/g, "/");

  // ✅ If DB already has a full URL, just use it
  if (/^https?:\/\//i.test(s) || /^data:|^blob:/i.test(s)) return s;

  // Ensure leading slash for relative forms
  if (!s.startsWith("/")) s = `/${s}`;

  // Remove accidental "/api" segment before "/uploads"
  s = s.replace(/^\/api(?=\/uploads\/)/i, "");

  // Turn "/images/xyz.jpg" into "/uploads/images/xyz.jpg"
  if (/^\/images\//i.test(s)) s = `/uploads${s}`;

  // Turn "/foo.jpg" into "/uploads/images/foo.jpg"
  if (/^\/[^/]+\.(jpg|jpeg|png|gif|webp)$/i.test(s)) s = `/uploads/images${s}`;

  // If it already starts with /uploads, keep it
  if (/^\/uploads\//i.test(s)) return `${API_ORIGIN}${s}`;

  // Fallback: treat as a root-relative path on the API origin
  return `${API_ORIGIN}${s}`;
};

/* Match the admin “selector” behavior */
const pickSlideSrc = (s) => {
  // 1) Prefer the DB 'src' if present (often already absolute)
  if (s?.src) return absolutizeUploadUrl(s.src);

  // 2) Otherwise probe other common fields then absolutize
  const img0 = Array.isArray(s?.images) ? s.images[0] : undefined;
  const img0Url = (img0 && typeof img0 === "object") ? (img0.url ?? img0.src ?? img0.path) : img0;

  const candidate =
    s?.image ??
    s?.url ??
    s?.file?.url ??
    img0Url ??
    (s?.filename ? `/uploads/images/${s.filename}` : "");

  return absolutizeUploadUrl(candidate);
};

const pickEventCover = (e) => {
  if (e?.coverImage) return absolutizeUploadUrl(e.coverImage);

  const img0 = Array.isArray(e?.images) ? e.images[0] : undefined;
  const img0Url = (img0 && typeof img0 === "object") ? (img0.url ?? img0.src ?? img0.path) : img0;

  const candidate =
    e?.cover?.url ??
    e?.image ??
    img0Url ??
    (e?.filename ? `/uploads/images/${e.filename}` : "");

  return absolutizeUploadUrl(candidate);
};

/* ==================== Icons (inline SVG) ==================== */
const IconEducation = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
    <path d="M4 10v6c0 1.1.9 2 2 2h4v-6L4 10z" />
  </svg>
);
const IconHealth = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 6.04 9.5 12.5 10 12.5.5 0 10-6.46 10-12.5C22 5.42 19.58 3 16.5 3z" />
  </svg>
);
const IconWater = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2S5 9 5 13.5 8.58 21 12 21s7-3.13 7-7.5S12 2 12 2zm0 17c-2.49 0-4.5-2.02-4.5-4.5S9.51 10 12 10s4.5 2.02 4.5 4.5S14.49 19 12 19z" />
  </svg>
);
const IconEmpower = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z" />
  </svg>
);
const IconVolunteer = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M1 21h22l-2-7H3l-2 7zm16-9a3 3 0 003-3V4h-2v5a1 1 0 01-2 0V4h-2v5a1 1 0 01-2 0V4H8v5a3 3 0 003 3h10z" />
  </svg>
);
const IconDonate = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-8-4.5-8-10a5 5 0 019-3 5 5 0 019 3c0 5.5-8 10-8 10z" />
  </svg>
);
/* Focus row icons */
const IconDisability = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-7 16a7 7 0 0 1 14 0H5Z" />
    <path d="M11 11h2v4h4v2h-6z" />
  </svg>
);
const IconReligion = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l2.2 5H19l-4 3 1.5 5L12 13l-4.5 2 1.5-5-4-3h4.8z" />
  </svg>
);
const IconPublic = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M2 20v-1c0-2.8 4-4 6-4s6 1.2 6 4v1H2Zm14 0v-1c0-1.3-.5-2.3-1.3-3.1 1.2-.4 2.6-.6 3.3-.6 2 0 6 1.2 6 4v1h-8z" />
  </svg>
);
const IconGrants = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l3 5 6 .8-4.3 3.9L18 18l-6-3-6 3 1.3-6.3L3 7.8 9 7z" />
  </svg>
);

/* ==================== CountUp ==================== */
function CountUp({ end, start = 0, duration = 1500, compact = false, suffix = "" }) {
  const ref = React.useRef(null);
  const [text, setText] = React.useState(compact ? "0" : "0");
  const startedRef = React.useRef(false);

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
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const startTime = performance.now();
            const ease = (t) => 1 - Math.pow(1 - t, 3);
            const step = (now) => {
              const p = Math.min((now - startTime) / duration, 1);
              const value = Math.round(start + (end - start) * ease(p));
              setText(format(value) + (p >= 1 ? suffix : ""));
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [end, start, duration, compact, suffix]);

  return <span ref={ref}>{text}</span>;
}

/* ==================== Page ==================== */
export default function Home() {
  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Recent events
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  // Helpers (events)
  const stripTags = (html = "") => html.replace(/<[^>]*>/g, " ");
  const truncate = (s = "", n = 160) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const fmtDate = (d) => {
    const dt = d ? new Date(d) : null;
    if (!dt || Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  /* -------- Fetch slides (published, sorted, max 3) -------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get("/slides", { params: {} });
        const raw =
          Array.isArray(data) ? data :
          (Array.isArray(data?.items) ? data.items :
          (Array.isArray(data?.slides) ? data.slides : []));

        const published = raw
          .filter((s) => s?.published === true)
          .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
          .slice(0, 3);

        const normalizedSlides = published.map((s, i) => ({
          id: s?._id || s?.id || i,
          src: pickSlideSrc(s),
          alt: (s?.alt && String(s.alt)) || "Slide image",
          title: (s?.title && String(s.title)) || "",
          subtitle: (s?.subtitle && String(s.subtitle)) || "",
          align: (s?.align && String(s.align).toLowerCase()) || "left",
          overlay: Number(s?.overlay ?? 40),
        }));

        if (import.meta.env.DEV) {
          console.debug("Slides normalized:", normalizedSlides.map(x => x.src));
        }

        if (mounted) setSlides(normalizedSlides);
      } catch (err) {
        console.error("Failed to fetch slides", err);
      } finally {
        if (mounted) setLoadingSlides(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* -------- Fetch recent events (published) -------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      setEventsLoading(true);
      setEventsError("");
      try {
        const { data } = await API.get("/events/public", { params: { limit: 6 } });
        const list =
          Array.isArray(data) ? data :
          (Array.isArray(data?.items) ? data.items :
          (Array.isArray(data?.events) ? data.events : []));

        const norm = list.map((e, i) => {
          const id = e?._id || e?.id || i;
          const title = String(e?.title || e?.name || "Untitled");

          const cover = pickEventCover(e);

          const category = (e?.category && (e.category.name || e.category)) || "Event";
          const location = e?.location || e?.city || "";
          const when = e?.date || e?.publishedAt || e?.createdAt || null;
          const desc = truncate(stripTags(e?.description || e?.excerpt || ""), 160);

          return {
            id,
            title,
            cover,
            category,
            location,
            whenLabel: fmtDate(when),
            desc,
          };
        });

        if (import.meta.env.DEV) {
          console.debug("Events covers:", norm.map(x => x.cover));
        }

        if (mounted) setEvents(norm);
      } catch (err) {
        console.error("Failed to fetch events", err);
        if (mounted) setEventsError("Could not load events right now.");
      } finally {
        if (mounted) setEventsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* -------- UI helpers -------- */
  const showHeroText = !loadingSlides && slides.length > 0;
  const current = slides[currentSlide] || {};

  // Scroll-reveal for .reveal & force hero text visible when ready
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));

    if (showHeroText) {
      document.querySelectorAll(".hero-text-card .reveal").forEach((el) => el.classList.add("in-view"));
    }

    return () => io.disconnect();
  }, [showHeroText]);

  // Auto slide every 5s when >1 slide
  useEffect(() => {
    let interval;
    if (isAutoPlaying && slides.length > 1) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  const prev = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);
  const next = () => goToSlide((currentSlide + 1) % slides.length);

  return (
    <main className="home">
      {/* Small dev badge (doesn't block the page) */}
      {import.meta.env.DEV && (
        <div
          style={{
            position: "fixed",
            bottom: 8,
            left: 8,
            background: "#000a",
            color: "#fff",
            padding: "6px 8px",
            borderRadius: 6,
            fontSize: 12,
            zIndex: 9999,
          }}
        >
          API: {API_BASE} • slides: {slides.length} • events: {events.length}
        </div>
      )}

      {/* HERO SECTION */}
      <section className="hero-section">
        {/* IMAGES CONTAINER */}
        <div className="hero-images-container">
          {/* Skeleton while loading / empty */}
          {!showHeroText && (
            <div className="hero-image-wrapper active">
              <div className="hero-image hero-skeleton" aria-hidden="true" />
              <div className="hero-images-tint" />
            </div>
          )}

          {/* Real slides */}
          {slides.map((img, i) => {
            const key = img.id ?? i;
            const alt = img.alt?.trim() || "Homepage slide";
            const overlay = (typeof img.overlay === "number" ? img.overlay : 40) / 100;
            return (
              <div key={key} className={`hero-image-wrapper ${i === currentSlide ? "active" : ""}`}>
                <img
                  src={img.src}
                  alt={alt}
                  className="hero-image"
                  loading={i === 0 ? "eager" : "lazy"}
                  onError={(e) => e.currentTarget.classList.add("hero-image--error")}
                />
                {/* per-slide dark overlay from backend */}
                <div className="hero-overlay" style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />
              </div>
            );
          })}
        </div>

        {/* TEXT CONTENT CONTAINER (with card) */}
        {showHeroText && (
          <div
            className={`hero-content-container align-${
              current.align === "center" ? "center" : current.align === "right" ? "right" : "left"
            }`}
          >
            <div className="hero-text-content">
              <div className="hero-text-card">
                <span className="hero-badge reveal">Non-Profit | Community First</span>

                <h1 className="hero-title reveal">{current.title?.trim() || "Headline goes here"}</h1>

                <p className="hero-subtitle reveal">{current.subtitle?.trim() || "Subtitle shows here"}</p>

                <div className="hero-actions reveal">
                  <Link to="/donate" className="btn btn-primary sheen">
                    Donate
                  </Link>
                  <Link to="/volunteers" className="btn btn-ghost">
                    Volunteer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS */}
        {slides.length > 1 && (
          <>
            <button className="bg-arrow left" onClick={prev} aria-label="Previous image">
              ‹
            </button>
            <button className="bg-arrow right" onClick={next} aria-label="Next image">
              ›
            </button>
            <div className="carousel-dots" role="tablist" aria-label="Choose slide">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                  role="tab"
                  aria-selected={index === currentSlide}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* WHAT WE DO (Colored Cards) — WIDE */}
      <section className="section container-wide what-we-do" aria-labelledby="what-title">
        <h2 id="what-title" className="reveal">
          What We Do
        </h2>
        <p className="muted center reveal">Programs designed with local partners to create lasting impact.</p>

        {/* Charity focus row */}
        <div className="charity-focus reveal">
          <div className="focus-item">
            <IconDisability /> Disability
          </div>
          <div className="focus-item">
            <IconReligion /> Religious Activities
          </div>
          <div className="focus-item">
            <IconPublic /> The General Public / Mankind
          </div>
          <div className="focus-item">
            <IconGrants /> Makes Grants To Individuals
          </div>
          <div className="focus-item">
            <IconGrants /> Makes Grants To Organisations
          </div>
        </div>

        {/* Existing cards */}
        <div className="cards cards-wide">
          <Link to="/projects" className="card card-edu reveal tilt">
            <div className="card-icon">
              <IconEducation />
            </div>
            <h3>Education Access</h3>
            <p>Scholarships, school kits, and teacher support for every child's future.</p>
            <span className="chip">Learn more →</span>
          </Link>

          <Link to="/projects" className="card card-health reveal tilt">
            <div className="card-icon">
              <IconHealth />
            </div>
            <h3>Healthcare Support</h3>
            <p>Mobile clinics, telemedicine, and maternal health initiatives.</p>
            <span className="chip">See programs →</span>
          </Link>

          <Link to="/projects" className="card card-water reveal tilt">
            <div className="card-icon">
              <IconWater />
            </div>
            <h3>Clean Water</h3>
            <p>Wells, filtration, and hygiene training for safe communities.</p>
            <span className="chip">Explore work →</span>
          </Link>

          <Link to="/projects" className="card card-empower reveal tilt">
            <div className="card-icon">
              <IconEmpower />
            </div>
            <h3>Empowerment</h3>
            <p>Skills, micro-grants, and youth programs for independence.</p>
            <span className="chip">Get inspired →</span>
          </Link>
        </div>
      </section>

      {/* ===== NEW: RECENT EVENTS (from API) ===== */}
      <section className="section container-wide mission" aria-labelledby="mission-title">
        <div className="mission-head">
          <h2 id="mission-title" className="reveal">
            Recent Events
          </h2>
        </div>

        {/* Loading skeletons */}
        {eventsLoading && (
          <div className="events-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="event-card skeleton">
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

        {/* Error / Empty states */}
        {!eventsLoading && eventsError && <div className="events-error">{eventsError}</div>}
        {!eventsLoading && !eventsError && events.length === 0 && (
          <div className="events-empty">No events yet. Please check back soon.</div>
        )}

        {/* Events grid */}
        {!eventsLoading && !eventsError && events.length > 0 && (
          <div className="events-grid">
            {events.map((ev) => (
              <article key={ev.id} className="event-card hover-pop">
                <div className="cover" aria-hidden="true">
                  {ev.cover ? (
                    <img
                      className="cover-img"
                      src={ev.cover}
                      alt={ev.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.visibility = "hidden";
                      }}
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
              </article>
            ))}
          </div>
        )}
      </section>

      {/* MISSION — WIDE */}
      <section className="section container-wide mission" aria-labelledby="mission-title-2">
        <h2 id="mission-title-2" className="reveal">
          Our Mission
        </h2>
        <p className="mission-text reveal">
          To empower children and families through access to quality education, essential healthcare, and sustainable
          community projects—delivered with transparency, dignity, and local partnership.
        </p>

        <ul className="pill-list reveal" aria-label="Mission focus areas">
          <li>
            <IconEducation /> Education
          </li>
          <li>
            <IconHealth /> Health
          </li>
          <li>
            <IconWater /> Water & Sanitation
          </li>
          <li>
            <IconEmpower /> Women & Youth
          </li>
        </ul>
      </section>

      {/* INFO / QUICK STATS — WIDE */}
      <section className="section container-wide stats" aria-label="Impact statistics">
        <article className="stat reveal hover-pop">
          <span className="num">
            <CountUp end={120} suffix="+" />
          </span>
          <span className="label">Projects Funded</span>
        </article>
        <article className="stat reveal hover-pop">
          <span className="num">
            <CountUp end={30000} compact suffix="+" />
          </span>
          <span className="label">People Reached</span>
        </article>
        <article className="stat reveal hover-pop">
          <span className="num">
            <CountUp end={50} suffix="+" />
          </span>
          <span className="label">Active Volunteers</span>
        </article>
        <article className="stat reveal hover-pop">
          <span className="num">
            <CountUp end={15} />
          </span>
          <span className="label">Partner Communities</span>
        </article>
      </section>

      {/* GET INVOLVED (CTA Cards) — WIDE */}
      <section className="section container-wide get-involved" aria-label="Get involved">
        <div className="cta-grid cta-grid-wide">
          <Link to="/donate" className="cta-card shine reveal">
            <div className="cta-icon">
              <IconDonate />
            </div>
            <h3>Donate</h3>
            <p>Your gift funds urgent needs and long-term solutions.</p>
            <span className="cta-btn">Give Now</span>
          </Link>

          <Link to="/volunteers" className="cta-card outline reveal">
            <div className="cta-icon">
              <IconVolunteer />
            </div>
            <h3>Volunteer</h3>
            <p>Join hands-on projects or remote support teams.</p>
            <span className="cta-btn">Join Us</span>
          </Link>
        </div>
      </section>

      {/* SECONDARY CTA — WIDE */}
      <section className="section container-wide cta">
        <h3 className="reveal">See our latest work</h3>
        <p className="reveal">Browse ongoing initiatives and real stories from the field.</p>
        <div className="cta-actions reveal">
          <Link to="/projects" className="btn btn-primary sheen">
            View Projects
          </Link>
          <Link to="/contact" className="btn btn-ghost">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
