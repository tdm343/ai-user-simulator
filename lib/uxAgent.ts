import { chromium } from "playwright";

export async function runUXSimulation({
  url,
  goal,
}: {
  url: string;
  goal: string;
}) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const frictions: string[] = [];

  try {
    // 1) Open page
    await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
    frictions.push("Page loaded. Evaluating first-screen clarity.");

    // 2) Count clickable elements
    const clickableCount = await page.locator("button, a, input[type=submit]").count();
    if (clickableCount < 3) {
      frictions.push("Low action discoverability: very few visible clickable elements.");
    }

    // 3) Detect a visible CTA button
    const btn = page.locator("button:visible").first();
    const txt = (await btn.textContent().catch(() => ""))?.trim() || "";
    if (!txt) {
      frictions.push("Primary CTA is unclear or not visible on first screen.");
    } else {
      frictions.push(`Visible CTA found: "${txt}". But it may not match the user goal.`);
    }

    // 4) Scroll heuristic
    await page.mouse.wheel(0, 900);
    frictions.push("User had to scroll to understand next step (potential first-screen clarity issue).");

    // 5) Very rough goal alignment check
    const goalLower = goal.toLowerCase();
    if (goalLower.includes("login") || goalLower.includes("sign") || goalLower.includes("register")) {
      const loginCount = await page.locator("text=/login|sign in|sign up|register/i").count();
      if (loginCount === 0) {
        frictions.push("Goal mentions login/signup, but user cannot quickly find it on the page.");
      }
    } else {
      frictions.push("User goal is not obviously supported by first-screen navigation.");
    }

    const score = Math.max(40, 100 - frictions.length * 8);
    return { score, frictions };
  } catch (e) {
    return {
      score: 30,
      frictions: ["User could not complete basic interaction: page failed to load or blocked automation."],
    };
  } finally {
    await browser.close();
  }
}