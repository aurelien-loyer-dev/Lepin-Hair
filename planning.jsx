// planning.jsx — Week & Day planning views

function Planning({ services, selected, onPick, viewMode, setViewMode, bookedAppts }) {
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(new Date()));
  const [activeDay, setActiveDay] = React.useState(() => {
    // find first working day from today
    const t = new Date(); t.setHours(0,0,0,0);
    if (WORKING_DAYS.includes(t.getDay())) return t;
    return startOfWeek(t);
  });

  const today = new Date(); today.setHours(0,0,0,0);
  const weekDays = WORKING_DAYS.map(dow => addDays(weekStart, dow - 1));

  const duration = selected.service?.duration || 1;

  // Booked map (selected ones from user's appts + pre-booked)
  const userBookedSet = new Set(
    bookedAppts.filter(a => a.status === 'active').flatMap(a => {
      const slots = [];
      for (let i = 0; i < a.duration; i++) slots.push(`${a.dateKey}:${a.hour + i}`);
      return slots;
    })
  );

  function isSlotBooked(date, hour) {
    if (userBookedSet.has(`${dateKey(date)}:${hour}`)) return true;
    return isPreBooked(date, hour);
  }

  // For 2h slots, both hours must be free
  function canBook(date, hour) {
    if (isPast(date, hour)) return false;
    if (isSlotBooked(date, hour)) return false;
    if (duration === 2) {
      if (hour + 1 >= HOURS.end) return false;
      if (isSlotBooked(date, hour + 1)) return false;
    }
    return true;
  }

  function isSelectedSlot(date, hour) {
    if (!selected.date || !selected.hour) return false;
    if (!sameDay(date, selected.date)) return false;
    if (hour === selected.hour) return true;
    if (duration === 2 && hour === selected.hour + 1) return true;
    return false;
  }

  function handlePick(date, hour) {
    if (!selected.service) {
      onPick({ ...selected, date, hour, _wantService: true });
      return;
    }
    if (!canBook(date, hour)) return;
    onPick({ ...selected, date, hour });
  }

  const goPrev = () => setWeekStart(d => addDays(d, -7));
  const goNext = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => {
    setWeekStart(startOfWeek(new Date()));
    const t = new Date(); t.setHours(0,0,0,0);
    if (WORKING_DAYS.includes(t.getDay())) setActiveDay(t);
    else setActiveDay(startOfWeek(t));
  };

  const isCurrentWeek = sameDay(weekStart, startOfWeek(today));
  const monthLabel = (() => {
    const last = weekDays[weekDays.length - 1];
    if (weekDays[0].getMonth() === last.getMonth()) return MONTH_NAMES[weekDays[0].getMonth()];
    return `${MONTH_SHORT[weekDays[0].getMonth()]} – ${MONTH_SHORT[last.getMonth()]}`;
  })();

  return (
    <div className="planning-wrap">
      <div className="planning-toolbar">
        <div>
          <div className="planning-week-label">
            Semaine du {weekDays[0].getDate()} {MONTH_SHORT[weekDays[0].getMonth()]}
            <span className="month">{weekDays[0].getFullYear()}</span>
          </div>
        </div>
        <div className="planning-nav">
          <button className="today" onClick={goToday} disabled={isCurrentWeek}>Aujourd'hui</button>
          <button onClick={goPrev} aria-label="Semaine précédente">‹</button>
          <button onClick={goNext} aria-label="Semaine suivante">›</button>
          <div className="view-toggle">
            <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>Semaine</button>
            <button className={viewMode === 'day' ? 'active' : ''} onClick={() => setViewMode('day')}>Jour</button>
          </div>
        </div>
      </div>

      {viewMode === 'week' ? (
        <WeekView
          weekDays={weekDays}
          today={today}
          canBook={canBook}
          isSlotBooked={isSlotBooked}
          isSelectedSlot={isSelectedSlot}
          handlePick={handlePick}
          duration={duration}
        />
      ) : (
        <DayView
          weekDays={weekDays}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          today={today}
          canBook={canBook}
          isSlotBooked={isSlotBooked}
          isSelectedSlot={isSelectedSlot}
          handlePick={handlePick}
          duration={duration}
        />
      )}
    </div>
  );
}

function WeekView({ weekDays, today, canBook, isSlotBooked, isSelectedSlot, handlePick, duration }) {
  const hours = hoursForDay();
  return (
    <div className="week-grid">
      <div className="week-head">
        <div></div>
        {weekDays.map((d, i) => (
          <div key={i} className={`day-label ${sameDay(d, today) ? 'today' : ''}`}>
            <div>{DAY_NAMES[d.getDay()]}</div>
            <span className="num">{d.getDate()}</span>
          </div>
        ))}
      </div>
      <div className="time-col">
        {hours.map(h => (
          <div key={h} className="time-slot">{String(h).padStart(2,'0')}:00</div>
        ))}
      </div>
      {weekDays.map((d, di) => (
        <div key={di} className="day-col">
          {hours.map(h => {
            const past = isPast(d, h);
            const booked = isSlotBooked(d, h);
            const ok = canBook(d, h);
            const sel = isSelectedSlot(d, h);
            const cls = sel ? 'selected' : booked ? 'booked' : (past || !ok) ? 'unavailable' : '';
            const label = sel
              ? (duration === 2 ? `${String(h).padStart(2,'0')}–${String(h+2).padStart(2,'0')}h` : '✓')
              : booked ? '—'
              : past ? '—'
              : `${String(h).padStart(2,'0')}:00`;
            // For 2h selected, hide label on second hour
            const isSecondOfTwo = sel && duration === 2 && h !== weekDays[0].getHours;
            return (
              <div key={h} className={`slot ${cls}`}>
                <button onClick={() => handlePick(d, h)} disabled={booked || past}>
                  {label}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function DayView({ weekDays, activeDay, setActiveDay, today, canBook, isSlotBooked, isSelectedSlot, handlePick, duration }) {
  const hours = hoursForDay();
  const day = activeDay;
  return (
    <div className="day-view">
      <div className="day-tabs">
        {weekDays.map((d, i) => {
          const active = sameDay(d, day);
          const isToday = sameDay(d, today);
          return (
            <button
              key={i}
              className={`${active ? 'active' : ''} ${active && isToday ? 'has-today' : ''}`}
              onClick={() => setActiveDay(d)}
            >
              <span className="d">{DAY_NAMES[d.getDay()]}</span>
              <span className="n">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
      <div className="day-view-head">
        <h3>
          <span className="num">{day.getDate()}</span>
          {DAY_NAMES_LONG[day.getDay()]} <span style={{ color: 'var(--fg-mute)', fontSize: '20px' }}>· {MONTH_NAMES[day.getMonth()]}</span>
        </h3>
      </div>
      <div className="day-view-list">
        {hours.map(h => {
          const past = isPast(day, h);
          const booked = isSlotBooked(day, h);
          const ok = canBook(day, h);
          const sel = isSelectedSlot(day, h);
          let cls = '';
          if (sel) cls = 'selected';
          else if (booked) cls = 'booked';
          else if (past || !ok) cls = 'unavailable';
          const sub = sel ? `${duration}h · sélectionné`
            : booked ? 'Réservé'
            : past ? 'Passé'
            : !ok ? 'Indisponible'
            : `disponible`;
          return (
            <button
              key={h}
              className={`slot-card ${cls}`}
              onClick={() => handlePick(day, h)}
              disabled={booked || past || !ok}
            >
              <span className="time">{String(h).padStart(2,'0')}:00</span>
              <span className="sub">{sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Planning, WeekView, DayView });
