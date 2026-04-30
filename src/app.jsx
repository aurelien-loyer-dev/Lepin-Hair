import React from 'react';
import { SERVICES, dateKey, fmtDateShort } from './data.js';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio } from './tweaks-panel.jsx';
import { Nav, Hero, Services, MyAppts, Footer } from './sections.jsx';
import { BookingModal, CancelModal } from './booking.jsx';
import { Planning } from './planning.jsx';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "viewMode": "week",
  "theme": "dark",
  "density": "cozy"
}/*EDITMODE-END*/;

export function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [section, setSection] = React.useState('home');
  const [selected, setSelected] = React.useState({ service: null, date: null, hour: null });
  const [modal, setModal] = React.useState(null);
  const [cancelTarget, setCancelTarget] = React.useState(null);
  const [appts, setAppts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('lepin_appts') || '[]'); }
    catch { return []; }
  });
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    try { localStorage.setItem('lepin_appts', JSON.stringify(appts)); } catch {}
  }, [appts]);

  React.useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.dataset.density = t.density;
  }, [t.theme, t.density]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  function pickService(s) {
    setSelected(prev => ({ ...prev, service: s }));
    showToast(`${s.name} sélectionné · choisissez un créneau`);
    setTimeout(() => {
      document.querySelector('#book-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function pickSlot(next) {
    if (next._wantService) {
      showToast('Choisissez d\'abord une prestation');
      delete next._wantService;
      document.querySelector('#services-anchor')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setSelected(next);
  }

  function navTo(s) {
    setSection(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openReview() {
    if (!selected.service || !selected.date || selected.hour == null) return;
    setModal('review');
  }

  function confirmBooking({ name, notes }) {
    const appt = {
      id: Date.now().toString(36),
      serviceId: selected.service.id,
      serviceName: selected.service.name,
      duration: selected.service.duration,
      price: selected.service.price,
      dateKey: dateKey(selected.date),
      hour: selected.hour,
      name, notes,
      status: 'active',
      createdAt: Date.now(),
    };
    setAppts(prev => [...prev, appt]);
    setModal('confirmed');
  }

  function closeModal() {
    if (modal === 'confirmed') {
      setModal(null);
      setSelected({ service: null, date: null, hour: null });
      setSection('mine');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setModal(null);
    }
  }

  function doCancel() {
    setAppts(prev => prev.map(a => a.id === cancelTarget.id ? { ...a, status: 'cancelled' } : a));
    setCancelTarget(null);
    showToast('Rendez-vous annulé');
  }

  const canConfirm = selected.service && selected.date && selected.hour != null;
  const activeAppts = appts.filter(a => a.status === 'active');

  return (
    <div className="app">
      <Nav section={section} onNav={navTo} hasAppts={activeAppts.length > 0} />

      {section === 'home' && (
        <>
          <Hero onCta={() => navTo('book')} />
          <Services services={SERVICES} selected={selected} onSelect={pickService} />
          <BookSection
            selected={selected}
            onPick={pickSlot}
            viewMode={t.viewMode}
            setViewMode={(v) => setTweak('viewMode', v)}
            bookedAppts={appts}
            canConfirm={canConfirm}
            openReview={openReview}
            onClear={() => setSelected({ service: null, date: null, hour: null })}
          />
        </>
      )}

      {section === 'services' && (
        <Services services={SERVICES} selected={selected} onSelect={pickService} />
      )}

      {section === 'book' && (
        <>
          <Services services={SERVICES} selected={selected} onSelect={pickService} />
          <BookSection
            selected={selected}
            onPick={pickSlot}
            viewMode={t.viewMode}
            setViewMode={(v) => setTweak('viewMode', v)}
            bookedAppts={appts}
            canConfirm={canConfirm}
            openReview={openReview}
            onClear={() => setSelected({ service: null, date: null, hour: null })}
          />
        </>
      )}

      {section === 'mine' && (
        <MyAppts appts={appts} onCancel={(a) => setCancelTarget(a)} onBookNew={() => navTo('book')} />
      )}

      <Footer />

      <BookingModal
        open={modal === 'review' || modal === 'confirmed'}
        mode={modal}
        selected={selected}
        onClose={closeModal}
        onConfirm={confirmBooking}
      />

      <CancelModal
        open={!!cancelTarget}
        appt={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={doCancel}
      />

      {toast && (
        <div className="toast-wrap">
          <div className="toast"><span className="dot"></span>{toast}</div>
        </div>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Affichage" />
        <TweakRadio
          label="Vue planning"
          value={t.viewMode}
          options={[{value: 'week', label: 'Semaine'}, {value: 'day', label: 'Jour'}]}
          onChange={(v) => setTweak('viewMode', v)}
        />
        <TweakRadio
          label="Densité"
          value={t.density}
          options={[{value: 'compact', label: 'Compact'}, {value: 'cozy', label: 'Cozy'}, {value: 'airy', label: 'Aéré'}]}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakSection label="Thème" />
        <TweakRadio
          label="Mode"
          value={t.theme}
          options={[{value: 'dark', label: 'Sombre'}, {value: 'light', label: 'Clair'}]}
          onChange={(v) => setTweak('theme', v)}
        />
      </TweaksPanel>
    </div>
  );
}

export function BookSection({ selected, onPick, viewMode, setViewMode, bookedAppts, canConfirm, openReview, onClear }) {
  const endHour = selected.hour != null && selected.service ? selected.hour + selected.service.duration : null;
  return (
    <section className="section" id="book-anchor">
      <div className="shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">— Réservation</div>
            <h2>Choisissez votre créneau.</h2>
          </div>
          <p className="desc">
            Lundi au vendredi, 14h à 18h. Les créneaux s'adaptent automatiquement à la durée de votre prestation.
          </p>
        </div>
        <Planning
          services={SERVICES}
          selected={selected}
          onPick={onPick}
          viewMode={viewMode}
          setViewMode={setViewMode}
          bookedAppts={bookedAppts}
        />
        <div className="booking-bar">
          <div className="booking-summary">
            <div className="item">
              <span className="k">Prestation</span>
              <span className={`v ${!selected.service ? 'empty' : ''}`}>
                {selected.service?.name || 'Aucune'}
              </span>
            </div>
            <div className="item">
              <span className="k">Date & heure</span>
              <span className={`v ${!selected.date ? 'empty' : ''}`}>
                {selected.date
                  ? `${fmtDateShort(selected.date)} · ${String(selected.hour).padStart(2,'0')}:00–${String(endHour).padStart(2,'0')}:00`
                  : 'Non choisi'}
              </span>
            </div>
            <div className="item">
              <span className="k">Total</span>
              <span className={`v ${!selected.service ? 'empty' : ''}`}>
                {selected.service ? `${selected.service.price} €` : '—'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {(selected.service || selected.date) && (
              <button className="btn-link" onClick={onClear}>Effacer</button>
            )}
            <button className="btn-primary" disabled={!canConfirm} onClick={openReview}>
              Confirmer le RDV
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
