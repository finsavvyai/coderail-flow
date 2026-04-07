import React, { useState, useEffect } from 'react';
import { fetchArtifactBlobUrl } from './api';

interface AuthImageProps {
  artifactId: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function AuthImage({
  artifactId,
  alt,
  style,
  className,
  loading: loadingProp,
}: AuthImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let revoke: string | null = null;
    fetchArtifactBlobUrl(artifactId)
      .then((url) => {
        revoke = url;
        setSrc(url);
      })
      .catch(() => setError(true));
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [artifactId]);

  if (error) {
    return (
      <div className="auth-image-placeholder auth-image-placeholder--error" style={style}>
        Failed to load
      </div>
    );
  }

  if (!src) {
    return (
      <div className="auth-image-placeholder auth-image-placeholder--loading" style={style}>
        Loading...
      </div>
    );
  }

  return <img src={src} alt={alt} style={style} className={className} loading={loadingProp} />;
}
