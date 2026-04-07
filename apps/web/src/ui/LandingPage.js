import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Play, Star } from 'lucide-react';
import { Features, HowItWorks } from './LandingFeatures';
import { Pricing } from './LandingPricing';
import { Waitlist } from './LandingWaitlist';
export function LandingPage() {
    return (_jsxs("div", { className: "landing", children: [_jsx(Nav, {}), _jsx(Hero, {}), _jsx(LogoBar, {}), _jsx(Features, {}), _jsx(HowItWorks, {}), _jsx(Pricing, {}), _jsx(Waitlist, {}), _jsx(Footer, {})] }));
}
function Nav() {
    return (_jsx("nav", { className: "lp-nav", children: _jsxs("div", { className: "lp-nav-inner", children: [_jsxs("div", { className: "lp-logo", children: [_jsx(Zap, { size: 20, strokeWidth: 2.5 }), _jsx("span", { children: "CodeRail Flow" })] }), _jsxs("div", { className: "lp-nav-links", children: [_jsx("a", { href: "#features", children: "Features" }), _jsx("a", { href: "#pricing", children: "Pricing" }), _jsx("a", { href: "#waitlist", children: "Early Access" }), _jsxs(Link, { to: "/app", className: "lp-btn-sm", children: ["Dashboard ", _jsx(ArrowRight, { size: 16 })] })] })] }) }));
}
function Hero() {
    return (_jsxs("section", { className: "lp-hero", children: [_jsxs("div", { className: "lp-hero-badge", children: [_jsx(Star, { size: 16, "aria-hidden": "true" }), " Now in Early Access"] }), _jsxs("h1", { className: "lp-hero-title", children: ["Automate browser workflows.", _jsx("br", {}), _jsx("span", { className: "lp-gradient-text", children: "Explain them visually." })] }), _jsx("p", { className: "lp-hero-sub", children: "CodeRail Flow records, replays, and narrates browser workflows with screenshots, visual overlays, and SRT subtitles. Built for support teams, QA, onboarding, and compliance." }), _jsxs("div", { className: "lp-hero-actions", children: [_jsxs("a", { href: "#waitlist", className: "lp-btn-primary", children: ["Get Early Access ", _jsx(ArrowRight, { size: 16 })] }), _jsxs("a", { href: "#how-it-works", className: "lp-btn-ghost", children: [_jsx(Play, { size: 16, "aria-hidden": "true" }), " See How It Works"] })] }), _jsxs("div", { className: "lp-hero-stats", children: [_jsxs("div", { className: "lp-stat", children: [_jsx("span", { className: "lp-stat-num", children: "7" }), _jsx("span", { className: "lp-stat-label", children: "Step Types" })] }), _jsx("div", { className: "lp-stat-divider" }), _jsxs("div", { className: "lp-stat", children: [_jsx("span", { className: "lp-stat-num", children: "<3s" }), _jsx("span", { className: "lp-stat-label", children: "Cold Start" })] }), _jsx("div", { className: "lp-stat-divider" }), _jsxs("div", { className: "lp-stat", children: [_jsx("span", { className: "lp-stat-num", children: "100%" }), _jsx("span", { className: "lp-stat-label", children: "Serverless" })] })] })] }));
}
function LogoBar() {
    return (_jsxs("section", { className: "lp-logobar", children: [_jsx("p", { children: "Built on" }), _jsxs("div", { className: "lp-logobar-items", children: [_jsx("span", { children: "Cloudflare Workers" }), _jsx("span", { children: "D1 Database" }), _jsx("span", { children: "R2 Storage" }), _jsx("span", { children: "Browser Rendering" })] })] }));
}
function Footer() {
    return (_jsx("footer", { className: "lp-footer", children: _jsxs("div", { className: "lp-footer-inner", children: [_jsxs("div", { className: "lp-footer-brand", children: [_jsx(Zap, { size: 16 }), " CodeRail Flow"] }), _jsxs("div", { className: "lp-footer-links", children: [_jsx("a", { href: "#features", children: "Features" }), _jsx("a", { href: "#pricing", children: "Pricing" }), _jsx("a", { href: "#waitlist", children: "Early Access" }), _jsx(Link, { to: "/app", children: "Dashboard" })] }), _jsxs("p", { className: "lp-footer-copy", children: ["\u00A9 ", new Date().getFullYear(), " CodeRail Flow. All rights reserved."] })] }) }));
}
