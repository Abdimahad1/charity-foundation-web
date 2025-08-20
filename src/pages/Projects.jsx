import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Projects.css';

/* ---------- Inline icons (map categories to icons) ---------- */
const IconBook = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h12a2 2 0 012 2v14H6a2 2 0 01-2-2V4zm2 2v12h10V6H6zm-2 14h14v2H4a4 4 0 01-4-4V6h2v12a2 2 0 002 2z"/></svg>
);
const IconHealth = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5 2 14.54 11.5 21 12 21s10-6.46 10-12.5C22 5.42 19.58 3 16.5 3z"/></svg>
);
const IconWater = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2S5 9 5 13.5 8.58 21 12 21s7-3.13 7-7.5S12 2 12 2zm0 17c-2.49 0-4.5-2.02-4.5-4.5S9.51 10 12 10s4.5 2.02 4.5 4.5S14.49 19 12 19z"/></svg>
);
const IconFood = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 9h2v12h-2zM5 9h2v12H5zM19 9h2v12h-2zM7 6a5 5 0 1110 0v3H7V6z"/></svg>
);
const IconWomen = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a5 5 0 110 10 5 5 0 010-10zm-1 11h2v3h3v2h-3v3h-2v-3H8v-2h3v-3z"/></svg>
);

/* Map category names to icons + colors */
const categoryMap = {
  Education:   { icon: <IconBook />,   color: 'edu' },
  Health:      { icon: <IconHealth />, color: 'health' },
  Water:       { icon: <IconWater />,  color: 'water' },
  Food:        { icon: <IconFood />,   color: 'food' },
  Empowerment: { icon: <IconWomen />,  color: 'empower' }
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleDonateClick = (projectId) => {
    sessionStorage.setItem('selectedProjectId', projectId);
    navigate('/donate');
  };

  // Fetch projects from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${base}/charities`);
        setProjects(res.data.items || res.data || []);
      } catch (err) {
        console.error('Error fetching projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Refresh projects every 30 seconds to get updated raised amounts
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${base}/charities`);
        setProjects(res.data.items || res.data || []);
      } catch (err) {
        console.error('Error refreshing projects', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for reveal animations
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && e.target.classList.add('in-view'));
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [projects]);

  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
    return ['All', ...uniqueCats];
  }, [projects]);

  const list = useMemo(() => {
    return projects.filter(p => {
      const matchCat = activeCat === 'All' || p.category === activeCat;
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [projects, activeCat, query]);

  return (
    <main className="projects">
      {/* Hero / header */}
      <section className="projects-hero">
        <div className="projects-hero-inner container-wide">
          <h1 className="title reveal">Projects & Causes</h1>
          <p className="sub reveal">Choose a cause and power real change.</p>

          <div className="toolbar reveal" role="region" aria-label="project filters">
            <div className="chips">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`chip ${activeCat === cat ? 'active' : ''}`}
                  onClick={() => setActiveCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="search">
              <input
                type="search"
                placeholder="Search by title or location…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search projects"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="section container-wide grid">
        {loading && <div className="loading">Loading projects…</div>}

        {!loading && list.map(p => {
          const { icon, color } = categoryMap[p.category] || {};
          const pct = p.goal ? Math.min(100, Math.round((Number(p.raised || 0) / Number(p.goal || 1)) * 100)) : 0;

          return (
            <article key={p._id || p.id} className={`card card-photo reveal hover-pop ${color || ''}`}>
              {/* HD image; keeps quality with object-fit + no filters; inherits rounded corners */}
              {p.cover && (
                <img
                  className="card-img"
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}

              {/* Aqua glass panel */}
              <div className="info-panel aqua">
                <div className="topline">
                  <div className={`badge ${color || ''}`}>{p.category}</div>
                  <span className="location">{p.location}</span>
                </div>

                <div className="title-row">
                  <div className={`icon-wrap ${color || ''}`}>{icon}</div>
                  <h3>{p.title}</h3>
                </div>

                <p className="excerpt">{p.excerpt}</p>

                <div className="progress">
                  <div className="bar"><span className={`fill ${color || ''}`} style={{ width: `${pct}%` }} /></div>
                  <div className="legend">
                    <span className="raised">${Number(p.raised || 0).toLocaleString()}</span>
                    <span className="goal">of ${Number(p.goal || 0).toLocaleString()}</span>
                    <span className="pct">{pct}%</span>
                  </div>
                </div>

                <div className="actions">
                  {p.donationLink ? (
                    <a href={p.donationLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary sheen">
                      Donate
                    </a>
                  ) : (
                    <button 
                      onClick={() => handleDonateClick(p._id || p.id)} 
                      className="btn btn-primary sheen"
                    >
                      Donate
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {!loading && list.length === 0 && (
          <div className="empty reveal">
            <p>No projects found. Try a different search or category.</p>
            <button 
              onClick={() => navigate('/donate')} 
              className="btn btn-primary"
            >
              Donate to the general fund
            </button>
          </div>
        )}
      </section>
    </main>
  );
}