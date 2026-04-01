export type TriggerType =
  | "pr.opened"
  | "pr.conflict"
  | "deploy.success"
  | "cron.daily"
  | "repo.updated"
  | "manual";

export type ActionType =
  | "send_email"
  | "slack_message"
  | "git_rebase"
  | "archive_issues"
  | "sync_notion"
  | "webhook";

export interface Trigger {
  type: TriggerType;
  config?: Record<string, unknown>;
}

export interface Action {
  type: ActionType;
  config: Record<string, unknown>;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  trigger: Trigger;
  actions: Action[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: Trigger;
  actions: Action[];
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
