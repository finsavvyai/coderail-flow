import type { Template } from "./types";

export const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: "tpl-github-pr-email",
    name: "GitHub PR Email Notification",
    description: "Send email when a pull request is opened",
    category: "notifications",
    trigger: {
      type: "pr.opened",
      config: { repositories: [] },
    },
    actions: [
      {
        type: "send_email",
        config: {
          to: "${github.actor.email}",
          subject: "Pull Request #${github.number} opened by ${github.actor}",
          body: "${github.body}",
        },
      },
    ],
    tags: ["github", "email", "notifications"],
    isPublic: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tpl-slack-deploy-notify",
    name: "Slack Deploy Notification",
    description: "Post to Slack when deployment succeeds",
    category: "notifications",
    trigger: {
      type: "deploy.success",
      config: { environments: ["production"] },
    },
    actions: [
      {
        type: "slack_message",
        config: {
          channel: "#deployments",
          text: "Deployment to ${deploy.environment} successful",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Deployment Success*\nEnvironment: ${deploy.environment}\nVersion: ${deploy.version}",
              },
            },
          ],
        },
      },
    ],
    tags: ["slack", "deployment", "notifications"],
    isPublic: true,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "tpl-auto-rebase-pr",
    name: "Auto Rebase PR on Conflict",
    description: "Automatically rebase PR when it has conflicts",
    category: "automation",
    trigger: {
      type: "pr.conflict",
      config: {},
    },
    actions: [
      {
        type: "git_rebase",
        config: {
          strategy: "rebase",
          onError: "comment",
          forcePush: false,
        },
      },
    ],
    tags: ["github", "git", "automation"],
    isPublic: true,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "tpl-archive-old-issues",
    name: "Archive Old Issues",
    description: "Archive issues older than 90 days (runs daily)",
    category: "maintenance",
    trigger: {
      type: "cron.daily",
      config: { time: "00:00" },
    },
    actions: [
      {
        type: "archive_issues",
        config: {
          ageInDays: 90,
          labels: [],
          states: ["closed"],
          reason: "automated cleanup",
        },
      },
    ],
    tags: ["github", "maintenance", "cron"],
    isPublic: true,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
  },
  {
    id: "tpl-sync-docs-notion",
    name: "Sync Docs to Notion",
    description: "Sync repository docs when repo is updated",
    category: "integration",
    trigger: {
      type: "repo.updated",
      config: { paths: ["docs/**"] },
    },
    actions: [
      {
        type: "sync_notion",
        config: {
          databaseId: "${notion.docs_db}",
          sourceDir: "docs",
          syncInterval: 3600,
          conflictResolution: "source-wins",
        },
      },
    ],
    tags: ["notion", "docs", "integration"],
    isPublic: true,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
];
