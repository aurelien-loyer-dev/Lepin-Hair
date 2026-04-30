import React from 'react';
import { DAY_NAMES, MONTH_SHORT } from './data.js';

const ADMIN_PASSWORD = 'admin';

const ALL_DAYS = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 7);

export function AdminSection({ services, onSaveServices, appts, onCancelAppt, config, onSaveConfig }) {
  const [authed, setAuthed] = React.useState(() => sessionStorage.getItem('adm') === '1');
  const [pw, setPw] = React.useState('');
  const [err, setErr] = React.useState('');
  const [tab, setTab] = React.useState('dashboard');

  function login() {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('adm', '1');
      setAuthed(true);
    } else {
      setErr('Mot de passe incorrect');
    }
  }

  function logout() {
    sessionStorage.removeItem('adm');
    setAuthed(false);
    setPw('');
  }

  if (!authed) {
    return (
      <section className="section">
        <div className="shell">
          <div className="adm-login">
            <div className="eyebrow">— Administration</div>
            <h2 className="adm-login-title">Accès administrateur</h2>
            <div className="adm-login-card">
              <div className="field">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={pw}
                  onChange={e => { setPw(e.target.value); setErr(''); }}
                  onKeyDown={e => e.key === 'Enter' && login()}
                  placeholder="••••••••"
                  autoFocus
                />
                {err && <span className="err">{err}</span>}
              </div>
              <button className="btn-primary" style={{ width: '100%' }} onClick={login}>
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const TABS = [
    { id: 'dashboard', label: 'Vue d\'ensemble' },
    { id: 'services',  label: 'Prestations' },
    { id: 'appts',     label: 'Rendez-vous' },
    { id: 'settings',  label: 'Paramètres' },
  ];

  return (
    <section className="section">
      <div className="shell">
        <div className="adm-header">
          <div>
            <div className="eyebrow">— Administration</div>
            <h2>Gestion du salon</h2>
          </div>
          <button className="btn-ghost" onClick={logout}>Déconnexion</button>
        </div>
        <div className="adm-tabs">
          {TABS.map(t => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div>
          {tab === 'dashboard' && <Dashboard appts={appts} services={services} />}
          {tab === 'services'  && <ServicesTab services={services} onSave={onSaveServices} />}
          {tab === 'appts'     && <ApptsTab appts={appts} onCancel={onCancelAppt} />}
          {tab === 'settings'  && <SettingsTab config={config} onSave={onSaveConfig} />}
        </div>
      </div>
    </section>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ appts, services }) {
  const now = new Date();
  const active = appts.filter(a => a.status === 'active');
  const upcoming = active.filter(a => { const d = new Date(a.dateKey); d.setHours(a.hour + 1); return d > now; });
  const done = active.filter(a => { const d = new Date(a.dateKey); d.setHours(a.hour + 1); return d <= now; });
  const revenue = active.reduce((s, a) => s + (a.price || 0), 0);

  const stats = [
    { value: upcoming.length, label: 'RDV à venir', accent: true },
    { value: done.length,     label: 'RDV effectués' },
    { value: appts.filter(a => a.status === 'cancelled').length, label: 'Annulations' },
    { value: `${revenue} €`, label: 'CA total' },
  ];

  const recent = [...appts].reverse().slice(0, 8);

  return (
    <div className="adm-dashboard">
      <div className="adm-stats">
        {stats.map(s => (
          <div key={s.label} className={`adm-stat${s.accent ? ' accent' : ''}`}>
            <div className="adm-stat-val">{s.value}</div>
            <div className="adm-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
      {recent.length > 0 && (
        <>
          <div className="adm-section-lbl">Derniers rendez-vous</div>
          <div className="adm-appts-list">
            {recent.map(a => <ApptRow key={a.id} appt={a} />)}
          </div>
        </>
      )}
      {recent.length === 0 && (
        <div className="adm-empty">Aucun rendez-vous enregistré pour l'instant.</div>
      )}
    </div>
  );
}

// ── Services tab ──────────────────────────────────────────────────────────────
function ServicesTab({ services, onSave }) {
  const [draft, setDraft] = React.useState(() => services.map(s => ({ ...s })));
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => { setDraft(services.map(s => ({ ...s }))); }, [services]);

  const upd = (i, field, val) => {
    setDraft(prev => prev.map((s, j) => j === i ? { ...s, [field]: val } : s));
    setSaved(false);
  };

  const save = () => { onSave(draft); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div>
      <div className="adm-section-lbl">Modifier les prestations</div>
      <div className="adm-services-grid">
        {draft.map((s, i) => (
          <div key={s.id} className="adm-svc-card">
            <div className="adm-svc-top">
              <input
                className="adm-input adm-svc-name"
                value={s.name}
                onChange={e => upd(i, 'name', e.target.value)}
                placeholder="Nom de la prestation"
              />
              <div className="adm-price-row">
                <input
                  className="adm-input adm-svc-price"
                  type="number" min="0"
                  value={s.price}
                  onChange={e => upd(i, 'price', Number(e.target.value))}
                />
                <span className="adm-euro">€</span>
              </div>
            </div>
            <textarea
              className="adm-input adm-svc-desc"
              value={s.desc}
              rows={2}
              onChange={e => upd(i, 'desc', e.target.value)}
              placeholder="Description"
            />
            <div className="adm-svc-meta">
              <div className="adm-field-row">
                <label>Tag</label>
                <input className="adm-input adm-sm" value={s.tag} onChange={e => upd(i, 'tag', e.target.value)} />
              </div>
              <div className="adm-field-row">
                <label>Durée</label>
                <select className="adm-input adm-sm" value={s.duration} onChange={e => upd(i, 'duration', Number(e.target.value))}>
                  <option value={1}>1h</option>
                  <option value={2}>2h</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={save} style={{ marginTop: 24 }}>
        {saved ? 'Enregistré ✓' : 'Enregistrer les modifications'}
      </button>
    </div>
  );
}

// ── Appointments tab ──────────────────────────────────────────────────────────
function ApptsTab({ appts, onCancel }) {
  const [filter, setFilter] = React.useState('active');

  const filtered = [...appts].reverse().filter(a => {
    if (filter === 'active')    return a.status === 'active';
    if (filter === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  return (
    <div>
      <div className="adm-filter-bar">
        {[['all', 'Tous'], ['active', 'Actifs'], ['cancelled', 'Annulés']].map(([v, l]) => (
          <button key={v} className={filter === v ? 'active' : ''} onClick={() => setFilter(v)}>{l}</button>
        ))}
        <span className="adm-count">{filtered.length} RDV</span>
      </div>
      {filtered.length === 0
        ? <div className="adm-empty">Aucun rendez-vous dans cette catégorie.</div>
        : <div className="adm-appts-list">{filtered.map(a => <ApptRow key={a.id} appt={a} onCancel={onCancel} />)}</div>
      }
    </div>
  );
}

function ApptRow({ appt, onCancel }) {
  const d = new Date(appt.dateKey);
  const cancelled = appt.status === 'cancelled';
  return (
    <div className={`adm-appt-row${cancelled ? ' is-cancelled' : ''}`}>
      <div className="apr-date">
        <span className="apr-d">{DAY_NAMES[d.getDay()]}</span>
        <span className="apr-n">{d.getDate()} {MONTH_SHORT[d.getMonth()]}</span>
      </div>
      <div className="apr-info">
        <div className="apr-name">{appt.name || '—'}</div>
        <div className="apr-svc">{appt.serviceName}</div>
      </div>
      <div className="apr-hour">{String(appt.hour).padStart(2, '0')}:00</div>
      <div className="apr-price">{appt.price} €</div>
      {onCancel && (
        <div className="apr-action">
          {cancelled
            ? <span className="adm-badge cancelled">Annulé</span>
            : <button className="adm-cancel-btn" onClick={() => onCancel(appt.id)}>Annuler</button>
          }
        </div>
      )}
    </div>
  );
}

// ── Settings tab ──────────────────────────────────────────────────────────────
function SettingsTab({ config, onSave }) {
  const [vals, setVals] = React.useState({ ...config });
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => { setVals({ ...config }); }, [config]);

  const upd = (key, val) => { setVals(p => ({ ...p, [key]: val })); setSaved(false); };
  const updHours = (key, val) => upd('hours', { ...vals.hours, [key]: val });
  const toggleDay = d => {
    const days = vals.workingDays.includes(d)
      ? vals.workingDays.filter(x => x !== d)
      : [...vals.workingDays, d].sort((a, b) => a - b);
    upd('workingDays', days);
  };

  const save = () => { onSave(vals); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div>
      <div className="adm-settings-grid">

        <div className="adm-setting-card">
          <div className="adm-section-lbl">Horaires d'ouverture</div>
          <div className="adm-setting-row">
            <label>Ouverture</label>
            <select className="adm-input adm-sm" value={vals.hours.start} onChange={e => updHours('start', Number(e.target.value))}>
              {HOURS_OPTIONS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
            </select>
          </div>
          <div className="adm-setting-row">
            <label>Fermeture</label>
            <select className="adm-input adm-sm" value={vals.hours.end} onChange={e => updHours('end', Number(e.target.value))}>
              {HOURS_OPTIONS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
            </select>
          </div>
        </div>

        <div className="adm-setting-card">
          <div className="adm-section-lbl">Jours ouvrés</div>
          <div className="adm-days-row">
            {ALL_DAYS.map((d, i) => (
              <button
                key={d}
                className={`adm-day-btn${vals.workingDays.includes(d) ? ' active' : ''}`}
                onClick={() => toggleDay(d)}
              >
                {DAY_LABELS[i]}
              </button>
            ))}
          </div>
        </div>

        <div className="adm-setting-card">
          <div className="adm-section-lbl">Informations salon</div>
          {[
            { key: 'address', label: 'Adresse',   ph: 'EPITECH La Réunion' },
            { key: 'city',    label: 'Ville',      ph: 'Saint-André' },
            { key: 'phone',   label: 'Téléphone',  ph: '04 78 12 34 56' },
          ].map(({ key, label, ph }) => (
            <div key={key} className="adm-setting-row">
              <label>{label}</label>
              <input className="adm-input" value={vals[key] || ''} placeholder={ph}
                onChange={e => upd(key, e.target.value)} />
            </div>
          ))}
        </div>

        <div className="adm-setting-card">
          <div className="adm-section-lbl">Accès admin</div>
          <p style={{ fontSize: 13, color: 'var(--fg-dim)', margin: 0 }}>
            Mot de passe actuel&nbsp;: <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg)' }}>admin</code>
          </p>
          <p style={{ fontSize: 12, color: 'var(--fg-mute)', margin: 0 }}>
            Pour changer le mot de passe, modifiez la constante <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>ADMIN_PASSWORD</code> dans <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>src/admin.jsx</code>.
          </p>
        </div>

      </div>
      <button className="btn-primary" onClick={save} style={{ marginTop: 24 }}>
        {saved ? 'Enregistré ✓' : 'Enregistrer les paramètres'}
      </button>
    </div>
  );
}
