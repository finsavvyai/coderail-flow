import { describe, it, expect } from "vitest";
import {
  getTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByTag,
} from "../src/templates/index";

describe("Template Registry", () => {
  it("should get all templates", async () => {
    const templates = await getTemplates();
    expect(templates).toHaveLength(5);
  });

  it("should get template by id", async () => {
    const template = await getTemplateById("tpl-github-pr-email");
    expect(template).toBeDefined();
    expect(template?.name).toBe("GitHub PR Email Notification");
  });

  it("should return null for non-existent template", async () => {
    const template = await getTemplateById("non-existent");
    expect(template).toBeNull();
  });

  it("should filter templates by category", async () => {
    const notifications = await getTemplatesByCategory("notifications");
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications.every((t) => t.category === "notifications")).toBe(
      true
    );
  });

  it("should filter templates by tag", async () => {
    const githubTemplates = await getTemplatesByTag("github");
    expect(githubTemplates.length).toBeGreaterThan(0);
    expect(githubTemplates.every((t) => t.tags.includes("github"))).toBe(true);
  });

  it("should have valid template structure", async () => {
    const templates = await getTemplates();
    expect(templates).not.toHaveLength(0);

    templates.forEach((template) => {
      expect(template).toHaveProperty("id");
      expect(template).toHaveProperty("name");
      expect(template).toHaveProperty("description");
      expect(template).toHaveProperty("trigger");
      expect(template).toHaveProperty("actions");
      expect(Array.isArray(template.actions)).toBe(true);
    });
  });

  it("should have valid trigger and action types", async () => {
    const templates = await getTemplates();

    const validTriggerTypes = [
      "pr.opened",
      "pr.conflict",
      "deploy.success",
      "cron.daily",
      "repo.updated",
      "manual",
    ];
    const validActionTypes = [
      "send_email",
      "slack_message",
      "git_rebase",
      "archive_issues",
      "sync_notion",
      "webhook",
    ];

    templates.forEach((template) => {
      expect(validTriggerTypes).toContain(template.trigger.type);
      template.actions.forEach((action) => {
        expect(validActionTypes).toContain(action.type);
      });
    });
  });

  it("should have timestamps in ISO format", async () => {
    const templates = await getTemplates();
    templates.forEach((template) => {
      expect(() => new Date(template.createdAt)).not.toThrow();
      expect(() => new Date(template.updatedAt)).not.toThrow();
    });
  });
});
