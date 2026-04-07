import { useState, useEffect } from 'react';
import { apiRequest } from './integrations-types';
export function useIntegrations(projectId) {
    const [integrations, setIntegrations] = useState([]);
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDeliveries, setExpandedDeliveries] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [testing, setTesting] = useState(null);
    useEffect(() => {
        void loadData();
    }, [projectId]);
    async function loadData() {
        setLoading(true);
        const [intRes, keyRes] = await Promise.all([
            apiRequest(`/integrations?projectId=${projectId}`),
            apiRequest(`/api-keys`),
        ]);
        setIntegrations(intRes.integrations || []);
        setApiKeys(keyRes.keys || []);
        setLoading(false);
    }
    async function createIntegration(type, name, config) {
        if (!name)
            return false;
        const res = await apiRequest('/integrations', {
            method: 'POST',
            body: JSON.stringify({ projectId, type, name, config }),
        });
        if (res.integration) {
            setIntegrations((prev) => [res.integration, ...prev]);
            return true;
        }
        return false;
    }
    async function toggleIntegration(id, enabled) {
        await apiRequest(`/integrations/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ enabled }),
        });
        setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, enabled: enabled ? 1 : 0 } : i)));
    }
    async function deleteIntegration(id) {
        if (!confirm('Delete this integration?'))
            return;
        await apiRequest(`/integrations/${id}`, { method: 'DELETE' });
        setIntegrations((prev) => prev.filter((i) => i.id !== id));
    }
    async function testIntegration(id) {
        setTesting(id);
        await apiRequest(`/integrations/${id}/test`, { method: 'POST' });
        setTimeout(() => setTesting(null), 2000);
    }
    async function loadDeliveries(id) {
        if (expandedDeliveries === id) {
            setExpandedDeliveries(null);
            return;
        }
        const res = await apiRequest(`/integrations/${id}/deliveries`);
        setDeliveries(res.deliveries || []);
        setExpandedDeliveries(id);
    }
    async function createApiKey(name, expiryDays) {
        if (!name)
            return null;
        const res = await apiRequest('/api-keys', {
            method: 'POST',
            body: JSON.stringify({ name, expiresInDays: expiryDays }),
        });
        if (res.key) {
            setApiKeys((prev) => [
                {
                    ...res.key,
                    key_prefix: res.key.prefix,
                    scopes: '["runs:write","flows:read"]',
                },
                ...prev,
            ]);
            return res.key.key;
        }
        return null;
    }
    async function deleteApiKey(id) {
        if (!confirm('Delete this API key? Any integrations using it will stop working.'))
            return;
        await apiRequest(`/api-keys/${id}`, { method: 'DELETE' });
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
    }
    return {
        integrations,
        apiKeys,
        loading,
        expandedDeliveries,
        deliveries,
        testing,
        createIntegration,
        toggleIntegration,
        deleteIntegration,
        testIntegration,
        loadDeliveries,
        createApiKey,
        deleteApiKey,
    };
}
