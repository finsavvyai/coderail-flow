import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { DashboardStatCards } from './DashboardStatCards';
import { DashboardCharts } from './DashboardCharts';
import { DashboardRunsTable } from './DashboardRunsTable';
import { DashboardEmptyState } from './DashboardEmptyState';
import { DashboardSkeleton } from './DashboardSkeleton';
import { apiUrl, authHeaders } from './api-core';
import toast from 'react-hot-toast';
export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [runs, setRuns] = useState([]);
    const [dateRange, setDateRange] = useState('7d');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        void loadStats();
        void loadRuns();
    }, [dateRange]);
    const loadStats = async () => {
        try {
            const response = await fetch(apiUrl(`/stats?dateRange=${dateRange}`), {
                headers: await authHeaders(),
            });
            if (response.ok) {
                setStats(await response.json());
            }
            else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to load stats');
            }
        }
        catch (error) {
            console.error('Failed to load stats:', error);
            toast.error(error.message || 'Failed to load dashboard data');
        }
        finally {
            setLoading(false);
        }
    };
    const loadRuns = async () => {
        try {
            const response = await fetch(apiUrl('/runs?limit=10&sort=created_at&order=desc'), {
                headers: await authHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setRuns(data.runs || data);
            }
        }
        catch (error) {
            console.error('Failed to load runs:', error);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "dash-page", children: _jsx("div", { className: "dash-content", children: _jsx(DashboardSkeleton, {}) }) }));
    }
    if (!stats) {
        return (_jsx("div", { className: "dash-page", children: _jsxs("div", { className: "dash-content", children: [_jsx("div", { className: "dash-header", children: _jsxs("div", { children: [_jsx("h1", { className: "dash-title", children: "Dashboard" }), _jsx("p", { className: "dash-subtitle", children: "Overview of your flow executions" })] }) }), _jsx(DashboardEmptyState, {})] }) }));
    }
    return (_jsx("div", { className: "dash-page", children: _jsxs("div", { className: "dash-content", children: [_jsxs("div", { className: "dash-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "dash-title", children: "Dashboard" }), _jsx("p", { className: "dash-subtitle", children: "Overview of your flow executions" })] }), _jsxs("select", { value: dateRange, onChange: (e) => setDateRange(e.target.value), className: "dash-select", "aria-label": "Date range", children: [_jsx("option", { value: "7d", children: "Last 7 days" }), _jsx("option", { value: "30d", children: "Last 30 days" }), _jsx("option", { value: "90d", children: "Last 90 days" })] })] }), _jsxs("div", { className: "dash-gap", children: [_jsx(DashboardStatCards, { stats: stats }), _jsx(DashboardCharts, { stats: stats }), _jsx(DashboardRunsTable, { runs: runs }), stats.total_runs === 0 && _jsx(DashboardEmptyState, {})] })] }) }));
}
