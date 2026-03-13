import React, { useState } from 'react';
import MEMBERS from '../data/members';
import './AttendancePage.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const today = new Date().toISOString().split('T')[0];

export default function AttendancePage() {
  const [step, setStep] = useState(1);
  const [kirType, setKirType] = useState(null);       // 'pulsar' | 'special'
  const [subType, setSubType] = useState(null);        // 'normal' | 'event'
  const [pulsarDate, setPulsarDate] = useState(today);
  const [normalDate, setNormalDate] = useState(today);
  const [eventDate, setEventDate] = useState(today);
  const [hostName, setHostName] = useState('');
  const [eventName, setEventName] = useState('');
  const [attendance, setAttendance] = useState({});

  // Build initial attendance when entering step 3
  const initAttendance = (host = '') => {
    const att = {};
    MEMBERS.forEach(m => {
      att[m] = m === host ? 'special' : null;
    });
    setAttendance(att);
  };

  const setAtt = (name, status) => {
    setAttendance(prev => ({ ...prev, [name]: prev[name] === status ? null : status }));
  };

  const markAll = (status) => {
    const att = {};
    MEMBERS.forEach(m => att[m] = status);
    setAttendance(att);
  };

  const clearAll = () => {
    const att = {};
    MEMBERS.forEach(m => att[m] = null);
    setAttendance(att);
  };

  const counts = Object.values(attendance).reduce(
    (acc, v) => {
      if (v === 'present') acc.present++;
      else if (v === 'absent') acc.absent++;
      else if (v === 'special') acc.special++;
      return acc;
    },
    { present: 0, absent: 0, special: 0 }
  );

  const goStep3 = () => {
    if (kirType === 'pulsar') {
      initAttendance('');
    } else if (subType === 'normal') {
      if (!hostName) { alert('Host ka naam select karein!'); return; }
      initAttendance(hostName);
    } else {
      if (!eventName.trim()) { alert('Event ka naam likho!'); return; }
      initAttendance('');
    }
    setStep(3);
  };

  const submitAttendance = () => {
    const unmarked = Object.values(attendance).filter(v => v === null).length;
    if (unmarked > 0) {
      if (!window.confirm(`${unmarked} logo ki attendance nahi bhari. Phir bhi save karein?`)) return;
    }
    setStep(4);
  };

  const resetAll = () => {
    setStep(1);
    setKirType(null);
    setSubType(null);
    setHostName('');
    setEventName('');
    setAttendance({});
    setPulsarDate(today);
    setNormalDate(today);
    setEventDate(today);
  };

  const infoText = () => {
    if (kirType === 'pulsar') return `🔔 Pulsar Kirtan — ${formatDate(pulsarDate)}`;
    if (subType === 'normal') return `🏠 Special Kirtan — ${hostName} ke ghar mein | ${formatDate(normalDate)}`;
    return `🎉 ${eventName} — ${formatDate(eventDate)}`;
  };

  const showSpecialCol = kirType === 'special' && subType === 'normal';

  return (
    <div className="page-wrap">
      {/* HEADER */}
      <header className="site-header">
        <span className="om">🕉️</span>
        <h1>Mahadev Kirtan Sangh</h1>
        <p>Attendance Register</p>
      </header>

      <main className="main">
        {/* STEP INDICATOR */}
        <div className="steps">
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
                <div className="step-circle">{step > s ? '✓' : s}</div>
                <div className="step-label">{['Type', 'Details', 'Attendance'][i]}</div>
              </div>
              {i < 2 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="card fade-up">
            <div className="card-title">Kirtan Type Select Karein</div>
            <div className="card-sub">Aaj ka kirtan kis type ka hai?</div>
            <div className="type-grid">
              {[
                { key: 'pulsar', icon: '🔔', title: 'Pulsar', desc: 'Weekly regular kirtan' },
                { key: 'special', icon: '⭐', title: 'Special', desc: 'Ghar mein puja ya event' },
              ].map(t => (
                <button
                  key={t.key}
                  className={`type-btn ${kirType === t.key ? 'selected' : ''}`}
                  onClick={() => setKirType(t.key)}
                >
                  <span className="btn-icon">{t.icon}</span>
                  <span className="btn-title">{t.title}</span>
                  <span className="btn-desc">{t.desc}</span>
                </button>
              ))}
            </div>
            <div className="nav-btns">
              <button className="btn-next" disabled={!kirType} onClick={() => setStep(2)}>
                Aage Badho →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="card fade-up">
            {kirType === 'pulsar' ? (
              <>
                <div className="card-title">🔔 Pulsar Kirtan</div>
                <div className="card-sub">Kirtan ki tarikh bharein</div>
                <div className="field-group">
                  <label className="field-label">📅 Kirtan Ki Tarikh</label>
                  <input type="date" className="field-input" value={pulsarDate} onChange={e => setPulsarDate(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="card-title">⭐ Special Kirtan</div>
                <div className="card-sub">Yeh kirtan kaisa hai?</div>
                <div className="sub-grid">
                  {[
                    { key: 'normal', icon: '🏠', title: 'Normal', desc: 'Kisi ke ghar mein kirtan' },
                    { key: 'event', icon: '🎉', title: 'Event', desc: 'Janmashtami, Ram Navami etc.' },
                  ].map(t => (
                    <button
                      key={t.key}
                      className={`sub-btn ${subType === t.key ? 'selected' : ''}`}
                      onClick={() => setSubType(t.key)}
                    >
                      <span className="btn-icon">{t.icon}</span>
                      <span className="btn-title">{t.title}</span>
                      <span className="btn-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>

                {subType === 'normal' && (
                  <div className="fade-up">
                    <div className="divider" />
                    <div className="field-group">
                      <label className="field-label">🏠 Jiske Ghar Kirtan Ho Raha Hai</label>
                      <select className="field-select" value={hostName} onChange={e => setHostName(e.target.value)}>
                        <option value="">-- Naam Select Karein --</option>
                        {MEMBERS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="field-group">
                      <label className="field-label">📅 Tarikh</label>
                      <input type="date" className="field-input" value={normalDate} onChange={e => setNormalDate(e.target.value)} />
                    </div>
                  </div>
                )}

                {subType === 'event' && (
                  <div className="fade-up">
                    <div className="divider" />
                    <div className="field-group">
                      <label className="field-label">🎉 Event Ka Naam</label>
                      <input type="text" className="field-input" placeholder="Jaise: Janmashtami, Ram Navami..." value={eventName} onChange={e => setEventName(e.target.value)} />
                    </div>
                    <div className="field-group">
                      <label className="field-label">📅 Tarikh</label>
                      <input type="date" className="field-input" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="nav-btns">
              <button className="btn-back" onClick={() => setStep(1)}>← Wapas</button>
              <button
                className="btn-next"
                disabled={kirType === 'special' && !subType}
                onClick={goStep3}
              >
                Attendance Lein →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="card fade-up">
            <div className="info-box">
              <span>ℹ️</span>
              <p dangerouslySetInnerHTML={{ __html: infoText() }} />
            </div>

            <div className="counter-bar">
              <div className="pill present">✅ Present: <b>{counts.present}</b></div>
              <div className="pill absent">❌ Absent: <b>{counts.absent}</b></div>
              {showSpecialCol && <div className="pill special">⭐ Special: <b>{counts.special}</b></div>}
              <div className="pill total">👥 Total: 34</div>
            </div>

            <div className="quick-actions">
              <button className="quick-btn" onClick={() => markAll('present')}>✅ Sabko Present</button>
              <button className="quick-btn" onClick={() => markAll('absent')}>❌ Sabko Absent</button>
              <button className="quick-btn" onClick={clearAll}>🔄 Reset</button>
            </div>

            <div className="table-wrap">
              <div className={`att-header ${showSpecialCol ? 'with-special' : ''}`}>
                <span>#</span>
                <span>Naam</span>
                <span>✅ Present</span>
                <span>❌ Absent</span>
                {showSpecialCol && <span>⭐ Special</span>}
              </div>
              {MEMBERS.map((name, i) => (
                <div key={name} className={`member-row ${showSpecialCol ? 'with-special' : ''}`}>
                  <span className="m-num">{i + 1}</span>
                  <span className="m-name">{name}{name === hostName ? ' 🏠' : ''}</span>
                  <button
                    className={`att-btn present ${attendance[name] === 'present' ? 'active' : ''}`}
                    onClick={() => setAtt(name, 'present')}
                  >✅ Present</button>
                  <button
                    className={`att-btn absent ${attendance[name] === 'absent' ? 'active' : ''}`}
                    onClick={() => setAtt(name, 'absent')}
                  >❌ Absent</button>
                  {showSpecialCol && (
                    <button
                      className={`att-btn special ${attendance[name] === 'special' ? 'active' : ''}`}
                      onClick={() => setAtt(name, 'special')}
                    >⭐ Special</button>
                  )}
                </div>
              ))}
            </div>

            <div className="nav-btns">
              <button className="btn-back" onClick={() => setStep(2)}>← Wapas</button>
              <button className="btn-next" onClick={submitAttendance}>💾 Save Karein</button>
            </div>
          </div>
        )}

        {/* STEP 4 - SUCCESS */}
        {step === 4 && (
          <div className="card fade-up success-card">
            <span className="success-icon">🙏</span>
            <h2>Jai Mahadev!</h2>
            <p>Attendance safaltapurvak save ho gayi!</p>
            <div className="summary-grid">
              <div className="summary-box">
                <span className="s-num">{counts.present}</span>
                <span className="s-label">Present</span>
              </div>
              <div className="summary-box">
                <span className="s-num">{counts.absent}</span>
                <span className="s-label">Absent</span>
              </div>
              <div className="summary-box">
                <span className="s-num">{counts.special}</span>
                <span className="s-label">Special</span>
              </div>
            </div>
            <button className="btn-next" onClick={resetAll}>🔄 Naya Attendance Lein</button>
          </div>
        )}
      </main>
    </div>
  );
}
