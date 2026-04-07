import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
const PLANS = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        desc: 'Get started with basic automation',
        features: ['3 flows', '10 runs/month', 'Screenshot capture', 'Community support'],
        cta: 'Start Free',
        featured: false,
    },
    {
        name: 'Pro',
        price: '$29',
        period: '/month',
        desc: 'For teams that need more power',
        features: [
            '25 flows',
            '500 runs/month',
            'SRT subtitle export',
            'Visual overlays',
            'Priority support',
            'API access',
        ],
        cta: 'Get Early Access',
        featured: true,
    },
    {
        name: 'Team',
        price: '$79',
        period: '/month',
        desc: 'For growing organizations',
        features: [
            'Unlimited flows',
            '2,000 runs/month',
            '5 team seats',
            'Custom branding',
            'Webhook integrations',
            'Dedicated support',
        ],
        cta: 'Contact Sales',
        featured: false,
    },
];
export function Pricing() {
    return (_jsx("section", { className: "lp-section", id: "pricing", children: _jsxs("div", { className: "lp-section-inner", children: [_jsxs("div", { className: "lp-section-header", children: [_jsx("h2", { children: "Simple, transparent pricing" }), _jsx("p", { children: "Start free. Scale as you grow." })] }), _jsx("div", { className: "lp-pricing-grid", children: PLANS.map((p, i) => (_jsxs("div", { className: `lp-pricing-card ${p.featured ? 'lp-pricing-featured' : ''}`, children: [p.featured && _jsx("div", { className: "lp-pricing-badge", children: "Most Popular" }), _jsx("h3", { children: p.name }), _jsxs("div", { className: "lp-pricing-price", children: [_jsx("span", { className: "lp-pricing-amount", children: p.price }), _jsx("span", { className: "lp-pricing-period", children: p.period })] }), _jsx("p", { className: "lp-pricing-desc", children: p.desc }), _jsx("ul", { className: "lp-pricing-features", children: p.features.map((f, j) => (_jsxs("li", { children: [_jsx(Check, { size: 14 }), " ", f] }, j))) }), _jsx(Link, { to: "/app", className: p.featured ? 'lp-btn-primary' : 'lp-btn-outline', children: p.cta })] }, i))) }), _jsxs("p", { className: "lp-pricing-note", children: [_jsx("strong", { children: "Early-bird special:" }), " First 50 users get Pro at $19/mo for life."] })] }) }));
}
