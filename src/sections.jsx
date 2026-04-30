import React from 'react';
import { DAY_NAMES, MONTH_SHORT } from './data.js';

export function Nav({ section, onNav, hasAppts }) {
  return (
    <nav className="nav">
      <div className="shell nav-inner">
        <div className="brand">
          <span>Lepin<span className="dot">'</span>Hair</span>
          <span className="tag">Barber · depuis 2018</span>
        </div>
        <div className="nav-links">
          <a className={section === 'home' ? 'active' : ''} onClick={() => onNav('home')}>Accueil</a>
          <a className={section === 'services' ? 'active' : ''} onClick={() => onNav('services')}>Prestations</a>
          <a className={section === 'book' ? 'active' : ''} onClick={() => onNav('book')}>Réserver</a>
          <a className={section === 'mine' ? 'active' : ''} onClick={() => onNav('mine')}>
            Mes RDV{hasAppts ? ` ·` : ''}
          </a>
        </div>
        <button className="nav-cta" onClick={() => onNav('book')}>Prendre RDV</button>
      </div>
    </nav>
  );
}

export function Hero({ onCta }) {
  return (
    <section className="hero">
      <div className="shell hero-grid">
        <div>
          <h1>L'art de la coupe.<br/><em>Sans compromis.</em></h1>
          <p className="lead">
            Un salon. Un coiffeur. Quatre prestations sur-mesure, du lundi au vendredi de 14h à 18h. Réservez votre créneau en ligne, en deux clics.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={onCta}>Réserver maintenant</button>
            <button className="btn-ghost" onClick={() => document.querySelector('#services-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Voir les prestations</button>
          </div>
          <div className="hero-meta">
            <div><div className="k">Adresse</div><div className="v">EPITECH La Réunion</div></div>
            <div><div className="k">Horaires</div><div className="v">Lun–Ven · 14h–18h</div></div>
            </div>
        </div>
        <div className="hero-card">
          <div className="placeholder-img">[ photo salon — intérieur ]</div>
          <div className="hero-card-foot">
            <span>Atelier de coiffure pour homme</span>
            <b>Lyon · 6e</b>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Services({ services, selected, onSelect }) {
  return (
    <section className="section" id="services-anchor">
      <div className="shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">— Prestations</div>
            <h2>Quatre rituels.<br/>Choisissez le vôtre.</h2>
          </div>
          <p className="desc">
            Toutes les prestations comprennent shampoing et coiffage final. Les rituels signature durent 2 heures pour une expérience complète.
          </p>
        </div>
        <div className="services">
          {services.map(s => (
            <div
              key={s.id}
              className={`service ${selected.service?.id === s.id ? 'selected' : ''}`}
              onClick={() => onSelect(s)}
            >
              <div className="service-head">
                <h3>{s.name}</h3>
                <span className="service-price">{s.price} €</span>
              </div>
              <div className="service-meta">
                <span>{s.tag}</span>
                <span>{s.duration}h</span>
              </div>
              <p className="service-desc">{s.desc}</p>
              <div className="service-foot">
                <span className="service-pick">
                  <span className="checkdot"></span>
                  {selected.service?.id === s.id ? 'Sélectionné' : 'Choisir'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MyAppts({ appts, onCancel, onBookNew }) {
  const active = appts.filter(a => a.status === 'active').sort((a, b) => {
    const ad = new Date(a.dateKey); ad.setHours(a.hour);
    const bd = new Date(b.dateKey); bd.setHours(b.hour);
    return ad - bd;
  });

  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">— Mes rendez-vous</div>
            <h2>{active.length === 0 ? 'Aucun RDV' : active.length === 1 ? 'Un RDV à venir' : `${active.length} RDV à venir`}</h2>
          </div>
          <p className="desc">
            Retrouvez ici vos rendez-vous confirmés. Vous pouvez les annuler jusqu'à 24h avant.
          </p>
        </div>
        {active.length === 0 ? (
          <div className="appt-empty">
            <div className="ic">∅</div>
            <p>Vous n'avez pas encore de rendez-vous.</p>
            <button className="btn-link" onClick={onBookNew}>Prendre RDV →</button>
          </div>
        ) : (
          <div className="appt-list">
            {active.map(a => {
              const d = new Date(a.dateKey);
              return (
                <div key={a.id} className="appt-card">
                  <div className="appt-date">
                    <div className="d">{DAY_NAMES[d.getDay()]}</div>
                    <div className="n">{d.getDate()}</div>
                    <div className="m">{MONTH_SHORT[d.getMonth()]}</div>
                  </div>
                  <div className="appt-info">
                    <div className="svc">{a.serviceName}</div>
                    <div className="meta">
                      {String(a.hour).padStart(2,'0')}:00 – {String(a.hour + a.duration).padStart(2,'0')}:00 · {a.duration}h · {a.price} €
                    </div>
                    {a.notes && <div className="notes">"{a.notes}"</div>}
                  </div>
                  <div className="appt-actions">
                    <button className="btn-ghost" onClick={() => onCancel(a)}>Annuler</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <div className="shell">
      <div className="foot">
        <div>© 2026 Lepin'Hair · EPITECH La Réunion, Lyon 6e</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a>Mentions légales</a>
          <a>Contact</a>
          <a>Instagram</a>
        </div>
      </div>
    </div>
  );
}
