import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { apiUrl } from './api-core';
import { getWebRuntimeConfig } from './runtime-config';
const runtimeConfig = getWebRuntimeConfig(import.meta.env);
const waitlistUnavailable = import.meta.env.PROD && !runtimeConfig.apiReady;
export function Waitlist() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    async function handleSubmit(e) {
        e.preventDefault();
        if (!email || waitlistUnavailable)
            return;
        setStatus('loading');
        try {
            const res = await fetch(apiUrl('/waitlist'), {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email, source: 'landing-page' }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage(data.message === 'already_subscribed'
                    ? "You're already on the list! We'll be in touch soon."
                    : "You're in! We'll notify you when early access opens.");
                setEmail('');
            }
            else {
                throw new Error(data.error || 'Something went wrong');
            }
        }
        catch (err) {
            setStatus('error');
            setMessage(err.message || 'Failed to join. Please try again.');
        }
    }
    return (_jsx("section", { className: "lp-section lp-section-cta", id: "waitlist", children: _jsx("div", { className: "lp-section-inner", children: _jsxs("div", { className: "lp-cta-content", children: [_jsx("h2", { children: "Get early access" }), _jsx("p", { children: "Join the waitlist and be the first to automate your browser workflows. Early adopters get exclusive pricing." }), status === 'success' ? (_jsxs("div", { className: "lp-cta-success", children: [_jsx(Check, { size: 20 }), " ", message] })) : waitlistUnavailable ? (_jsx("p", { className: "lp-cta-error", children: "Waitlist signups are temporarily unavailable until the production API base URL is configured." })) : (_jsxs("form", { className: "lp-cta-form", onSubmit: handleSubmit, children: [_jsx("label", { htmlFor: "waitlist-email", className: "sr-only", children: "Email address" }), _jsx("input", { id: "waitlist-email", type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: waitlistUnavailable, className: "lp-cta-input", "aria-label": "Email address" }), _jsxs("button", { type: "submit", className: "lp-btn-primary", disabled: status === 'loading' || waitlistUnavailable, children: [status === 'loading' ? 'Joining...' : 'Join Waitlist', _jsx(ArrowRight, { size: 16 })] })] })), status === 'error' && _jsx("p", { className: "lp-cta-error", children: message }), _jsx("p", { className: "lp-cta-note", children: "No spam. Unsubscribe anytime." })] }) }) }));
}
