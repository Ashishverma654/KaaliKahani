const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Gemini Narrative Intelligence Service
 * Handles story enhancement, title generation, and dual-language translation.
 */
class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Performs a comprehensive analysis of the story narrative.
   * Generates enhanced prose, titles, and translations in a single pass.
   */
  async analyzeStory(originalContent, sourceLang = 'en') {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY missing. AI intelligence disabled.");
      return null;
    }

    const targetLang = sourceLang === 'en' ? 'hi' : 'en';
    const langName = sourceLang === 'en' ? 'English' : 'Hindi';
    const targetLangName = targetLang === 'en' ? 'English' : 'Hindi';

    const prompt = `
      You are an elite horror editorial AI. Analyze the following story provided in ${langName}.
      
      STORY CONTENT:
      "${originalContent}"

      TASK:
      1. ENHANCE: Improve the original story to make it more atmospheric, immersive, and emotionally resonant. Maintain the original meaning but elevate the prose. Prefer a first-person perspective. Keep it realistic and avoid cheesy tropes.
      2. TITLE: Generate a catchy, SEO-friendly title for this story.
      3. TRANSLATE ORIGINAL: Translate the ORIGINAL story provided above into ${targetLangName}.
      4. TRANSLATE ENHANCED: Translate your ENHANCED version into ${targetLangName}.
      5. SCORE: Provide a realism/believability score from 0 to 100 based on how grounded the horror feels.
      6. CLASSIFY: Classify into one of: real-horror, paranormal, haunted-places, urban-legends.

      Format your response ONLY as a valid JSON object with the following structure:
      {
        "enhancedContent": {
          "${sourceLang}": "enhanced version in ${langName}",
          "${targetLang}": "enhanced version in ${targetLangName}"
        },
        "originalTranslated": {
          "${targetLang}": "original story translated into ${targetLangName}"
        },
        "suggestedTitle": {
          "${sourceLang}": "suggested title in ${langName}",
          "${targetLang}": "suggested title in ${targetLangName}"
        },
        "realismScore": 85,
        "suggestedCategory": "paranormal"
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON if AI surrounds it with markdown blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Analysis Failure:", error.message);
      return null;
    }
  }
}

module.exports = new GeminiService();
