const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const axios = require("axios");
const { OpenAI } = require("openai");

admin.initializeApp();

// Define secrets
const openAiKey = defineSecret("OPENAI_API_KEY");
const geminiKey = defineSecret("GEMINI_API_KEY");

// Create empty exports structure scaffold
exports.validateDump = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    try {
        const text = req.body.text || req.body.data?.text;
        if (!text) {
            return res.status(400).json({ error: "Missing text in request body" });
        }

        const prompt = `You are an AI analyzing a student's input.
Determine if the following text is a "personal study reflection/brain dump" or a "general/academic question".
A brain dump is where a student reflects on what they studied, what they understood, or what confused them.
A general question is when they are asking for facts, concepts to be explained, or direct answers (e.g. "What is Newton's second law?").
If it is a general question, set redirect to "tutor", valid to false.
Otherwise, it is a valid reflection, set valid to true, redirect to null.
Provide a short reason.
Output strictly as JSON in the following format, with no markdown formatting or backticks:
{ "valid": true/false, "reason": "string", "redirect": "tutor" | null }

Input text: "${text}"`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.value()}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        let rawResult = response.data.candidates[0].content.parts[0].text;
        // Clean markdown backticks if they are returned
        rawResult = rawResult.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        const resultJson = JSON.parse(rawResult);

        return res.status(200).json(resultJson);

    } catch (err) {
        logger.error("Error in validateDump:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

exports.analyzeDump = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    try {
        const text = req.body.text || req.body.data?.text;
        const examType = req.body.examType || req.body.data?.examType || "general competitive exams";

        if (!text) {
            return res.status(400).json({ error: "Missing text in request body" });
        }

        const prompt = `You are an expert tutor AI analyzing a student's brain dump for the ${examType} exam.
Analyze the following text and extract these perfectly strictly formatted JSON fields:
1. "subject" (string): The broad subject detected (e.g. Physics, History, etc.)
2. "topic" (string): The specific topic within the subject they are discussing.
3. "confidence" (number 1-5): How confident they seem based on their words (1=Very Low, 5=Very High).
4. "focusQuality" (object): {"score": number 0-100, "label": "string"}.
5. "patternObservation" (string): One specific, dynamic observation about their specific study pattern or mindset based strictly on the text.
6. "practiceQuestions" (array of exactly 3 objects): Generate 3 dynamic, challenging multiple-choice questions specifically based on the topic they struggled with or mentioned, tailored for the exact level of the ${examType} exam. Each must have {"question": string, "options": string array of 4 choices, "answer": string exact matching one option, "explanation": string why it is correct}.

IMPORTANT: Every response MUST be dynamic. Do not reuse generic templates. It must directly respond to their specific confusion or topic.
Return ONLY valid JSON. Keep formatting clean without markdown wrapping.

Input text: "${text}"`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.value()}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        let rawResult = response.data.candidates[0].content.parts[0].text;
        rawResult = rawResult.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        const resultJson = JSON.parse(rawResult);

        return res.status(200).json(resultJson);

    } catch (err) {
        logger.error("Error in analyzeDump:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

exports.tutorChat = onRequest({ secrets: [openAiKey], cors: true }, async (req, res) => {
    try {
        const messages = req.body.messages || req.body.data?.messages;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Missing or invalid messages array" });
        }

        const openai = new OpenAI({ apiKey: openAiKey.value() });

        // Ensure system prompt is present to enforce strict tutoring behavior
        const systemPrompt = "You are an expert tutor for Indian competitive exam students preparing for JEE, NEET, UPSC or CAT. Answer only study and exam related questions. If asked anything unrelated to academics or exams, politely decline and bring the conversation back to studying.";
        
        // Prefix system prompt appropriately if not managing full history perfectly
        const apiMessages = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: apiMessages,
        });

        const reply = completion.choices[0].message.content;
        return res.status(200).json({ reply });

    } catch (err) {
        logger.error("Error in tutorChat:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

exports.clarifyDecision = onRequest({ secrets: [geminiKey] }, async (req, res) => {
    // Access secret securely: geminiKey.value()
    // Function logic goes here
    res.status(200).send("clarifyDecision scaffold");
});
