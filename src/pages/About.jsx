// src/pages/About.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/About.css';

/* ---------- Inline icons (no extra libs) ---------- */
const IconMission = () => (
  <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
    <path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3L12 16l-5.5 3.5 1-6.3L3 8.9 9 8l3-6z" />
  </svg>
);
const IconVision = () => (
  <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
    <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
  </svg>
);
const IconGoal = () => (
  <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
    <path d="M12 2a10 10 0 1010 10h-2A8 8 0 116 6l1.41 1.41A6 6 0 1018 12h-2a4 4 0 11-4-4v6l5 3V7h-5V2z" />
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
    <path d="M12 21s-8-4.5-8-10a5 5 0 019-3 5 5 0 019 3c0 5.5-8 10-8 10z" />
  </svg>
);
const IconHands = () => (
  <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
    <path d="M2 12l5-5 5 5-5 5-5-5zm10 0l5-5 5 5-5 5-5-5z" />
  </svg>
);
const IconLeaf = () => (
  <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
    <path d="M5 21c8 0 14-6 14-14V3h-4C7 3 3 7 3 15v6h2z" />
  </svg>
);

export default function About() {
  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------- Timeline data (easy to edit/extend) ---------- */
  const milestones = [
    {
      id: '1961',
      dateLabel: '1961',
      dateTime: '1961',
      title: 'Early Foundations',
      text:
        'Multiple charitable foundations established across England, focusing on local community support, ' +
        'almshouses, and relief for the poor.',
      start: true,
    },
    {
      id: '1962-05-17',
      dateLabel: 'May 17, 1962',
      dateTime: '1962-05-17',
      title: 'Official Registration',
      text:
        'The charity was officially registered, beginning our formal operations as "POTTERNE MISSION ROOM AND TRUST" ' +
        'with charity number 200027.',
    },
    {
      id: '1960s-1990s',
      dateLabel: '1960s–1990s',
      dateTime: '1975', // representative mid-point for accessibility
      title: 'Expansion & Consolidation',
      text:
        'Expanded services across multiple communities, with many smaller charities merging or transferring assets ' +
        'to form larger, more efficient organizations.',
    },
    {
      id: '2014-04-16',
      dateLabel: 'April 16, 2014',
      dateTime: '2014-04-16',
      title: 'Significant Restructuring',
      text:
        'Underwent amalgamation and asset transfers to streamline operations, including transfer to ' +
        'REARDON SMITH NAUTICAL TRUST.',
    },
    {
      id: 'today',
      dateLabel: 'Today',
      dateTime: String(new Date().getFullYear()),
      title: 'Continuing Legacy',
      text:
        'Maintaining our commitment to serving communities while adapting to modern needs—focused on sustainable impact, ' +
        'partnership, and transparent operations.',
      now: true,
    },
  ];

  return (
    <main className="about">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-inner container-wide">
          <span className="badge reveal">About Us</span>
          <h1 className="title reveal">Who We Are & Why We Care</h1>
          <p className="sub reveal">
            A community-driven charity focused on long-term impact through education, healthcare,
            clean water, and empowerment programs.
          </p>
          <div className="actions reveal">
            <Link to="/projects" className="btn btn-primary sheen">Our Projects</Link>
            <Link to="/donate" className="btn btn-ghost">Donate</Link>
          </div>
          <div className="spark a">✨</div>
          <div className="spark b">💙</div>
        </div>
      </section>

      {/* MISSION / VISION / GOAL */}
      <section className="section container-wide trio">
        <article className="card card-mission reveal tilt">
          <div className="card-icon"><IconMission /></div>
          <h3>Our Mission</h3>
          <p>
            To empower children and families through access to quality education, essential
            healthcare, and sustainable community projects—delivered with dignity and transparency.
          </p>
        </article>

        <article className="card card-vision reveal tilt">
          <div className="card-icon"><IconVision /></div>
          <h3>Our Vision</h3>
          <p>
            Thriving, self-reliant communities where every person has the opportunity to learn,
            live healthy, and build a secure future.
          </p>
        </article>

        <article className="card card-goal reveal tilt">
          <div className="card-icon"><IconGoal /></div>
          <h3>Our Goals</h3>
          <ul>
            <li>Expand access to schooling and skills training</li>
            <li>Improve primary healthcare and maternal services</li>
            <li>Deliver safe water and sanitation solutions</li>
            <li>Support women &amp; youth with micro-grants and mentorship</li>
          </ul>
        </article>
      </section>

      {/* HISTORY (Timeline) */}
      <section className="section container-wide timeline" aria-labelledby="history-title">
        <h2 id="history-title" className="reveal">Our History</h2>
        <p className="muted reveal">
          A journey through our key milestones and transformations since our founding.
        </p>

        <ol className="road" role="list">
          {milestones.map((m, idx) => (
            <li
              key={m.id}
              className={[
                'milestone',
                'reveal',
                idx % 2 ? 'right' : 'left', // allows alternating styles if your CSS supports it
                m.start ? 'is-start' : '',
                m.now ? 'is-now' : '',
              ].join(' ').trim()}
              aria-label={`${m.dateLabel} — ${m.title}`}
            >
              <span
                className={[
                  'dot',
                  m.start ? 'dot-start' : '',
                  m.now ? 'dot-now' : '',
                ].join(' ').trim()}
                aria-hidden="true"
              />
              <article className="card-line">
                <header className="milestone-head">
                  {/* Use <time> for better semantics; dateTime can be approximate for ranges */}
                  <time className="when" dateTime={m.dateTime}>{m.dateLabel}</time>
                  <h4 className="what">{m.title}</h4>
                </header>
                <p className="why">{m.text}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      {/* VALUES */}
      <section className="section container-wide values">
        <h2 className="reveal">What Guides Us</h2>
        <div className="values-grid">
          <div className="vcard reveal hover-pop">
            <div className="vicon v1"><IconHeart /></div>
            <h4>Dignity</h4>
            <p>We put people first, honoring local culture and voices.</p>
          </div>

          <div className="vcard reveal hover-pop">
            <div className="vicon v2"><IconHands /></div>
            <h4>Collaboration</h4>
            <p>We build together with communities and partners.</p>
          </div>

          <div className="vcard reveal hover-pop">
            <div className="vicon v3"><IconLeaf /></div>
            <h4>Sustainability</h4>
            <p>We focus on solutions that last beyond our involvement.</p>
          </div>
        </div>
      </section>

      {/* IMPACT STRIP */}
      <section className="impact-strip">
        <div className="container-wide strip-inner">
          <div className="strip-item reveal">
            <span className="num">120+</span>
            <span className="lbl">Projects</span>
          </div>
          <div className="strip-item reveal">
            <span className="num">30k+</span>
            <span className="lbl">People Reached</span>
          </div>
          <div className="strip-item reveal">
            <span className="num">50+</span>
            <span className="lbl">Volunteers</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section container-wide bottom-cta">
        <div className="cta-card shine reveal">
          <h3>Be part of the story</h3>
          <p>Support a project, volunteer skills, or share our mission.</p>
          <div className="cta-actions">
            <Link to="/donate" className="btn btn-primary sheen">Donate</Link>
            <Link to="/volunteers" className="btn btn-ghost">Volunteer</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
