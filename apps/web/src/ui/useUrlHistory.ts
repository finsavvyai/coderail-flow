import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getRecentUrls,
  addRecentUrl,
  getFavoriteUrls,
  toggleFavoriteUrl,
  removeFavoriteUrl,
  removeRecentUrl,
} from './FlowRecorder.utils';

export function useUrlHistory() {
  const [recentUrls, setRecentUrls] = useState<string[]>(getRecentUrls);
  const [favoriteUrls, setFavoriteUrls] = useState<string[]>(getFavoriteUrls);
  const [showUrlDropdown, setShowUrlDropdown] = useState(false);
  const urlDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showUrlDropdown) return;
    const handler = (e: MouseEvent) => {
      if (urlDropdownRef.current && !urlDropdownRef.current.contains(e.target as Node)) {
        setShowUrlDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUrlDropdown]);

  const trackUrl = useCallback((url: string) => {
    addRecentUrl(url);
    setRecentUrls(getRecentUrls());
  }, []);

  const handleToggleFavorite = useCallback(
    (url: string) => setFavoriteUrls(toggleFavoriteUrl(url)),
    []
  );

  const handleRemoveFavorite = useCallback(
    (url: string) => setFavoriteUrls(removeFavoriteUrl(url)),
    []
  );

  const handleRemoveRecent = useCallback((url: string) => setRecentUrls(removeRecentUrl(url)), []);

  return {
    recentUrls,
    favoriteUrls,
    showUrlDropdown,
    setShowUrlDropdown,
    urlDropdownRef,
    trackUrl,
    handleToggleFavorite,
    handleRemoveFavorite,
    handleRemoveRecent,
  };
}
