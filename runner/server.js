import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ ok: true, service: "ai-user-simulator-runner" });
});

app.post("/run", async (req, res) => {
  const { url, goal } = req.body || {};

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "url must start with http(s)" });
  }
  if (!goal || goal.length < 5) {
    return res.status(400).json({ error: "goal too short" });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const frictions = [];
  const steps = [];

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const title = await page.title();
    const finalUrl = page.url();

    const buttons = await page.locator("button").count();
    if (buttons < 2) frictions.push("Very few visible actions on first screen");

    steps.push({ step: "Opened page", note: title });

    const screenshot = await page
      .screenshot({ type: "jpeg", quality: 60 })
      .then((b) => b.toString("base64"));

    res.json({
      ok: true,
      confidence_score: Math.max(40, 100 - frictions.length * 10),
      ux_frictions: frictions,
      steps,
      evidence: {
        title,
        finalUrl,
        screenshot_base64: screenshot
      }
    });
  } catch (e) {
    res.status(500).json({ error: "runner_failed", details: String(e) });
  } finally {
    await browser.close();
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Runner listening on", port);
});