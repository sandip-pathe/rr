import { ProjectDetails } from "./newForm";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

console.log("API KEY:", process.env.NEXT_PUBLIC_OPENAI_API_KEY);

if (!OPENAI_API_KEY) throw new Error("API Key not found!");

interface Task {
  title: string;
  description: string;
  dueDate: string;
}

interface AISuggestions {
  tasks: Task[];
  suggestedSkills: string[];
  recommendedDeadline: string;
  reasoning: string;
}

export const generateAITasks = async (
  projectDetails: ProjectDetails,
  number: number
): Promise<AISuggestions> => {
  console.log(OPENAI_API_KEY, API_URL);
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not set in the environment variables.");
  }

  try {
    if (!projectDetails.title || !number) {
      throw new Error("Missing required project details or number of tasks.");
    }

    const today = new Date().toISOString().split("T")[0];
    const userDueDate =
      projectDetails.dueDate?.toISOString().split("T")[0] || "Not specified";

    const systemInstructions = `You are a project management AI assistant. Your task is to:
    1. Generate exactly ${number} relevant tasks for the project, each with title, description, and due date
    2. Suggest skills required for the project
    3. Estimate a realistic deadline for the entire project
    4. Provide reasoning for your suggestions
    
    For task due dates:
    - Distribute them evenly between today (${today}) and the project deadline (${userDueDate})
    - If no project deadline is specified, estimate a reasonable timeline based on the project scope
    
    For skills, consider:
    - Project title and description
    - Project category
    - Industry standards
    - Existing skills already listed
    
    Return your response as a valid JSON object with this exact structure:
    {
      "tasks": [
        {
          "title": "Task title",
          "description": "Task description",
          "dueDate": "YYYY-MM-DD"
        },
        ...
      ],
      "suggestedSkills": ["skill1", "skill2", ...],
      "recommendedDeadline": "YYYY-MM-DD",
      "reasoning": "Your explanation here"
    }`;

    const prompt = `Project Details:
    Title: ${projectDetails.title}
    Description: ${projectDetails.description}
    Today's Date: ${today}
    User-specified Due Date: ${userDueDate}
    Category: ${projectDetails.category || "Not specified"}
    Existing Skills: ${projectDetails.existingSkills?.join(", ") || "None"}
    
    Please generate exactly ${number} tasks with due dates distributed appropriately between today and the project deadline.`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemInstructions },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API Error: ${response.status} - ${await response.text()}`
      );
    }

    const data = await response.json();
    let result: AISuggestions = {
      tasks: [],
      suggestedSkills: [],
      recommendedDeadline: "",
      reasoning: "",
    };

    try {
      const content = data.choices[0]?.message?.content;
      if (content) {
        result = JSON.parse(content);

        // Validate and format the response
        if (!Array.isArray(result.tasks) || result.tasks.length !== number) {
          throw new Error(`Expected exactly ${number} tasks`);
        }

        // Ensure all tasks have required fields
        result.tasks = result.tasks.map((task: any) => ({
          title: task.title || "Untitled task",
          description: task.description || "",
          dueDate: task.dueDate || new Date().toISOString().split("T")[0],
        }));
      }
    } catch (error) {
      console.error("❌ JSON parsing error:", error);
      throw new Error("Failed to parse AI response");
    }

    return result;
  } catch (error) {
    console.error("❌ Error generating AI tasks:", error);
    throw error;
  }
};
