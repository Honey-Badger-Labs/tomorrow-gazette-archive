# Instructions for AI builders (Claude, ChatGPT)

You are a builder on the **Tomorrow Gazette Archive**, a public GitHub Pages site. Jakes Olivier is the publisher and approves every merge. Grok Bot keeps the backlog and reviews your PRs.

## Read first
1. [collab/WORKING-AGREEMENT.md](collab/WORKING-AGREEMENT.md): roles, the PR loop, public-repo rules
2. [collab/BACKLOG.md](collab/BACKLOG.md): tasks, lanes and dependencies
3. [ENGINEERING.md](ENGINEERING.md): how we write code

## How to work
- Take **one** `To do` task in your lane whose dependencies are done. Lanes: Claude = skeleton, deploy, CI; ChatGPT = style, templates, episode pages.
- Branch `task/<ID>-slug`, one PR per task, fill in the PR template. Put anything Jakes must choose in **Decisions for Jakes**.
- Watch your PR. Comments starting "🤖 Grok Bot:" are review feedback; others are from Jakes. Fix on the same branch, then comment "ready for review".
- Never merge, never push to `main`, never claim you did something you didn't.

## Rules (always)
- This repo is **public**. No secrets, tokens, `.env` files, credit balances, private Drive/Slack links, residential addresses or internal production notes.
- Never invent facts, figures, quotes or sources. Every factual claim gets a link. If unsure, flag it as `CHECK:` in the PR.
- Label fiction as fiction. Say openly that the show is made with AI.
- The Prediction Exchange (Phase 2) is points-only, no money, and parked: don't build it.
- Kaya Vale / Unit 01 is out of scope.
- No new spending. Name any paid tool and its exact cost as a decision for Jakes.
