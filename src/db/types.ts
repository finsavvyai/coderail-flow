export interface TemplateRow {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  trigger_config: string;
  actions: string;
  tags: string;
  is_public: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  template_id: string | null;
  trigger_type: string;
  trigger_config: string;
  actions: string;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  auth_subject: string;
  created_at: string;
  updated_at: string;
}

export interface ExecutionRow {
  id: string;
  workflow_id: string;
  status: "pending" | "running" | "success" | "failed";
  triggered_at: string;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}
