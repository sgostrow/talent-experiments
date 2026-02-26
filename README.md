# talent-experiments

A collection of experimental tools for talent management and team development.

## Projects

### skill-graph

An interactive team skill assessment and talent dashboard. Helps managers and teams visualize skill distributions, track self vs. manager ratings, and surface actionable insights about how talent is being deployed.

**Key features:**
- Rate team members across customizable skill dimensions (default: 8 dimensions including AI Fluency, Systems & Strategy, Communication & Influence, and more)
- Side-by-side manager and self-assessment radar charts to spot alignment gaps
- Team skill heatmap showing depth across the full roster
- Task-to-skill mapping to identify underutilized strengths and coverage risks
- Nudge cards that surface insights automatically — e.g. "Alex rates themselves 4+ in Precision & Rigor but no current tasks use that skill"
- Data persisted in browser localStorage

**Tech stack:** React 19, Vite, Recharts, Tailwind CSS, Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Running skill-graph locally

```bash
git clone https://github.com/sgostrow/talent-experiments.git
cd talent-experiments/skill-graph
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

```bash
npm run build    # production build
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

## Repository Structure

```
talent-experiments/
└── skill-graph/   # team skill assessment dashboard
```
