import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Monitor, Camera, FileText, Zap, Shield, Users, ChevronRight } from 'lucide-react';
export function Features() {
    const features = [
        {
            icon: _jsx(Monitor, { size: 24 }),
            title: 'Real Browser Automation',
            desc: "Puppeteer-powered flows running on Cloudflare's edge. Navigate, click, fill, wait — all automated.",
        },
        {
            icon: _jsx(Camera, { size: 24 }),
            title: 'Per-Step Screenshots',
            desc: 'Every step captures a screenshot. Build visual documentation automatically as flows execute.',
        },
        {
            icon: _jsx(FileText, { size: 24 }),
            title: 'SRT Subtitle Generation',
            desc: 'Auto-generate narration subtitles from your flow steps. Perfect for video walkthroughs.',
        },
        {
            icon: _jsx(Zap, { size: 24 }),
            title: 'Visual Overlays',
            desc: 'Highlight elements and show captions directly in the browser during execution.',
        },
        {
            icon: _jsx(Shield, { size: 24 }),
            title: 'Compliance-Ready',
            desc: 'Screenshot evidence, timestamped logs, and artifact storage for audit trails.',
        },
        {
            icon: _jsx(Users, { size: 24 }),
            title: 'Team Collaboration',
            desc: 'Share flows across your organization. Projects, screens, and element mappings for your whole team.',
        },
    ];
    return (_jsx("section", { className: "lp-section", id: "features", children: _jsxs("div", { className: "lp-section-inner", children: [_jsxs("div", { className: "lp-section-header", children: [_jsx("h2", { children: "Everything you need to automate visual workflows" }), _jsx("p", { children: "From browser automation to visual documentation \u2014 one platform." })] }), _jsx("div", { className: "lp-features-grid", children: features.map((f, i) => (_jsxs("div", { className: "lp-feature-card", children: [_jsx("div", { className: "lp-feature-icon", children: f.icon }), _jsx("h3", { children: f.title }), _jsx("p", { children: f.desc })] }, i))) })] }) }));
}
export function HowItWorks() {
    const steps = [
        {
            num: '01',
            title: 'Define Your Flow',
            desc: 'Use our DSL to describe browser steps: navigate, click, fill, highlight, caption.',
        },
        {
            num: '02',
            title: 'Execute & Capture',
            desc: 'Run flows against any web app. Each step captures screenshots and generates overlays.',
        },
        {
            num: '03',
            title: 'Review & Share',
            desc: 'Browse the screenshot gallery, download artifacts, and share visual documentation.',
        },
    ];
    return (_jsx("section", { className: "lp-section lp-section-dark", id: "how-it-works", children: _jsxs("div", { className: "lp-section-inner", children: [_jsxs("div", { className: "lp-section-header", children: [_jsx("h2", { children: "How it works" }), _jsx("p", { children: "Three steps to automated visual documentation." })] }), _jsx("div", { className: "lp-steps", children: steps.map((s, i) => (_jsxs("div", { className: "lp-step", children: [_jsx("div", { className: "lp-step-num", children: s.num }), _jsx("h3", { children: s.title }), _jsx("p", { children: s.desc }), i < steps.length - 1 && _jsx(ChevronRight, { size: 20, className: "lp-step-arrow" })] }, i))) })] }) }));
}
