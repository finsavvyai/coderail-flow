import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Check } from 'lucide-react';
export function BillingPlanCards({ plans, accountPlan, upgrading, onUpgrade, }) {
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "h2 billing-plan-heading", children: "Choose Your Plan" }), _jsx("div", { className: "billing-plan-grid", children: plans.map((p) => {
                    const cardClass = [
                        'billing-plan-card',
                        p.featured ? 'featured' : '',
                        p.current ? 'current' : '',
                    ]
                        .filter(Boolean)
                        .join(' ');
                    return (_jsxs("div", { className: cardClass, children: [p.featured && _jsx("div", { className: "billing-popular-badge", children: "Most Popular" }), _jsx("div", { className: "billing-plan-name", children: p.name }), _jsxs("div", { className: "billing-plan-price-row", children: [_jsx("span", { className: "billing-plan-price", children: p.price }), _jsx("span", { className: "billing-plan-period", children: p.period })] }), _jsx("ul", { className: "billing-plan-features", children: p.features.map((f, i) => (_jsxs("li", { children: [_jsx(Check, { size: 13, "aria-hidden": "true" }), " ", f] }, i))) }), _jsx(PlanButton, { planKey: p.key, current: p.current, featured: p.featured, accountPlan: accountPlan, upgrading: upgrading, name: p.name, onUpgrade: onUpgrade })] }, p.key));
                }) })] }));
}
function PlanButton({ planKey, current, featured, accountPlan, upgrading, name, onUpgrade, }) {
    if (current) {
        return (_jsx("button", { className: "btn billing-plan-btn", disabled: true, children: "Current Plan" }));
    }
    if (planKey === 'free') {
        return (_jsx("button", { className: "btn billing-plan-btn", disabled: true, children: accountPlan !== 'free' ? 'Downgrade' : 'Active' }));
    }
    return (_jsx("button", { className: `btn billing-plan-btn${featured ? ' billing-plan-btn-featured' : ''}`, onClick: () => onUpgrade(planKey), disabled: !!upgrading, children: upgrading === planKey ? 'Redirecting...' : `Upgrade to ${name}` }));
}
