import { Star, Clock, X } from 'lucide-react';

interface UrlDropdownProps {
  favoriteUrls: string[];
  recentUrls: string[];
  onSelect: (url: string) => void;
  onRemoveFavorite: (url: string) => void;
  onRemoveRecent: (url: string) => void;
}

export function UrlDropdown({
  favoriteUrls,
  recentUrls,
  onSelect,
  onRemoveFavorite,
  onRemoveRecent,
}: UrlDropdownProps) {
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 13,
    color: '#e0e0e0',
  };
  const removeBtn = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 10,
    color: '#a8b3cf',
    minHeight: 44,
    minWidth: 44,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 4,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 10,
        background: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: 8,
        maxHeight: 260,
        overflowY: 'auto',
        marginTop: 4,
        boxShadow: '0 8px 24px rgba(0,0,0,.5)',
      }}
    >
      {favoriteUrls.length > 0 && (
        <>
          <div
            style={{
              padding: '8px 12px',
              fontSize: 11,
              color: '#a8b3cf',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Star size={10} fill="#eab308" color="#eab308" aria-hidden="true" /> Favorites
          </div>
          {favoriteUrls.map((url) => (
            <UrlRow
              key={'fav-' + url}
              url={url}
              onSelect={onSelect}
              onRemove={onRemoveFavorite}
              rowStyle={rowStyle}
              removeBtn={removeBtn}
            />
          ))}
        </>
      )}
      {recentUrls.length > 0 && (
        <>
          <div
            style={{
              padding: '8px 12px',
              fontSize: 11,
              color: '#a8b3cf',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              borderTop: favoriteUrls.length > 0 ? '1px solid #333' : 'none',
            }}
          >
            <Clock size={10} aria-hidden="true" /> Recent
          </div>
          {recentUrls.map((url) => (
            <UrlRow
              key={'rec-' + url}
              url={url}
              onSelect={onSelect}
              onRemove={onRemoveRecent}
              rowStyle={rowStyle}
              removeBtn={removeBtn}
            />
          ))}
        </>
      )}
    </div>
  );
}

function UrlRow({
  url,
  onSelect,
  onRemove,
  rowStyle,
  removeBtn,
}: {
  url: string;
  onSelect: (url: string) => void;
  onRemove: (url: string) => void;
  rowStyle: React.CSSProperties;
  removeBtn: React.CSSProperties;
}) {
  return (
    <div
      role="option"
      tabIndex={0}
      style={rowStyle}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2a2a')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(url);
        }
      }}
    >
      <div
        style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        onClick={() => onSelect(url)}
      >
        {url}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(url);
        }}
        style={removeBtn}
        aria-label="Remove URL"
      >
        <X size={12} />
      </button>
    </div>
  );
}
