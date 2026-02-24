🛒 Deadlock Prevention in Online Shopping Applications
📌 Overview

This project implements a real-time Deadlock Management Framework for online shopping systems using C and POSIX threads.

It simulates concurrent order processing in an e-commerce backend environment and demonstrates:

Deadlock Prevention

Deadlock Avoidance (Banker’s Algorithm)

Real-Time Deadlock Detection (Wait-For Graph)

Automated Recovery Mechanism

Stress Testing

Performance Metrics

Resource Allocation Graph (RAG) Visualization

The system models customers as concurrent threads competing for shared system resources such as inventory, payment gateway, and database locks.

🧠 Problem Statement

In high-concurrency environments like online shopping platforms, multiple users may simultaneously request shared resources. Improper resource allocation can result in:

Circular wait

System freeze

Transaction failure

Reduced throughput

This project simulates and manages such scenarios using classical Operating System deadlock handling strategies.

🏗 System Architecture

The framework consists of:

Customers (Threads)
        ↓
Order Engine
        ↓
Resource Manager
        ↓
Deadlock Monitor (Background Thread)
        ↓
Recovery Mechanism

Key components:

Resource Ownership Tracking

Wait-For Graph Construction

DFS-based Cycle Detection

Victim Selection & Recovery

🔄 Deadlock Management Techniques Implemented
1️⃣ Prevention (Resource Ordering)

Eliminates circular wait by enforcing global resource acquisition order.

2️⃣ Avoidance (Banker’s Algorithm)

Checks for safe state before granting resource requests.

3️⃣ Detection (Wait-For Graph)

Constructs a dynamic wait-for graph and performs cycle detection using DFS.

4️⃣ Recovery

Upon detecting a deadlock:

Selects a victim process

Releases its resources

Breaks the circular dependency

⚙️ Features

✔ Multi-threaded simulation
✔ Real-time deadlock detection thread
✔ Dynamic resource ownership tracking
✔ Automated recovery mechanism
✔ Stress testing with high concurrency
✔ Performance metrics calculation
✔ Resource Allocation Graph generation (.dot format)
✔ Modular architecture

📂 Project Structure
Deadlock_Online_Shopping/
│
├── docs/                     # Architecture & Graph files
├── include/                  # Header files
├── src/                      # Source code
├── logs/                     # System logs
├── results/                  # Output results
├── tests/                    # Stress test inputs
├── Makefile
└── README.md
🛠 Technologies Used

C Programming Language

POSIX Threads (pthread)

Mutex Synchronization

Graph Theory (Cycle Detection using DFS)

Banker’s Algorithm

Graphviz (for RAG visualization)

🚀 How To Build & Run
Compile
gcc src/*.c -o shopping -lpthread

or

make
Run
./shopping
📊 Performance Metrics

The system measures:

Execution Time

Total Resource Requests

Granted Requests

Denied Requests

Throughput (Orders per second)

📈 Resource Allocation Graph

The system generates a .dot file:

docs/resource_allocation_graph.dot

Convert it to PNG using:

dot -Tpng resource_allocation_graph.dot -o resource_allocation_graph.png
🧪 Stress Testing

The stress test module simulates heavy traffic with multiple concurrent customers to evaluate:

Stability

Deadlock handling efficiency

Throughput under load

🔥 Real-Time Deadlock Detection

A background monitoring thread:

Periodically scans the Wait-For Graph

Detects cycles

Automatically triggers recovery

This models real OS-level deadlock management systems.

🎓 Academic Concepts Covered

Mutual Exclusion

Hold and Wait

Circular Wait

No Preemption

Safe State

Wait-For Graph

Cycle Detection

Resource Allocation Graph

Concurrency Control

📚 Future Enhancements

Priority-based victim selection

Transaction rollback simulation

Web-based monitoring dashboard

Real-time visualization of wait-for graph

Database-backed transaction simulation

👨‍💻 Author

Saisuchindra
B.Tech Computer Science
Operating Systems Major Project

📌 Conclusion

This project demonstrates a complete Deadlock Management Framework integrating prevention, avoidance, detection, recovery, and performance evaluation within a simulated online shopping system.

It bridges theoretical Operating System concepts with practical multi-threaded implementation.

gcc -pthread src/*.c -o /tmp/shopping_wsl && (printf '1\n' | timeout 10s stdbuf -oL /tmp/shopping_wsl)
