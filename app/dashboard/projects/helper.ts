const API_URL = "https://api.openai.com/v1/chat/completions";

const OPENAI_API_KEY =
  "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";

export const generateAITasks = async (
  projectId: string,
  title: string,
  number: number
) => {
  try {
    if (!projectId || !title || !number) {
      throw new Error("Missing projectId, title, or number of tasks.");
    }

    const prompt = `Generate exactly "${number}" tasks related to "${title}". \n    Return only a valid array [] of JSON ojbects {} in below format.\\n\n    [\n      { "title": "this is task 1", "description": "description" },\n      { "title": "task 2", "description": "description of task" },\n       ...\n    ]\n     \\n 🚨 IMPORTANT:\n    - The response must **only** contain the array.\n    - Do **NOT** include any extra text, explanations, labels, or keys like "tasks" or "data".\n    - Maintain proper JSON formatting with double quotes for keys and values.`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 1,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API Error: ${response.status} - ${await response.text()}`
      );
    }

    const data = await response.json();
    let parsedTasks = [];

    try {
      parsedTasks = JSON.parse(data.choices[0]?.message?.content || "[]");
    } catch (error) {
      console.error("❌ JSON parsing error:", error);
      parsedTasks = [];
    }

    if (!Array.isArray(parsedTasks)) {
      throw new Error("Invalid response format: Expected an array.");
    }

    console.log("🤖 AI Response:", parsedTasks);

    return parsedTasks.map((task: any) => ({
      ...task,
      date: new Date().toISOString(),
      stageId: "1-unassigned",
    }));
  } catch (error) {
    console.error("❌ Error generating AI tasks:", error);
    throw error;
  }
};
