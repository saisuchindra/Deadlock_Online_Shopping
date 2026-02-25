# Deadlock Management Framework — Dashboard

A professional, real-time web dashboard for visualizing OS-level deadlock simulation in online shopping applications.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.3-06B6D4) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-10-purple) ![Recharts](https://img.shields.io/badge/Recharts-2.9-green)

---

## Features

| Panel | Description |
|---|---|
| **System Status** | Live indicator (Running / Deadlock / Recovery), active customers & resources, deadlock & recovery counts |
| **Resource Monitor** | Table of resources with current owner, waiting threads, and availability badges with animated updates |
| **Wait-For Graph** | Dynamic SVG graph — customers as circles, resources as squares, edges animate; cycles highlighted in red |
| **Performance Metrics** | Execution time, throughput, granted vs denied requests, system load area/bar charts |
| **Event Log** | Scrollable, timestamped live log — request, allocate, block, deadlock, recovery events |
| **Control Panel** | Start/Stop/Reset simulation, toggle Prevention/Avoidance/Detection strategies, run Stress Test |
| **Stress Test Viz** | Thread activity spikes, contention level charts, lock attempt vs failure line charts |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 16
- **npm** ≥ 8

### Installation

```bash
cd dashboard
npm install
```

### Development Server

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

Output in `build/` folder — ready to deploy.

---

## Project Structure

```
dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── GlassCard.jsx         # Reusable glassmorphism card wrapper
│   │   ├── SystemStatus.jsx      # System status panel with live indicators
│   │   ├── ResourceMonitor.jsx   # Resource table with animated rows
│   │   ├── WaitForGraph.jsx      # SVG-based wait-for graph with cycle detection
│   │   ├── PerformanceMetrics.jsx# Charts for system load, throughput, grants/denials
│   │   ├── EventLog.jsx          # Scrollable timestamped event log
│   │   ├── ControlPanel.jsx      # Simulation controls and strategy toggles
│   │   └── StressTest.jsx        # Stress test visualization with contention charts
│   ├── data/
│   │   └── mockData.js           # Mock data generators for simulation
│   ├── hooks/
│   │   └── useSimulation.js      # Core simulation state management hook
│   ├── App.jsx                   # Main dashboard layout
│   ├── index.js                  # Entry point
│   └── index.css                 # Tailwind directives + custom styles
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## Architecture

- **React Functional Components** with hooks-based state management
- **`useSimulation` hook** drives the entire simulation via `setInterval`, producing mock data for all panels
- **Mock backend** — no real backend needed; data generated at configurable tick intervals
- **Framer Motion** for smooth entry, exit, and layout animations
- **Recharts** for responsive, dark-themed performance charts
- **Tailwind CSS** with custom dark color palette, glassmorphism utilities, and glow effects

---

## Design System

| Element | Style |
|---|---|
| Background | `#060812` (near-black) |
| Card Surface | Glassmorphism — semi-transparent with backdrop blur |
| Accent | Indigo `#6366f1` with glow shadows |
| Success | Emerald `#10b981` |
| Danger | Red `#ef4444` |
| Warning | Amber `#f59e0b` |
| Typography | Inter (UI) + JetBrains Mono (data) |

---

## How It Works

1. Click **Start** — the simulation engine begins generating resource allocation events at ~1.2s intervals
2. Customers request, acquire, and release resources; the **Resource Monitor** and **Wait-For Graph** update in real-time
3. Deadlocks occur probabilistically (unless Prevention or Avoidance is enabled) — the graph highlights cycles in red
4. With **Detection** enabled, the system auto-recovers from deadlocks
5. **Stress Test** mode increases thread count and contention, showing spike behavior in dedicated charts
6. All events are logged with timestamps in the **Event Log**
7. **Performance Metrics** track CPU, memory, throughput, and grant/deny ratios over time
