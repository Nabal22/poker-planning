import { NextRequest, NextResponse } from "next/server";
import { updateStoryPoints } from "@/lib/jira";

function getJiraConfig() {
  const domain = process.env.JIRA_DOMAIN;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const storyPointsField = process.env.JIRA_STORY_POINTS_FIELD || "customfield_10016";
  if (!domain || !email || !apiToken) {
    throw new Error("Jira non configuré (variables d'environnement manquantes)");
  }
  return { domain, email, apiToken, storyPointsField };
}

export async function POST(req: NextRequest) {
  const { issueKey, points } = await req.json();

  if (!issueKey || points === undefined) {
    return NextResponse.json({ error: "issueKey et points requis" }, { status: 400 });
  }

  try {
    const { domain, email, apiToken, storyPointsField } = getJiraConfig();
    await updateStoryPoints(domain, email, apiToken, issueKey, points, storyPointsField);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur" }, { status: 500 });
  }
}
