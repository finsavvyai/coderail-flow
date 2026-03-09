export interface Run {
  id: string;
  flow_id: string;
  flow_name: string;
  status: 'succeeded' | 'failed' | 'running' | 'pending';
  duration: number;
  created_at: string;
}

export interface Stats {
  total_runs: number;
  succeeded_runs: number;
  failed_runs: number;
  avg_duration: number;
  runs_by_flow: { flow_name: string; count: number }[];
  runs_over_time: { date: string; count: number }[];
}
