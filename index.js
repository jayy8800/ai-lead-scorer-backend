import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("AI Lead Scorer backend is running ✅");
});

// simple stub logic for now
async function scoreLead(username) {
  const clean = username.toLowerCase().trim();

  let buyScore = 5;
  if (clean.includes("dubai") || clean.includes("dxb")) buyScore += 2;
  if (clean.includes("real") || clean.includes("estate")) buyScore += 2;
  buyScore = Math.min(10, buyScore + Math.floor(Math.random() * 2));

  return {
    username,
    buyScore,
    priority: buyScore >= 8 ? "HIGH" : buyScore >= 6 ? "MEDIUM" : "LOW",
    businessStage: "Unknown",
    techOpenness: "MEDIUM",
    aiInsight: "Stub result from backend – real data coming soon.",
    painPoints: ["Stub: pain points will be based on IG content."],
    buyingSignals: ["Stub: buying signals will use engagement + profile bio."],
    pitchAngle: "TIME FREEDOM & SCALING",
    dmOpener: `Hey ${username}, this is a stub result from the backend.`,
    closeProbability: 25,
    objections: []
  };
}

app.post("/score-leads", async (req, res) => {
  try {
    const usernames = req.body.usernames || [];
    if (!Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ error: "usernames[] required" });
    }

    const results = [];
    for (const u of usernames) {
      results.push(await scoreLead(u));
    }

    results.sort((a, b) => b.buyScore - a.buyScore);
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
