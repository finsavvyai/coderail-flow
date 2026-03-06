import { useState, useEffect } from 'react';
import { getProjects, createProject, getScreens, getElements } from './api';

export type ProjectView =
  | 'list'
  | 'flow-builder'
  | 'element-mapper'
  | 'flow-recorder'
  | 'integrations'
  | 'auth-profiles'
  | 'templates';

export function useProjectManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [screens, setScreens] = useState<any[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  const [view, setView] = useState<ProjectView>('list');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadScreens(selectedProject.id);
    }
  }, [selectedProject]);

  async function loadProjects() {
    try {
      setLoading(true);
      const p = await getProjects();
      setProjects(p);
      if (p.length > 0 && !selectedProject) {
        setSelectedProject(p[0]);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadScreens(projectId: string) {
    try {
      const s = await getScreens(projectId);
      setScreens(s);
      const allElements: any[] = [];
      for (const screen of s) {
        const els = await getElements(screen.id);
        allElements.push(...els);
      }
      setElements(allElements);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleCreateProject() {
    if (!newProjectName.trim() || !newProjectUrl.trim()) {
      setError('Project name and base URL are required');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const project = await createProject({
        name: newProjectName.trim(),
        baseUrl: newProjectUrl.trim(),
      });
      await loadProjects();
      setSelectedProject(project);
      setNewProjectName('');
      setNewProjectUrl('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    projects,
    selectedProject,
    setSelectedProject,
    screens,
    elements,
    view,
    setView,
    newProjectName,
    setNewProjectName,
    newProjectUrl,
    setNewProjectUrl,
    loading,
    error,
    setError,
    handleCreateProject,
    loadScreens,
  };
}
