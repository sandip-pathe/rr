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

    const prompt = `Generate exactly ${number} tasks related to "${title}". 
    Return only a valid array, formatted inside ###-###.
    ###[
      { "title": "", "description": "" },
      { "title": "", "description": "" }
    ]###
    🚨 IMPORTANT:
    - The response must **only** contain the JSON array, respond everything withing ###-###.
    - Do **NOT** include any extra text, explanations, labels, or keys like "tasks" or "data".
    - Maintain proper JSON formatting with double quotes for keys and values.`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API Error: ${response.status} - ${await response.text()}`
      );
    }

    const data = await response.json();
    const parsedTasks = data.choices[0]?.message?.content || "[]";

    console.log("🤖 AI Response:", parsedTasks);

    return parsedTasks.map((task: any) => ({
      ...task,
      date: null,
      stageId: "1-unassigned",
    }));
  } catch (error) {
    console.error("❌ Error generating AI tasks:", error);
    throw error;
  }
};
