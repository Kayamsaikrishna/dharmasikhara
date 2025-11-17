const { GoogleGenerativeAI } = require("@google/generative-ai");

class LegalAIController {
  constructor() {
    // Use environment variable for API key
    this.geminiAPIKey = process.env.GEMINI_API_KEY;

    console.log('🔑 GEMINI_API_KEY:', this.geminiAPIKey ? 'CONFIGURED' : 'MISSING');

    if (this.geminiAPIKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.geminiAPIKey);
        this.model = this.genAI.getGenerativeModel({ 
          model: "models/gemini-2.0-flash",
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7
          }
        });
        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.error('❌ Gemini initialization error:', error);
        this.model = null;
      }
    } else {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      this.model = null;
    }
  }

  /** Check AI Status */
  async getAIStatus(req, res) {
    try {
      if (this.model) {
        res.json({
          success: true,
          data: { 
            modelAvailable: true, 
            message: 'Gemini AI ready',
            model: 'models/gemini-2.0-flash'
          }
        });
      } else {
        res.status(503).json({
          success: false,
          message: 'Gemini AI not configured. Check GEMINI_API_KEY environment variable.'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking AI status: ' + error.message
      });
    }
  }

  /** Analyze Document */
  async analyzeDocument(req, res) {
    try {
      if (!this.model) {
        return res.status(503).json({ 
          success: false, 
          message: 'AI model not available. Please configure GEMINI_API_KEY.' 
        });
      }

      const { documentText } = req.body;
      if (!documentText) {
        return res.status(400).json({ 
          success: false, 
          message: 'Document text required' 
        });
      }

      // Truncate if too large
      let text = documentText;
      if (text.length > 500000) {
        console.log('⚠️ Document truncated from', text.length, 'to 500000 characters');
        text = text.substring(0, 500000);
      }

      const prompt = `Analyze this legal document and provide a JSON response with this exact structure:

{
  "document_type": "type of document (e.g., contract, agreement, notice)",
  "summary": "2-3 sentence summary",
  "key_terms": ["list", "of", "important", "legal", "terms"],
  "parties_involved": ["party names if mentioned"],
  "key_dates": ["dates found in document"],
  "monetary_values": ["amounts mentioned"],
  "legal_provisions": ["laws/sections referenced"],
  "risk_assessment": ["potential legal risks"],
  "recommended_actions": ["suggested next steps"],
  "confidence": 0.85
}

Document:
${text}

Return ONLY valid JSON, no markdown or extra text.`;

      console.log('📤 Sending to Gemini...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      console.log('📥 Gemini response received');

      // Parse JSON from response
      let analysis;
      try {
        // Remove markdown code blocks if present
        let jsonText = responseText.trim();
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        analysis = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error, using fallback');
        analysis = {
          document_type: 'Unknown',
          summary: responseText.substring(0, 300),
          key_terms: [],
          parties_involved: [],
          key_dates: [],
          monetary_values: [],
          legal_provisions: [],
          risk_assessment: [],
          recommended_actions: [],
          confidence: 0.5
        };
      }

      // Enhance result
      const enhancedResult = {
        document_length: documentText.length,
        token_count: Math.floor(documentText.length / 4),
        document_type: analysis.document_type || 'Unknown',
        summary: analysis.summary || 'No summary available',
        key_terms: analysis.key_terms || [],
        parties_involved: analysis.parties_involved || [],
        key_dates: analysis.key_dates || [],
        monetary_values: analysis.monetary_values || [],
        legal_provisions: analysis.legal_provisions || [],
        risk_assessment: analysis.risk_assessment || [],
        recommended_actions: analysis.recommended_actions || [],
        document_structure: {},
        confidence: analysis.confidence || 0.75
      };

      res.json({ success: true, data: enhancedResult });
    } catch (error) {
      console.error('❌ Document analysis error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Analysis failed: ' + error.message 
      });
    }
  }

  /** Legal Assistant Response */
  async getLegalAssistantResponse(req, res) {
    try {
      if (!this.model) {
        return res.status(503).json({ 
          success: false, 
          message: 'AI model not available. Please configure GEMINI_API_KEY.' 
        });
      }

      const { query, documentContext, documentAnalysis } = req.body;
      if (!query) {
        return res.status(400).json({ 
          success: false, 
          message: 'Query required' 
        });
      }

      let prompt = `You are an AI Legal Assistant specializing in Indian Law. Provide clear, accurate legal guidance.

User Question: ${query}`;

      if (documentContext) {
        prompt += `\n\nDocument Context Available: Yes
Document Type: ${documentAnalysis?.document_type || 'Unknown'}
Key Terms: ${documentAnalysis?.key_terms?.join(', ') || 'None'}

When answering, refer to the uploaded document where relevant.`;
      }

      prompt += `\n\nProvide a concise, focused response that directly answers the user's question. Avoid markdown formatting, bullet points, or excessive educational content. Just provide clear legal guidance in plain text. Keep the response under 300 words.`;

      console.log('📤 Generating legal response...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({ 
        success: true, 
        data: {
          response: text,
          answer: text, // Backward compatibility
          confidence: 0.90,
          legalCategory: documentAnalysis?.document_type || 'General Legal',
          relatedConcepts: documentAnalysis?.key_terms || [],
          sources: [
            'DharmaSikhara AI Legal Assistant',
            'Bharatiya Nyaya Sanhita (BNS)',
            'Bharatiya Nagarik Suraksha Sanhita (BNSS)',
            'Bharatiya Sakshya Adhiniyam (BSA)',
            'Constitution of India'
          ]
        }
      });
    } catch (error) {
      console.error('❌ Legal assistant error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate response: ' + error.message 
      });
    }
  }
}

// Export singleton instance
const aiController = new LegalAIController();

module.exports = {
  getAIStatus: aiController.getAIStatus.bind(aiController),
  analyzeDocument: aiController.analyzeDocument.bind(aiController),
  getLegalAssistantResponse: aiController.getLegalAssistantResponse.bind(aiController)
};