<p align="center">
  <img src="https://img.shields.io/badge/Language-C-00599C?style=for-the-badge&logo=c&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Routing-React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/OS_Concept-Deadlock_Management-FF4444?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Threads-POSIX_pthreads-green?style=for-the-badge" />
</p>

<h1 align="center">🛒 Deadlock Management Framework<br/>for Online Shopping Systems</h1>

<p align="center">
  <b>A comprehensive Operating Systems project demonstrating deadlock <i>prevention</i>, <i>avoidance</i>, and <i>detection</i> algorithms — applied to a real-world online shopping resource contention scenario — with a stunning real-time React dashboard.</b>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-dashboard">Dashboard</a> •
  <a href="#-shopping-dashboard-new">Shopping Dashboard</a> •
  <a href="#-algorithms">Algorithms</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-sample-output">Sample Output</a> •
  <a href="#-tech-stack">Tech Stack</a>
</p>

---

## 📌 Overview

In an online shopping system, multiple **customers** (threads) compete for shared **resources** — payment gateways, inventory databases, cart locks, and shipping services. When two or more customers hold resources and wait for each other to release theirs, a **deadlock** occurs, freezing the entire system.

This project simulates that exact scenario and implements three classical OS strategies to handle it:

| Strategy | Approach | Algorithm Used |
|----------|----------|----------------|
| **Prevention** | Eliminate one of the four necessary conditions for deadlock | Resource ordering (lock hierarchy) |
| **Avoidance** | Dynamically check if granting a request leads to an unsafe state | Banker's Algorithm |
| **Detection** | Periodically scan for cycles in the wait-for graph and recover | DFS cycle detection + victim preemption |

---

## ✨ Features

### Backend (C + POSIX Threads)
- 🔐 **Multi-threaded simulation** using `pthreads` — customers run as concurrent threads
- 🏦 **Banker's Algorithm** for safe-state verification before resource allocation
- 🔍 **DFS-based cycle detection** on a Wait-For Graph running in a background thread
- 🛡️ **Prevention via resource ordering** — enforces a global lock acquisition order
- 📊 **Performance metrics** — tracks execution time, throughput, granted/denied requests
- 📝 **Event logging** — all resource events are logged to `logs/system.log`
- 🧪 **Stress testing** — spawns 20 concurrent customers to test system resilience
- 📈 **RAG generation** — outputs a Resource Allocation Graph in Graphviz `.dot` format

### Frontend (React Dashboard)
- 🖥️ **Real-time simulation engine** with tick-based state updates
- 📊 **Resource Monitor** — live view of resource allocation, ownership, and wait queues
  - 🎯 **Manual resource selection** — click individual resources (e.g., Cart_Lock) to run only those in the simulation; unselected resources are paused
  - 🔍 **Expandable detail panel** — click any resource row to see status, owner, instances, and waiting queue
- 🕸️ **Wait-For Graph visualization** — interactive graph showing customer-resource dependencies
- 📉 **Performance Metrics** — CPU, memory, throughput, and latency charts (via Recharts)
- 🎛️ **Control Panel** — start/stop simulation, toggle strategies, activate stress tests
- 📋 **Event Log** — color-coded live feed of all system events
- 🧪 **Stress Test Monitor** — thread spawns, contention levels, lock failures
  - 📈 **Manual stress level control** — increase/decrease stress intensity (1–10 scale) with arrow buttons
- 📖 **About Page** — comprehensive project overview with animated glassmorphism cards
- �️ **Shopping Dashboard** *(NEW!)* — E-commerce focused deadlock simulation
  - 👥 **Customer Management** — displays active customers and their shopping states
  - 📦 **Inventory System** — shows items with real-time locking status
  - 🛒 **Shopping Carts** — tracks items in each customer's cart
  - 🔄 **Deadlock Visualizer** — real-time visualization of circular wait chains
  - ⚠️ **Deadlock Detection & Resolution** — manual trigger to resolve detected deadlocks
- 🔗 **Client-side routing** — Dashboard, Shopping, and About pages via React Router
- 🎨 **Glassmorphism UI** — modern dark theme with animated components (Framer Motion)

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Dashboard (Frontend)                │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐  │
│  │ System   │ │ Resource │ │ Wait-For  │ │ Performance  │  │
│  │ Status   │ │ Monitor  │ │ Graph     │ │ Metrics      │  │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐  │
│  │ Control  │ │ Event    │ │ Stress    │ │  About       │  │
│  │ Panel    │ │ Log      │ │ Test      │ │  Page        │  │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  C Backend (Core Engine)                      │
│                                                               │
│  ┌──────────────┐   ┌────────────────┐   ┌───────────────┐  │
│  │   Resource    │   │   Deadlock      │   │   Order       │  │
│  │   Manager     │   │   Manager       │   │   Engine      │  │
│  │  (Mutexes)    │   │  (3 Strategies) │   │  (Threads)    │  │
│  └──────┬───────┘   └───────┬────────┘   └──────┬────────┘  │
│         │                   │                    │            │
│  ┌──────┴───────┐   ┌──────┴────────┐   ┌──────┴────────┐  │
│  │  Banker's    │   │  Detection    │   │  RAG          │  │
│  │  Algorithm   │   │  Thread (DFS) │   │  Generator    │  │
│  └──────────────┘   └───────────────┘   └───────────────┘  │
│                                                               │
│  ┌──────────────┐   ┌────────────────┐   ┌───────────────┐  │
│  │  Metrics     │   │  Logger        │   │  Stress Test  │  │
│  │  Collector   │   │  (File I/O)    │   │  (20 threads) │  │
│  └──────────────┘   └────────────────┘   └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Purpose |
|------|---------|
| **GCC** (or any C compiler) | Compile the C backend |
| **POSIX Threads** (`-lpthread`) | Multi-threading support |
| **Node.js** (v16+) | Run the React dashboard |
| **npm** | Install dashboard dependencies |
| **Graphviz** *(optional)* | Render the RAG `.dot` file |

### 1. Clone the Repository

```bash
git clone https://github.com/saisuchindra/Deadlock_Online_Shopping.git
cd Deadlock_Online_Shopping
```

### 2. Compile & Run the C Backend

```bash
gcc -o deadlock_sim src/*.c -Iinclude -lpthread
./deadlock_sim
```

You'll see:

```
=== Deadlock Management Framework ===
1. Prevention Mode
2. Avoidance Mode (Banker)
3. Detection Mode
4. Stress Test
5. Generate RAG
Enter choice:
```

### 3. Run the React Dashboard

```bash
cd dashboard
npm install
npm start
```

The dashboard will open at **http://localhost:3000** with the real-time simulation UI.

### 4. Navigate Between Dashboards

Once the React dashboard loads, you'll see a navigation bar at the top with the following options:

| Tab | Purpose |
|-----|---------|
| **Dashboard** | OS Simulation — real-time deadlock detection with 3 strategies (Prevention, Avoidance, Detection) |
| **Shopping** *(NEW!)* | E-commerce Simulation — deadlock scenarios in a customer ordering context |
| **About** | Project overview and documentation |
| **OS Execution** | Terminal-like view of the C backend execution |

Simply click any tab to switch contexts!

---

## 🖥️ Dashboard

The interactive dashboard provides a complete visual representation of the deadlock management system:

| Component | Description |
|-----------|-------------|
| **System Status** | Shows overall system state — idle, running, deadlock, or recovery — with live counters |
| **Resource Monitor** | Displays all resources with ownership and wait queues; **click individual resources to activate/deactivate them in the simulation**; expandable detail panel per resource |
| **Wait-For Graph** | Visualizes customer → resource dependencies; highlights deadlock cycles |
| **Control Panel** | Toggle Prevention / Avoidance / Detection strategies on-the-fly |
| **Event Log** | Color-coded live feed: 🔵 requests, 🟢 allocations, 🟡 blocks, 🔴 deadlocks, 🟣 recoveries |
| **Performance Metrics** | Real-time charts for CPU usage, memory, throughput, and latency |
| **Stress Test** | Monitor thread spawns, lock contention, and failure rates; **manual stress level control (1–10)** with increase/decrease buttons |
| **About Page** | Comprehensive project overview — problem statement, strategies, architecture, tech stack |

### 🛍️ Shopping Dashboard *(NEW!)*

A dedicated e-commerce simulation showcasing deadlock scenarios in a real-world context:

**Features:**
- 👥 **Customer Management** — 4 concurrent customers with individual shopping states (browsing, shopping, deadlocked)
- 📦 **Dynamic Inventory** — 5 sample items (shirts, jeans, shoes, jackets, caps) with limited quantities and real-time locking
- 🛒 **Shopping Carts** — track items each customer wants and has acquired
- 🔄 **Deadlock Visualization** — circular wait chain display showing which customers are waiting for which items
- ⚙️ **Auto-Detection** — system automatically detects when circular waiting occurs
- 🔨 **Manual Resolution** — click "Resolve" button to perform victim preemption and break deadlock
- 📊 **Live Metrics** — active customers, inventory items, active deadlocks, and resolved deadlock counters
- 🎯 **Realistic Scenario** — customers want items in different orders → circular wait → deadlock

**Access:** Navigate to the **Shopping** tab in the main dashboard

---

## 🧠 Algorithms

### 1. Deadlock Prevention — Resource Ordering

**Strategy:** Enforce a total ordering on resource acquisition. Customers must request resources in a fixed order (e.g., Resource 0 before Resource 1), eliminating the **circular wait** condition.

```c
// Even customers: lock R0 → R1 (ordered)
// Odd customers:  lock R0 → R1 (same order — no circular wait)
```

**File:** `src/deadlock_prevention.c`, `src/order_engine.c`

---

### 2. Deadlock Avoidance — Banker's Algorithm

**Strategy:** Before granting a resource request, simulate the allocation and check if the system remains in a **safe state** (i.e., there exists a sequence in which all customers can finish).

```c
int is_safe_state() {
    // Simulates resource release for each customer
    // Returns 1 if a safe sequence exists, 0 otherwise
}

int bankers_request(int customer_id, int request[]) {
    // Tentatively allocate → check safety → commit or rollback
}
```

**File:** `src/banker.c`

---

### 3. Deadlock Detection — DFS Cycle Detection

**Strategy:** A background thread runs periodically, performing **Depth-First Search** on the Wait-For Graph. If a back-edge is found (cycle detected), the system initiates **recovery by victim preemption**.

```c
void* detection_thread(void* arg) {
    while(1) {
        sleep(2);  // Periodic scan
        // DFS on wait_for[][] adjacency matrix
        // If cycle → recover_deadlock() — preempt lowest-ID customer
    }
}
```

**File:** `src/deadlock_detection.c`

---

## 📁 Project Structure

```
Deadlock_Online_Shopping/
│
├── src/                          # C Backend Source Code
│   ├── main.c                    # Entry point — menu-driven mode selection
│   ├── resource_manager.c        # Mutex-based resource allocation & release
│   ├── banker.c                  # Banker's Algorithm (safe state check)
│   ├── deadlock_prevention.c     # Prevention mode launcher
│   ├── deadlock_avoidance.c      # Avoidance mode launcher
│   ├── deadlock_detection.c      # DFS-based detection + recovery thread
│   ├── order_engine.c            # Customer order processing (thread function)
│   ├── rag.c                     # Resource Allocation Graph generator (.dot)
│   ├── stress.c                  # Stress test — 20 concurrent customers
│   ├── metrics.c                 # Performance metrics (time, throughput)
│   └── logger.c                  # File-based event logger
│
├── include/                      # C Header Files
│   ├── config.h                  # System configuration (NUM_CUSTOMERS, NUM_RESOURCES)
│   ├── banker.h                  # Banker's Algorithm interface
│   ├── deadlock_manager.h        # Deadlock strategy function declarations
│   ├── detection.h               # Detection thread interface
│   ├── resource_manager.h        # Resource manager interface
│   ├── order_engine.h            # Order processing interface
│   ├── rag.h                     # RAG generation interface
│   ├── stress.h                  # Stress test interface
│   ├── metrics.h                 # Metrics interface
│   └── logger.h                  # Logger interface
│
├── dashboard/                    # React Frontend Dashboard
│   ├── package.json              # Dependencies (React, Recharts, Framer Motion)
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── public/                   # Static assets
│   ├── build/                    # Production build
│   └── src/
│       ├── App.jsx               # Main dashboard layout with React Router
│       ├── index.js              # React entry point (BrowserRouter)
│       ├── index.css             # Global styles
│       ├── hooks/
│       │   ├── useSimulation.js       # Core OS simulation engine (tick-based state)
│       │   └── useShoppingSimulation.js  # E-commerce deadlock simulation (NEW!)
│       ├── data/
│       │   └── mockData.js       # Data generators (customers, resources, events)
│       └── components/
│           ├── SystemStatus.jsx          # System state indicator
│           ├── ResourceMonitor.jsx       # Resource allocation table with manual selection
│           ├── WaitForGraph.jsx          # Dependency graph visualization
│           ├── ControlPanel.jsx          # Strategy toggles & controls
│           ├── EventLog.jsx              # Live event feed
│           ├── PerformanceMetrics.jsx    # Charts & graphs
│           ├── StressTest.jsx            # Stress test monitor with level control
│           ├── AboutPage.jsx             # About page with project details
│           ├── GlassCard.jsx             # Reusable glassmorphism card
│           ├── ShoppingDashboard.jsx     # E-commerce deadlock dashboard (NEW!)
│           ├── CustomerList.jsx          # Shopping: customer list display (NEW!)
│           ├── ShoppingCart.jsx          # Shopping: customer carts (NEW!)
│           ├── DeadlockVisualizer.jsx    # Shopping: circular wait visualization (NEW!)
│           ├── InventoryManager.jsx      # Shopping: inventory & locking status (NEW!)
│           ├── ShoppingEventLog.jsx      # Shopping: event log (NEW!)
│           └── ShoppingControlPanel.jsx  # Shopping: controls (NEW!)
│
├── logs/                         # Runtime logs (system.log)
├── results/                      # Execution output files
│   ├── avoidance_output.txt
│   ├── detection_output.txt
│   └── prevention_output.txt
├── tests/                        # Test cases
│   └── stress_test_cases.txt
└── docs/                         # Documentation & generated files
```

---

## 📋 Sample Output

### Prevention Mode
```
Customer 0 requesting Resource 0...
Customer 0 acquired Resource 0.
Customer 1 requesting Resource 0...
Customer 0 requesting Resource 1...
Customer 0 acquired Resource 1.
Customer 0 finished.
Customer 1 acquired Resource 0.
Customer 1 requesting Resource 1...
Customer 1 acquired Resource 1.
Customer 1 finished.
```

### Detection Mode
```
Customer 0 waiting for resource 1 held by 1
Customer 1 waiting for resource 0 held by 0
Scanning for deadlock...
🔥 Deadlock Detected in System!
Recovering... Terminating Customer 0
Customer 1 finished.
```

### Stress Test
```
Customer 0 requesting resources...
Customer 5 requesting resources...
...
Customer 19 finished.
Stress test completed.
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | C (C99) | Core deadlock algorithms |
| **Threading** | POSIX pthreads | Concurrent customer simulation |
| **Synchronization** | Mutexes (`pthread_mutex_t`) | Resource locking |
| **Frontend** | React 18 | Dashboard UI framework |
| **Routing** | React Router v6 | Client-side page navigation |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design |
| **Charts** | Recharts | Performance data visualization |
| **Animations** | Framer Motion | Smooth UI transitions |
| **Icons** | Lucide React | Interface iconography |
| **Graph Format** | Graphviz DOT | Resource Allocation Graph export |

---

## 🔧 Configuration

Edit `include/config.h` to adjust system parameters:

```c
#define NUM_CUSTOMERS 2    // Number of concurrent customers (threads)
#define NUM_RESOURCES 4    // Number of shared resources

#define ENABLE_PREVENTION 1
#define ENABLE_AVOIDANCE  1
#define ENABLE_DETECTION  1
```

---

## 📚 OS Concepts Demonstrated

- **Deadlock** — mutual exclusion, hold & wait, no preemption, circular wait
- **Deadlock Prevention** — breaking the circular wait condition via resource ordering
- **Deadlock Avoidance** — Banker's Algorithm for safe state verification
- **Deadlock Detection & Recovery** — Wait-For Graph cycle detection using DFS, victim selection
- **Concurrency** — multi-threaded execution with POSIX threads
- **Synchronization** — mutex locks for critical section protection
- **Resource Allocation Graph** — visual representation of process-resource relationships
- **Starvation & Livelock awareness** — stress testing under high contention

---

## 👤 Author

**Sai Suchindra**

- GitHub: [@saisuchindra](https://github.com/saisuchindra)

---

## 📄 License

This project is for **educational purposes** — developed as part of an Operating Systems course project.

--- https://dashboard-mu-flax.vercel.app/

<p align="center">
  <b>⭐ Star this repository if you found it helpful!</b>
</p>
