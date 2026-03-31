export interface JiraSprint {
  id: string;
  name: string;
  jql: string;
}

export interface JiraIssue {
  key: string;
  summary: string;
  description?: string;
  status: string;
  currentPoints?: number;
  assignee?: string;
}

function getAuthHeader(apiToken: string, email: string) {
  // If the token looks like an OAuth/granular token (starts with a known prefix),
  // use Bearer auth. Otherwise, use Basic auth (classic API tokens).
  if (apiToken.startsWith("ey") || apiToken.length > 200) {
    return `Bearer ${apiToken}`;
  }
  return `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`;
}

type RawIssue = {
  key: string;
  fields: {
    summary: string;
    description?: unknown;
    status: { name: string };
    assignee?: { displayName: string };
    customfield_10020?: Array<{ id: number; name: string; state: string }>;
    [key: string]: unknown;
  };
};

function mapIssue(i: RawIssue, storyPointsField: string): JiraIssue {
  return {
    key: i.key,
    summary: i.fields.summary,
    description: extractPlainText(i.fields.description),
    status: i.fields.status.name,
    currentPoints: i.fields[storyPointsField] as number | undefined,
    assignee: i.fields.assignee?.displayName,
  };
}

async function searchJQL(
  domain: string,
  email: string,
  apiToken: string,
  jql: string,
  fields: string[],
): Promise<RawIssue[]> {
  const url = `https://${domain}/rest/api/3/search/jql`;
  console.log(`[Jira] POST ${url}`);
  console.log(`[Jira] JQL: ${jql}`);
  console.log(`[Jira] Fields: ${fields.join(", ")}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(apiToken, email),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ jql, maxResults: 100, fields }),
  });

  console.log(`[Jira] Response status: ${res.status}`);

  if (!res.ok) {
    const err = await res.text();
    console.error(`[Jira] Error body: ${err}`);
    throw new Error(`Jira API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const count = data.issues?.length ?? 0;
  console.log(`[Jira] Issues returned: ${count} (isLast: ${data.isLast})`);
  return data.issues ?? [];
}

const NO_SUBTASKS = "issuetype not in subTaskIssueTypes()";

export async function fetchSprints(
  domain: string,
  email: string,
  apiToken: string,
  projectKey: string,
): Promise<JiraSprint[]> {
  console.log(`[Jira] fetchSprints — project: ${projectKey}`);
  const result: JiraSprint[] = [];

  // 1. Issues in active sprints
  const activeIssues = await searchJQL(
    domain,
    email,
    apiToken,
    `project = ${projectKey} AND sprint in openSprints() AND ${NO_SUBTASKS}`,
    ["customfield_10020"],
  );

  // 2. Issues in future sprints
  const futureIssues = await searchJQL(
    domain,
    email,
    apiToken,
    `project = ${projectKey} AND sprint in futureSprints() AND ${NO_SUBTASKS}`,
    ["customfield_10020"],
  );

  const seen = new Map<number, { name: string; state: string }>();
  for (const issue of [...activeIssues, ...futureIssues]) {
    for (const s of issue.fields.customfield_10020 ?? []) {
      if (!seen.has(s.id) && s.state !== "closed") {
        seen.set(s.id, { name: s.name, state: s.state });
      }
    }
  }

  console.log(`[Jira] Distinct active/future sprints found: ${seen.size}`);
  seen.forEach((s, id) => console.log(`[Jira]   sprint id=${id} name="${s.name}" state=${s.state}`));

  for (const [id, s] of seen.entries()) {
    result.push({
      id: String(id),
      name: `${s.name}${s.state === "active" ? " (actif)" : ""}`,
      jql: `project = ${projectKey} AND sprint = ${id} AND ${NO_SUBTASKS} ORDER BY rank ASC`,
    });
  }

  // 2. Backlog (sans sprint, hors sous-tâches)
  const backlogIssues = await searchJQL(
    domain,
    email,
    apiToken,
    `project = ${projectKey} AND sprint is EMPTY AND ${NO_SUBTASKS} ORDER BY created ASC`,
    ["summary"],
  );

  console.log(`[Jira] Backlog issues (no sprint): ${backlogIssues.length}`);

  if (backlogIssues.length > 0) {
    result.push({
      id: "backlog",
      name: `Backlog`,
      jql: `project = ${projectKey} AND sprint is EMPTY AND ${NO_SUBTASKS} ORDER BY rank ASC`,
    });
  }

  if (result.length > 0) {
    console.log(`[Jira] Returning ${result.length} option(s):`, result.map((r) => r.name));
    return result;
  }

  // 3. Fallback générique
  console.warn(`[Jira] Aucun ticket trouvé dans le projet ${projectKey}`);
  return [];
}

export async function fetchIssuesByJQL(
  domain: string,
  email: string,
  apiToken: string,
  jql: string,
  storyPointsField = "customfield_10016",
): Promise<JiraIssue[]> {
  console.log(`[Jira] fetchIssuesByJQL — storyPointsField: ${storyPointsField}`);
  const issues = await searchJQL(domain, email, apiToken, jql, [
    "summary",
    "description",
    "status",
    "assignee",
    storyPointsField,
  ]);
  const mapped = issues.map((i) => mapIssue(i, storyPointsField));
  mapped.forEach((i) => console.log(`[Jira]   ${i.key} "${i.summary}" status=${i.status} points=${i.currentPoints ?? "—"}`));
  return mapped;
}

export async function updateStoryPoints(
  domain: string,
  email: string,
  apiToken: string,
  issueKey: string,
  points: number,
  storyPointsField = "customfield_10016",
) {
  console.log(`[Jira] updateStoryPoints — ${issueKey} → ${points} (field: ${storyPointsField})`);
  const url = `https://${domain}/rest/api/3/issue/${issueKey}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: getAuthHeader(apiToken, email),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: { [storyPointsField]: points } }),
  });
  console.log(`[Jira] updateStoryPoints response: ${res.status}`);
  if (!res.ok) {
    const err = await res.text();
    console.error(`[Jira] updateStoryPoints error: ${err}`);
    throw new Error(`Failed to update story points: ${err}`);
  }
}

function extractPlainText(doc: unknown): string | undefined {
  if (!doc) return undefined;
  if (typeof doc === "string") return doc;
  const adf = doc as { content?: Array<{ content?: Array<{ text?: string }> }> };
  try {
    return adf.content
      ?.flatMap((block) => block.content ?? [])
      .map((node) => node.text ?? "")
      .join(" ")
      .trim()
      .slice(0, 500);
  } catch {
    return undefined;
  }
}
