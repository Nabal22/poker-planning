import { NextRequest, NextResponse } from "next/server";
import { fetchIssuesByJQL } from "@/lib/jira";

function getJiraConfig() {
  const domain = process.env.JIRA_DOMAIN;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const storyPointsField = process.env.JIRA_STORY_POINTS_FIELD || "customfield_10016";
  if (!domain || !email || !apiToken) {
    throw new Error("Variables d'environnement Jira manquantes");
  }
  return { domain, email, apiToken, storyPointsField };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jql = searchParams.get("jql");
  console.log(`[Jira] GET /api/jira/issues — jql: ${jql}`);

  if (!jql) {
    return NextResponse.json({ error: "Paramètre jql requis" }, { status: 400 });
  }

  try {
    const { domain, email, apiToken, storyPointsField } = getJiraConfig();
    const issues = await fetchIssuesByJQL(domain, email, apiToken, jql, storyPointsField);
    console.log(`[Jira] /api/jira/issues → ${issues.length} ticket(s)`);
    return NextResponse.json(issues);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    console.error(`[Jira] /api/jira/issues failed: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
