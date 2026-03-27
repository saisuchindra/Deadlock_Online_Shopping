import React, { useMemo, useState } from 'react';
import WaitForGraph from './WaitForGraph';
import DeadlockEventLog from './DeadlockEventLog';
import {
  RefreshCw,
  User,
  ShoppingCart,
  CreditCard,
  Database,
  Package,
  Wallet,
  Key,
  Truck,
} from 'lucide-react';

const resourceIcons = {
  R1: ShoppingCart,
  R2: CreditCard,
  R3: Database,
  R4: Wallet,
  R5: Key,
  R6: Truck,
};

export default function ManualDeadlockGraph({
  resourceMap,
  customers,
  resources,
  hasDeadlock,
  deadlockedResourceIds,
  animationSteps,
  currentStep,
  isAnimating,
  activeAnimationStep,
  events,
  selectedResource,
  explanation,
  suggestions,
  bestSuggestion,
  hoveredSuggestion,
  selectedSuggestion,
  lastResolution,
  onConnectNodes,
  onResourceSelect,
  onHoverSuggestion,
  onSelectSuggestion,
  onApplySuggestion,
  onClearConnections,
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const customerNameById = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer.name])),
    [customers]
  );

  const formatCustomer = (customerId) => customerNameById[customerId] || customerId;
  const previewSuggestion = hoveredSuggestion || selectedSuggestion || bestSuggestion;

  const handleNodeClick = (node) => {
    if (isAnimating) {
      return;
    }

    if (node.type === 'resource') {
      onResourceSelect?.(node.id);
    }

    if (!selectedNode) {
      setSelectedNode(node);
      return;
    }

    if (selectedNode.id === node.id && selectedNode.type === node.type) {
      setSelectedNode(null);
      return;
    }

    if (selectedNode.type === node.type) {
      setSelectedNode(node);
      return;
    }

    const customerId = selectedNode.type === 'customer' ? selectedNode.id : node.id;
    const resourceId = selectedNode.type === 'resource' ? selectedNode.id : node.id;

    if (typeof onConnectNodes === 'function') {
      onConnectNodes(customerId, resourceId);
    }

    setSelectedNode(null);
  };

  const { graphData, highlightedCustomerIds } = useMemo(() => {
    const deadlockedCustomers = new Set();
    const edges = [];

    Object.entries(resourceMap).forEach(([resourceId, customerIds]) => {
      const resourceIsDeadlocked = customerIds.length >= 2;

      customerIds.forEach((customerId) => {
        const isAnimatedEdge =
          activeAnimationStep?.customer === customerId &&
          activeAnimationStep?.resource === resourceId;
        const isPreviewRemoval =
          previewSuggestion?.resource === resourceId &&
          previewSuggestion?.remove === customerId;
        const isPreviewKeep =
          previewSuggestion?.resource === resourceId &&
          previewSuggestion?.keep.includes(customerId);

        if (resourceIsDeadlocked) {
          deadlockedCustomers.add(customerId);
        }

        edges.push({
          from: customerId,
          to: resourceId,
          type: 'access',
          cycle: resourceIsDeadlocked,
          color: isPreviewRemoval
            ? '#ef4444'
            : isPreviewKeep
              ? '#22c55e'
              : resourceIsDeadlocked
                ? '#ef4444'
                : isAnimatedEdge
                  ? '#38bdf8'
                  : '#10b981',
        });
      });
    });

    return {
      graphData: {
        nodes: [
          ...customers.map((customer) => ({
            id: customer.id,
            label: customer.name,
            type: 'customer',
            state: deadlockedCustomers.has(customer.id) ? 'deadlocked' : 'active',
          })),
          ...resources.map((resource) => ({
            id: resource.id,
            label: resource.name,
            type: 'resource',
            state: deadlockedResourceIds.has(resource.id) ? 'deadlocked' : 'free',
          })),
        ],
        edges,
      },
      highlightedCustomerIds: deadlockedCustomers,
    };
  }, [activeAnimationStep, customers, deadlockedResourceIds, resourceMap, resources]);

  const statusText = hasDeadlock ? 'Deadlock Detected' : 'No Deadlock';
  const statusClasses = hasDeadlock
    ? 'border-danger/40 bg-danger/10 text-danger'
    : 'border-success/40 bg-success/10 text-success';

  const selectionHint = !selectedNode
    ? isAnimating
      ? 'Animation in progress. Manual clicks are temporarily disabled.'
      : 'Select one customer and one resource to connect them.'
    : selectedNode.type === 'customer'
      ? `${selectedNode.id} selected. Click a resource.`
      : `${selectedNode.id} selected. Click a customer.`;

  return (
    <>
      <div className="mb-4 rounded-2xl border border-surface-700/60 bg-surface-900/70 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <div className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusClasses}`}>
              {statusText}
            </div>
            <p className="text-sm text-surface-400">
              Deadlock rule: if two or more customers use the same resource, that resource is deadlocked.
            </p>
            <p className="text-xs text-surface-500">
              Example: connect Customer_A and Customer_B to R1.
            </p>
          </div>

          <button
            disabled={isAnimating}
            onClick={() => {
              onClearConnections?.();
              setSelectedNode(null);
            }}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              isAnimating
                ? 'border-surface-700/60 bg-surface-800/60 text-surface-500 cursor-not-allowed'
                : 'border-warning/40 bg-warning/10 text-warning hover:bg-warning/15'
            }`}
          >
            <RefreshCw size={16} />
            Clear All Connections
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-surface-400">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-7 bg-[#10b981]" />
            Access Edge
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-7 bg-danger" />
            Deadlocked Resource
          </div>
          {activeAnimationStep && (
            <div className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent-light">
              Step {currentStep}: {formatCustomer(activeAnimationStep.customer)} -> {activeAnimationStep.resource}
            </div>
          )}
          <div className="rounded-full border border-surface-700/60 bg-surface-950/70 px-3 py-1 text-surface-300">
            {selectionHint}
          </div>
        </div>
      </div>

      {(selectedResource || suggestions.length > 0 || animationSteps.length > 0) && (
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {selectedResource && (
            <div className="rounded-2xl border border-surface-700/60 bg-surface-900/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-300">
                Explanation
              </h3>
              <p className="mt-2 text-sm text-surface-400">
                {explanation}
              </p>
            </div>
          )}
          {previewSuggestion && (
            <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-warning">
                Impact Preview
              </h3>
              <p className="mt-2 text-sm text-warning/90">
                {previewSuggestion.impact}
                <br />
                Remaining users: {previewSuggestion.keep.length
                  ? previewSuggestion.keep.map((customerId) => formatCustomer(customerId)).join(', ')
                  : 'none'}
              </p>
            </div>
          )}
          {animationSteps.length > 0 && (
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-light">
                Animation Steps
              </h3>
              <div className="mt-2 space-y-2 text-sm text-surface-300">
                {animationSteps.map((step, index) => {
                  const isCurrentStep = index === currentStep - 1;

                  return (
                    <div
                      key={`${step.customer}-${step.resource}-${index}`}
                      className={`rounded-xl border px-3 py-2 transition-all ${
                        isCurrentStep
                          ? 'border-accent/50 bg-accent/15 text-accent-light'
                          : 'border-surface-700/60 bg-surface-950/60 text-surface-400'
                      }`}
                    >
                      Step {index + 1}: {formatCustomer(step.customer)} -> {step.resource}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {bestSuggestion && (
        <div className="mb-4 rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-light">
                Recommended Fix
              </h3>
              <p className="mt-1 text-sm text-surface-300">
                Remove {formatCustomer(bestSuggestion.remove)} from {bestSuggestion.resource}.
              </p>
            </div>
            <button
              disabled={isAnimating}
              onMouseEnter={() => onHoverSuggestion?.(bestSuggestion)}
              onMouseLeave={() => onHoverSuggestion?.(null)}
              onFocus={() => onHoverSuggestion?.(bestSuggestion)}
              onBlur={() => onHoverSuggestion?.(null)}
              onClick={() => {
                onSelectSuggestion?.(bestSuggestion);
                onApplySuggestion?.(bestSuggestion.remove, bestSuggestion.resource);
              }}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isAnimating
                  ? 'border-surface-700/60 bg-surface-800/60 text-surface-500 cursor-not-allowed'
                  : 'border-accent/50 bg-accent/20 text-accent-light hover:bg-accent/30'
              }`}
            >
              Apply Recommended Fix
            </button>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mb-4 rounded-2xl border border-surface-700/60 bg-surface-900/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-300">
            Smart Suggestions
          </h3>
          <div className="mt-3 flex flex-wrap gap-3">
            {suggestions.map((suggestion, index) => {
              const isBest =
                bestSuggestion?.resource === suggestion.resource &&
                bestSuggestion?.remove === suggestion.remove;
              const isHovered =
                hoveredSuggestion?.resource === suggestion.resource &&
                hoveredSuggestion?.remove === suggestion.remove;
              const isSelectedSuggestion =
                selectedSuggestion?.resource === suggestion.resource &&
                selectedSuggestion?.remove === suggestion.remove;

              return (
                <button
                  key={`${suggestion.resource}-${suggestion.remove}-${index}`}
                  disabled={isAnimating}
                  onMouseEnter={() => onHoverSuggestion?.(suggestion)}
                  onMouseLeave={() => onHoverSuggestion?.(null)}
                  onFocus={() => onHoverSuggestion?.(suggestion)}
                  onBlur={() => onHoverSuggestion?.(null)}
                  onClick={() => {
                    onSelectSuggestion?.(suggestion);
                    onApplySuggestion?.(suggestion.remove, suggestion.resource);
                  }}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    isAnimating
                      ? 'border-surface-700/60 bg-surface-800/60 text-surface-500 cursor-not-allowed'
                      : isHovered || isSelectedSuggestion
                        ? 'border-accent/50 bg-accent/15 text-accent-light'
                        : isBest
                          ? 'border-warning/50 bg-warning/10 text-warning hover:bg-warning/15'
                          : 'border-surface-700/60 bg-surface-950/60 text-surface-300 hover:border-surface-500/80 hover:text-white'
                  }`}
                >
                  {isBest ? 'Recommended: ' : ''}
                  Remove {formatCustomer(suggestion.remove)} from {suggestion.resource}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <WaitForGraph
            graphData={graphData}
            systemStatus={hasDeadlock ? 'deadlock' : null}
            preventionEnabled={false}
            avoidanceEnabled={false}
            renderNode={(node, pos) => {
              const isSelected =
                selectedNode?.id === node.id && selectedNode?.type === node.type;
              const isDeadlockedResource = node.type === 'resource' && deadlockedResourceIds.has(node.id);
              const isDeadlockedCustomer = node.type === 'customer' && highlightedCustomerIds.has(node.id);
              const isSelectedResource = node.type === 'resource' && selectedResource === node.id;
              const isAnimatedResource = node.type === 'resource' && activeAnimationStep?.resource === node.id;
              const isAnimatedCustomer = node.type === 'customer' && activeAnimationStep?.customer === node.id;
              const isHoveredResource = node.type === 'resource' && previewSuggestion?.resource === node.id;
              const isSuggestedRemoval = node.type === 'customer' && previewSuggestion?.remove === node.id;
              const isSuggestedKeep = node.type === 'customer' && previewSuggestion?.keep.includes(node.id);
              const isLastRemoved = node.type === 'customer' && lastResolution?.remove === node.id;
              const isLastKept = node.type === 'customer' && lastResolution?.keep.includes(node.id);

              if (node.type === 'resource') {
                const Icon = resourceIcons[node.id] || Package;

                return (
                  <g
                    key={node.id}
                    style={{ cursor: isAnimating ? 'not-allowed' : 'pointer' }}
                    onClick={() => handleNodeClick({ id: node.id, type: node.type })}
                  >
                    {/* 🔥 VISIBLE ICON */}
                    <g transform={`translate(${pos.x - 10}, ${pos.y - 10})`}>
                      <Icon
                        size={20}
                        color={
                          isDeadlockedResource
                            ? '#ef4444'
                            : isHoveredResource
                            ? '#facc15'
                            : isSelectedResource || isAnimatedResource || isSelected
                            ? '#38bdf8'
                            : '#10b981'
                        }
                      />
                    </g>

                    {/* 🔥 INVISIBLE CIRCLE FOR GRAPH LAYOUT/CLICK HANDLER */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={18}
                      fill="transparent"
                    />

                    {/* 🔥 LABEL */}
                    <text
                      x={pos.x}
                      y={pos.y - 18}
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="9"
                      fontFamily="Inter, sans-serif"
                      fontWeight="500"
                    >
                      {node.label.length > 14
                        ? `${node.label.slice(0, 12)}...`
                        : node.label}
                    </text>

                    {/* 🔥 ID */}
                    <text
                      x={pos.x}
                      y={pos.y + 20}
                      textAnchor="middle"
                      fill={isDeadlockedResource ? '#ef4444' : '#e5e7eb'}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="500"
                    >
                      {node.id}
                    </text>
                  </g>
                );
              }

              // CUSTOMER NODE RENDERING (Pure SVG)
              const circleColor = isSuggestedRemoval || isLastRemoved
                ? '#ef4444'
                : isSuggestedKeep || isLastKept
                ? '#22c55e'
                : isDeadlockedCustomer
                ? '#ef4444'
                : isAnimatedCustomer || isSelected
                ? '#38bdf8'
                : '#38bdf8';

              const circleFill = isSuggestedRemoval || isLastRemoved
                ? 'rgba(239,68,68,0.2)'
                : isSuggestedKeep || isLastKept
                ? 'rgba(34,197,94,0.18)'
                : isDeadlockedCustomer
                ? 'rgba(239,68,68,0.2)'
                : isAnimatedCustomer || isSelected
                ? 'rgba(56,189,248,0.25)'
                : 'rgba(99,102,241,0.18)';

              return (
                <g
                  key={node.id}
                  style={{ cursor: isAnimating ? 'not-allowed' : 'pointer' }}
                  onClick={() => handleNodeClick({ id: node.id, type: node.type })}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={18}
                    fill={circleFill}
                    stroke={circleColor}
                    strokeWidth={1}
                  />
                  
                  <g transform={`translate(${pos.x - 9}, ${pos.y - 9})`}>
                    <User size={18} color="#e0e7ef" />
                  </g>

                  <text
                    x={pos.x}
                    y={pos.y - 25}
                    textAnchor="middle"
                    fill={
                      isSuggestedRemoval || isLastRemoved
                        ? '#fecaca'
                        : isSuggestedKeep || isLastKept
                          ? '#bbf7d0'
                          : isDeadlockedCustomer
                            ? '#fecaca'
                            : '#e0e7ef'
                    }
                    fontSize="11"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                  >
                    {node.label.length > 10 ? `${node.label.slice(0, 9)}...` : node.label}
                  </text>
                  
                  <text
                    x={pos.x}
                    y={pos.y + 25}
                    textAnchor="middle"
                    fill={isDeadlockedCustomer ? '#ef4444' : '#a5b4fc'}
                    fontSize="8.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="500"
                  >
                    {node.id}
                  </text>
                </g>
              );
            }}
          />
        </div>
        <DeadlockEventLog events={events} />
      </div>
    </>
  );
}
