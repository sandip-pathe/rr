import { FIREBASE_DB } from "@/FirebaseConfig";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
const API_URL = "https://api.openai.com/v1/chat/completions";

if (!OPENAI_API_KEY) throw new Error("API Key not found!");

interface Summary {
  content: string;
  lastUpdated: Date;
  version: number;
  generatedAtReplyCount: number;
}

interface ConversationContext {
  question: {
    title: string;
    description: string;
    author: string;
    date: string;
  };
  replies: {
    author: string;
    content: string;
    date: string;
    isTopLevel: boolean;
  }[];
}

export const generateAndUpdateAMASummary = async (
  questionId: string,
  currentReplyCount: number
) => {
  console.log("Generating summary for question ID:", questionId);
  if (!questionId) {
    console.warn("No question ID provided for summary generation.");
    return;
  }
  try {
    const questionRef = doc(FIREBASE_DB, "ama", questionId);
    const questionSnap = await getDoc(questionRef);

    if (!questionSnap.exists()) {
      throw new Error("Question not found");
    }

    const questionData = questionSnap.data();
    const replies = questionData.replies || [];
    const summary: Summary | undefined = questionData.summary;

    // Only generate if we have enough content
    if (replies.length < 1) {
      console.warn("Not enough replies to generate a summary.");
      return;
    }

    // Prepare context
    const conversationContext: ConversationContext = {
      question: {
        title: questionData.title,
        description: questionData.description,
        author: questionData.authorName || "Anonymous",
        date: questionData.created_at,
      },
      replies: replies
        .filter((reply: any) => !reply.deleted)
        .filter((reply: any) => reply.content.length > 20)
        .map((reply: any) => ({
          author: reply.author,
          content: reply.content,
          date: reply.created_at,
          isTopLevel: !reply.parent_id,
        })),
    };

    const newSummaryContent = await generateAMASummary(
      conversationContext,
      summary?.content || ""
    );

    const newSummary: Summary = {
      content: newSummaryContent,
      lastUpdated: Timestamp.now().toDate(),
      version: summary ? summary.version + 1 : 1,
      generatedAtReplyCount: currentReplyCount,
    };

    await updateDoc(questionRef, { summary: newSummary });

    console.log("Summary successfully updated.");
  } catch (error) {
    console.error("Error generating and updating summary:", error);
    throw error;
  }
};

// --- Helper function ---
const generateAMASummary = async (
  conversation: ConversationContext,
  previousSummary?: string
): Promise<string> => {
  const systemInstructions = `You are an assistant that creates very concise discussion summaries (150 words max). 
  Rules:
  1. Plain text only - no markdown or formatting
  2. Maximum 150 words
  3. Focus on key insights only
  4. Skip examples and details
  5. Use simple, direct language
  6. Structure as one short paragraph`;

  const prompt = `
    Question Title: ${conversation.question.title}
    Question Description: ${conversation.question.description}
    Asked by: ${conversation.question.author} on ${conversation.question.date}

    ${
      previousSummary
        ? `Previous Summary (for reference only):\n${previousSummary}\n\n`
        : ""
    }

    Replies:
    ${conversation.replies
      .map(
        (reply) =>
          `- ${reply.author} (${reply.date}): ${reply.content} ${
            reply.isTopLevel ? "(Top-level reply)" : ""
          }`
      )
      .join("\n")}

    Please generate a comprehensive summary of this conversation following the above guidelines.
    `;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemInstructions },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `OpenAI API Error: ${response.status} - ${await response.text()}`
    );
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "Unable to generate summary.";
};
