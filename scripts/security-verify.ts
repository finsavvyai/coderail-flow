// @ts-nocheck

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

const API_BASE = process.env.API_BASE || "http://localhost:8787";
const API_TOKEN = process.env.API_TOKEN;
const ORG_ID = process.env.ORG_ID;
const RETENTION_DAYS = Number(process.env.RETENTION_DAYS || "90");

function authHeaders(): Record<string, string> {
  if (!API_TOKEN) return {};
  return { Authorization: `Bearer ${API_TOKEN}` };
}

async function requestJson(path: string, init?: RequestInit): Promise<{ status: number; body: any; headers: Headers }> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  });

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { status: response.status, body, headers: response.headers };
}

function pass(name: string, detail: string): CheckResult {
  return { name, ok: true, detail };
}

function fail(name: string, detail: string): CheckResult {
  return { name, ok: false, detail };
}

async function checkSecurityHeaders(): Promise<CheckResult> {
  const response = await fetch(`${API_BASE}/health`);
  const requiredHeaders = [
    ["x-content-type-options", "nosniff"],
    ["x-frame-options", "DENY"],
    ["referrer-policy", "no-referrer"],
    ["cache-control", "no-store"],
  ] as const;

  const missing = requiredHeaders.filter(([key, expected]) => {
    const value = response.headers.get(key);
    return value !== expected;
  });

  if (missing.length > 0) {
    return fail(
      "security_headers",
      `missing_or_invalid=${missing.map(([k, v]) => `${k}:${v}`).join(",")}`
    );
  }

  return pass("security_headers", "all_required_headers_present");
}

async function checkSsoProviderTests(): Promise<CheckResult> {
  const { status, body } = await requestJson("/sso/test", { method: "GET" });

  if (status !== 200) {
    return fail("sso_provider_tests", `unexpected_status=${status}`);
  }

  if (!body || !Array.isArray(body.tests) || typeof body.ok !== "boolean") {
    return fail("sso_provider_tests", "invalid_response_shape");
  }

  return pass("sso_provider_tests", `providers_returned=${body.tests.length}`);
}

async function checkComplianceExport(): Promise<CheckResult> {
  if (!ORG_ID) return fail("compliance_export", "ORG_ID_missing");
  if (!API_TOKEN) return fail("compliance_export", "API_TOKEN_missing");

  const { status, body } = await requestJson(`/compliance/export?orgId=${encodeURIComponent(ORG_ID)}`, {
    method: "GET",
  });

  if (status !== 200) return fail("compliance_export", `unexpected_status=${status}`);
  if (!body?.export?.orgId || !body?.export?.generatedAt) {
    return fail("compliance_export", "missing_export_fields");
  }

  return pass("compliance_export", `org=${body.export.orgId}`);
}

async function checkComplianceRetentionDryRun(): Promise<CheckResult> {
  if (!API_TOKEN) return fail("compliance_retention_dry_run", "API_TOKEN_missing");

  const { status, body } = await requestJson("/compliance/retention/apply", {
    method: "POST",
    body: JSON.stringify({ days: RETENTION_DAYS, dryRun: true }),
  });

  if (status !== 200) return fail("compliance_retention_dry_run", `unexpected_status=${status}`);
  if (!body?.retention || body?.retention?.dryRun !== true) {
    return fail("compliance_retention_dry_run", "invalid_retention_payload");
  }

  return pass("compliance_retention_dry_run", `cutoff=${body.retention.cutoff}`);
}

async function checkComplianceDeletionDryRun(): Promise<CheckResult> {
  if (!ORG_ID) return fail("compliance_delete_dry_run", "ORG_ID_missing");
  if (!API_TOKEN) return fail("compliance_delete_dry_run", "API_TOKEN_missing");

  const { status, body } = await requestJson(`/compliance/orgs/${encodeURIComponent(ORG_ID)}/delete`, {
    method: "POST",
    body: JSON.stringify({ dryRun: true }),
  });

  if (status !== 200) return fail("compliance_delete_dry_run", `unexpected_status=${status}`);
  if (body?.dryRun !== true || !body?.result?.deleted) {
    return fail("compliance_delete_dry_run", "invalid_delete_payload");
  }

  return pass("compliance_delete_dry_run", `projects=${body.result.projects}`);
}

async function main() {
  console.log(`Security verification target: ${API_BASE}`);

  const checks = await Promise.all([
    checkSecurityHeaders(),
    checkSsoProviderTests(),
    checkComplianceExport(),
    checkComplianceRetentionDryRun(),
    checkComplianceDeletionDryRun(),
  ]);

  let failed = 0;
  for (const check of checks) {
    const status = check.ok ? "PASS" : "FAIL";
    if (!check.ok) failed += 1;
    console.log(`[${status}] ${check.name} - ${check.detail}`);
  }

  if (failed > 0) {
    console.error(`\nSecurity verification failed: ${failed} check(s) failed`);
    process.exit(1);
  }

  console.log("\nSecurity verification passed");
}

main().catch((error) => {
  console.error("Security verification failed with runtime error:", error);
  process.exit(1);
});
