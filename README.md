# 💼🛡️ OfferGuard — Fake Job Offer Checker

**Real jobs never ask you to pay.**

In an Indeed survey of 1,161 Indian job seekers, **93% had encountered suspicious or fraudulent job opportunities** and **51% couldn't confidently tell a genuine recruiter from a scammer**. Freshers are hit hardest. Fake offers steal registration fees, Aadhaar/PAN/bank details — and the worst variant traffics people to scam compounds abroad on fake "IT job" offers (the Indian government has rescued **2,907 people** from Myanmar, Cambodia and Laos).

Basic checkers exist, but none combine detection, verification, training and tracking — in Indian languages, offline, free. **OfferGuard does.**

🔗 **Try it live:** https://haminyovanantonyfk-netizen.github.io/offer-guard/
📱 **Android:** build the APK from the Actions tab (or publish a Release with a `v*` tag) · **iPhone:** open the live link in Safari → Share → Add to Home Screen.

## What it does

- **🔍 Offer checker** — paste any job post, WhatsApp/Telegram message, email or offer letter. 15 weighted pattern detectors (fee/deposit demands, documents-before-offer, task/recharge scams, overseas-agent traps, government-job impersonation, guaranteed selection, unrealistic pay, WhatsApp-only hiring, crypto salary, MLM…) produce a **0–100 scam score** with every trick named.
- **🌐 Recruiter & domain analysis** — extracts every email/website in the text and flags free-mail recruiters (Gmail "HR") and **look-alike domains** (e.g. `wipro-careers.in` imitating `wipro.com`), with a built-in table of real domains for major Indian employers and government bodies.
- **✅ Guided verification** — an 8-step checklist that genuine employers always pass: official careers page, real-domain email, callback on the official number, MCA company registry, and more.
- **✈️ Overseas-agent module** — the anti-trafficking checks: eMigrate-registered agents only, the legal fee cap of **₹30,000 + GST**, work visa (never tourist visa), never surrender your passport, MEA helpline **1800-11-3090**.
- **🎭 Practice drills** — three scripted scams with scored choices: the WhatsApp "TCS HR" offer, a fake India Post selection letter, and the "Thailand IT job" funnel.
- **📋 Application tracker** — every real application in one list, with verified/scam status.
- **🧾 Evidence locker + report flow** — save scam messages and numbers with dates, export them as a file, and report fast: **1930** and cybercrime.gov.in.
- **🖨️ Printable verification card** — the six rules to check before paying or sharing documents.
- **🌍 English · हिन्दी · മലയാളം** — because the targets are freshers and their families, not English-speaking Twitter.

## Privacy

No account. No server. No analytics. Offers you paste are checked **on your device only**; your tracker and evidence live in your own browser. The app works fully offline.

## Honest limits

OfferGuard reads the *text* of an offer — a scammer's polished letter can score low while still being fake, which is why the Verify checklist matters: treat a low score as "no tricks found", never as proof. And a small genuine business may recruit from a Gmail address; the checker flags it as a caution, not a verdict. When money or documents are involved, verify independently, every time.

## Run it yourself

```bash
git clone https://github.com/haminyovanantonyfk-netizen/offer-guard
cd offer-guard
npx serve .
```

Plain HTML/CSS/JS — no build step. `ci/` contains the GitHub Actions workflows (copy to `.github/workflows/`): GitHub Pages deploy, Android APK (Capacitor), iOS build.

## License

MIT — free for everyone, forever. If OfferGuard saves one fresher's savings — or one person's freedom — it has done its job.
