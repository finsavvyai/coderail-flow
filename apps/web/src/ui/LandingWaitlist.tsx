import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { apiUrl } from './api-core';
import { getWebRuntimeConfig } from './runtime-config';

const runtimeConfig = getWebRuntimeConfig(import.meta.env);
const waitlistUnavailable = import.meta.env.PROD && !runtimeConfig.apiReady;

export function Waitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || waitlistUnavailable) return;
    setStatus('loading');
    try {
      const res = await fetch(apiUrl('/waitlist'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing-page' }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (res.ok) {
        setStatus('success');
        setMessage(
          data.message === 'already_subscribed'
            ? "You're already on the list! We'll be in touch soon."
            : "You're in! We'll notify you when early access opens."
        );
        setEmail('');
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to join. Please try again.');
    }
  }

  return (
    <section className="lp-section lp-section-cta" id="waitlist">
      <div className="lp-section-inner">
        <div className="lp-cta-content">
          <h2>Get early access</h2>
          <p>
            Join the waitlist and be the first to automate your browser workflows. Early adopters
            get exclusive pricing.
          </p>
          {status === 'success' ? (
            <div className="lp-cta-success">
              <Check size={20} /> {message}
            </div>
          ) : waitlistUnavailable ? (
            <p className="lp-cta-error">
              Waitlist signups are temporarily unavailable until the production API base URL is
              configured.
            </p>
          ) : (
            <form className="lp-cta-form" onSubmit={handleSubmit}>
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={waitlistUnavailable}
                className="lp-cta-input"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="lp-btn-primary"
                disabled={status === 'loading' || waitlistUnavailable}
              >
                {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
          {status === 'error' && <p className="lp-cta-error">{message}</p>}
          <p className="lp-cta-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
