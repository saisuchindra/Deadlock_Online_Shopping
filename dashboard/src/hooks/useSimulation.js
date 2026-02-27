import { useState, useEffect, useCallback, useRef } from 'react';
import {
  generateInitialResources,
  generateInitialCustomers,
  generateEvent,
  generatePerformancePoint,
  generateWaitForGraph,
  generateStressData,
  randomPick,
  randomInt,
  EVENT_TYPES,
} from '../data/mockData';

const TICK_INTERVAL = 1200;
const MAX_LOG_ENTRIES = 200;
const MAX_PERF_POINTS = 60;
const MAX_STRESS_POINTS = 40;

export function useSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  // Strategy toggles
  const [preventionEnabled, setPreventionEnabled] = useState(false);
  const [avoidanceEnabled, setAvoidanceEnabled] = useState(false);
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [stressTestActive, setStressTestActive] = useState(false);
  const [stressLevel, setStressLevel] = useState(5); // 1-10 scale

  // Active resource filter (empty Set = all active)
  const [activeResourceIds, setActiveResourceIds] = useState(new Set());

  // Core state
  const [resources, setResources] = useState(() => generateInitialResources(8));
  const [customers, setCustomers] = useState(() => generateInitialCustomers(6));
  const [eventLog, setEventLog] = useState([]);
  const [perfData, setPerfData] = useState([]);
  const [stressData, setStressData] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  // Aggregate metrics
  const [systemStatus, setSystemStatus] = useState('idle'); // idle, running, deadlock, recovery
  const [deadlockCount, setDeadlockCount] = useState(0);
  const [recoveryCount, setRecoveryCount] = useState(0);
  const [totalGranted, setTotalGranted] = useState(0);
  const [totalDenied, setTotalDenied] = useState(0);

  const intervalRef = useRef(null);
  const systemStatusRef = useRef('idle');

  // Keep ref in sync so simulateTick reads current status (avoids stale closure)
  useEffect(() => {
    systemStatusRef.current = systemStatus;
  }, [systemStatus]);

  const simulateTick = useCallback(() => {
    tickRef.current += 1;
    const currentTick = tickRef.current;
    setTick(currentTick);

    setCustomers((prev) => {
      const updated = prev.map((c) => ({ ...c }));
      updated.forEach((c) => {
        if (c.state === 'idle' && Math.random() > 0.4) {
          c.state = 'running';
        }
      });
      return updated;
    });

    setResources((prevResources) => {
      setCustomers((prevCustomers) => {
        const res = prevResources.map((r) => ({ ...r, waitingThreads: [] }));
        const custs = prevCustomers.map((c) => ({ ...c, holding: [...c.holding] }));

        // Determine which resources are active (empty set = all)
        const activeSet = activeResourceIds;
        const isResActive = (r) => activeSet.size === 0 || activeSet.has(r.id);

        // Simulate resource allocation
        custs.forEach((c) => {
          if (c.state === 'running' || c.state === 'waiting') {
            const availableRes = res.filter(
              (r) => isResActive(r) && r.available && !c.holding.includes(r.id)
            );

            if (preventionEnabled) {
              // PREVENTION: enforce resource ordering — only acquire resources with ID > max held
              const maxHeldIdx = c.holding.length > 0
                ? Math.max(...c.holding.map((id) => parseInt(id.replace('R', ''))))
                : -1;
              const safeRes = availableRes.filter(
                (r) => parseInt(r.id.replace('R', '')) > maxHeldIdx
              );
              if (safeRes.length > 0 && Math.random() > 0.25) {
                const target = randomPick(safeRes);
                target.available = false;
                target.owner = c.name;
                target.currentInstances += 1;
                c.holding.push(target.id);
                c.waiting = null;
                c.state = 'running';
              } else if (c.holding.length === 0 && availableRes.length > 0 && Math.random() > 0.3) {
                const target = randomPick(availableRes);
                target.available = false;
                target.owner = c.name;
                target.currentInstances += 1;
                c.holding.push(target.id);
                c.waiting = null;
                c.state = 'running';
              }
              // Prevention: never enter circular wait

            } else if (avoidanceEnabled) {
              // AVOIDANCE: simplified Banker's check — deny if granting leaves system unsafe
              if (availableRes.length > 0 && Math.random() > 0.3) {
                const target = randomPick(availableRes);
                const totalAvailableAfter = res.filter((r) => r.available).length - 1;
                const waitingCount = custs.filter((c2) => c2.state === 'waiting').length;
                if (totalAvailableAfter >= waitingCount || waitingCount === 0) {
                  target.available = false;
                  target.owner = c.name;
                  target.currentInstances += 1;
                  c.holding.push(target.id);
                  c.waiting = null;
                  c.state = 'running';
                }
              } else if (Math.random() > 0.5) {
                const unavailable = res.filter(
                  (r) => isResActive(r) && !r.available && !c.holding.includes(r.id)
                );
                if (unavailable.length > 0) {
                  const target = randomPick(unavailable);
                  target.waitingThreads.push(c.name);
                  c.waiting = target.id;
                  c.state = 'waiting';
                }
              }

            } else {
              // NO STRATEGY: normal allocation (can cause deadlocks)
              if (availableRes.length > 0 && Math.random() > 0.3) {
                const target = randomPick(availableRes);
                target.available = false;
                target.owner = c.name;
                target.currentInstances += 1;
                c.holding.push(target.id);
                c.waiting = null;
                c.state = 'running';
              } else if (Math.random() > 0.5) {
                const unavailable = res.filter(
                  (r) => isResActive(r) && !r.available && !c.holding.includes(r.id)
                );
                if (unavailable.length > 0) {
                  const target = randomPick(unavailable);
                  target.waitingThreads.push(c.name);
                  c.waiting = target.id;
                  c.state = 'waiting';
                }
              }
            }
          }

          // Randomly release resources
          if (c.holding.length > 0 && Math.random() > 0.65) {
            const releaseId = randomPick(c.holding);
            c.holding = c.holding.filter((id) => id !== releaseId);
            const released = res.find((r) => r.id === releaseId);
            if (released) {
              released.available = true;
              released.owner = null;
              released.currentInstances = Math.max(0, released.currentInstances - 1);
            }
            if (c.holding.length === 0 && !c.waiting) {
              c.state = Math.random() > 0.3 ? 'running' : 'idle';
            }
          }
        });

        setResources(res);
        return custs;
      });
      return prevResources;
    });

    // ---- Deadlock State Machine (uses ref to avoid stale closure) ----
    const prevStatus = systemStatusRef.current;
    let newStatus = prevStatus;
    let didDeadlock = false;
    let didRecover = false;

    if (preventionEnabled || avoidanceEnabled) {
      // Strategies active → no deadlocks possible; clear any leftover deadlocked state
      setCustomers((prev) =>
        prev.map((c) =>
          c.state === 'deadlocked' ? { ...c, state: 'running', waiting: null } : c
        )
      );
      newStatus = currentTick > 1 ? 'running' : prevStatus;
    } else {
      // No strategies → deadlocks can occur
      const shouldDeadlock = Math.random() > 0.82;

      if (shouldDeadlock && prevStatus !== 'deadlock') {
        didDeadlock = true;
        setDeadlockCount((prev) => prev + 1);
        newStatus = 'deadlock';
        setCustomers((prev) => {
          const updated = prev.map((c) => ({ ...c }));
          const waiting = updated.filter((c) => c.state === 'waiting');
          if (waiting.length >= 2) {
            waiting.slice(0, 2).forEach((c) => { c.state = 'deadlocked'; });
          } else {
            const running = updated.filter((c) => c.state === 'running');
            running.slice(0, 2).forEach((c) => { c.state = 'deadlocked'; });
          }
          return updated;
        });
      } else if (prevStatus === 'deadlock') {
        if (detectionEnabled) {
          didRecover = true;
          setRecoveryCount((prev) => prev + 1);
          newStatus = 'recovery';
          // Clear deadlocked customers and release their resources
          setCustomers((prev) =>
            prev.map((c) =>
              c.state === 'deadlocked'
                ? { ...c, state: 'running', waiting: null, holding: [] }
                : c
            )
          );
          setResources((prev) =>
            prev.map((r) => ({
              ...r,
              available: true,
              owner: null,
              currentInstances: 0,
              waitingThreads: [],
            }))
          );
          setTimeout(() => {
            setSystemStatus((s) => (s === 'recovery' ? 'running' : s));
          }, 2500);
        } else {
          newStatus = 'deadlock'; // Stuck — no detection to recover
        }
      } else if (prevStatus === 'recovery') {
        newStatus = 'recovery'; // Let timeout handle transition
      } else {
        newStatus = currentTick > 1 ? 'running' : prevStatus;
      }
    }

    setSystemStatus(newStatus);

    // Generate events
    setCustomers((prevCustomers) => {
      setResources((prevResources) => {
        const eventTypes = [EVENT_TYPES.REQUEST, EVENT_TYPES.ALLOCATE, EVENT_TYPES.RELEASE];
        if (didDeadlock) eventTypes.push(EVENT_TYPES.DEADLOCK, EVENT_TYPES.BLOCK);
        if (didRecover) eventTypes.push(EVENT_TYPES.RECOVERY);

        const newEvents = [];
        const numEvents = randomInt(1, 3);
        for (let i = 0; i < numEvents; i++) {
          newEvents.push(generateEvent(prevCustomers, prevResources, randomPick(eventTypes)));
        }

        // Strategy-specific events for visible feedback
        const ts = () =>
          new Date().toLocaleTimeString('en-US', { hour12: false }) +
          '.' +
          String(new Date().getMilliseconds()).padStart(3, '0');

        if (preventionEnabled && Math.random() > 0.35) {
          const c = randomPick(prevCustomers);
          const r = randomPick(prevResources);
          newEvents.push({
            id: Date.now() + Math.random(),
            timestamp: ts(),
            type: 'prevention',
            label: 'Prevention Active',
            color: '#10b981',
            message: `Prevention: enforced resource ordering for ${c.name} → ${r.name}`,
            customer: c.name,
            resource: r.name,
          });
        }

        if (avoidanceEnabled && Math.random() > 0.35) {
          const c = randomPick(prevCustomers);
          const r = randomPick(prevResources);
          const safe = Math.random() > 0.3;
          newEvents.push({
            id: Date.now() + Math.random(),
            timestamp: ts(),
            type: safe ? 'avoidance_safe' : 'avoidance_denied',
            label: safe ? "Banker's Check Passed" : "Banker's Check Denied",
            color: safe ? '#3b82f6' : '#f59e0b',
            message: safe
              ? `Avoidance: safe state verified for ${c.name} → ${r.name}`
              : `Avoidance: denied unsafe request from ${c.name} for ${r.name}`,
            customer: c.name,
            resource: r.name,
          });
        }

        setEventLog((prev) => [...newEvents, ...prev].slice(0, MAX_LOG_ENTRIES));

        // Update metrics
        const point = generatePerformancePoint(currentTick, stressTestActive);
        setPerfData((prev) => [...prev, point].slice(-MAX_PERF_POINTS));
        setTotalGranted((prev) => prev + point.granted);
        setTotalDenied((prev) => prev + point.denied);

        // Update graph
        setGraphData(generateWaitForGraph(prevCustomers, prevResources));

        // Stress test data
        if (stressTestActive) {
          setStressData((prev) =>
            [...prev, generateStressData(currentTick, stressLevel)].slice(-MAX_STRESS_POINTS)
          );
        }

        return prevResources;
      });
      return prevCustomers;
    });
  }, [preventionEnabled, avoidanceEnabled, detectionEnabled, stressTestActive, stressLevel, activeResourceIds]);

  // Main simulation loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(simulateTick, TICK_INTERVAL);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, simulateTick]);

  // Mark / clear cycle edges in graph based on system status
  useEffect(() => {
    if (systemStatus === 'deadlock') {
      setGraphData((prev) => {
        const edges = prev.edges.map((e) => ({ ...e }));
        const cycleEdges = edges.filter((e) => e.type === 'waiting');
        if (cycleEdges.length >= 2) {
          cycleEdges.forEach((e) => { e.cycle = true; });
        }
        return { ...prev, edges };
      });
    } else {
      // Clear all cycle flags and deadlocked node states when not in deadlock
      setGraphData((prev) => {
        const hasAnyCycle = prev.edges.some((e) => e.cycle);
        const hasDeadlockedNode = prev.nodes.some((n) => n.state === 'deadlocked');
        if (!hasAnyCycle && !hasDeadlockedNode) return prev;
        const edges = prev.edges.map((e) => ({ ...e, cycle: false }));
        const nodes = prev.nodes.map((n) =>
          n.state === 'deadlocked' ? { ...n, state: n.type === 'customer' ? 'running' : n.state } : n
        );
        return { nodes, edges };
      });
    }
  }, [systemStatus]);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    setSystemStatus('running');
  }, []);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    setSystemStatus('idle');
  }, []);

  const resetSystem = useCallback(() => {
    setIsRunning(false);
    tickRef.current = 0;
    setTick(0);
    setResources(generateInitialResources(8));
    setCustomers(generateInitialCustomers(6));
    setEventLog([]);
    setPerfData([]);
    setStressData([]);
    setGraphData({ nodes: [], edges: [] });
    setSystemStatus('idle');
    setDeadlockCount(0);
    setRecoveryCount(0);
    setTotalGranted(0);
    setTotalDenied(0);
    setStressTestActive(false);
    setStressLevel(5);
    setActiveResourceIds(new Set());
    setPreventionEnabled(false);
    setAvoidanceEnabled(false);
    setDetectionEnabled(true);
  }, []);

  const toggleStressTest = useCallback(() => {
    setStressTestActive((prev) => !prev);
    if (!stressTestActive) {
      setStressData([]);
      // Increase customer count during stress
      setCustomers((prev) => {
        if (prev.length < 12) {
          const extra = generateInitialCustomers(12).slice(prev.length);
          extra.forEach((c) => { c.state = 'running'; });
          return [...prev, ...extra];
        }
        return prev;
      });
    }
  }, [stressTestActive]);

  const adjustStressLevel = useCallback((delta) => {
    setStressLevel((prev) => Math.max(1, Math.min(10, prev + delta)));
  }, []);

  const toggleResourceActive = useCallback((resourceId) => {
    setActiveResourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(resourceId)) {
        next.delete(resourceId);
      } else {
        next.add(resourceId);
      }
      return next;
    });
  }, []);

  const clearResourceFilter = useCallback(() => {
    setActiveResourceIds(new Set());
  }, []);

  return {
    // State
    isRunning,
    tick,
    systemStatus,
    resources,
    customers,
    eventLog,
    perfData,
    stressData,
    graphData,
    deadlockCount,
    recoveryCount,
    totalGranted,
    totalDenied,
    stressTestActive,
    stressLevel,
    activeResourceIds,
    preventionEnabled,
    avoidanceEnabled,
    detectionEnabled,

    // Actions
    startSimulation,
    stopSimulation,
    resetSystem,
    toggleStressTest,
    adjustStressLevel,
    toggleResourceActive,
    clearResourceFilter,
    setPreventionEnabled,
    setAvoidanceEnabled,
    setDetectionEnabled,
  };
}
