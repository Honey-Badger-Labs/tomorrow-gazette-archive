# Working agreement

*Version 0.1, 15 Oct 2026. Adapted from the Kaya Vale and Tomorrow Gazette hubs, cut down for a small website repo.*

## 1. Roles

| Who | Role | In plain words |
|---|---|---|
| **Jakes Olivier** | Publisher and approver | Sets direction, makes the decisions, approves every merge. |
| **Grok Bot** | Reviewer, backlog owner, merger | Keeps the backlog, reviews every PR, merges **only after Jakes says OK**. |
| **Claude** | Lead builder | Site skeleton, deploy, CI, and anything structural. |
| **ChatGPT** | Second builder and reviewer | Templates, style, content pages; can review Claude's PRs when asked. |

Builders build. Grok Bot checks. Jakes approves.

## 2. The loop

1. Pick a task from [BACKLOG.md](BACKLOG.md) that is `To do` and assigned to you (or unassigned and in your lane). Set it to `In progress` in your PR.
2. **One task per branch**: `task/<ID>-short-slug`, e.g. `task/A-T2-site-skeleton`.
3. **One PR per task.** Fill in the PR template, including **Decisions for Jakes** at the top.
4. Grok Bot reviews. Feedback arrives as PR comments starting **"🤖 Grok Bot:"**. Comments without the prefix are from Jakes.
5. Push fixes to the **same branch**, then comment "ready for review".
6. Jakes approves; Grok Bot (or Jakes) merges. Builders never merge and never push to `main`.

## 3. Avoiding overlap

- Only one builder per task. If a task is `In progress`, leave it alone.
- If your task needs another task's output, wait for it to merge, or say so in the PR.
- Claude and ChatGPT can't see each other's chats. The repo is the only shared memory: write it down here or it didn't happen.

## 4. Public-repo rules (always)

- No secrets, API keys, tokens, passwords or `.env` files.
- No credit balances, costs of internal tools, or private Drive/Slack links.
- No residential addresses. If a location is ever needed: *Eldoraigne, Centurion, Gauteng, South Africa*.
- No internal production notes (scripts in progress, prompts, review threads). Publish finished episode info only.
- Every factual claim is sourced with a link. Fiction is labelled as fiction.
- Kaya Vale / Unit 01 is a separate project and is out of scope here.
- No new spending. If a paid tool would help, name it and its exact cost in **Decisions for Jakes**.

## 5. Status values

`To do` → `In progress` → `Review` → `Done` (or `Blocked`, with a reason).
