const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Gemini Narrative Intelligence Service
 * Handles story enhancement, title generation, and dual-language translation.
 */
class GeminiService {
  constructor() {
    this.disabled = !process.env.GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    if (!this.disabled) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      this.fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
  }

  /**
   * Private helper to execute Gemini requests with retry and fallback logic
   */
  async _callWithRetry(prompt) {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let lastError;
    let result;

    // Try primary model with 2 retries on 503
    for (let i = 0; i < 2; i++) {
      try {
        result = await this.model.generateContent(prompt);
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        if (err.message.includes('503')) {
          console.warn(`Primary model 503 error, retrying in 2s... (Attempt ${i + 1}/2)`);
          await sleep(2000);
        } else {
          break;
        }
      }
    }

    // Fallback if primary failed definitively
    if (lastError) {
      console.warn(`Primary model failed definitively (${lastError.message}), trying fallback model...`);
      if (!this.fallbackModel) throw lastError;
      result = await this.fallbackModel.generateContent(prompt);
    }

    const response = await result.response;
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("Gemini returned no candidates (blocked content).");
    }
    return response.text().trim();
  }

  /**
   * Performs a comprehensive analysis of the story narrative.
   * Generates enhanced prose, titles, and translations in a single pass.
   */
  async analyzeStory(originalContent, sourceLang = 'en') {
    if (this.disabled || !process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY missing. AI intelligence disabled.");
      return null;
    }
    if (!this.model) {
      console.warn("Gemini model not initialized. AI intelligence disabled.");
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
      const text = await this._callWithRetry(prompt);
      
      // Extract JSON if AI surrounds it with markdown blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Analysis Failure:", error.message);
      throw error;
    }
  }

  /**
   * Refines or rewrites a story based on a specific user instructions (prompt).
   */
  async refineStory(content, userPrompt, lang = 'en') {
    console.log("AI Refine Request Received..."); // DEBUG LOG
    
    if (this.disabled || !this.model) {
      console.warn("AI Refine aborted: Service is disabled or model not initialized.");
      return null;
    }

    const prompt = `
      You are an elite horror editorial AI. 
      Your task is to rewrite the story provided below following the user's instruction.
      
      STORY: "${content}"
      INSTRUCTION: "${userPrompt}"
      
      CRITICAL: Output ONLY the raw story text. Do not include any introductory text, labels, or conversational filler.
    `;

    try {
      return await this._callWithRetry(prompt);
    } catch (error) {
      console.error("CRITICAL Gemini Error:", error.message);
      throw error;
    }
  }
}

module.exports = new GeminiService();
