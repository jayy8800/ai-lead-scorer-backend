import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "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"
});

app.get("/", (req, res) => {
  res.send("AI Lead Scorer Backend is running 🚀");
});

// ============= DEMO MODE: Rule-based scoring =============
function scoreLead(usernameRaw) {
  const username = usernameRaw.trim().replace("@", "");
  const clean = username.toLowerCase();

  let buyScore = 5;
  let painPoints = [];
  let buyingSignals = [];
  let techOpenness = "MEDIUM";
  let businessStage = "Established";

  if (clean.includes("real") || clean.includes("property") || clean.includes("estate")) {
    buyScore += 2;
    buyingSignals.push("Real estate focus in username");
  }
  if (clean.includes("dubai") || clean.includes("uae") || clean.includes("dxb")) {
    buyScore += 2;
    buyingSignals.push("Dubai-based agent");
  }
  if (clean.includes("broker") || clean.includes("agent")) {
    buyScore += 1;
    businessStage = "Professional";
  }
  if (clean.includes("luxury") || clean.includes("premium")) {
    buyScore += 1;
    buyingSignals.push("High-ticket sales (can afford premium tools)");
  }
  if (clean.includes("team") || clean.includes("group")) {
    businessStage = "Team Leader";
    buyScore += 2;
    buyingSignals.push("Leads a team (bigger pain = higher willingness to pay)");
  }

  const painKeywords = ["busy", "time", "scale", "grow", "tired", "calls", "leads"];
  painKeywords.forEach((keyword) => {
    if (clean.includes(keyword)) {
      painPoints.push(`Username suggests ${keyword}-related pain point`);
      buyScore += 1;
    }
  });

  if (clean.includes("tech") || clean.includes("digital") || clean.includes("smart")) {
    techOpenness = "HIGH";
    buyScore += 2;
    buyingSignals.push("Tech-forward positioning");
  }

  buyScore += Math.floor(Math.random() * 2);
  buyScore = Math.min(10, buyScore);

  if (painPoints.length === 0) {
    painPoints = [
      "Likely spending 2-4 hours/day on manual cold calling",
      "Inconsistent lead pipeline (based on typical agent patterns)",
      "Limited time for high-value activities (closings, networking)"
    ];
  }

  if (buyingSignals.length === 0) {
    buyingSignals = [
      "Active Instagram presence (values digital tools)",
      "Professional presentation (invests in business growth)"
    ];
  }

  let pitchAngle = "";
  let dmOpener = "";
  let closeProbability = 0;

  if (buyScore >= 8) {
    pitchAngle = "TIME FREEDOM & SCALING";
    closeProbability = Math.floor(30 + Math.random() * 20);
    dmOpener = `Hey ${username}! Quick question - if you could free up 2-3 hours/day that you currently spend cold calling and turn that into 30-40 qualified appointments automatically, would that be worth a conversation?`;
  } else if (buyScore >= 6) {
    pitchAngle = "CONSISTENCY & PREDICTABILITY";
    closeProbability = Math.floor(20 + Math.random() * 15);
    dmOpener = `${username} - saw your profile and had to ask: how predictable is your monthly appointment flow right now? Most agents tell me it's up and down. What if it didn't have to be?`;
  } else {
    pitchAngle = "COMPETITIVE ADVANTAGE";
    closeProbability = Math.floor(10 + Math.random() * 15);
    dmOpener = `Hey ${username}! The top Dubai agents are using AI to make 1,500-3,000 calls/month on autopilot. Want to see how they're doing it before your competitors catch on?`;
  }

  const objections = [
    {
      objection: '"How much does it cost?"',
      handler: '"Great question! We have packages from AED 1,750 to AED 12,850/month depending on call volume. Most agents see 10x ROI in month 1. Want me to show you the breakdown for your volume?"'
    },
    {
      objection: '"I need to think about it"',
      handler: '"Totally fair. Most agents say that at first. Can I ask - is it the investment, or are you unsure if it\'ll work for your market? (Address the REAL concern)"'
    },
    {
      objection: '"Does it sound robotic?"',
      handler: '"That\'s exactly what I thought at first! Want me to send you a 30-second recording? You literally can\'t tell it\'s AI. That\'s why our agents are booking 30-40 appointments/month with it."'
    }
  ];

  const priority = buyScore >= 8 ? "HIGH" : buyScore >= 6 ? "MEDIUM" : "LOW";
  const aiInsight = buyScore >= 8
    ? "This lead shows strong buying signals. Prioritize for immediate outreach."
    : buyScore >= 6
    ? "Qualified lead with moderate intent. Good prospect for follow-up sequence."
    : "Lower priority. Consider for nurture campaign or revisit later.";

  return {
    username,
    buyScore,
    painPoints,
    buyingSignals,
    techOpenness,
    businessStage,
    pitchAngle,
    dmOpener,
    closeProbability,
    objections,
    priority,
    aiInsight
  };
}

// ============= PRO MODE: OpenAI-powered scoring =============
async function scoreLeadPro(usernameRaw) {
  const username = usernameRaw.trim().replace("@", "");
  
  try {
    const prompt = `You are an expert sales intelligence analyst for Dubai real estate agents.

Analyze this Instagram username: "${username}"

Based on the username patterns, provide a detailed lead analysis in JSON format:

{
  "buyScore": <number 1-10>,
  "priority": "<HIGH|MEDIUM|LOW>",
  "businessStage": "<string>",
  "techOpenness": "<HIGH|MEDIUM|LOW>",
  "painPoints": [<array of 3-4 specific pain points>],
  "buyingSignals": [<array of 3-4 buying signals>],
  "pitchAngles": [
    {
      "angle": "<pitch angle name>",
      "dmOpener": "<personalized DM opener for this angle>"
    },
    {
      "angle": "<different angle>",
      "dmOpener": "<different DM opener>"
    },
    {
      "angle": "<third angle>",
      "dmOpener": "<third DM opener>"
    }
  ],
  "linkedinStrategy": "<1-2 sentence strategy for finding them on LinkedIn>",
  "outreachMethod": "<recommended outreach sequence: DM-first, LinkedIn-first, or hybrid>",
  "aiSummary": "<2-3 sentence executive summary of this lead>",
  "recommendedNextAction": "<specific next step to take>",
  "closeProbability": <number 10-50>,
  "objections": [
    {
      "objection": "<likely objection>",
      "handler": "<how to handle it>"
    }
  ]
}

Be specific, actionable, and personalized. Focus on Dubai real estate context.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a sales intelligence expert. Always respond with valid JSON only, no markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const rawResponse = completion.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    let jsonStr = rawResponse;
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }
    
    const aiResult = JSON.parse(jsonStr);
    
    return {
      username,
      ...aiResult
    };
  } catch (error) {
    console.error("OpenAI Error:", error);
    
    // Fallback to enhanced rule-based if AI fails
    const basicScore = scoreLead(username);
    return {
      username,
      buyScore: basicScore.buyScore,
      priority: basicScore.priority,
      businessStage: basicScore.businessStage,
      techOpenness: basicScore.techOpenness,
      painPoints: basicScore.painPoints,
      buyingSignals: basicScore.buyingSignals,
      pitchAngles: [
        {
          angle: "TIME FREEDOM",
          dmOpener: basicScore.dmOpener
        },
        {
          angle: "REVENUE GROWTH",
          dmOpener: `${username} - quick question: if you could double your appointments without hiring more people, would that interest you?`
        },
        {
          angle: "COMPETITIVE EDGE",
          dmOpener: `Hey ${username}, the top agents in Dubai are using AI calling. Want to see what they're doing before everyone else catches on?`
        }
      ],
      linkedinStrategy: "Search for their name + 'Dubai real estate' on LinkedIn, look for RERA certification in profile",
      outreachMethod: "DM-first strategy (warm up with 2-3 likes, then send personalized DM)",
      aiSummary: basicScore.aiInsight,
      recommendedNextAction: "Start with Instagram engagement, then send DM using TIME FREEDOM angle",
      closeProbability: basicScore.closeProbability,
      objections: basicScore.objections,
      _fallback: true
    };
  }
}

// ============= ENDPOINTS =============

// Demo endpoint
app.post("/score-leads", (req, res) => {
  const { usernames } = req.body;

  if (!Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: "usernames[] is required" });
  }

  const cleaned = usernames.map((u) => (u || "").trim()).filter((u) => u.length > 0);

  if (cleaned.length === 0) {
    return res.status(400).json({ error: "No valid usernames provided" });
  }

  const results = cleaned.map(scoreLead);
  results.sort((a, b) => b.buyScore - a.buyScore);

  res.json({ results, mode: "demo" });
});

// Pro endpoint with OpenAI
app.post("/score-leads-pro", async (req, res) => {
  const { usernames } = req.body;

  if (!Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: "usernames[] is required" });
  }

  const cleaned = usernames.map((u) => (u || "").trim()).filter((u) => u.length > 0);

  if (cleaned.length === 0) {
    return res.status(400).json({ error: "No valid usernames provided" });
  }

  try {
    // Process leads sequentially to avoid rate limits
    const results = [];
    for (const username of cleaned) {
      const result = await scoreLeadPro(username);
      results.push(result);
    }
    
    results.sort((a, b) => b.buyScore - a.buyScore);
    res.json({ results, mode: "pro" });
  } catch (error) {
    console.error("Pro scoring error:", error);
    res.status(500).json({ error: "Failed to process leads", details: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
