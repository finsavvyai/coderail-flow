import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function OnboardingProgressBar({ step, total }) {
    return (_jsx("div", { className: "onboarding-progress-track", children: Array.from({ length: total }, (_, i) => (_jsx("div", { className: `onboarding-progress-dot ${i <= step ? 'active' : 'inactive'}` }, i))) }));
}
export function FeatureItem({ icon, title, description, }) {
    return (_jsxs("div", { className: "onboarding-welcome-item", children: [_jsx("div", { className: "onboarding-welcome-icon", children: icon }), _jsxs("div", { children: [_jsx("div", { className: "onboarding-step-title", children: title }), _jsx("div", { className: "onboarding-step-desc", children: description })] })] }));
}
export function OptionCard({ title, description, icon, onClick, }) {
    return (_jsxs("button", { onClick: onClick, className: "onboarding-step-card", children: [_jsx("div", { className: "onboarding-welcome-icon", style: { marginBottom: 8 }, children: icon }), _jsx("div", { className: "onboarding-step-title", children: title }), _jsx("div", { className: "onboarding-step-desc", children: description })] }));
}
export function NextStep({ number, text }) {
    return (_jsxs("div", { className: "onboarding-welcome-item", children: [_jsx("div", { className: "onboarding-next-step-num", children: number }), _jsx("div", { className: "onboarding-step-desc", style: { paddingTop: 2 }, children: text })] }));
}
