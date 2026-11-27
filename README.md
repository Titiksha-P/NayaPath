<div align="center">

<img src="docs/assets/nayapath-banner.svg" alt="NayaPath — A new path. A future of your own" width="100%"/>

### Your next chapter should begin with possibility, not pressure.

**NayaPath** is a voice-first livelihood discovery experience that helps people explore new careers, small-business ideas and additional income opportunities—while respecting the work, responsibilities and strengths they already have.

[Explore the repository](https://github.com/Titiksha-P/NayaPath) · [Report an issue](https://github.com/Titiksha-P/NayaPath/issues)

![React](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)
![Status](https://img.shields.io/badge/status-active%20prototype-c08b45)

</div>

---

## 🌱 The idea behind NayaPath

A person can be good at their current work and still dream about something different. A shop owner might be curious about digital services. A student might want to discover a skill they have never tried. A working parent might want an additional income stream without risking the household's stability.

But taking a new direction can feel like a leap into the unknown.

**NayaPath turns that leap into a series of smaller, safer discoveries.**

Instead of simply telling someone *“you should become a designer”* or *“start a business”*, NayaPath is being built to help them:

- discover possibilities they may not have considered;
- recognise the strengths and transferable skills they already have;
- try realistic challenges before making a major commitment;
- learn at a pace that fits their actual life;
- understand the financial realities of exploring a new direction; and
- decide for themselves what the next step should be.

> **Our principle: Explore before you transition.**
>
> You do not have to quit your current work to begin discovering what else is possible.

## ✨ What can someone explore?

<table>
<tr>
<td width="50%">

### 🧭 A different career
Explore a new field, experience realistic tasks and build evidence of skills before making a move.

</td>
<td width="50%">

### 🪴 A business of their own
Start with a customer problem, test a small idea and understand the costs before investing.

</td>
</tr>
<tr>
<td>

### 💡 Additional income
Explore supplementary work that can fit around an existing occupation and responsibilities.

</td>
<td>

### 🎨 A new interest
Try something unfamiliar, reflect on the experience and discover what feels worth pursuing.

</td>
</tr>
</table>

## 🎙️ Designed around people's voices

Voice should be more than a microphone icon beside a form. It should make the experience feel natural and approachable.

NayaPath's discovery flow includes browser-based speech input where supported, alongside ordinary typing and touch controls. The current prototype wires English and Hindi speech recognition through the browser; actual availability depends on the browser and device. Other language options are not represented as fully implemented speech support yet.

We want the experience to grow towards multilingual, conversational guidance—with clear consent, visible transcription and a reliable text alternative.

## 🧠 Learn by trying: the adaptive assessment

A fixed 30-day plan cannot reflect everyone's circumstances. People have different starting points, available time, responsibilities and learning curves.

NayaPath's assessment prototype explores a different approach: **the next challenge should respond to evidence of learning, not to a countdown.**

### The experience

1. **Start with a baseline.** Try a realistic scenario in the path you want to explore.
2. **Work through challenges.** Scenarios move across foundation, developing, applied and stretch levels.
3. **Notice how you learn.** The prototype records attempts, correctness, hints and response time.
4. **Apply the idea.** A practical mini-project asks you to take a decision beyond a multiple-choice question.
5. **Reflect.** Record what felt interesting, difficult or surprisingly natural.
6. **Choose what happens next.** The intended journey can adapt as skills, interests and circumstances become clearer.

### What the prototype currently measures

| Signal | Why it matters |
|---|---|
| Attempts and correctness | Shows how a person is approaching a challenge |
| Hints used | Helps understand what kind of support is useful |
| Response time | Adds context; it is **not** treated as a measure of intelligence or potential |
| Practical application | Looks for evidence beyond quiz answers |
| Interest and reflection | Keeps the person's own experience in the decision |

The challenge-selection engine uses recent performance and hint-dependence signals to select an appropriate next level. It does not advance someone merely because time has passed.

**A note on retention:** the engine has a retention evidence field, but a real spaced-recall workflow is still to be built. Until that exists, the prototype does not claim to measure long-term retention.

This is a learning and exploration prototype—not a validated psychometric instrument, diagnosis, hiring test or guarantee of career suitability.

## 🛡️ A future should fit real life—and real finances

Exploring a new livelihood should not put someone's existing stability at risk.

A responsible readiness review needs to understand more than a person's ambition. It should eventually consider:

- income, including seasonal or irregular income;
- essential household expenses and debt payments;
- accessible savings and emergency reserves;
- dependants and existing responsibilities;
- the cost and time required to explore a path;
- risk comfort and the ability to absorb a setback; and
- most importantly, whether the person actually wants to proceed.

**Unknown does not mean zero.** Missing financial information must remain unknown—not be treated as proof that a person can afford a transition.

The current review is deliberately conservative. Financial values captured in discovery are not yet securely connected to the assessment engine, so it does not make a transition recommendation. NayaPath does not tell people to quit, borrow money or spend emergency savings.

## 🗺️ How the journey fits together

```mermaid
flowchart TD
    A["🎙️ Tell us about yourself"] --> B["🧭 Discover interests & strengths"]
    B --> C["Choose a path to explore"]
    C --> D["🧠 Baseline scenario"]
    D --> E["🧩 Adaptive challenges"]
    E --> F["🛠️ Practical mini-project"]
    F --> G["💭 Reflect on the experience"]
    G --> H["🛡️ Review readiness & real-life constraints"]
    H --> I{"What feels right to you?"}
    I -->|"Explore further"| E
    I -->|"Build a small experiment"| J["🌱 Take a low-risk next step"]
    I -->|"Pause or change direction"| B
```

There is no universal deadline in this journey. A person can pause, revisit an idea or explore another direction.

## 🧪 Try the prototype

### Run it locally

**Requirements:** Node.js 20 or later and npm.

```bash
git clone https://github.com/Titiksha-P/NayaPath.git
cd NayaPath
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

### Run with Docker

```bash
docker compose up --build
```

Then open [http://localhost:4173](http://localhost:4173).

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the assessment-engine tests |

## 🧰 Under the hood

NayaPath is being developed as a lightweight web application with a deliberately small initial footprint.

- **React 18 + TypeScript** — interactive user experience and typed application logic.
- **Vite** — local development and production bundling.
- **Lucide React** — interface iconography.
- **Vitest** — assessment-engine unit tests.
- **Docker + Nginx** — containerised static deployment.
- **Web Speech API** — browser-dependent speech input with typed fallback.
- **Local storage** — prototype progress persistence in the user's browser.
- **PWA shell** — manifest and service-worker foundation.

### Project map

```text
NayaPath/
├── public/
│   └── sw.js
├── docs/
│   └── assets/
│       └── nayapath-banner.svg
├── src/
│   ├── App.tsx
│   ├── AdaptiveAssessment.tsx
│   ├── assessmentEngine.ts
│   ├── assessmentEngine.test.ts
│   ├── assessment.css
│   ├── style.css
│   ├── main.tsx
│   └── registerSW.ts
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
└── README.md
```

## 🚧 Where the project is today

NayaPath is an **active prototype**, and we want to be transparent about what is implemented and what still needs work.

| Area | Current state |
|---|---|
| Responsive discovery experience | Prototype implemented |
| Browser speech input | English/Hindi browser integration; device-dependent |
| Adaptive challenge selection | Initial evidence-based engine implemented |
| Attempts, hints and response time | Captured in the assessment |
| Practical mini-project and reflection | Prototype implemented |
| Long-term retention | Spaced-recall workflow not yet implemented |
| Financial readiness | Conservative review; financial integration incomplete |
| Accounts and cloud sync | Not implemented; progress is browser-local |
| Curated local opportunities | Needs sourced content and provenance |
| Full multilingual voice experience | Future development |

The project still needs a verified production build, broader automated and accessibility testing, more diverse livelihood scenarios, secure financial-data handling and independent evaluation for fairness and reliability. The challenge bank is illustrative and should not be used to make real employment or financial decisions.

## 🛤️ What's next?

We are working towards a more complete experience with:

- richer, occupation-specific simulations and practical tasks;
- spaced-recall checks to understand what a person remembers over time;
- a genuinely adaptive learning journey with pause, resume and direction changes;
- a secure and transparent financial-readiness workflow;
- more Indian languages and tested voice experiences;
- trustworthy learning resources and local opportunity discovery; and
- privacy, accessibility, safety and bias evaluation before real-world deployment.

## 💚 The belief

A person's current occupation does not define the limits of their future.

NayaPath is being built around a simple belief: **people deserve the space to discover, experiment and grow—without being pushed into a risky leap.**

*One small experiment can open up a whole new direction.*

---

<div align="center">

**NayaPath — A new path. A future of your own.**

Made with curiosity, care and the belief that everyone deserves room to grow. 🌱

</div>
