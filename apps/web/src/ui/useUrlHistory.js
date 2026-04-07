import { useState, useEffect, useRef, useCallback } from 'react';
import { getRecentUrls, addRecentUrl, getFavoriteUrls, toggleFavoriteUrl, removeFavoriteUrl, removeRecentUrl, } from './FlowRecorder.utils';
export function useUrlHistory() {
    const [recentUrls, setRecentUrls] = useState(getRecentUrls);
    const [favoriteUrls, setFavoriteUrls] = useState(getFavoriteUrls);
    const [showUrlDropdown, setShowUrlDropdown] = useState(false);
    const urlDropdownRef = useRef(null);
    useEffect(() => {
        if (!showUrlDropdown)
            return;
        const handler = (e) => {
            if (urlDropdownRef.current && !urlDropdownRef.current.contains(e.target)) {
                setShowUrlDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showUrlDropdown]);
    const trackUrl = useCallback((url) => {
        addRecentUrl(url);
        setRecentUrls(getRecentUrls());
    }, []);
    const handleToggleFavorite = useCallback((url) => setFavoriteUrls(toggleFavoriteUrl(url)), []);
    const handleRemoveFavorite = useCallback((url) => setFavoriteUrls(removeFavoriteUrl(url)), []);
    const handleRemoveRecent = useCallback((url) => setRecentUrls(removeRecentUrl(url)), []);
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
