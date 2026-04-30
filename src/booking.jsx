import React from 'react';
import { fmtDate } from './data.js';

export function BookingModal({ open, mode, selected, onClose, onConfirm }) {
  const [name, setName] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (open) { setName(''); setNotes(''); setErrors({}); }
  }, [open]);

  if (!open) return null;
  const { service, date, hour } = selected;
  const endHour = hour + (service?.duration || 1);

  function submit() {
    const errs = {};
    if (!name.trim()) errs.name = 'Veuillez indiquer votre nom';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onConfirm({ name: name.trim(), notes: notes.trim() });
  }

  if (mode === 'confirmed') {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="confirm-icon">✓</div>
          <h3>Réservation confirmée</h3>
          <p className="modal-sub">Au plaisir de vous voir bientôt chez Lepin'Hair.</p>
          <div className="recap">
            <div className="row"><span className="k">Prestation</span><span className="v">{service.name}</span></div>
            <div className="row"><span className="k">Date</span><span className="v">{fmtDate(date)}</span></div>
            <div className="row"><span className="k">Horaire</span><span className="v">{String(hour).padStart(2,'0')}:00 – {String(endHour).padStart(2,'0')}:00</span></div>
            <div className="row total"><span className="k">Total</span><span className="v">{service.price} €</span></div>
          </div>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Voir mes RDV</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>Confirmer le RDV</h3>
        <p className="modal-sub">Vérifiez les informations avant de valider.</p>
        <div className="recap">
          <div className="row"><span className="k">Prestation</span><span className="v">{service.name}</span></div>
          <div className="row"><span className="k">Date</span><span className="v">{fmtDate(date)}</span></div>
          <div className="row"><span className="k">Horaire</span><span className="v">{String(hour).padStart(2,'0')}:00 – {String(endHour).padStart(2,'0')}:00</span></div>
          <div className="row total"><span className="k">Total</span><span className="v">{service.price} €</span></div>
        </div>
        <div className="field">
          <label>Nom</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jean Dupont"
            autoFocus
          />
          {errors.name && <span className="err">{errors.name}</span>}
        </div>
        <div className="field">
          <label>Notes (optionnel)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Préférences, demandes particulières…"
          />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Annuler</button>
          <button className="btn-primary" onClick={submit} style={{ flex: 2 }}>Confirmer la réservation</button>
        </div>
      </div>
    </div>
  );
}

export function CancelModal({ open, appt, onClose, onConfirm }) {
  if (!open || !appt) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>Annuler ce RDV ?</h3>
        <p className="modal-sub">Cette action est irréversible. Le créneau sera libéré pour un autre client.</p>
        <div className="recap">
          <div className="row"><span className="k">Prestation</span><span className="v">{appt.serviceName}</span></div>
          <div className="row"><span className="k">Date</span><span className="v">{fmtDate(new Date(appt.dateKey))}</span></div>
          <div className="row"><span className="k">Horaire</span><span className="v">{String(appt.hour).padStart(2,'0')}:00 – {String(appt.hour + appt.duration).padStart(2,'0')}:00</span></div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Garder</button>
          <button className="btn-primary" onClick={onConfirm} style={{ flex: 1, background: 'var(--danger)', color: '#fff' }}>Annuler le RDV</button>
        </div>
      </div>
    </div>
  );
}
