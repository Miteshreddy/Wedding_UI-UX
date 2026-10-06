import { useRef, useState, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sound } from '../utils/audioSystem';
import { WEDDING } from '../data/weddingData';
import SectionHeader from './SectionHeader';
import './RSVP.css';

const STORAGE_KEY = 'wedding-rsvp-v1';
const EMPTY = { name: '', email: '', attending: '', guests: 1, dietary: '', song: '', message: '' };

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildMailto(data) {
  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Attending: ${data.attending === 'yes' ? 'Joyfully accepts' : 'Regretfully declines'}`,
    data.attending === 'yes' ? `Guests: ${data.guests}` : null,
    data.dietary && `Dietary needs: ${data.dietary}`,
    data.song && `Song request: ${data.song}`,
    data.message && `Message: ${data.message}`,
  ].filter(Boolean);
  const subject = `RSVP — ${data.name} (${data.attending === 'yes' ? 'attending' : 'not attending'})`;
  return `mailto:${WEDDING.rsvp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

export default function RSVP() {
  const prefersReduced = useReducedMotion();
  const cardRef = useRef(null);
  const sealRef = useRef(null);
  const nameRef = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('form'); // form | sending | done
  const [sentVia, setSentVia] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Returning guest: show their saved answer instead of a blank form
  useEffect(() => {
    const saved = loadSaved();
    if (saved?.data) {
      setForm({ ...EMPTY, ...saved.data });
      setSentVia(saved.via || '');
      setStatus('done');
    }
  }, []);

  const update = (field) => (e) => {
    const value = field === 'guests' ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Please tell us your name.';
    if (!form.email.trim()) er.email = 'We need an email to send updates.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = 'That email doesn’t look quite right.';
    if (!form.attending) er.attending = 'Please choose one.';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const playSeal = useCallback(() => {
    if (prefersReduced || !sealRef.current) return;
    gsap.fromTo(
      sealRef.current,
      { y: -120, scale: 2, rotation: -30, opacity: 0 },
      {
        y: 0, scale: 1, rotation: -8, opacity: 1, duration: 0.45, ease: 'power4.in',
        onComplete: () => {
          sound.playStampThud();
          if (cardRef.current) {
            gsap.fromTo(cardRef.current, { y: 6 }, { y: 0, duration: 0.35, ease: 'elastic.out(1, 0.4)' });
          }
        },
      }
    );
  }, [prefersReduced]);

  useEffect(() => {
    if (status === 'done' && sentVia !== 'restored') playSeal();
  }, [status, sentVia, playSeal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) {
      sound.playPaperRustle();
      const first = e.currentTarget.querySelector('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    const data = { ...form, name: form.name.trim(), email: form.email.trim(), guests: form.attending === 'yes' ? form.guests : 0 };
    setStatus('sending');

    let via = 'email';
    if (WEDDING.rsvp.endpoint) {
      try {
        const res = await fetch(WEDDING.rsvp.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...data, _subject: `RSVP — ${data.name}` }),
        });
        if (!res.ok) throw new Error(String(res.status));
        via = 'online';
      } catch {
        setStatus('form');
        setSubmitError(`Our owl got lost on the way. Please try again, or email us at ${WEDDING.rsvp.email}.`);
        return;
      }
    } else {
      window.location.href = buildMailto(data);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, via, at: Date.now() }));
    } catch {
      /* storage unavailable: confirmation still shows for this visit */
    }
    setForm(data);
    setSentVia(via);
    setStatus('done');
  };

  const editResponse = () => {
    setStatus('form');
    setSentVia('');
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const attending = form.attending === 'yes';
  const fieldProps = (name) => ({
    id: `rsvp-${name}`,
    name,
    value: form[name],
    onChange: update(name),
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `rsvp-${name}-err` : undefined,
  });

  return (
    <section id="rsvp" className="rsvp-section scene" aria-labelledby="rsvp-title">
      <SectionHeader
        id="rsvp-title"
        kicker={`Kindly reply by ${WEDDING.rsvp.deadline}`}
        title="Will You Be There?"
        subtitle={`${WEDDING.couple.person1} & ${WEDDING.couple.person2} request the honour of your presence`}
      />

      <div ref={cardRef} className="rsvp-card">
        <span className="rsvp-corner rsvp-corner--tl" aria-hidden="true" />
        <span className="rsvp-corner rsvp-corner--tr" aria-hidden="true" />
        <span className="rsvp-corner rsvp-corner--bl" aria-hidden="true" />
        <span className="rsvp-corner rsvp-corner--br" aria-hidden="true" />

        {status !== 'done' ? (
          <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
            <fieldset className="rsvp-choice" aria-describedby={errors.attending ? 'rsvp-attending-err' : undefined}>
              <legend className="rsvp-label t-display">Your reply</legend>
              <div className="rsvp-choice-row">
                {[
                  { v: 'yes', t: 'Joyfully accepts', i: '✦' },
                  { v: 'no', t: 'Regretfully declines', i: '✧' },
                ].map((o) => (
                  <label key={o.v} className={`rsvp-choice-btn ${form.attending === o.v ? 'is-selected' : ''}`}>
                    <input type="radio" name="attending" value={o.v} checked={form.attending === o.v} onChange={update('attending')} aria-invalid={errors.attending ? 'true' : undefined} />
                    <span className="rsvp-choice-icon" aria-hidden="true">{o.i}</span>
                    <span className="t-display">{o.t}</span>
                  </label>
                ))}
              </div>
              {errors.attending && <p id="rsvp-attending-err" className="rsvp-error">{errors.attending}</p>}
            </fieldset>

            <div className="rsvp-grid">
              <div className="rsvp-field">
                <label className="rsvp-label t-display" htmlFor="rsvp-name">Full name</label>
                <input ref={nameRef} type="text" autoComplete="name" placeholder="As it should appear on your place card" {...fieldProps('name')} />
                {errors.name && <p id="rsvp-name-err" className="rsvp-error">{errors.name}</p>}
              </div>
              <div className="rsvp-field">
                <label className="rsvp-label t-display" htmlFor="rsvp-email">Email</label>
                <input type="email" autoComplete="email" inputMode="email" placeholder="For updates by owl (or email)" {...fieldProps('email')} />
                {errors.email && <p id="rsvp-email-err" className="rsvp-error">{errors.email}</p>}
              </div>

              {attending && (
                <>
                  <div className="rsvp-field">
                    <label className="rsvp-label t-display" htmlFor="rsvp-guests">Number of guests</label>
                    <select {...fieldProps('guests')}>
                      {Array.from({ length: WEDDING.rsvp.maxGuests }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n === 1 ? 'Just me' : `${n} guests (including me)`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rsvp-field">
                    <label className="rsvp-label t-display" htmlFor="rsvp-dietary">Dietary needs</label>
                    <input type="text" placeholder="Vegetarian, allergies… (optional)" {...fieldProps('dietary')} />
                  </div>
                  <div className="rsvp-field rsvp-field--full">
                    <label className="rsvp-label t-display" htmlFor="rsvp-song">A song to get you dancing</label>
                    <input type="text" placeholder="Optional" {...fieldProps('song')} />
                  </div>
                </>
              )}

              <div className="rsvp-field rsvp-field--full">
                <label className="rsvp-label t-display" htmlFor="rsvp-message">A note for the couple</label>
                <textarea rows={3} placeholder="Optional" {...fieldProps('message')} />
              </div>
            </div>

            {submitError && <p className="rsvp-error rsvp-error--banner" role="alert">{submitError}</p>}

            <button type="submit" className="rsvp-submit t-display" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending your owl…' : 'Seal & send reply'}
            </button>
            {!WEDDING.rsvp.endpoint && (
              <p className="rsvp-hint t-ink">This opens your email app with your reply ready to send.</p>
            )}
          </form>
        ) : (
          <div className="rsvp-done" aria-live="polite">
            <div ref={sealRef} className={`rsvp-seal ${attending ? '' : 'rsvp-seal--decline'}`} aria-hidden="true">
              <span className="t-display">{attending ? 'Accepted' : 'Received'}</span>
              <strong className="t-display">{WEDDING.couple.person1[0]}{WEDDING.couple.person2[0]}</strong>
            </div>
            <h3 className="rsvp-done-title t-display">
              {attending ? 'Your place in the Great Hall is saved' : 'You will be missed'}
            </h3>
            <p className="rsvp-done-text t-ink">
              {attending
                ? `Thank you, ${form.name}. We can’t wait to celebrate with ${form.guests > 1 ? `your party of ${form.guests}` : 'you'} on ${WEDDING.date.display}.`
                : `Thank you for letting us know, ${form.name}. We’ll raise a glass to you.`}
            </p>
            {sentVia === 'email' && (
              <p className="rsvp-hint t-ink">
                Didn’t see an email draft open? <a href={buildMailto(form)}>Send it here</a> or write to {WEDDING.rsvp.email}.
              </p>
            )}
            <button type="button" className="rsvp-link-btn t-display" onClick={editResponse}>
              Change my reply
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
