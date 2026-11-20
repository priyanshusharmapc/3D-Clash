# 3DClash for Kiroween 2026: what we build, and with what

This file explains five things in simple words:

1. [The project](#1-the-project): what we build for the Skeleton Crew category, and the pitch line.
2. [Replacing Meta](#2-replacing-meta): what takes the place of each Meta (Muse) model.
3. [Kiro inside the product](#3-kiro-inside-the-product): the Kiro Power, the Kiro CLI in GitHub, the Kiro Crew app.
4. [Every Kiro feature](#4-every-kiro-feature): what each one is and how we use it, with examples.
5. [The tech, by name](#5-the-tech-by-name): every tool, service and library, and why we picked it.

Nothing here is built yet. Written Nov 15, 2026.

## Words used in this file

| Word | Meaning |
|---|---|
| **Clash** | Two parts of a 3D design that sit in the same space (a pipe going through a beam), or sit too close together |
| **IFC** | The open file format for building models |
| **STEP** | The open file format for machine and product models |
| **Clearance** | The gap that must stay between two parts (for example 25 mm) |
| **Spec** | A Kiro plan for one feature: what it must do, how it is designed, and the list of tasks to build it |
| **Steering** | Notes about the project that Kiro reads before it works, so it knows the rules |
| **Hook** | An automatic action Kiro runs when something happens (a file is saved, a task ends) |
| **MCP** | A standard way for an AI agent to use outside tools. Our server speaks MCP, so Kiro can use it |
| **Kiro Power** | A package that adds a skill and tools to Kiro. Anyone can install it from GitHub |
| **Bedrock** | AWS's service for running AI models |

---

## 1. The project

### What 3DClash does

On a building or a machine, different teams design different parts. When their 3D designs are put together, parts
often bump into each other: a duct through a beam, a cable tray through a pipe. These are **clashes**.

Most tools stop at a list of clashes. 3DClash goes further:

1. It **finds** each clash.
2. An **AI suggests** one to three fixes, as real edits to the model (move this pipe up 400 mm, route this tray
   around the beam).
3. 3DClash **checks every fix with geometry**: is the clash gone, is there enough gap, does it hit anything new?
4. A fix that fails goes back to the AI **with the reason**, and the AI tries again.
5. Only fixes that pass reach the person. They look at them in 3D, keep one, and download the edited model.

### Why we enter Skeleton Crew

The Skeleton Crew category asks for **one lean starter template** and **two different apps built on it**, each
in its own folder.

3DClash's core idea already works this way. The loop (find, suggest, check, retry, rank) doesn't care whether the model
is a building or a machine. Only the rules change. So:

- **The template** is the loop and the geometry check, with no building or machine knowledge in it.
- **App 1** uses it for buildings.
- **App 2** uses it for machines.

This shows the judges the template really is reusable: two very different apps, the same core.

### The template (`template/`)

What is inside:

| Part | What it does |
|---|---|
| **Model loader** | A common interface: "give me the parts, their shapes and their positions". Each app plugs in its own loader |
| **Geometry check** | Answers three questions for any edit: is the clash gone, is the gap big enough, is anything new hit? |
| **The loop** | Asks the AI for fixes, checks each one, sends failures back with the reason, ranks the ones that pass |
| **Edits** | The kinds of change a fix can make: move, offset (with bends), trim, resize, reroute |
| **Ranking** | Orders the passing fixes (smallest change first, fewest parts touched) |
| **MCP server** | The same operations as tools any AI agent can call |
| **Viewer base** | The 3D view: before / after, ghosted context, section box, measure |
| **Rules file format** | How an app says what may move, what must stay, and the gap each kind of part needs |

What the template **does not** contain: any word like "duct", "beam", "conveyor" or "robot". Those live only in the
apps. (3DClash already had this rule: nothing names a demo or a domain outside its own folder.)

### App 1: buildings (`apps/building/`)

- **Opens:** IFC models from structure, building services (ducts, pipes, cable trays) and architecture.
- **Rules:** structure stays where it is; services move. Each service needs a gap from the beam (for example 25 mm,
  50 mm for ducts).
- **Demo:** a supply-air duct, a cable tray and a cold-water pipe all hitting the same steel beam. The AI raises the
  middle of each one over the beam, with bends either side, and the check proves each fix.
- **Out:** the edited IFC, a PDF report, BCF issues (the building industry's standard issue file).

### App 2: machines (`apps/machine/`)

- **Opens:** STEP assemblies, for example a robot palletising cell (robot, conveyor, safety fence, pallets).
- **Rules:** the robot base and the fence stay; brackets, guards and sensors may move. Moving parts need a bigger gap.
- **Demo:** a sensor bracket inside the robot's reach and a guard hitting the conveyor frame. The AI moves or trims
  them, and the check proves each fix.
- **Out:** the edited STEP file and a PDF report.

### Folder layout

```
template/             the core: loader interface, geometry check, loop, edits, ranking, MCP server, viewer base
apps/building/        app 1: IFC loader, building rules, building demo
apps/machine/         app 2: STEP loader, machine rules, machine demo
powers/3dclash/          the Kiro Power (section 3)
.kiro/                specs, steering, hooks, agents, MCP settings (section 4)
```

### The pitch

- **Main line:** *AI proposes, geometry proves, whether the AI is in our app or in your Kiro.*
- **Short line:** *Fixes, not just findings. Every fix proven before you see it.*
- **One sentence for the form:** 3DClash is a template for AI that fixes 3D designs: the AI suggests real edits,
  geometry proves each one before a person sees it, and two apps show it on buildings and on machines.


---

## 2. Replacing Meta

### The basic idea

**Kiro builds the app. It is not an AI the app can call.** So the Meta parts are replaced in two ways:

- The AI **inside the app** moves to **Amazon Bedrock** (AWS makes Kiro and sponsors the hackathon).
- The "bring your own AI agent" part becomes **Kiro itself** (section 3).

### The swap, one by one

| Old (Meta) | What it did | New | Why this one |
|---|---|---|---|
| **Muse Spark** | Looked at each clash (3 pictures plus the numbers), suggested fixes by calling our tools, ran the chat, wrote report text | **Claude Opus 5.5 on Bedrock** (`anthropic.claude-opus-5-5`) | Reads pictures, calls tools well, and is the same model family Kiro's own agent uses |
| **Muse Wonder** | A second, stronger try on clashes the first round couldn't fix | **The same Claude Opus 5.5, with the effort setting turned up** (`xhigh` or `max`) | One model, one prompt, one integration. Higher effort means it thinks longer on hard cases |
| **Muse Spark Open** (on Baseten) | Sorted hundreds of clashes (real problem or not, how serious) and gave each a short title | **Claude Haiku 5.5 on Bedrock** (`anthropic.claude-haiku-5-5`), sent as a **Bedrock batch job** | Fast and cheap for big lists; batch jobs cost less. All-Amazon option: Amazon Nova 2 Lite |
| **Muse Voice Transcribe** | Turned speech into text for voice commands and live captions | **Amazon Transcribe** (streaming). Optional: **Amazon Nova 2 Sonic** if the app should talk back | Transcribe does live captions well; Nova 2 Sonic is for two-way voice |
| **Muse Image** | "Show it built": redrew a checked fix as a realistic picture | **Removed** | Amazon's image model (Nova Canvas) reportedly reached end of life in Sept 2026. A well-lit three.js render of the fix shows the same thing without a model |
| **Muse Code** with pairing links | Let someone's own AI agent fix clashes through our MCP server | **Kiro**, through the **Kiro Power** | Kiro users install it in one step (section 3) |
| **`META_API_KEY`** | The secret key for Meta's API | **No key at all.** The server runs with an AWS **IAM role** that is allowed to call Bedrock | One less secret that can leak |
| **Modal** | Hosting | **Keep Modal**, or move to **Amazon ECS Fargate** (one container) | Judges don't score hosting. Fargate only if you want it all on AWS |

### How the loop uses the models

1. Person picks a clash and clicks **Propose fixes**.
2. The server sends **Claude Opus 5.5** the clash: three pictures, the two parts' names and sizes, the measured
   overlap, the rules (what may move, what gap is needed).
3. Claude answers with edits, by calling our tools (for example "offset this pipe up 0.40 m between x 2.6 and 4.4").
4. The **geometry check** tries each edit and measures the result.
5. A failed edit goes back to Claude with the reason ("hits the wall at x 3.1, 0.12 m overlap").
6. After the normal tries, still-unsolved clashes get **one more round at higher effort**.
7. Passing fixes are ranked and shown. **Claude Haiku 5.5** has already sorted and titled the clash list before
   any of this.

The AI never decides whether a fix is good. **Geometry decides.** That is why the AI can be swapped without losing
trust in the result.

### Calling Bedrock from Python

Use the Anthropic Python SDK's **`AnthropicBedrockMantle`** client. It needs an AWS region. It gets its permission
from the IAM role, so there is no API key in the code or in `.env`.

### Two things to know

- **Cost:** Bedrock charges per use. The hackathon gives Kiro credits, not AWS credits. Put a cap on proposals in the
  public demo and set an **AWS Budgets** alarm.
- **Access:** Bedrock may ask for a one-time form before Anthropic models work. Do it on day one, in the AWS region
  you will deploy to.

---

## 3. Kiro inside the product

Most projects use Kiro only to build. We also make Kiro **one of the ways people use 3DClash**. The same server works
in four places:

| Where | Who uses it | Who does the AI part | Who checks the fix |
|---|---|---|---|
| 1. The web app | Anyone with the link | Claude on Bedrock | Our geometry check |
| 2. Kiro, through the Power | A coordinator who uses Kiro | Kiro's own agent | Our geometry check |
| 3. GitHub, through the Kiro CLI | A team that keeps models in GitHub | Kiro, running with no person | Our geometry check |
| 4. Slack or Teams, through a Crew app | A team that wants a nightly report | Kiro Crew | Our geometry check |

In every case the check is ours, and nothing reaches a person without passing it.

### 3.1 The Kiro Power

**What it is:** a package that teaches Kiro how to fix clashes and gives it our tools. Anyone installs it in Kiro
with **"Import power from GitHub"**.

**What the person does** (an example to show the idea; the numbers are made up, not measured):

> **Person (in Kiro chat):** Open the Northbank models and fix clash 3.
>
> **Kiro:** Clash 3: cable tray LV-TRAY-L02-1 through the girder TB-L02-01, 400 mm overlap. I tried 3 fixes; 2
> passed the geometry check. Best: raise the middle of the tray 250 mm between x 2.6 and 4.4, with bends either
> side. 52 mm clear all round (25 mm needed), checked against 18 parts. Keep it?

**The files (Agent Plugins format, which Kiro recommends):**

```
powers/3dclash/
  plugin.json                  who made it, what it does, words that switch it on
  mcp.json                     how Kiro reaches the 3DClash server
  skills/fix-clashes/SKILL.md  the steps Kiro follows to fix a clash
```

`plugin.json` (add the `$schema` line from Kiro's docs):

```json
{
  "name": "3dclash",
  "version": "0.1.0",
  "description": "Find clashes in IFC and STEP models and fix them with edits proven by geometry",
  "author": { "name": "3DClash" },
  "keywords": ["clash", "ifc", "bim", "step", "coordination", "clearance"]
}
```

`mcp.json` (the address comes from the person's environment, never written in the file):

```json
{
  "mcpServers": {
    "3dclash": { "url": "${CLASH3D_MCP_URL}" }
  }
}
```

`SKILL.md` tells Kiro, in order:

1. List the open models and the clashes.
2. For the clash asked about, get the two parts, the overlap and the rules.
3. Suggest up to three edits.
4. Send each edit to the check tool. Read the result.
5. If an edit fails, read the reason and try a different edit.
6. Show only edits that passed, with the measured gap.
7. **Never keep an edit unless the person says so.** Keeping runs the check again on the server.

**Why judges care:** it uses three Kiro features at once (Powers, MCP, skills) and shows a real way for the product
to reach Kiro users.

### 3.2 The Kiro CLI in GitHub

**What it is:** Kiro can run with no person at the keyboard ("headless"). We run it in a **GitHub Action**: every
time a pull request changes a model file, Kiro checks it and writes a comment.

**What happens on a pull request:**

1. Someone changes `models/mep.ifc` and opens a pull request.
2. The Action starts the 3DClash server and Kiro.
3. Kiro (as the `clash-coordinator` agent) checks the changed model against the others.
4. For each new clash, it asks 3DClash for fixes. Only checked fixes are listed.
5. The Action posts a comment: "2 new clashes. Clash 1: duct through beam B-12, fix verified: raise 300 mm."

**A sketch of the Action** (check the flags against the Kiro CLI docs before using it):

```yaml
name: Kiro clash check
on:
  pull_request:
    paths: ["models/**/*.ifc", "models/**/*.step"]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Start the 3DClash server
        run: ./scripts/start-server.sh
      - name: Install the Kiro CLI
        run: curl -fsSL https://cli.kiro.dev/install | bash
      - name: Check the changed models
        env:
          KIRO_API_KEY: ${{ secrets.KIRO_API_KEY }}
        run: >
          kiro-cli chat --v3 --no-interactive --agent clash-coordinator
          "Check the changed models for new clashes and list only fixes that passed the check"
          > clash-report.md
      - name: Comment on the pull request
        env:
          GH_TOKEN: ${{ github.token }}
        run: gh pr comment ${{ github.event.pull_request.number }} --body-file clash-report.md
```

**Notes:**
- `KIRO_API_KEY` comes from a paid Kiro plan (Pro, Pro+, Pro Max or Power). Store it as a GitHub secret.
- Let the agent use **only the 3DClash tools**, not everything (trust only those tools in the command).

**Why judges care:** it shows Kiro working in CI, not only in the editor.

### 3.3 The Kiro Crew app (optional, $1,000 prize)

**What it is:** Kiro Crew is an open-source AI agent that runs on your own computer or server and can talk through
Slack, Teams, Discord and others. A **Crew app** is a package (`app.json`) that adds agents, skills, MCP servers,
scheduled jobs and pages to Crew.

**What our Crew app does:**

1. Every night at 2:00, a **scheduled job** checks the project's models.
2. It compares with last night: new clashes, fixed clashes.
3. For each new clash, it asks 3DClash for checked fixes.
4. It posts a short report in Slack or Teams: "3 new clashes on Level 2. 2 have verified fixes. Open in 3DClash."

**What it contains:** the 3DClash MCP server, a "nightly check" skill, the scheduled job, and one page showing the last
report.

**Rule:** it must live in **its own public GitHub repo**. If time runs short, this is the first thing to cut.

---

## 4. Every Kiro feature

Each feature below has: what it is, how we use it, and what we make.

### 4.1 Plan mode

- **What it is:** Kiro looks at the code and asks you questions, but changes nothing. A safe first step.
- **How we use it:** at the start of each part (template, building app, machine app, viewer, Power), to agree the
  plan before any code.
- **What we make:** nothing in the repo; a screenshot for the write-up.

### 4.2 Specs

- **What it is:** a spec is Kiro's plan for one feature, in three files: `requirements.md` (what it must do),
  `design.md` (how), `tasks.md` (the steps). They live in `.kiro/specs/<name>/`.
- **Kinds we use:**

| Kind | Order | Use it for |
|---|---|---|
| Requirements-first | requirements → design → tasks | The template's loop and check; the two apps |
| Design-first | design → requirements → tasks | The 3D viewer, where the layout comes first |
| Quick Spec | all three at once, no stops | Small features: PDF report, BCF export, captions |
| Bugfix spec | defect → design → tasks | Every real bug (4.6) |

- **Our specs:**

| Spec | Covers |
|---|---|
| `core-verify-loop` | The loop, the check, edits, ranking |
| `model-loader` | The common loader interface |
| `building-app` | IFC loading, building rules, BCF |
| `machine-app` | STEP loading, machine rules, STEP export |
| `viewer` | 3D view, before / after, section box, measure |
| `mcp-server` | The tools for AI agents |
| `kiro-power` | The Power's files and its skill |
| `ai-on-bedrock` | Calling Claude, triage in batches, effort for second tries |

- **Writing requirements:** Kiro uses the "WHEN … THE SYSTEM SHALL …" form (called EARS). Examples for
  `core-verify-loop`:
  - WHEN the person asks for fixes for a clash THE SYSTEM SHALL return between one and three options.
  - WHEN a suggested fix still overlaps any part THE SYSTEM SHALL reject it and record the reason.
  - WHEN a suggested fix leaves less than the required gap THE SYSTEM SHALL reject it and record the measured gap.
  - WHEN a suggested fix hits a part it did not hit before THE SYSTEM SHALL reject it.
  - WHEN a fix is rejected THE SYSTEM SHALL send the reason back to the AI for its next try.
  - WHEN the person keeps a fix THE SYSTEM SHALL check it again on the server before changing the model.
- **Rule:** let **Kiro write** the spec files. That trail is the proof judges read.

### 4.3 Analyze Requirements

- **What it is:** Kiro reads a finished `requirements.md` and points out gaps and contradictions.
- **How we use it:** on every spec, before the design step. Fix what it finds.
- **What we make:** a note in the commit message of what it found, and a screenshot or two.

### 4.4 Running tasks in waves

- **What it is:** "Run all tasks" makes Kiro group tasks that don't depend on each other and run them at the same
  time, one wave after another.
- **How we use it:** on the bigger specs (`core-verify-loop`, `viewer`).
- **What we make:** a short screen recording for the video.

### 4.5 Property-based testing

- **What it is:** instead of a few hand-picked test cases, Kiro turns rules into tests that try **hundreds or
  thousands of random inputs**. When one fails, it **shrinks** it to the smallest example that still fails. (IDE only.)
- **Why it fits us:** our whole promise is "every fix proven". Property tests prove the checker itself.
- **Our properties:**
  1. Any fix that passes the check overlaps nothing.
  2. Any fix that passes keeps at least the required gap.
  3. Moving a part by a distance and then back puts it exactly where it started.
  4. A length converted mm → m → mm (and feet → m → feet) comes back the same.
  5. A trial move never marks the file as edited; only a kept fix does.
  6. Keeping a fix and then undoing it gives back the original model.
  7. The order in which parts are checked never changes the answer.
  8. A point taken from the model's axes (Z up) to the viewer's (Y up) and back is unchanged.
- **Libraries (our choice; Kiro's docs don't name one):** **Hypothesis** for Python, **fast-check** for TypeScript.
- **What we make:** property tests in each spec's tasks; every shrunk failing case saved and linked in the write-up.

### 4.6 Bugfix specs

- **What it is:** a spec for one bug, in `bugfix.md` with three parts: what happens now, what should happen, what
  must not change.
- **How we use it:** for every real bug found while building.
- **Example** (based on a real 3DClash bug, in case it happens again):
  - **Now:** WHEN a fix moves several fittings on a millimetre model THEN the system places all but the first near
    the origin.
  - **Should:** WHEN a fix moves several fittings on a millimetre model THEN the system SHALL place each one at its
    correct position.
  - **Must not change:** WHEN a fix moves one part on a metre model THEN the system SHALL CONTINUE TO place it
    correctly.
- **What we make:** `.kiro/specs/fix-<bug-name>/`, plus a property test that would have caught it.

### 4.7 Steering

- **What it is:** Markdown notes in `.kiro/steering/` that Kiro reads before it works. A setting at the top of each
  file says **when** Kiro reads it:

| Setting | Kiro reads it |
|---|---|
| `inclusion: always` | Every time (the default) |
| `inclusion: fileMatch` | Only when working on files that match a pattern |
| `inclusion: manual` | Only when you type `#file-name` in chat |

- **Our files:**

| File | When | What is in it |
|---|---|---|
| `product.md` | always | Who it's for, what it does, the loop, and the rules we never break |
| `tech.md` | always | The stack (section 5), how to run and test, links to the API schema |
| `structure.md` | always | The folder layout: template, two apps, Power |
| `geometry.md` | fileMatch: geometry code | The traps learned on 3DClash (example below) |
| `viewer.md` | fileMatch: viewer code | Axes, one mesh per file, ghost mode for context |
| `demo-rules.md` | manual: `#demo-rules` | Every number people see is measured, never typed in |

- **`product.md` rules section:**
  - Never show a fix that has not passed the check.
  - Keeping a fix always checks it again on the server.
  - The template never names a domain, a demo or a vendor.
  - Every number shown to people is measured.

- **Full example, `.kiro/steering/geometry.md`:**

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/geometry/**/*.py"
---
# Geometry rules

- Every length is in metres. Convert only where a file is read or written.
- three.js is Y-up and IFC is Z-up: a move in the viewer is (dx, dz, -dy).
- Finding a clash and checking a fix must triangulate with the same kernel,
  or a clash found is not one the check can see.
- Never run a clash query on an empty set: IfcOpenShell crashes.
- Use intersection, not collision, for hard clashes: collision misses a part
  wholly inside another.
- When converting a placement matrix to metres, pass a copy: the conversion
  changes the matrix you give it.
- Parts joined by ports (a pipe and its fitting) touch on purpose: skip them in the check.

#[[file:template/geometry/units.py]]
```

  The last line links Kiro to the real file, so the note and the code can't drift apart.

- **Also:** Kiro reads `AGENTS.md` at the repo root, always. Keep it short: how to run, how to test, where things are.

### 4.8 Hooks

- **What it is:** an action Kiro runs by itself when something happens. The action is either a **command** (run a
  script) or an **agent prompt** (tell Kiro to do something). Hooks live in `.kiro/hooks/`.
- **How to make them:** use **"Ask Kiro to create a hook"**. Kiro's docs disagree on some exact trigger names, and
  making them through Kiro is itself Kiro use.
- **Our hooks:**

| Hook | When it runs | What it does | Why |
|---|---|---|---|
| `test-on-save` | Kiro saves a server file | Runs the tests for that module | Bugs are caught at once |
| `guard-samples` | Before Kiro writes a file | Blocks writes to the sample model files | Demo models must stay byte-identical |
| `guard-secrets` | Before Kiro runs a command | Blocks commands that would print a secret | Keys never land in logs or chat |
| `lint-after-edit` | After Kiro edits Python | Runs the linter and type checker | Keeps the code clean |
| `docs-map` | Kiro creates a new file | Adds a line for it in the architecture doc | The docs stay current |
| `task-start` | A spec task starts | Checks the work is on a feature branch | Never builds on `main` |
| `task-end` | A spec task finishes | Runs the tests; adds a line to the commit message | A record for the judges |
| `units-reminder` | The person sends a prompt | If it mentions moves or gaps, adds "all lengths in metres" | Stops the most common geometry bug |
| `stop-gate` | Kiro finishes a turn | Runs the answer-key test (3 known clashes, 3 known fixes). If one fails, asks: fix it, ignore it, or open a bugfix spec | Nothing gets worse without anyone noticing |

- **Note:** file hooks run on **Kiro's** changes, not on edits you type yourself.

### 4.9 Custom agents

- **What it is:** a named Kiro agent with its own instructions, its own tools and its own limits. Files go in
  `.kiro/agents/`.
- **Our agents:**

| Agent | Tools | Job |
|---|---|---|
| `geometry-reviewer` | read only | Reviews every change to geometry code for unit, axis and kernel mistakes. Never edits |
| `triage-worker` | read + 3DClash tools | Sorts a list of clashes: real or not, how serious |
| `clash-coordinator` | 3DClash tools only | The product agent: used by the Power, the GitHub Action and the Crew app |

- **Example, `.kiro/agents/geometry-reviewer.json`:**

```json
{
  "name": "geometry-reviewer",
  "description": "Reviews changes to geometry code for unit, axis and kernel mistakes",
  "tools": ["read"],
  "resources": ["file://.kiro/steering/**/*.md"],
  "prompt": "You review changes to geometry code. Check that every length is in metres, that axes are converted correctly between the model and the viewer, and that detection and the check use the same kernel. Report each problem with its file and line. Do not edit files."
}
```

  The `resources` line matters: custom agents **don't** read steering unless you tell them to.

### 4.10 Sub-agents

- **What it is:** one agent hands parts of a job to other agents, which can run side by side. A **review loop** sends
  work to a reviewer and back, a set number of times.
- **How we use it:**
  - Geometry code: the builder writes, `geometry-reviewer` reviews, up to 3 rounds.
  - Big clash lists: several `triage-worker`s sort parts of the list at the same time.

### 4.11 Workflows

- **What it is:** a saved recipe of steps in `.kiro/workflows/`. Each step runs in its own session.
- **Our recipe, `slice.yaml`:** plan → spec → tasks → tests → pull request. Every part is built the same way.
- **Note:** workflows must be switched on in Kiro's settings first.

### 4.12 MCP servers

- **What it is:** MCP lets Kiro use outside tools. Settings go in `.kiro/settings/mcp.json`. Keys are written as
  `${NAME}` and come from your environment, **never** written in the file.
- **The servers Kiro uses while we build:**

| Server | Why we use it |
|---|---|
| **AWS Documentation MCP Server** | Kiro looks up correct Bedrock and AWS code instead of guessing |
| **Playwright MCP** | Kiro opens the app in a browser, clicks through the 3D viewer and checks it works |
| **GitHub MCP Server** | Kiro reads issues and opens pull requests |
| **Context7** | Kiro reads current docs for three.js and IfcOpenShell |
| **Our own `3dclash` MCP server** | Kiro tests the clash tools while it is building them |

- **Sketch of `.kiro/settings/mcp.json`** (check each server's page for its current install line):

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "3dclash": {
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

### 4.13 Kiro Powers

- **What it is:** a package that adds tools and know-how to Kiro (3.1).
- **How we use it, two ways:**
  1. **Install** AWS powers from [kiro.dev/powers](https://kiro.dev/powers). Use the architecture-diagram one to
     draw the diagram for the write-up.
  2. **Build and publish** our own `powers/3dclash` (layout and files in 3.1).

### 4.14 Kiro Web, Autonomous mode

- **What it is:** on Kiro's website, you give Kiro a task and it works alone in a sandbox, then opens a pull request.
- **How we use it:** hand it one well-specified part, such as the PDF report or the BCF export. Review the pull
  request; ask for changes with `/kiro fix` comments.
- **What we make:** one pull request opened by Kiro, linked in the write-up.

### 4.15 Checkpoints

- **What it is:** Kiro saves a restore point at every prompt. **Restore** puts the files and the conversation back.
- **How we use it:** when an approach fails, restore and try another way.
- **What we make:** a line in the commit message each time (what failed, what we did instead). Judges like seeing the
  dead ends.

### 4.16 Permission modes

- **What it is:** how much Kiro may do without asking: **Supervised** (asks for everything), **Accept file changes**,
  **Approve for me** (Kiro's model decides what is safe).
- **How we use it:** Supervised for the geometry core (we read every change); Approve for me for UI work.
- **What we make:** one paragraph in the write-up explaining the choice.

### 4.17 Kiroignore

- **What it is:** a list of files Kiro should not read.
- **How we use it:** keep the large IFC and STEP sample files out of Kiro's context, so it stays fast and focused.

### 4.18 The whole `.kiro` folder

```
.kiro/
  steering/    product.md  tech.md  structure.md  geometry.md  viewer.md  demo-rules.md
  specs/       core-verify-loop/  model-loader/  building-app/  machine-app/  viewer/
               mcp-server/  kiro-power/  ai-on-bedrock/  fix-<bug-name>/ ...
  hooks/       test-on-save  guard-samples  guard-secrets  lint-after-edit  docs-map
               task-start  task-end  units-reminder  stop-gate
  agents/      geometry-reviewer.json  triage-worker.json  clash-coordinator.json
  workflows/   slice.yaml
  settings/    mcp.json
```

**Never** put `.kiro` or anything in it in `.gitignore`: the hackathon can disqualify the entry for it.

---

## 5. The tech, by name

### Kiro: for building

| Name | What we use it for |
|---|---|
| **Kiro IDE** | The main editor: specs, hooks, property tests |
| **Plan mode** | Agreeing a plan before code |
| **Specs**: Requirements-first, Design-first, Quick Spec | Planning each part |
| **Bugfix specs** | Fixing each real bug with a record |
| **Analyze Requirements** | Finding gaps in each spec |
| **Task waves** | Running independent tasks at the same time |
| **Property-based testing** | Proving the checker with random inputs |
| **Steering** (always, fileMatch, manual) and **AGENTS.md** | Giving Kiro the project's rules |
| **Agent Hooks** | Tests, guards and logs that run by themselves |
| **MCP** | AWS docs, browser testing, GitHub, library docs, our server |
| **Custom agents** | `geometry-reviewer`, `triage-worker`, `clash-coordinator` |
| **Sub-agents** | Review loops; sorting clashes in parallel |
| **Workflows** | The same recipe for every part |
| **Checkpoints** | Going back when an approach fails |
| **Permission modes** | Supervised for geometry, Approve for me for UI |
| **Kiroignore** | Keeping big model files out of context |

### Kiro: inside the product

| Name | What we use it for |
|---|---|
| **Kiro Power** (`3dclash`) | Fixing clashes from Kiro chat |
| **Kiro CLI** (headless) | The GitHub Action that checks models on every pull request |
| **Kiro Web**, Autonomous mode | Building one feature on its own and opening a pull request |
| **Kiro Crew** app | The nightly check posted to Slack or Teams (optional) |

### AWS

| Name | What we use it for |
|---|---|
| **Amazon Bedrock** | Running the AI models |
| **Claude Opus 5.5** (`anthropic.claude-opus-5-5`) | Reading clashes, suggesting fixes, chat, report text; higher effort for second tries |
| **Claude Haiku 5.5** (`anthropic.claude-haiku-5-5`) | Sorting clashes and writing titles |
| **Bedrock batch inference** | Sorting big lists for less money |
| **Amazon Transcribe** (streaming) | Voice commands and live captions |
| **Amazon Nova 2 Sonic** (optional) | Letting the app talk back |
| **IAM role** | Permission to call Bedrock, with no API key |
| **Amazon ECS Fargate** + **Amazon ECR** | Running the server in a container (or keep Modal) |
| **AWS Budgets** | An alarm before the demo costs too much |

### Server (Python 3.13)

| Name | What we use it for |
|---|---|
| **uv** | Installing Python packages and running the server |
| **FastAPI** | The web API |
| **Uvicorn** | Running FastAPI |
| **Pydantic** | Checking the data that comes in and goes out |
| **IfcOpenShell 0.9** | Reading, editing and writing IFC building models; finding clashes |
| **cadquery-ocp** (OpenCASCADE) | Reading, editing and writing STEP machine models |
| **NumPy** | Geometry maths (positions, matrices, distances) |
| **MCP Python SDK** (`mcp`) | The `3dclash` MCP server |
| **Anthropic Python SDK** (`AnthropicBedrockMantle`) | Calling Claude on Bedrock |
| **boto3** | Calling Amazon Transcribe |
| **WeasyPrint** | Making PDF reports |
| **defusedxml** | Reading BCF files safely |
| **python-multipart** | Receiving uploaded model files |

### Web app

| Name | What we use it for |
|---|---|
| **React 19** | The app's screens |
| **TypeScript** | Safer code in the browser |
| **Vite** | Building and running the web app |
| **three.js** | The 3D view |
| **web-ifc** | Opening IFC models in the browser |
| **three-mesh-bvh** | Fast clicking on parts in big models |
| **dockview** (free MIT core only) | Panels that dock, float and resize |
| **lucide-react** | Icons |

### Testing

| Name | What we use it for |
|---|---|
| **pytest** | Server tests |
| **Hypothesis** | Property tests in Python (geometry, units) |
| **Vitest** | Web app tests |
| **fast-check** | Property tests in TypeScript (viewer maths) |
| **Playwright** | Tests in a real browser |

### Sharing

| Name | What we use it for |
|---|---|
| **GitHub** | The public repo |
| **GitHub Actions** | The Kiro clash check on pull requests |
| **YouTube** | The demo video (under 3 minutes) |
| **A blog post** and a **#KiroweenHackathon26** social post | The two bonus prizes |

File formats in and out: **IFC, STEP, BCF, PDF**.

**No longer used:** Meta Model API, the five Muse models, Baseten, Muse Image.
