import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { AuthImage } from './AuthImage';
import { artifactDownloadUrl } from './api';
export function ScreenshotLightbox({ screenshot, index, total, onClose, onPrev, onNext, }) {
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);
    return (_jsx("div", { role: "dialog", "aria-modal": "true", "aria-label": "Screenshot viewer", onClick: onClose, style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
        }, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
                maxWidth: '90vw',
                maxHeight: '90vh',
                position: 'relative',
                cursor: 'default',
            }, children: [_jsx(AuthImage, { artifactId: screenshot.id, alt: `Screenshot ${index + 1}`, style: {
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        borderRadius: 8,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    } }), _jsxs("div", { style: {
                        position: 'absolute',
                        bottom: -50,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 16,
                    }, children: [_jsx("button", { className: "btn", disabled: index === 0, onClick: (e) => {
                                e.stopPropagation();
                                onPrev();
                            }, children: "Previous" }), _jsxs("span", { className: "small", style: { color: '#fff' }, children: [index + 1, " of ", total] }), _jsx("button", { className: "btn", disabled: index === total - 1, onClick: (e) => {
                                e.stopPropagation();
                                onNext();
                            }, children: "Next" }), _jsx("a", { className: "btn", href: artifactDownloadUrl(screenshot.id), download: true, onClick: (e) => e.stopPropagation(), children: "Download" }), _jsx("button", { className: "btn", onClick: (e) => {
                                e.stopPropagation();
                                onClose();
                            }, children: "Close" })] })] }) }));
}
