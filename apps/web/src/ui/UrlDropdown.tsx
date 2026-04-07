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
  return (
    <div className="url-dropdown">
      {favoriteUrls.length > 0 && (
        <>
          <div className="url-section-header">
            <Star size={10} className="star-gold" aria-hidden="true" /> Favorites
          </div>
          {favoriteUrls.map((url) => (
            <UrlRow key={'fav-' + url} url={url} onSelect={onSelect} onRemove={onRemoveFavorite} />
          ))}
        </>
      )}
      {recentUrls.length > 0 && (
        <>
          <div
            className={`url-section-header${favoriteUrls.length > 0 ? ' url-section-header--border' : ''}`}
          >
            <Clock size={10} aria-hidden="true" /> Recent
          </div>
          {recentUrls.map((url) => (
            <UrlRow key={'rec-' + url} url={url} onSelect={onSelect} onRemove={onRemoveRecent} />
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
}: {
  url: string;
  onSelect: (url: string) => void;
  onRemove: (url: string) => void;
}) {
  return (
    <div
      role="option"
      tabIndex={0}
      className="url-row"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(url);
        }
      }}
    >
      <div className="url-row-text" onClick={() => onSelect(url)}>
        {url}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(url);
        }}
        className="url-remove-btn"
        aria-label="Remove URL"
      >
        <X size={12} />
      </button>
    </div>
  );
}
