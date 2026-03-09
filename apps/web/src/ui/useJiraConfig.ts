import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { JiraConfig } from './JiraIntegrationForm.types';
import { DEFAULT_JIRA_CONFIG } from './JiraIntegrationForm.types';

async function getToken(): Promise<string | undefined> {
  return (window as any).Clerk?.session?.getToken();
}

export function useJiraConfig(projectId: string) {
  const [config, setConfig] = useState<JiraConfig>({ ...DEFAULT_JIRA_CONFIG });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [existingConfig, setExistingConfig] = useState<any>(null);

  async function loadExistingConfig() {
    try {
      const token = await getToken();
      const res = await fetch(
        `/api/integrations/jira/config?projectId=${encodeURIComponent(projectId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setExistingConfig(data.config);
          setConfig({
            instanceUrl: data.config.instance_url || '',
            clientId: data.config.client_id || '',
            clientSecret: '',
            projectKey: data.config.project_key || '',
            issueType: data.config.issue_type || 'Bug',
            autoCreateOnFailure: data.config.auto_create_on_failure || false,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load Jira config:', error);
    }
  }

  useEffect(() => {
    void loadExistingConfig();
  }, [projectId]);

  async function saveConfig() {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/integrations/jira/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          projectId,
          config: {
            instance_url: config.instanceUrl,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            project_key: config.projectKey,
            issue_type: config.issueType,
            auto_create_on_failure: config.autoCreateOnFailure,
          },
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save Jira configuration');
      }
      toast.success('Jira integration saved successfully!');
      await loadExistingConfig();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save Jira configuration');
    } finally {
      setLoading(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/integrations/jira/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          instanceUrl: config.instanceUrl,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Connection test failed');
      }
      toast.success('Jira connection successful!');
    } catch (error: any) {
      toast.error(error.message || 'Connection test failed');
    } finally {
      setTesting(false);
    }
  }

  async function deleteIntegration() {
    if (!confirm('Are you sure you want to remove the Jira integration?')) return;
    try {
      const token = await getToken();
      const res = await fetch('/api/integrations/jira/config', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error('Failed to remove integration');
      toast.success('Jira integration removed');
      setExistingConfig(null);
      setConfig({ ...DEFAULT_JIRA_CONFIG });
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove integration');
    }
  }

  return {
    config,
    setConfig,
    loading,
    testing,
    existingConfig,
    saveConfig,
    testConnection,
    deleteIntegration,
  };
}
