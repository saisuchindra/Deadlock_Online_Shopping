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

        // Simulate resource allocation
        custs.forEach((c) => {
          if (c.state === 'running' || c.state === 'waiting') {
            const availableRes = res.filter(
              (r) => r.available && !c.holding.includes(r.id)
            );
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
                (r) => !r.available && !c.holding.includes(r.id)
              );
              if (unavailable.length > 0) {
                const target = randomPick(unavailable);
                target.waitingThreads.push(c.name);
                c.waiting = target.id;
                c.state = 'waiting';
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

    // Determine deadlock occurrence
    const shouldDeadlock = !preventionEnabled && !avoidanceEnabled && Math.random() > 0.82;
    const isRecovering = shouldDeadlock && detectionEnabled && Math.random() > 0.3;

    if (shouldDeadlock) {
      setDeadlockCount((prev) => prev + 1);
      setSystemStatus('deadlock');

      // Mark some customers as deadlocked
      setCustomers((prev) => {
        const updated = prev.map((c) => ({ ...c }));
        const waiting = updated.filter((c) => c.state === 'waiting');
        if (waiting.length >= 2) {
          waiting.slice(0, 2).forEach((c) => {
            c.state = 'deadlocked';
          });
        }
        return updated;
      });
    } else if (isRecovering) {
      setRecoveryCount((prev) => prev + 1);
      setSystemStatus('recovery');
      setTimeout(() => setSystemStatus('running'), 2000);

      setCustomers((prev) =>
        prev.map((c) => (c.state === 'deadlocked' ? { ...c, state: 'running', waiting: null } : c))
      );
    } else {
      setSystemStatus((prev) => (prev === 'deadlock' || prev === 'recovery' ? 'running' : prev));
      if (currentTick > 1) setSystemStatus('running');
    }

    // Generate events
    setCustomers((prevCustomers) => {
      setResources((prevResources) => {
        const eventTypes = [EVENT_TYPES.REQUEST, EVENT_TYPES.ALLOCATE, EVENT_TYPES.RELEASE];
        if (shouldDeadlock) eventTypes.push(EVENT_TYPES.DEADLOCK, EVENT_TYPES.BLOCK);
        if (isRecovering) eventTypes.push(EVENT_TYPES.RECOVERY);

        const newEvents = [];
        const numEvents = randomInt(1, 3);
        for (let i = 0; i < numEvents; i++) {
          newEvents.push(generateEvent(prevCustomers, prevResources, randomPick(eventTypes)));
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
          setStressData((prev) => [...prev, generateStressData(currentTick)].slice(-MAX_STRESS_POINTS));
        }

        return prevResources;
      });
      return prevCustomers;
    });
  }, [preventionEnabled, avoidanceEnabled, detectionEnabled, stressTestActive]);

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

  // Mark cycle edges in graph when deadlock
  useEffect(() => {
    if (systemStatus === 'deadlock') {
      setGraphData((prev) => {
        const edges = prev.edges.map((e) => ({ ...e }));
        // Mark waiting edges as cycle
        const cycleEdges = edges.filter((e) => e.type === 'waiting');
        if (cycleEdges.length >= 2) {
          cycleEdges.forEach((e) => {
            e.cycle = true;
          });
        }
        return { ...prev, edges };
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
    preventionEnabled,
    avoidanceEnabled,
    detectionEnabled,

    // Actions
    startSimulation,
    stopSimulation,
    resetSystem,
    toggleStressTest,
    setPreventionEnabled,
    setAvoidanceEnabled,
    setDetectionEnabled,
  };
}
