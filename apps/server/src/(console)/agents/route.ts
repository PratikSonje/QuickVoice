import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
  const { name, organizationId, userId, templateId } = await request.json();
  const agent = await authClient.agents.createAgent({
    name,
    organizationId,
    userId,
    templateId,
  });
  return NextResponse.json(agent);
}