import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check } from 'lucide-react';
import { NextStep } from './OnboardingWizardParts';
export function OnboardingStepComplete({ onFinish }) {
    return (_jsxs("div", { className: "onboarding-welcome-wrapper", children: [_jsx("div", { className: "onboarding-complete-hero-icon", children: _jsx(Check, { size: 40, className: "onboarding-icon-white" }) }), _jsx("h2", { className: "onboarding-welcome-heading", children: "You're ready to go!" }), _jsx("p", { className: "onboarding-complete-text", children: "Your project is set up and ready for automation" }), _jsxs("div", { className: "onboarding-next-steps-box", children: [_jsx("div", { className: "onboarding-next-steps-label", children: "Next Steps:" }), _jsx(NextStep, { number: 1, text: "Record your first flow" }), _jsx(NextStep, { number: 2, text: "Test it instantly" }), _jsx(NextStep, { number: 3, text: "Share with your team" })] }), _jsx("button", { onClick: onFinish, className: "btn onboarding-finish-btn", children: "Get Started" })] }));
}
