import { Routes, Route, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSimulation } from './hooks/useSimulation';
import SystemStatus from './components/SystemStatus';
import ResourceMonitor from './components/ResourceMonitor';
import WaitForGraph from './components/WaitForGraph';
import PerformanceMetrics from './components/PerformanceMetrics';
import EventLog from './components/EventLog';
import DeadlockEventLog from './components/DeadlockEventLog';
import ControlPanel from './components/ControlPanel';
import StressTest from './components/StressTest';
import AboutPage from './components/AboutPage';
import OSExecutionPage from './components/OSExecutionPage';
import ShoppingDashboard from './components/ShoppingDashboard';
import { Monitor, Cpu, LayoutDashboard, Info, Terminal, ShoppingBag, AlertTriangle } from 'lucide-react';
import ManualDeadlockControl from './components/ManualDeadlockControl';
import ManualDeadlockGraph from './components/ManualDeadlockGraph';
import React from 'react';
import {
  generateInitialCustomers,
  generateInitialResources,
} from './data/mockData';

function createInitialResourceMap() {
  return {
    R1: [],
    R2: [],
    R3: [],
    R4: [],
    R5: [],
    R6: [],
    R7: [],
    R8: [],
  };
}

function hasConnections(resourceMap) {
  return Object.values(resourceMap).some((users) => users.length > 0);
}

function isDeadlock(resourceMap) {
  return Object.values(resourceMap).some((users) => users.length >= 2);
}

function getDeadlockedResourceIds(resourceMap) {
  return Object.entries(resourceMap)
    .filter(([, users]) => users.length >= 2)
    .map(([resourceId]) => resourceId);
}

function makeTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false }) +
    '.' +
    String(now.getMilliseconds()).padStart(3, '0');
}

function buildManualEvent(label, color, message) {
  return {
    id: Date.now() + Math.random(),
    timestamp: makeTimestamp(),
    label,
    color,
    message,
  };
}

function getExplanation(resourceMap, resourceId, customerNameById) {
  const users = resourceMap[resourceId] || [];

  if (users.length >= 2) {
    const names = users.map((customerId) => customerNameById[customerId] || customerId);
    return `Deadlock occurred because ${names.join(', ')} are all trying to access ${resourceId} simultaneously.`;
  }

  return 'No deadlock on this resource.';
}

function getSuggestions(resourceMap, customerNameById) {
  const suggestions = [];

  Object.keys(resourceMap).forEach((resourceId) => {
    const users = resourceMap[resourceId];

    if (users.length < 2) {
      return;
    }

    [...users].reverse().forEach((userId) => {
      const remainingUsers = users.filter((customerId) => customerId !== userId);
      const removedName = customerNameById[userId] || userId;
      const keepNames = remainingUsers.map((customerId) => customerNameById[customerId] || customerId);

      suggestions.push({
        resource: resourceId,
        remove: userId,
        keep: remainingUsers,
        impact: `Removing ${removedName} will resolve deadlock on ${resourceId}.`,
        keepLabel: keepNames.join(', '),
      });
    });
  });

  return suggestions;
}

function Dashboard({ sim, activeCustomerCount, activeResourceCount }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <SystemStatus
        systemStatus={sim.systemStatus}
        activeCustomers={activeCustomerCount}
        activeResources={activeResourceCount}
        deadlockCount={sim.deadlockCount}
        recoveryCount={sim.recoveryCount}
      />
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <ResourceMonitor
            resources={sim.resources}
            activeResourceIds={sim.activeResourceIds}
            onToggleResource={sim.toggleResourceActive}
            onClearFilter={sim.clearResourceFilter}
          />
        </div>
        <div className="xl:col-span-1">
          <ControlPanel
            isRunning={sim.isRunning}
            stressTestActive={sim.stressTestActive}
            preventionEnabled={sim.preventionEnabled}
            avoidanceEnabled={sim.avoidanceEnabled}
            detectionEnabled={sim.detectionEnabled}
            onStart={sim.startSimulation}
            onStop={sim.stopSimulation}
            onReset={sim.resetSystem}
            onToggleStress={sim.toggleStressTest}
            onPreventionChange={sim.setPreventionEnabled}
            onAvoidanceChange={sim.setAvoidanceEnabled}
            onDetectionChange={sim.setDetectionEnabled}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WaitForGraph
            graphData={sim.graphData}
            systemStatus={sim.systemStatus}
            preventionEnabled={sim.preventionEnabled}
            avoidanceEnabled={sim.avoidanceEnabled}
            isRunning={sim.isRunning}
            onStop={sim.stopSimulation}
          />
        </div>
        <DeadlockEventLog events={sim.deadlockLog} />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <EventLog events={sim.eventLog} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceMetrics
          perfData={sim.perfData}
          totalGranted={sim.totalGranted}
          totalDenied={sim.totalDenied}
          tick={sim.tick}
        />
        <StressTest
          stressData={sim.stressData}
          active={sim.stressTestActive}
          stressLevel={sim.stressLevel}
          onAdjustLevel={sim.adjustStressLevel}
        />
      </div>
    </motion.div>
  );
}

function App() {
  const sim = useSimulation();
  const [manualBlueprint] = React.useState(() => ({
    customers: generateInitialCustomers(6),
    resources: generateInitialResources(8),
  }));
  const [resourceMap, setResourceMap] = React.useState(createInitialResourceMap);
  const [manualDeadlockEvents, setManualDeadlockEvents] = React.useState([]);
  const [animationSteps, setAnimationSteps] = React.useState([]);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [selectedResource, setSelectedResource] = React.useState(null);
  const [hoveredSuggestion, setHoveredSuggestion] = React.useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState(null);
  const [lastResolution, setLastResolution] = React.useState(null);
  const animationTimeoutsRef = React.useRef([]);
  const resolutionHighlightTimeoutRef = React.useRef(null);
  const resourceMapRef = React.useRef(resourceMap);
  const animationStepsRef = React.useRef(animationSteps);

  React.useEffect(() => {
    resourceMapRef.current = resourceMap;
  }, [resourceMap]);

  React.useEffect(() => {
    animationStepsRef.current = animationSteps;
  }, [animationSteps]);

  const manualHasDeadlock = React.useMemo(() => isDeadlock(resourceMap), [resourceMap]);
  const deadlockedResourceIds = React.useMemo(
    () => new Set(getDeadlockedResourceIds(resourceMap)),
    [resourceMap]
  );
  const customerNameById = React.useMemo(
    () => Object.fromEntries(
      manualBlueprint.customers.map((customer) => [customer.id, customer.name])
    ),
    [manualBlueprint.customers]
  );
  const selectedResourceExplanation = React.useMemo(
    () => selectedResource
      ? getExplanation(resourceMap, selectedResource, customerNameById)
      : null,
    [customerNameById, resourceMap, selectedResource]
  );
  const suggestions = React.useMemo(
    () => getSuggestions(resourceMap, customerNameById),
    [customerNameById, resourceMap]
  );
  const bestSuggestion = suggestions[0] || null;
  const activeAnimationStep = React.useMemo(
    () => currentStep > 0 ? animationSteps[currentStep - 1] || null : null,
    [animationSteps, currentStep]
  );

  const activeCustomerCount = sim.customers.filter(
    (c) => c.state !== 'idle'
  ).length;
  const activeResourceCount = sim.resources.filter(
    (r) => !r.available
  ).length;

  const navLinkClass = (isActive) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
      isActive
        ? 'text-accent-light bg-accent/10 border border-accent/25'
        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 border border-transparent'
    }`;

  const pushManualEvent = React.useCallback((event) => {
    if (!event) {
      return;
    }

    setManualDeadlockEvents((prev) => [event, ...prev].slice(0, 50));
  }, []);

  const clearAnimationTimers = React.useCallback(() => {
    animationTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    animationTimeoutsRef.current = [];
  }, []);

  const clearResolutionHighlight = React.useCallback(() => {
    if (resolutionHighlightTimeoutRef.current) {
      clearTimeout(resolutionHighlightTimeoutRef.current);
      resolutionHighlightTimeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => () => {
    clearAnimationTimers();
    clearResolutionHighlight();
  }, [clearAnimationTimers, clearResolutionHighlight]);

  React.useEffect(() => {
    if (!suggestions.length) {
      setHoveredSuggestion(null);
      setSelectedSuggestion(null);
      return;
    }

    setHoveredSuggestion((current) => {
      if (!current) {
        return null;
      }

      const match = suggestions.find(
        (suggestion) =>
          suggestion.resource === current.resource &&
          suggestion.remove === current.remove
      );

      return match || null;
    });

    setSelectedSuggestion((current) => {
      if (!current) {
        return suggestions[0];
      }

      const match = suggestions.find(
        (suggestion) =>
          suggestion.resource === current.resource &&
          suggestion.remove === current.remove
      );

      return match || suggestions[0];
    });
  }, [suggestions]);

  const handleConnection = React.useCallback((customerId, resourceId, options = {}) => {
    const { recordStep = true } = options;
    const baseMap = resourceMapRef.current;
    const existingUsers = baseMap[resourceId] || [];
    if (existingUsers.includes(customerId)) {
      return;
    }

    const nextMap = {
      ...baseMap,
      [resourceId]: [...existingUsers, customerId],
    };

    resourceMapRef.current = nextMap;
    setResourceMap(nextMap);
    setSelectedResource(resourceId);
    clearResolutionHighlight();
    setLastResolution(null);

    if (recordStep) {
      const nextSteps = [...animationStepsRef.current, { customer: customerId, resource: resourceId }].slice(-8);
      animationStepsRef.current = nextSteps;
      setAnimationSteps(nextSteps);
      setCurrentStep(nextSteps.length);
    }

    if (!isDeadlock(baseMap) && isDeadlock(nextMap)) {
      const deadlockedResources = getDeadlockedResourceIds(nextMap).join(', ');
      pushManualEvent(
        buildManualEvent(
          'Deadlock Detected',
          '#ef4444',
          `Multiple customers are using ${deadlockedResources}.`
        )
      );
    }
  }, [clearResolutionHighlight, pushManualEvent]);

  const runAnimation = React.useCallback((steps) => {
    if (!steps.length) {
      return;
    }

    clearAnimationTimers();
    setIsAnimating(true);
    setCurrentStep(0);
    animationStepsRef.current = steps;
    setAnimationSteps(steps);
    setSelectedResource(steps[0].resource);
    const emptyMap = createInitialResourceMap();
    resourceMapRef.current = emptyMap;
    setResourceMap(emptyMap);

    steps.forEach((step, index) => {
      const timeoutId = setTimeout(() => {
        handleConnection(step.customer, step.resource, { recordStep: false });
        setSelectedResource(step.resource);
        setCurrentStep(index + 1);

        if (index === steps.length - 1) {
          setIsAnimating(false);
          animationTimeoutsRef.current = [];
        }
      }, index * 800);

      animationTimeoutsRef.current.push(timeoutId);
    });
  }, [clearAnimationTimers, handleConnection]);

  const removeCustomerFromResource = React.useCallback((customerId, resourceId) => {
    const users = resourceMapRef.current[resourceId] || [];
    if (!users.includes(customerId)) {
      return;
    }

    const nextMap = {
      ...resourceMapRef.current,
      [resourceId]: users.filter((userId) => userId !== customerId),
    };

    resourceMapRef.current = nextMap;
    setResourceMap(nextMap);
    setSelectedResource(resourceId);
    setHoveredSuggestion(null);
    clearResolutionHighlight();

    const appliedSuggestion = {
      resource: resourceId,
      remove: customerId,
      keep: nextMap[resourceId],
      impact: `Removing ${customerNameById[customerId] || customerId} will resolve deadlock on ${resourceId}.`,
      keepLabel: nextMap[resourceId]
        .map((userId) => customerNameById[userId] || userId)
        .join(', '),
    };

    setSelectedSuggestion(appliedSuggestion);
    setLastResolution({
      ...appliedSuggestion,
      id: Date.now(),
    });
    resolutionHighlightTimeoutRef.current = setTimeout(() => {
      setLastResolution(null);
      resolutionHighlightTimeoutRef.current = null;
    }, 1400);

    pushManualEvent(
      buildManualEvent(
        'Suggestion Applied',
        '#10b981',
        `${customerNameById[customerId] || customerId} was removed from ${resourceId}.`
      )
    );
  }, [clearResolutionHighlight, customerNameById, pushManualEvent]);

  const handlePreventDeadlock = React.useCallback(() => {
    if (!manualHasDeadlock || !bestSuggestion) {
      return;
    }

    removeCustomerFromResource(bestSuggestion.remove, bestSuggestion.resource);
  }, [bestSuggestion, manualHasDeadlock, removeCustomerFromResource]);

  const handleClearConnections = React.useCallback(() => {
    clearAnimationTimers();
    clearResolutionHighlight();
    setIsAnimating(false);
    animationStepsRef.current = [];
    setAnimationSteps([]);
    setCurrentStep(0);
    setSelectedResource(null);
    setHoveredSuggestion(null);
    setSelectedSuggestion(null);
    setLastResolution(null);
    const emptyMap = createInitialResourceMap();
    resourceMapRef.current = emptyMap;
    setResourceMap(emptyMap);

    if (hasConnections(resourceMap)) {
      pushManualEvent(
        buildManualEvent(
          'Connections Cleared',
          '#8b5cf6',
          'All customer-to-resource connections were removed.'
        )
      );
    }
  }, [clearAnimationTimers, clearResolutionHighlight, pushManualEvent, resourceMap]);

  const handleCreateSampleDeadlock = React.useCallback(() => {
    const [customerA, customerB] = manualBlueprint.customers;
    if (!customerA || !customerB) {
      return;
    }

    const steps = [
      { customer: customerA.id, resource: 'R1' },
      { customer: customerB.id, resource: 'R1' },
    ];

    runAnimation(steps);
    setLastResolution(null);
    pushManualEvent(
      buildManualEvent(
        'Sample Deadlock',
        '#f59e0b',
        'Animating sample deadlock: two customers will access R1 step by step.'
      )
    );
  }, [manualBlueprint.customers, pushManualEvent, runAnimation]);

  return (
    <div className="min-h-screen bg-surface-950 text-white font-sans">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-700/30">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                <Monitor size={20} className="text-accent-light" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  Deadlock Management Framework
                </h1>
                <p className="text-[11px] text-surface-400 font-medium">
                  Online Shopping Application â€” Real-time OS Simulation Engine
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <nav className="flex items-center gap-1">
                <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
                  <LayoutDashboard size={13} />
                  Dashboard
                </NavLink>
                <NavLink to="/shopping" className={({ isActive }) => navLinkClass(isActive)}>
                  <ShoppingBag size={13} />
                  Shopping
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => navLinkClass(isActive)}>
                  <Info size={13} />
                  About
                </NavLink>
                <NavLink to="/os-execution" className={({ isActive }) => navLinkClass(isActive)}>
                  <Terminal size={13} />
                  OS Execution
                </NavLink>
                <NavLink to="/manual-deadlock" className={({ isActive }) => navLinkClass(isActive)}>
                  <AlertTriangle size={13} />
                  Manual Deadlock
                </NavLink>
              </nav>

              <div className="w-px h-5 bg-surface-700/40" />

              <div className="flex items-center gap-2 text-xs text-surface-400">
                <Cpu size={13} />
                <span className="font-mono tabular-nums">
                  Tick: {sim.tick}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                sim.isRunning
                  ? 'text-success bg-success/10 border-success/30'
                  : 'text-surface-400 bg-surface-800/50 border-surface-600/30'
              }`}>
                <span className="relative flex h-2 w-2">
                  {sim.isRunning && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${sim.isRunning ? 'bg-success' : 'bg-surface-500'}`} />
                </span>
                {sim.isRunning ? 'SIMULATION ACTIVE' : 'OFFLINE'}
              </div>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2 mt-2 pt-2 border-t border-surface-700/20">
            <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
              <LayoutDashboard size={13} />
              Dashboard
            </NavLink>
            <NavLink to="/shopping" className={({ isActive }) => navLinkClass(isActive)}>
              <ShoppingBag size={13} />
              Shopping
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => navLinkClass(isActive)}>
              <Info size={13} />
              About
            </NavLink>
            <NavLink to="/os-execution" className={({ isActive }) => navLinkClass(isActive)}>
              <Terminal size={13} />
              OS Execution
            </NavLink>
            <NavLink to="/manual-deadlock" className={({ isActive }) => navLinkClass(isActive)}>
              <AlertTriangle size={13} />
              Manual Deadlock
            </NavLink>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                sim={sim}
                activeCustomerCount={activeCustomerCount}
                activeResourceCount={activeResourceCount}
              />
            }
          />
          <Route path="/shopping" element={<ShoppingDashboard />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/os-execution" element={<OSExecutionPage sim={sim} />} />
          <Route
            path="/manual-deadlock"
            element={
              <>
                <ManualDeadlockControl
                  hasDeadlock={manualHasDeadlock}
                  isAnimating={isAnimating}
                  onCreateSampleDeadlock={handleCreateSampleDeadlock}
                  onPreventDeadlock={handlePreventDeadlock}
                />
                <div className="mt-8">
                  <ManualDeadlockGraph
                    resourceMap={resourceMap}
                    customers={manualBlueprint.customers}
                    resources={manualBlueprint.resources}
                    hasDeadlock={manualHasDeadlock}
                    deadlockedResourceIds={deadlockedResourceIds}
                    animationSteps={animationSteps}
                    currentStep={currentStep}
                    isAnimating={isAnimating}
                    activeAnimationStep={activeAnimationStep}
                    events={manualDeadlockEvents}
                    selectedResource={selectedResource}
                    explanation={selectedResourceExplanation}
                    suggestions={suggestions}
                    bestSuggestion={bestSuggestion}
                    hoveredSuggestion={hoveredSuggestion}
                    selectedSuggestion={selectedSuggestion}
                    lastResolution={lastResolution}
                    onConnectNodes={handleConnection}
                    onResourceSelect={setSelectedResource}
                    onHoverSuggestion={setHoveredSuggestion}
                    onSelectSuggestion={setSelectedSuggestion}
                    onApplySuggestion={removeCustomerFromResource}
                    onClearConnections={handleClearConnections}
                  />
                </div>
              </>
            }
          />
        </Routes>
      </main>

      <footer className="border-t border-surface-700/20 mt-8">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-surface-500">
            <span>Deadlock Management Framework v1.0 â€” OS Simulation Dashboard</span>
            <span className="font-mono tabular-nums">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
