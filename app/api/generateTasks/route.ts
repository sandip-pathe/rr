import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL: string = process.env.API_URL || "https://default-api-url.com";

export async function POST(req: NextRequest) {
  try {
    const { projectId, title } = await req.json();

    if (!projectId || !title) {
      return NextResponse.json(
        { error: "Missing projectId or title" },
        { status: 400 }
      );
    }

    const prompt = `Break down the project "${title}" into detailed, actionable tasks for a Kanban board. Return JSON: [{title, description}]`;

    const body = JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API Error: ${response.status} - ${await response.text()}`
      );
    }

    const data = await response.json();
    const tasks = JSON.parse(data.choices[0]?.message?.content || "[]");

    const tasksRef = collection(FIREBASE_DB, "projects", projectId, "tasks");
    await Promise.all(
      tasks.map((task: any) =>
        addDoc(tasksRef, { ...task, dueDate: new Date(), stageId: "backlog" })
      )
    );

    return NextResponse.json({ success: true, tasks }, { status: 200 });
  } catch (error) {
    console.error("Error generating AI tasks:", error);
    return NextResponse.json(
      { success: false, error: error || "Unknown error" },
      { status: 500 }
    );
  }
}
