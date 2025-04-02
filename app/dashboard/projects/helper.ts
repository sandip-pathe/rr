const API_URL = "https://api.openai.com/v1/chat/completions";

const OPENAI_API_KEY = "";

interface ProjectDetails {
  title: string;
  description: string;
  category?: string;
  existingSkills?: string[];
}

interface AISuggestions {
  tasks: any[];
  suggestedSkills: string[];
  suggestedMembers: string[];
  recommendedDeadline: string;
  reasoning: string;
}

export const generateAITasks = async (
  projectDetails: ProjectDetails,
  number: number
): Promise<AISuggestions> => {
  try {
    if (!projectDetails.title || !number) {
      throw new Error("Missing required project details or number of tasks.");
    }

    const systemInstructions = `You are a project management AI assistant. Your task is to:
    1. Generate relevant tasks for the project
    2. Suggest skills required
    3. Recommend team members based on their profiles
    4. Estimate a realistic deadline
    
    Consider these factors for member recommendations:
    - Skills match with project requirements
    - Past project experience
    - Current workload
    - Interests and specialties
    - Team composition balance
    
    For skills, consider:
    - Project title and description
    - Project category
    - Industry standards
    - Existing skills already listed
    
    Format your response as a JSON object with these keys:
    - tasks: array of task objects (title, description, dueDate)
    - suggestedSkills: array of strings
    - recommendedDeadline: ISO date string
    - reasoning: brief explanation of your suggestions`;

    const prompt = `Project Details:
    Title: ${projectDetails.title}
    Description: ${projectDetails.description}
    Category: ${projectDetails.category || "Not specified"}
    Existing Skills: ${projectDetails.existingSkills?.join(", ") || "None"}
    
    Please generate:
    1. Exactly ${number} tasks for this project
    2. Suggested skills required
    3. Recommended team members (from existing or new)
    4. A realistic deadline based on project scope
    
    Return your response as a valid JSON object following the specified format.`;

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

    console.log("🤖 AI Request:", response);

    const data = await response.json();
    let result: AISuggestions = {
      tasks: [],
      suggestedSkills: [],
      suggestedMembers: [],
      recommendedDeadline: "",
      reasoning: "",
    };
    console.log("🤖 AI Response:", data);

    try {
      const content = data.choices[0]?.message?.content;
      if (content) {
        result = JSON.parse(content);

        // Process tasks to add default fields
        result.tasks = result.tasks.map((task: any) => ({
          ...task,
          id: crypto.randomUUID(),
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          stageId: "1-unassigned",
        }));
      }
    } catch (error) {
      console.error("❌ JSON parsing error:", error);
      throw new Error("Failed to parse AI response");
    }

    console.log("🤖 AI Suggestions:", result);
    return result;
  } catch (error) {
    console.error("❌ Error generating AI tasks and suggestions:", error);
    throw error;
  }
};
