import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Star, Clock, X } from 'lucide-react';
export function UrlDropdown({ favoriteUrls, recentUrls, onSelect, onRemoveFavorite, onRemoveRecent, }) {
    return (_jsxs("div", { className: "url-dropdown", children: [favoriteUrls.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "url-section-header", children: [_jsx(Star, { size: 10, className: "star-gold", "aria-hidden": "true" }), " Favorites"] }), favoriteUrls.map((url) => (_jsx(UrlRow, { url: url, onSelect: onSelect, onRemove: onRemoveFavorite }, 'fav-' + url)))] })), recentUrls.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: `url-section-header${favoriteUrls.length > 0 ? ' url-section-header--border' : ''}`, children: [_jsx(Clock, { size: 10, "aria-hidden": "true" }), " Recent"] }), recentUrls.map((url) => (_jsx(UrlRow, { url: url, onSelect: onSelect, onRemove: onRemoveRecent }, 'rec-' + url)))] }))] }));
}
function UrlRow({ url, onSelect, onRemove, }) {
    return (_jsxs("div", { role: "option", tabIndex: 0, className: "url-row", onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(url);
            }
        }, children: [_jsx("div", { className: "url-row-text", onClick: () => onSelect(url), children: url }), _jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    onRemove(url);
                }, className: "url-remove-btn", "aria-label": "Remove URL", children: _jsx(X, { size: 12 }) })] }));
}
