import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AIQuestion {
  title: string;
  text: string;
}

export interface GenerateQuestionsOptions {
  title: string;
  description?: string;
  questionCount?: number;
  difficulty?: "junior" | "mid" | "senior";
  categories?: string[]; // e.g., ['technical', 'behavioral', 'problem-solving']
}

export class AIInterviewer {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" }); // Lightweight model

  /**
   * Generate interview questions using AI
   */
  async generateQuestions(options: GenerateQuestionsOptions): Promise<AIQuestion[]> {
    try {
      const {
        title,
        description = "",
        questionCount = 5,
        difficulty = "mid",
        categories = ["technical", "behavioral", "problem-solving"],
      } = options;

      const prompt = this.buildPrompt(title, description, questionCount, difficulty, categories);

      console.log("Attempting to generate content with Gemini...");
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // console.log("Gemini response received:", text.substring(0, 200) + "...");

      // Clean the response text (remove any markdown formatting)
      let cleanText = text.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/```json\s*/, "").replace(/```\s*$/, "");
      }
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/```\s*/, "").replace(/```\s*$/, "");
      }

      // Parse the JSON response
      const questions = JSON.parse(cleanText);

      // Validate the response structure
      if (!Array.isArray(questions)) {
        console.error("AI response is not an array:", questions);
        throw new Error("AI response is not an array");
      }

      // Ensure each question has required fields
      const validQuestions = questions.filter(q => q && typeof q.title === "string" && typeof q.text === "string");

      if (validQuestions.length === 0) {
        console.error("No valid questions in response:", questions);
        throw new Error("No valid questions generated");
      }

      console.log(`Successfully generated ${validQuestions.length} questions`);
      return validQuestions.slice(0, questionCount);
    } catch (error) {
      console.error("Error generating AI questions:", error);

      // Check if it's a quota/rate limit issue
      if (error instanceof Error) {
        if (
          error.message.includes("429") ||
          error.message.includes("quota") ||
          error.message.includes("Too Many Requests")
        ) {
          console.log("Quota limit reached, but this is normal for free tier");
          throw new Error(
            "AI service is temporarily busy due to high demand. Using our expertly crafted fallback questions instead!"
          );
        }
        if (error.message.includes("API key")) {
          console.error("API key issue detected");
          throw new Error("Invalid API key. Please check your GEMINI_API_KEY environment variable.");
        }
        if (error.message.includes("not found") || error.message.includes("access")) {
          console.error("Model access issue detected");
          throw new Error("Model temporarily unavailable. Using our professional question templates!");
        }
      }

      // For any other error, use fallback with a positive message
      console.log("Using fallback questions due to AI error");
      throw new Error("AI service temporarily unavailable. Using our expertly crafted professional questions!");
    }
  }

  /**
   * Build the AI prompt for question generation
   */
  private buildPrompt(
    title: string,
    description: string,
    count: number,
    difficulty: string,
    categories: string[]
  ): string {
    return `You are a professional HR interviewer. Generate ${count} high-quality interview questions for a ${title} position.

${description ? `Job Description: ${description}\n` : ""}

Requirements:
- Target ${difficulty}-level candidates
- Include questions from these categories: ${categories.join(", ")}
- Make questions specific to the role and realistic
- Ensure questions help assess candidate fit
- Questions should be open-ended and encourage detailed responses

Return ONLY a valid JSON array in this exact format (no markdown, no explanation):
[
  {
    "title": "Experience Assessment", 
    "text": "Tell me about your experience with [specific skill/technology relevant to ${title}]. Can you walk me through a challenging project where you used this?"
  },
  {
    "title": "Problem Solving", 
    "text": "Describe a time when you faced a complex technical challenge in your role as a ${title}. How did you approach and solve it?"
  }
]

Generate exactly ${count} questions. Each question should be professional, relevant, and help evaluate the candidate's suitability for the ${title} role.`;
  }

  /**
   * Fallback questions if AI generation fails
   */
  public getFallbackQuestions(title: string): AIQuestion[] {
    return [
      {
        title: "Experience Overview",
        text: `Tell me about your background and experience relevant to the ${title} position.`,
      },
      {
        title: "Technical Challenge",
        text: `Describe a challenging technical problem you've solved in your career. Walk me through your approach.`,
      },
      {
        title: "Team Collaboration",
        text: `How do you handle working in a team environment? Can you give me an example of a successful collaboration?`,
      },
      {
        title: "Learning & Growth",
        text: `Tell me about a time when you had to learn a new technology or skill quickly. How did you approach it?`,
      },
      {
        title: "Future Goals",
        text: `Where do you see yourself growing in this role? What aspects of the ${title} position excite you most?`,
      },
    ];
  }

  /**
   * Analyze an answer (future feature)
   */
  async analyzeAnswer(
    question: string,
    answer: string
  ): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }> {
    // TODO: Implement answer analysis
    return {
      score: 0,
      feedback: "Answer analysis coming soon",
      strengths: [],
      improvements: [],
    };
  }
}

// Export singleton instance
export const aiInterviewer = new AIInterviewer();
