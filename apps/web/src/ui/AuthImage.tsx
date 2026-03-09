import React, { useState, useEffect } from 'react';
import { fetchArtifactBlobUrl } from './api';

interface AuthImageProps {
  artifactId: string;
  alt: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

export function AuthImage({ artifactId, alt, style, loading: loadingProp }: AuthImageProps) {
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
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a3a3a3',
          fontSize: 11,
          background: '#1a1a1a',
        }}
      >
        Failed to load
      </div>
    );
  }

  if (!src) {
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#555',
          fontSize: 11,
          background: '#1a1a1a',
        }}
      >
        Loading...
      </div>
    );
  }

  return <img src={src} alt={alt} style={style} loading={loadingProp} />;
}
