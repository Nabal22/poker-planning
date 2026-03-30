// Route non utilisée — les credentials sont côté serveur et le projet est fixe via JIRA_PROJECT_KEY
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Non disponible" }, { status: 410 });
}
