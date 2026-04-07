import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AuthImage } from './AuthImage';
import { ScreenshotLightbox } from './ScreenshotLightbox';
export function ScreenshotGallery({ screenshots }) {
    const [selectedIndex, setSelectedIndex] = useState(null);
    if (screenshots.length === 0) {
        return _jsx("div", { className: "small gallery-empty", children: "No screenshots available" });
    }
    const selectedScreenshot = selectedIndex !== null ? screenshots[selectedIndex] : null;
    return (_jsxs("div", { className: "gallery-wrapper", children: [_jsx("div", { className: "gallery-grid", children: screenshots.map((screenshot, index) => (_jsxs("button", { onClick: () => setSelectedIndex(index), "aria-label": `View screenshot ${getStepNumber(screenshot, index)}`, className: `gallery-thumb${selectedIndex === index ? ' selected' : ''}`, children: [_jsx(AuthImage, { artifactId: screenshot.id, alt: `Screenshot ${index + 1}`, className: "gallery-thumb-img", loading: "lazy" }), _jsxs("div", { className: "gallery-thumb-label", children: ["Step ", getStepNumber(screenshot, index)] })] }, screenshot.id))) }), selectedScreenshot && selectedIndex !== null && (_jsx(ScreenshotLightbox, { screenshot: selectedScreenshot, index: selectedIndex, total: screenshots.length, onClose: () => setSelectedIndex(null), onPrev: () => {
                    if (selectedIndex > 0)
                        setSelectedIndex(selectedIndex - 1);
                }, onNext: () => {
                    if (selectedIndex < screenshots.length - 1)
                        setSelectedIndex(selectedIndex + 1);
                } }))] }));
}
function getStepNumber(screenshot, fallbackIndex) {
    if (screenshot.kind && screenshot.kind.startsWith('screenshot')) {
        const match = screenshot.kind.match(/screenshot-(\d+)/);
        if (match)
            return parseInt(match[1]) + 1;
    }
    return fallbackIndex + 1;
}
