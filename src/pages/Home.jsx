import React, { useEffect, useState, useRef } from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import axios from "axios";

/* ---------- Base URLs ---------- */
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const LOCAL_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const DEPLOY_BASE = (import.meta.env.VITE_API_DEPLOY || "https://charity-backend-c05j.onrender.com/api").replace(/\/$/, "");
const API_BASE = import.meta.env.PROD ? DEPLOY_BASE : (isLocalHost ? LOCAL_BASE : DEPLOY_BASE);
const API_ORIGIN = API_BASE.replace(/\/api(?:\/.*)?$/, "");
const API = axios.create({ baseURL: API_BASE });

/* ---------- URL helpers ---------- */
const absolutizeUploadUrl = (u) => {
  if (!u) return "";
  let s = String(u).trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(s) || /^data:|^blob:/i.test(s)) return s;
  if (!s.startsWith("/")) s = `/${s}`;
  s = s.replace(/^\/api(?=\/uploads\/)/i, "");
  if (/^\/images\//i.test(s)) s = `/uploads${s}`;
  if (/^\/[^/]+\.(jpg|jpeg|png|gif|webp)$/i.test(s)) s = `/uploads/images${s}`;
  if (/^\/uploads\//i.test(s)) return `${API_ORIGIN}${s}`;
  return `${API_ORIGIN}${s}`;
};

// Responsive image helper functions
const responsiveUrl = (url, width, format = 'webp') => {
  if (!url) return '';
  const baseUrl = url.includes('?') ? url.split('?')[0] : url;
  return `${baseUrl}?width=${width}&format=${format}`;
};

const buildSrcSet = (url) => {
  if (!url) return '';
  const widths = [320, 480, 640, 768, 1024, 1280, 1536, 1920];
  return widths.map(w => `${responsiveUrl(url, w)} ${w}w`).join(', ');
};

const pickSlideSrc = (s) => {
  if (s?.src) return absolutizeUploadUrl(s.src);
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

/* ---------- Icons ---------- */
const IconEducation = () => (<svg className="icon" viewBox="0 0 24 24"><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3z"/><path d="M4 10v6c0 1.1.9 2 2 2h4v-6L4 10z"/></svg>);
const IconHealth = () => (<svg className="icon" viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5 2 14.54 11.5 21 12 21s10-6.46 10-12.5C22 5.42 19.58 3 16.5 3z"/></svg>);
const IconWater = () => (<svg className="icon" viewBox="0 0 24 24"><path d="M12 2S5 9 5 13.5 8.58 21 12 21s7-3.13 7-7.5S12 2 12 2zM12 19c-2.49 0-4.5-2.02-4.5-4.5S9.51 10 12 10s4.5 2.02 4.5 4.5S14.49 19 12 19z"/></svg>);
const IconEmpower = () => (<svg className="icon" viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z"/></svg>);
const IconVolunteer = () => (<svg className="icon" viewBox="0 0 24 24"><path d="M1 21h22l-2-7H3l-2 7zm16-9a3 3 0 0 0 3-3V4h-2v5a1 1 0 0 1-2 0V4h-2v5a1 1 0 0 1-2 0V4H8v5a3 3 0 0 0 3 3h6z"/></svg>);
const IconDonate = () => (<svg className="icon" viewBox="0 0 24 24"><path d="M12 21s-8-4.5-8-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-8 10-8 10z"/></svg>);
const IconDisability = () => (<svg className="icon" viewBox="0 0 24 24"><path d="M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM5 20a7 7 0 0 1 14 0H5Z"/><path d="M11 11h2v4h4v2h-6z"/></svg>);
const IconReligion = () => (<svg className="icon" viewBox="0 0 24 24"><path d="m12 2 2.2 5H19l-4 3 1.5 5L12 13l-4.5 2 1.5-5-4-3h4.8z"/></svg>);
const IconPublic = () => (<svg className="icon" viewBox="0 0 24 24"><path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M2 20v-1c0-2.8 4-4 6-4s6 1.2 6 4v1H2Zm14 0v-1c0-1.3-.5-2.3-1.3-3.1 1.2-.4 2.6-.6 3.3-.6 2 0 6 1.2 6 4v1h-8z"/></svg>);
const IconGrants = () => (<svg className="icon" viewBox="0 0 24 24"><path d="m12 2 3 5 6 .8-4.3 3.9L18 18l-6-3-6 3 1.3-6.3L3 7.8 9 7z"/></svg>);

/* Social icons */
const Social = {
  X: () => (<svg viewBox="0 0 24 24" className="social-ic"><path d="M14.7 3h4.3l-9.4 10.7L19 21h-4.3l-6.1-7-2.8 3.2V21H2V3h3.8v9.1z"/></svg>),
  Facebook: () => (<svg viewBox="0 0 24 24" className="social-ic"><path d="M13 22v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2h-3a5 5 0 0 0-5 5v3H6v4h3v8z"/></svg>),
  Instagram: () => (<svg viewBox="0 0 24 24" className="social-ic"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z"/></svg>),
  YouTube: () => (<svg viewBox="0 0 24 24" className="social-ic"><path d="M22 8.2v7.6c0 1.6-1.3 2.2-2.9 2.2H4.9C3.3 18 2 17.4 2 15.8V8.2C2 6.6 3.3 6 4.9 6h14.2C20.7 6 22 6.6 22 8.2zM10 9l6 3-6 3V9z"/></svg>),
  LinkedIn: () => (<svg viewBox="0 0 24 24" className="social-ic"><path d="M6 9h3v10H6zM7.5 5A1.5 1.5 0 1 1 6 6.5 1.5 1.5 0 0 1 7.5 5zM11 9h3v1.5h.1A3.3 3.3 0 0 1 17 9c3 0 4 2 4 4.6V19h-3v-4c0-1 0-2.3-1.4-2.3s-1.6 1-1.6 2.2V19h-3z"/></svg>),
  TikTok: () => (<svg viewBox="0 0 24 24" className="social-ic"><path d="M21 8.5a6.6 6.6 0 0 1-4-1.3v7.2A6.4 6.4 0 1 1 8.2 8.2v3A3.4 3.4 0 1 0 11.5 15V3h3a6.5 6.5 0 0 0 6.5 6.5z"/></svg>),
  WhatsApp: () => (<svg viewBox="0 0 24 24" className="social-ic"><path d="M20 4a10 10 0 0 0-16 12L3 21l5-1a10 10 0 0 0 12-16zm-3.1 12.5c-.4 1-2.4 1-3.3.8s-2.2-.8-3.7-2.2-2-2.6-2.2-3.7.2-2.9.8-3.3.8-.3 1.1 0l1.6 1.8c.1.1.2.4.1.6s-.5 1-.7 1.2-.2.4 0 .7a7.3 7.3 0 0 0 2.1 2.1c.3.2.5.2.7 0s1-.6 1.2-.7.5 0 .6.1l1.8 1.6c.2.3.2.8-.1 1.1z"/></svg>),
  Telegram: () => (<svg viewBox="0 0 24 24" className="social-ic"><path d="m21 3-19 8 6.8 2.1L10 21l3.6-4.8L19 20z"/></svg>),
  Mail: () => (<svg viewBox="0 0 24 24" className="social-ic"><path d="M2 6h20v12H2z"/><path d="m2 6 10 7L22 6"/></svg>),
};

/* ---------- CountUp ---------- */
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
      (entries) => entries.forEach((e) => {
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

  const stripTags = (html = "") => html.replace(/<[^>]*>/g, " ");
  const truncate = (s = "", n = 160) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const fmtDate = (d) => {
    const dt = d ? new Date(d) : null;
    if (!dt || Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  /* Slides */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get("/slides");
        const raw = Array.isArray(data) ? data : (data?.items || data?.slides || []);
        const published = raw
          .filter((s) => s?.published === true)
          .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
          .slice(0, 3);

        const normalized = published.map((s, i) => {
          const base = pickSlideSrc(s);
          return {
            id: s?._id || s?.id || i,
            src: responsiveUrl(base, 1024),
            srcSet: buildSrcSet(base),
            sizes: "(max-width: 768px) 100vw, 50vw",
            alt: (s?.alt && String(s.alt)) || "Slide image",
            title: (s?.title && String(s.title)) || "",
            subtitle: (s?.subtitle && String(s.subtitle)) || "",
            align: (s?.align && String(s.align).toLowerCase()) || "left",
            overlay: Number(s?.overlay ?? 40),
          };
        });
        if (mounted) setSlides(normalized);
      } catch (e) {
        console.error("Slides fetch failed:", e);
      } finally {
        if (mounted) setLoadingSlides(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  /* Events */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setEventsLoading(true);
        setEventsError("");
        const { data } = await API.get("/events/public", { params: { limit: 6 } });
        const list = Array.isArray(data) ? data : (data?.items || data?.events || []);
        const norm = list.map((e, i) => {
          const id = e?._id || e?.id || i;
          const title = String(e?.title || e?.name || "Untitled");
          const coverBase = pickEventCover(e);
          const category = (e?.category && (e.category.name || e.category)) || "Event";
          const location = e?.location || e?.city || "";
          const when = e?.date || e?.publishedAt || e?.createdAt || null;
          const desc = truncate(stripTags(e?.description || e?.excerpt || ""), 160);
          return {
            id,
            title,
            cover: responsiveUrl(coverBase, 600),
            coverSet: buildSrcSet(coverBase),
            category,
            location,
            whenLabel: fmtDate(when),
            desc,
          };
        });
        if (mounted) setEvents(norm);
      } catch (e) {
        console.error("Events fetch failed:", e);
        if (mounted) setEventsError("Could not load events right now.");
      } finally {
        if (mounted) setEventsLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  /* UI helpers */
  const showHeroText = !loadingSlides && slides.length > 0;
  const current = slides[currentSlide] || {};
  
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    if (showHeroText) {
      document.querySelectorAll(".hero-text-content .reveal").forEach((el) => el.classList.add("in-view"));
    }
    return () => io.disconnect();
  }, [showHeroText]);

  useEffect(() => {
    let interval;
    if (isAutoPlaying && slides.length > 1) {
      interval = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (i) => {
    setCurrentSlide(i);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  const prev = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);
  const next = () => goToSlide((currentSlide + 1) % slides.length);

  /* Newsletter mock */
  const onSubscribe = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email")?.toString().trim();
    if (!email) return;
    alert(`Thanks! We'll keep you updated at ${email}`);
    e.currentTarget.reset();
  };

  return (
    <>
      <main className="home" role="main">
        {/* SPLIT-SCREEN HERO */}
        <section className="hero-section">
          <div className="hero-container container-wide">
            {/* Image half */}
            <div className="hero-images">
              {!showHeroText && (
                <div className="hero-image-wrapper active">
                  <div className="hero-image hero-skeleton" aria-hidden="true" />
                </div>
              )}
              {slides.map((img, i) => {
                const eager = i === 0;
                return (
                  <div key={img.id ?? i} className={`hero-image-wrapper ${i === currentSlide ? "active" : ""}`}>
                    <picture>
                      <source 
                        srcSet={img.srcSet} 
                        sizes={img.sizes}
                        type="image/webp"
                      />
                      <img
                        src={img.src}
                        srcSet={img.srcSet}
                        sizes={img.sizes}
                        alt={img.alt?.trim() || "Homepage slide"}
                        className="hero-image"
                        loading={eager ? "eager" : "lazy"}
                        fetchPriority={eager ? "high" : "low"}
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.classList.add("hero-image--error");
                          console.error("Failed to load hero image:", img.src);
                        }}
                      />
                    </picture>
                  </div>
                );
              })}
            </div>

            {/* Text half */}
            {showHeroText && (
              <div className="hero-content">
                <div className="hero-text-content">
                  <span className="hero-badge reveal">Non-Profit | Community First</span>
                  <h1 className="hero-title reveal">{current.title?.trim() || "Headline goes here"}</h1>
                  <p className="hero-subtitle reveal">{current.subtitle?.trim() || "Subtitle shows here"}</p>
                  <div className="hero-actions reveal">
                    <Link to="/donate" className="btn btn-primary sheen">Donate</Link>
                    <Link to="/volunteers" className="btn btn-ghost">Volunteer</Link>
                  </div>
                </div>
              </div>
            )}

            {slides.length > 1 && (
              <>
                <button className="bg-arrow left" onClick={prev} aria-label="Previous image">‹</button>
                <button className="bg-arrow right" onClick={next} aria-label="Next image">›</button>
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
          </div>
        </section>

        {/* WHAT WE DO */}
        <section className="section container what-we-do" aria-labelledby="what-title">
          <h2 id="what-title" className="reveal">What We Do</h2>
          <p className="muted center reveal">Programs designed with local partners to create lasting impact.</p>

          <div className="charity-focus reveal">
            <div className="focus-item"><IconDisability /> Disability</div>
            <div className="focus-item"><IconReligion /> Religious Activities</div>
            <div className="focus-item"><IconPublic /> The General Public / Mankind</div>
            <div className="focus-item"><IconGrants /> Grants to Individuals</div>
            <div className="focus-item"><IconGrants /> Grants to Organisations</div>
          </div>

          <div className="cards">
            <Link to="/projects" className="card card-edu reveal tilt">
              <div className="card-icon"><IconEducation /></div>
              <h3>Education Access</h3>
              <p>Scholarships, school kits, and teacher support for every child's future.</p>
              <span className="chip">Learn more →</span>
            </Link>
            <Link to="/projects" className="card card-health reveal tilt">
              <div className="card-icon"><IconHealth /></div>
              <h3>Healthcare Support</h3>
              <p>Mobile clinics, telemedicine, and maternal health initiatives.</p>
              <span className="chip">See programs →</span>
            </Link>
            <Link to="/projects" className="card card-water reveal tilt">
              <div className="card-icon"><IconWater /></div>
              <h3>Clean Water</h3>
              <p>Wells, filtration, and hygiene training for safe communities.</p>
              <span className="chip">Explore work →</span>
            </Link>
            <Link to="/projects" className="card card-empower reveal tilt">
              <div className="card-icon"><IconEmpower /></div>
              <h3>Empowerment</h3>
              <p>Skills, micro-grants, and youth programs for independence.</p>
              <span className="chip">Get inspired →</span>
            </Link>
          </div>
        </section>

        {/* RECENT EVENTS */}
        <section className="section container mission" aria-labelledby="recent-events-title">
          <div className="mission-head">
            <h2 id="recent-events-title" className="reveal">Recent Events</h2>
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
                <article key={ev.id} className="event-card hover-pop">
                  <div className="cover" aria-hidden="true">
                    {ev.cover ? (
                      <picture>
                        <source srcSet={ev.coverSet} type="image/webp" />
                        <img
                          className="cover-img"
                          src={ev.cover}
                          srcSet={ev.coverSet}
                          sizes="(max-width:1100px) 50vw, 33vw"
                          alt={ev.title}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                        />
                      </picture>
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

        {/* MISSION */}
        <section className="section container mission" aria-labelledby="mission-title-2">
          <h2 id="mission-title-2" className="reveal">Our Mission</h2>
          <p className="mission-text reveal">
            To empower children and families through access to quality education, essential healthcare, and sustainable
            community projects—delivered with transparency, dignity, and local partnership.
          </p>
          <ul className="pill-list reveal" aria-label="Mission focus areas">
            <li><IconEducation /> Education</li>
            <li><IconHealth /> Health</li>
            <li><IconWater /> Water &amp; Sanitation</li>
            <li><IconEmpower /> Women &amp; Youth</li>
          </ul>
        </section>

        {/* STATS */}
        <section className="section container stats" aria-label="Impact statistics">
          <article className="stat reveal hover-pop">
            <span className="num"><CountUp end={120} suffix="+" /></span>
            <span className="label">Projects Funded</span>
          </article>
          <article className="stat reveal hover-pop">
            <span className="num"><CountUp end={30000} compact suffix="+" /></span>
            <span className="label">People Reached</span>
          </article>
          <article className="stat reveal hover-pop">
            <span className="num"><CountUp end={50} suffix="+" /></span>
            <span className="label">Active Volunteers</span>
          </article>
          <article className="stat reveal hover-pop">
            <span className="num"><CountUp end={15} /></span>
            <span className="label">Partner Communities</span>
          </article>
        </section>

        {/* GET INVOLVED */}
        <section className="section container get-involved" aria-label="Get involved">
          <div className="cta-grid">
            <Link to="/donate" className="cta-card shine reveal">
              <div className="cta-icon"><IconDonate /></div>
              <h3>Donate</h3>
              <p>Your gift funds urgent needs and long-term solutions.</p>
              <span className="cta-btn">Give Now</span>
            </Link>
            <Link to="/volunteers" className="cta-card outline reveal">
              <div className="cta-icon"><IconVolunteer /></div>
              <h3>Volunteer</h3>
              <p>Join hands-on projects or remote support teams.</p>
              <span className="cta-btn">Join Us</span>
            </Link>
          </div>
        </section>

        {/* Secondary CTA */}
        <section className="section container cta">
          <h3 className="reveal">See our latest work</h3>
          <p className="reveal">Browse ongoing initiatives and real stories from the field.</p>
          <div className="cta-actions reveal">
            <Link to="/projects" className="btn btn-primary sheen">View Projects</Link>
            <Link to="/contact" className="btn btn-ghost">Contact Us</Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
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

              <div className="footer-social" aria-label="Social media">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Social.Facebook /></a>
                <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)"><Social.X /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Social.Instagram /></a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Social.YouTube /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Social.LinkedIn /></a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok"><Social.TikTok /></a>
                <a href="https://wa.me/252" target="_blank" rel="noreferrer" aria-label="WhatsApp"><Social.WhatsApp /></a>
                <a href="https://t.me/" target="_blank" rel="noreferrer" aria-label="Telegram"><Social.Telegram /></a>
                <a href="mailto:info@charityhope.org" aria-label="Email"><Social.Mail /></a>
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
              <div className="payment-badges" aria-hidden="true">
                <span className="pay-badge">EVC</span>
                <span className="pay-badge">E-Dahab</span>
                <span className="pay-badge">Visa</span>
                <span className="pay-badge">Mastercard</span>
              </div>
            </div>

            <div className="footer-news">
              <h4>Newsletter</h4>
              <p>Get field stories and project updates (1–2×/month).</p>
              <form className="news-form" onSubmit={onSubscribe}>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  aria-label="Email address"
                  required
                />
                <button className="btn btn-ghost" type="submit">Subscribe</button>
              </form>
              <small className="foot-note">We respect your privacy. Unsubscribe any time.</small>
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

      {/* Floating Donate */}
      <div className="floating-donate">
        <Link to="/donate" className="floating-donate-btn sheen" aria-label="Donate">
          <IconDonate /> <span>Donate</span>
        </Link>
      </div>
    </>
  );
}