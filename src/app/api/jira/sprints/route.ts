import { NextResponse } from "next/server";
import { fetchSprints } from "@/lib/jira";

function getJiraConfig() {
  const domain = process.env.JIRA_DOMAIN;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  console.log("[Jira] Config check:");
  console.log(`  JIRA_DOMAIN:      ${domain ? `✓ ${domain}` : "✗ manquant"}`);
  console.log(`  JIRA_EMAIL:       ${email ? `✓ ${email}` : "✗ manquant"}`);
  console.log(`  JIRA_API_TOKEN:   ${apiToken ? "✓ (défini)" : "✗ manquant"}`);
  console.log(`  JIRA_PROJECT_KEY: ${projectKey ? `✓ ${projectKey}` : "✗ manquant"}`);

  if (!domain || !email || !apiToken || !projectKey) {
    throw new Error("Variables d'environnement Jira manquantes (JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY)");
  }
  return { domain, email, apiToken, projectKey };
}

export async function GET() {
  console.log("[Jira] GET /api/jira/sprints");
  try {
    const config = getJiraConfig();
    const sprints = await fetchSprints(config.domain, config.email, config.apiToken, config.projectKey);
    console.log(`[Jira] Returning ${sprints.length} sprint(s) to client`);
    return NextResponse.json(sprints);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    console.error(`[Jira] /api/jira/sprints failed: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
