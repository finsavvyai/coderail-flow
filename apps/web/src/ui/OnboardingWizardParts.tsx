import React from 'react';

export function OnboardingProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: i <= step ? '#3b82f6' : '#2a2a2a',
              border: i === step ? '2px solid #3b82f6' : '2px solid #2a2a2a',
            }}
          />
        ))}
      </div>
      <div
        style={{
          width: '100%',
          height: 2,
          background: '#2a2a2a',
          borderRadius: 1,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${(step / (total - 1)) * 100}%`,
            background: '#3b82f6',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

export function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#a3a3a3', lineHeight: 1.5 }}>{description}</div>
      </div>
    </div>
  );
}

export function OptionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 16,
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        border: '1px solid #2a2a2a',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2a2a2a';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ marginBottom: 8, color: '#3b82f6' }}>{icon}</div>
      <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#a3a3a3' }}>{description}</div>
    </button>
  );
}

export function NextStep({ number, text }: { number: number; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#3b82f6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div style={{ fontSize: 13, color: '#ccc', paddingTop: 2 }}>{text}</div>
    </div>
  );
}
