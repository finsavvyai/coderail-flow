import { useState, useEffect } from 'react';
import { getProjects, createProject, getScreens, getElements } from './api';
export function useProjectManager() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [screens, setScreens] = useState([]);
    const [elements, setElements] = useState([]);
    const [view, setView] = useState('list');
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectUrl, setNewProjectUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        void loadProjects();
    }, []);
    useEffect(() => {
        if (selectedProject) {
            void loadScreens(selectedProject.id);
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
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function loadScreens(projectId) {
        try {
            const s = await getScreens(projectId);
            setScreens(s);
            const allElements = [];
            for (const screen of s) {
                const els = await getElements(screen.id);
                allElements.push(...els);
            }
            setElements(allElements);
        }
        catch (e) {
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
            const created = await createProject({
                name: newProjectName.trim(),
                baseUrl: newProjectUrl.trim(),
            });
            await loadProjects();
            if (created) {
                setSelectedProject(created);
            }
            setNewProjectName('');
            setNewProjectUrl('');
        }
        catch (e) {
            setError(e.message);
        }
        finally {
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
