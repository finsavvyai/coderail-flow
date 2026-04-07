import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { fetchArtifactBlobUrl } from './api';
export function AuthImage({ artifactId, alt, style, className, loading: loadingProp, }) {
    const [src, setSrc] = useState(null);
    const [error, setError] = useState(false);
    useEffect(() => {
        let revoke = null;
        fetchArtifactBlobUrl(artifactId)
            .then((url) => {
            revoke = url;
            setSrc(url);
        })
            .catch(() => setError(true));
        return () => {
            if (revoke)
                URL.revokeObjectURL(revoke);
        };
    }, [artifactId]);
    if (error) {
        return (_jsx("div", { className: "auth-image-placeholder auth-image-placeholder--error", style: style, children: "Failed to load" }));
    }
    if (!src) {
        return (_jsx("div", { className: "auth-image-placeholder auth-image-placeholder--loading", style: style, children: "Loading..." }));
    }
    return _jsx("img", { src: src, alt: alt, style: style, className: className, loading: loadingProp });
}
