import { BUILT_IN_TEMPLATES } from "./data";
import type { Template } from "./types";

export async function getTemplates(): Promise<Template[]> {
  return BUILT_IN_TEMPLATES;
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const template = BUILT_IN_TEMPLATES.find((t) => t.id === id);
  return template || null;
}

export async function getTemplatesByCategory(
  category: string
): Promise<Template[]> {
  return BUILT_IN_TEMPLATES.filter((t) => t.category === category);
}

export async function getTemplatesByTag(tag: string): Promise<Template[]> {
  return BUILT_IN_TEMPLATES.filter((t) => t.tags.includes(tag));
}

export async function createTemplateFromBuiltin(
  builtinId: string
): Promise<Template | null> {
  return getTemplateById(builtinId);
}
