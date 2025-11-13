import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Simple root route so we can test that the server is online
app.get("/", (req, res) => {
  res.send("AI Lead Scorer Backend is running 🚀");
});

// ---------- CORE SCORING LOGIC ---------- //

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
      "Limited time for high-value activities (closings, networking)",
    ];
  }

  if (buyingSignals.length === 0) {
    buyingSignals = [
      "Active Instagram presence (values digital tools)",
      "Professional presentation (invests in business growth)",
    ];
  }

  let pitchAngle = "";
  let dmOpener = "";
  let closeProbability = 0;

    if (buyScore >= 8) {
    pitchAngle = "TIME FREEDOM & SCALING";
    closeProbability = Math.floor(30 + Math.random() * 20);
    dmOpener = `Hey ${username} — my AI caller is already booking 30–40 appointments/month for Dubai agents.

You’d still approve the script and leads, the AI just does the boring dials for you. Want a 60-second demo?`;
  } else if (buyScore >= 6) {
    pitchAngle = "CONSISTENCY & PREDICTABILITY";
    closeProbability = Math.floor(20 + Math.random() * 15);
    dmOpener = `Hey ${username}, quick q:

If I could make your lead flow look less “good month / bad month” and more “steady 20–30 appointments every month” using an AI caller, would you be open to seeing how?`;
  } else {
    pitchAngle = "COMPETITIVE ADVANTAGE";
    closeProbability = Math.floor(10 + Math.random() * 15);
    dmOpener = `Hey ${username} — a lot of Dubai agents are quietly using AI callers to make 1,500–3,000 calls/month while they focus on closings.

Curious to see how that would look for your numbers?`;
  }

  const objections = [
    {
      objection: '"How much does it cost?"',
      handler:
        '"Great question! We have packages from AED 1,750 to AED 12,850/month depending on call volume. Most agents see 10x ROI in month 1. Want me to show you the breakdown for your volume?"',
    },
    {
      objection: '"I need to think about it"',
      handler:
        '"Totally fair. Most agents say that at first. Can I ask - is it the investment, or are you unsure if it\'ll work for your market? (Address the REAL concern)"',
    },
    {
      objection: '"Does it sound robotic?"',
      handler:
        '"That\'s exactly what I thought at first! Want me to send you a 30-second recording? You literally can\'t tell it\'s AI. That\'s why our agents are booking 30-40 appointments/month with it."',
    },
  ];

  const priority =
    buyScore >= 8 ? "HIGH" : buyScore >= 6 ? "MEDIUM" : "LOW";

  const aiInsight =
    buyScore >= 8
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
    aiInsight,
  };
}

// ---------- API ENDPOINT ---------- //

app.post("/score-leads", (req, res) => {
  const { usernames } = req.body;

  if (!Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: "usernames[] is required" });
  }

  const cleaned = usernames
    .map((u) => (u || "").trim())
    .filter((u) => u.length > 0);

  if (cleaned.length === 0) {
    return res.status(400).json({ error: "No valid usernames provided" });
  }

  const results = cleaned.map(scoreLead);
  results.sort((a, b) => b.buyScore - a.buyScore);

  res.json({ results });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
