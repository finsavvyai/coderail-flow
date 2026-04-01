import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTemplates,
  getTemplateById,
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
} from "../src/db/queries";

describe("Database Queries", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      prepare: vi.fn(),
    };
  });

  it("should fetch all templates", async () => {
    const mockResults = [
      {
        id: "tpl-1",
        name: "Template 1",
        is_public: 1,
      },
    ];

    const mockChain = {
      all: vi.fn().mockResolvedValue({ results: mockResults }),
    };

    mockDb.prepare.mockReturnValue({
      all: mockChain.all,
    });

    const templates = await getTemplates(mockDb);

    expect(mockDb.prepare).toHaveBeenCalled();
    expect(templates).toEqual(mockResults);
  });

  it("should fetch template by id", async () => {
    const mockTemplate = {
      id: "tpl-1",
      name: "Template 1",
    };

    const mockChain = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(mockTemplate),
    };

    mockDb.prepare.mockReturnValue(mockChain);

    const template = await getTemplateById(mockDb, "tpl-1");

    expect(mockDb.prepare).toHaveBeenCalled();
    expect(template).toEqual(mockTemplate);
  });

  it("should create a workflow", async () => {
    const mockWorkflow = {
      id: "wf-123",
      user_id: "user-1",
      name: "My Workflow",
    };

    const mockChain = {
      bind: vi.fn().mockReturnThis(),
      run: vi.fn().mockResolvedValue(undefined),
      first: vi.fn().mockResolvedValue(mockWorkflow),
    };

    mockDb.prepare.mockReturnValue(mockChain);

    const workflow = await createWorkflow(mockDb, {
      id: "wf-123",
      userId: "user-1",
      name: "My Workflow",
      triggerType: "pr.opened",
      triggerConfig: "{}",
      actions: "[]",
    });

    expect(mockDb.prepare).toHaveBeenCalled();
    expect(workflow).toEqual(mockWorkflow);
  });

  it("should fetch workflows for user", async () => {
    const mockResults = [
      {
        id: "wf-1",
        user_id: "user-1",
        name: "Workflow 1",
      },
    ];

    const mockChain = {
      bind: vi.fn().mockReturnThis(),
      all: vi.fn().mockResolvedValue({ results: mockResults }),
    };

    mockDb.prepare.mockReturnValue(mockChain);

    const workflows = await getWorkflows(mockDb, "user-1");

    expect(mockDb.prepare).toHaveBeenCalled();
    expect(workflows).toEqual(mockResults);
  });

  it("should fetch workflow by id", async () => {
    const mockWorkflow = {
      id: "wf-1",
      user_id: "user-1",
    };

    const mockChain = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(mockWorkflow),
    };

    mockDb.prepare.mockReturnValue(mockChain);

    const workflow = await getWorkflowById(mockDb, "wf-1");

    expect(workflow).toEqual(mockWorkflow);
  });

  it("should update a workflow", async () => {
    const mockWorkflow = {
      id: "wf-1",
      name: "Updated Workflow",
    };

    const mockChain = {
      bind: vi.fn().mockReturnThis(),
      run: vi.fn().mockResolvedValue(undefined),
      first: vi.fn().mockResolvedValue(mockWorkflow),
    };

    mockDb.prepare.mockReturnValue(mockChain);

    const workflow = await updateWorkflow(mockDb, "wf-1", {
      name: "Updated Workflow",
    } as any);

    expect(workflow).toEqual(mockWorkflow);
  });
});
