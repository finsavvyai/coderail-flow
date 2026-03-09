import { useState, useEffect } from 'react';
import { apiRequest } from './api';
import type { CookieEntry, AuthProfile } from './cookieManagerTypes';

export function useCookieProfiles(projectId: string) {
  const [profiles, setProfiles] = useState<AuthProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<AuthProfile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [editingCookie, setEditingCookie] = useState<CookieEntry | null>(null);
  const [showValues, setShowValues] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, [projectId]);

  async function loadProfiles() {
    try {
      const data = await apiRequest(`/auth-profiles?projectId=${encodeURIComponent(projectId)}`);
      setProfiles(data.profiles || []);
    } catch {
      setProfiles([]);
    }
  }

  async function createProfile() {
    if (!newProfileName.trim()) {
      setError('Profile name is required');
      return;
    }
    try {
      setSaving(true);
      const data = await apiRequest('/auth-profiles', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          name: newProfileName.trim(),
          cookies: [],
        }),
      });
      setProfiles([...profiles, data.profile]);
      setSelectedProfile(data.profile);
      setNewProfileName('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile(profile: AuthProfile) {
    try {
      setSaving(true);
      const data = await apiRequest(`/auth-profiles/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setProfiles(profiles.map((p) => (p.id === profile.id ? data.profile : p)));
      setSelectedProfile(data.profile);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProfile(profileId: string) {
    if (!confirm('Delete this auth profile?')) return;
    try {
      await apiRequest(`/auth-profiles/${profileId}`, { method: 'DELETE' });
      setProfiles(profiles.filter((p) => p.id !== profileId));
      if (selectedProfile?.id === profileId) setSelectedProfile(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  function addCookie() {
    if (!selectedProfile) return;
    setEditingCookie({
      name: '',
      value: '',
      domain: '',
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'Lax',
    });
  }

  function saveCookie(cookie: CookieEntry) {
    if (!selectedProfile) return;
    const idx = selectedProfile.cookies.findIndex(
      (c) => c.name === cookie.name && c.domain === cookie.domain
    );
    let updatedCookies: CookieEntry[];
    if (idx >= 0) {
      updatedCookies = [...selectedProfile.cookies];
      updatedCookies[idx] = cookie;
    } else {
      updatedCookies = [...selectedProfile.cookies, cookie];
    }
    const updatedProfile = { ...selectedProfile, cookies: updatedCookies };
    setSelectedProfile(updatedProfile);
    saveProfile(updatedProfile);
    setEditingCookie(null);
  }

  function deleteCookie(cookie: CookieEntry) {
    if (!selectedProfile) return;
    const updatedCookies = selectedProfile.cookies.filter(
      (c) => !(c.name === cookie.name && c.domain === cookie.domain)
    );
    const updatedProfile = { ...selectedProfile, cookies: updatedCookies };
    setSelectedProfile(updatedProfile);
    saveProfile(updatedProfile);
  }

  function exportProfile() {
    if (!selectedProfile) return;
    const exportData = {
      name: selectedProfile.name,
      cookies: selectedProfile.cookies,
      localStorage: selectedProfile.localStorage,
      sessionStorage: selectedProfile.sessionStorage,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProfile.name}-auth-profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importProfile() {
    try {
      const data = JSON.parse(importJson);
      if (!data.cookies || !Array.isArray(data.cookies)) {
        throw new Error('Invalid profile format: missing cookies array');
      }
      if (selectedProfile) {
        const updatedProfile = {
          ...selectedProfile,
          cookies: data.cookies,
          localStorage: data.localStorage || selectedProfile.localStorage,
          sessionStorage: data.sessionStorage || selectedProfile.sessionStorage,
        };
        setSelectedProfile(updatedProfile);
        saveProfile(updatedProfile);
      }
      setImportJson('');
      setError('');
    } catch (e: any) {
      setError(`Import failed: ${e.message}`);
    }
  }

  return {
    profiles,
    selectedProfile,
    setSelectedProfile,
    newProfileName,
    setNewProfileName,
    editingCookie,
    setEditingCookie,
    showValues,
    setShowValues,
    importJson,
    setImportJson,
    error,
    saving,
    createProfile,
    deleteProfile,
    addCookie,
    saveCookie,
    deleteCookie,
    exportProfile,
    importProfile,
  };
}
