import { API_BASE, authHeaders } from './api-core';
export async function getProjects() {
    const res = await fetch(`${API_BASE}/projects`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load projects');
    const json = await res.json();
    return json.projects ?? [];
}
export async function createProject(data) {
    const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok)
        throw new Error('Failed to create project');
    const json = await res.json();
    return json.project;
}
export async function getScreens(projectId) {
    const res = await fetch(`${API_BASE}/screens?projectId=${projectId}`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load screens');
    const json = await res.json();
    return json.screens ?? [];
}
export async function createScreen(data) {
    const res = await fetch(`${API_BASE}/screens`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok)
        throw new Error('Failed to create screen');
    const json = await res.json();
    return json.screen;
}
export async function getElements(screenId) {
    const res = await fetch(`${API_BASE}/elements?screenId=${screenId}`, {
        headers: await authHeaders(),
    });
    if (!res.ok)
        throw new Error('Failed to load elements');
    const json = await res.json();
    return json.elements ?? [];
}
export async function createElement(data) {
    const res = await fetch(`${API_BASE}/elements`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok)
        throw new Error('Failed to create element');
    const json = await res.json();
    return json.element;
}
