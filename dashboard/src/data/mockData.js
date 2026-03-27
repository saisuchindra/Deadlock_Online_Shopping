// Mock data generators for the Deadlock Management Dashboard

const CUSTOMER_NAMES = [
  'Customer_A', 'Customer_B', 'Customer_C', 'Customer_D', 'Customer_E',
  'Customer_F', 'Customer_G', 'Customer_H', 'Customer_I', 'Customer_J',
  'Customer_K', 'Customer_L', 'Customer_M', 'Customer_N', 'Customer_O',
];

const RESOURCE_NAMES = [
  'Cart_Lock', 'Payment_Gateway', 'Inventory_DB', 'Order_Processor',
  'Shipping_Service', 'Coupon_Engine', 'Wallet_Service', 'Auth_Token',
  'Session_Manager', 'Cache_Store', 'Search_Index', 'Notification_Queue',
];

const EVENT_TYPES = {
  REQUEST: 'request',
  ALLOCATE: 'allocate',
  BLOCK: 'block',
  DEADLOCK: 'deadlock',
  RECOVERY: 'recovery',
  RELEASE: 'release',
};

const EVENT_LABELS = {
  [EVENT_TYPES.REQUEST]: 'Resource Request',
  [EVENT_TYPES.ALLOCATE]: 'Resource Allocated',
  [EVENT_TYPES.BLOCK]: 'Blocking Event',
  [EVENT_TYPES.DEADLOCK]: 'Deadlock Detected',
  [EVENT_TYPES.RECOVERY]: 'Recovery Action',
  [EVENT_TYPES.RELEASE]: 'Resource Released',
};

const EVENT_COLORS = {
  [EVENT_TYPES.REQUEST]: '#3b82f6',
  [EVENT_TYPES.ALLOCATE]: '#10b981',
  [EVENT_TYPES.BLOCK]: '#f59e0b',
  [EVENT_TYPES.DEADLOCK]: '#ef4444',
  [EVENT_TYPES.RECOVERY]: '#8b5cf6',
  [EVENT_TYPES.RELEASE]: '#6b7280',
};

// ========================================================
// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
// ========================================================
// The following auto-generation functions are COMMENTED OUT.
// Manual data structures are used instead (see below).
// ========================================================

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false }) + '.' +
    String(now.getMilliseconds()).padStart(3, '0');
}

/*
// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
export function generateInitialResources(count = 8) {
  return RESOURCE_NAMES.slice(0, count).map((name, i) => ({
    id: `R${i}`,
    name,
    owner: null,
    waitingThreads: [],
    available: true,
    maxInstances: randomInt(1, 3),
    currentInstances: 0,
  }));
}

// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
export function generateInitialCustomers(count = 6) {
  return CUSTOMER_NAMES.slice(0, count).map((name, i) => ({
    id: `C${i}`,
    name,
    holding: [],
    waiting: null,
    state: 'idle', // idle, running, waiting, deadlocked
  }));
}
*/

// ========================================================
// MANUAL DATA STRUCTURES – REPLACE AUTO-GENERATION
// ========================================================
export function generateInitialResources(count = 8) {
  return RESOURCE_NAMES.slice(0, count).map((name, index) => ({
    id: `R${index + 1}`,
    name,
    owner: null,
    waitingThreads: [],
    available: true,
    maxInstances: 1,
    currentInstances: 0,
  }));
}

export function generateInitialCustomers(count = 6) {
  return CUSTOMER_NAMES.slice(0, count).map((name, index) => ({
    id: `C${index}`,
    name,
    holding: [],
    waiting: null,
    state: 'idle',
  }));
}

/*
// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
export function generateEvent(customers, resources, forceType = null) {
  const type = forceType || randomPick(Object.values(EVENT_TYPES));
  const customer = randomPick(customers);
  const resource = randomPick(resources);

  let message = '';
  switch (type) {
    case EVENT_TYPES.REQUEST:
      message = `${customer.name} requested ${resource.name}`;
      break;
    case EVENT_TYPES.ALLOCATE:
      message = `${resource.name} allocated to ${customer.name}`;
      break;
    case EVENT_TYPES.BLOCK:
      message = `${customer.name} blocked waiting for ${resource.name} (held by ${randomPick(customers).name})`;
      break;
    case EVENT_TYPES.DEADLOCK:
      message = `Deadlock cycle detected: ${customer.name} → ${resource.name} → ${randomPick(customers).name}`;
      break;
    case EVENT_TYPES.RECOVERY:
      message = `Recovery: preempted ${resource.name} from ${customer.name}`;
      break;
    case EVENT_TYPES.RELEASE:
      message = `${customer.name} released ${resource.name}`;
      break;
    default:
      message = `System event on ${resource.name}`;
  }

  return {
    id: Date.now() + Math.random(),
    timestamp: generateTimestamp(),
    type,
    label: EVENT_LABELS[type],
    color: EVENT_COLORS[type],
    message,
    customer: customer.name,
    resource: resource.name,
  };
}
*/

// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
// Stub function to prevent errors - returns empty event
export function generateEvent(customers, resources, forceType = null) {
  const type = forceType || randomPick(Object.values(EVENT_TYPES));
  const customer = randomPick(customers);
  const resource = randomPick(resources);

  let message = '';
  switch (type) {
    case EVENT_TYPES.REQUEST:
      message = `${customer.name} requested ${resource.name}`;
      break;
    case EVENT_TYPES.ALLOCATE:
      message = `${resource.name} allocated to ${customer.name}`;
      break;
    case EVENT_TYPES.BLOCK:
      message = `${customer.name} blocked waiting for ${resource.name} (held by ${randomPick(customers).name})`;
      break;
    case EVENT_TYPES.DEADLOCK:
      message = `Deadlock cycle detected: ${customer.name} → ${resource.name} → ${randomPick(customers).name}`;
      break;
    case EVENT_TYPES.RECOVERY:
      message = `Recovery: preempted ${resource.name} from ${customer.name}`;
      break;
    case EVENT_TYPES.RELEASE:
      message = `${customer.name} released ${resource.name}`;
      break;
    default:
      message = `System event on ${resource.name}`;
  }

  return {
    id: Date.now() + Math.random(),
    timestamp: generateTimestamp(),
    type,
    label: EVENT_LABELS[type],
    color: EVENT_COLORS[type],
    message,
    customer: customer.name,
    resource: resource.name,
  };
}

/*
// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
export function generatePerformancePoint(tick, isStress = false) {
  const baseCpu = isStress ? 70 : 30;
  const baseMemory = isStress ? 60 : 25;
  const baseThreads = isStress ? 80 : 20;

  return {
    tick,
    time: `${tick}s`,
    cpuUsage: Math.min(100, baseCpu + randomInt(-10, 20)),
    memoryUsage: Math.min(100, baseMemory + randomInt(-8, 15)),
    activeThreads: baseThreads + randomInt(-5, 15),
    throughput: isStress ? randomInt(20, 80) : randomInt(50, 150),
    granted: randomInt(isStress ? 5 : 20, isStress ? 30 : 60),
    denied: randomInt(isStress ? 10 : 2, isStress ? 40 : 15),
    latency: isStress ? randomInt(200, 800) : randomInt(10, 120),
  };
}
*/

// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
// Stub function for compatibility
export function generatePerformancePoint(tick, isStress = false) {
  const baseCpu = isStress ? 70 : 30;
  const baseMemory = isStress ? 60 : 25;
  const baseThreads = isStress ? 80 : 20;

  return {
    tick,
    time: `${tick}s`,
    cpuUsage: Math.min(100, baseCpu + randomInt(-10, 20)),
    memoryUsage: Math.min(100, baseMemory + randomInt(-8, 15)),
    activeThreads: baseThreads + randomInt(-5, 15),
    throughput: isStress ? randomInt(20, 80) : randomInt(50, 150),
    granted: randomInt(isStress ? 5 : 20, isStress ? 30 : 60),
    denied: randomInt(isStress ? 10 : 2, isStress ? 40 : 15),
    latency: isStress ? randomInt(200, 800) : randomInt(10, 120),
  };
}

// ========================================================
// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
// MANUAL WAIT-FOR GRAPH - Dynamic edges from manual data
// ========================================================
export function generateWaitForGraph(customers, resources) {
  // MANUAL MODE: Uses provided customers and resources to generate edges
  // This allows manual control while keeping the graph rendering
  
  const nodes = [];
  const edges = [];

  // Add customer nodes
  if (customers && customers.length > 0) {
    customers.forEach((c) => {
      nodes.push({
        id: c.id,
        label: c.name,
        type: 'customer',
        state: c.state,
      });
    });
  }

  // Add resource nodes
  if (resources && resources.length > 0) {
    resources.forEach((r) => {
      nodes.push({
        id: r.id,
        label: r.name,
        type: 'resource',
        state: r.available ? 'available' : 'held',
      });
    });
  }

  // Generate edges from customer/resource relationships
  if (customers && customers.length > 0 && resources && resources.length > 0) {
    customers.forEach((c) => {
      // Add edges for held resources
      if (c.holding && c.holding.length > 0) {
        c.holding.forEach((rId) => {
          edges.push({ from: c.id, to: rId, type: 'assigned', cycle: false });
        });
      }
      // Add edge for waiting resource
      if (c.waiting) {
        edges.push({ from: c.id, to: c.waiting, type: 'waiting', cycle: false });
      }
    });
  }

  return { nodes, edges };
}

export function detectManualDeadlock(customers, resources) {
  const ownerByResource = new Map(
    (resources || [])
      .filter((resource) => resource.owner)
      .map((resource) => [resource.id, resource.owner])
  );

  (customers || []).forEach((customer) => {
    (customer.holding || []).forEach((resourceId) => {
      if (!ownerByResource.has(resourceId)) {
        ownerByResource.set(resourceId, customer.id);
      }
    });
  });

  const waitOwnerByCustomer = new Map();
  (customers || []).forEach((customer) => {
    if (!customer.waiting) return;
    const ownerId = ownerByResource.get(customer.waiting);
    if (ownerId && ownerId !== customer.id) {
      waitOwnerByCustomer.set(customer.id, ownerId);
    }
  });

  const visited = new Set();
  const inStack = new Set();
  const stack = [];
  let cycleCustomerIds = null;

  const dfs = (customerId) => {
    visited.add(customerId);
    inStack.add(customerId);
    stack.push(customerId);

    const nextCustomerId = waitOwnerByCustomer.get(customerId);
    if (nextCustomerId) {
      if (!visited.has(nextCustomerId)) {
        dfs(nextCustomerId);
      } else if (inStack.has(nextCustomerId)) {
        const startIndex = stack.indexOf(nextCustomerId);
        cycleCustomerIds = new Set(stack.slice(startIndex));
      }
    }

    stack.pop();
    inStack.delete(customerId);
  };

  for (const customer of customers || []) {
    if (!visited.has(customer.id) && !cycleCustomerIds) {
      dfs(customer.id);
    }
  }

  const cycleResourceIds = new Set();
  if (cycleCustomerIds) {
    (customers || []).forEach((customer) => {
      if (!cycleCustomerIds.has(customer.id)) return;
      if (customer.waiting) {
        cycleResourceIds.add(customer.waiting);
      }
      (customer.holding || []).forEach((resourceId) => {
        cycleResourceIds.add(resourceId);
      });
    });
  }

  return {
    hasDeadlock: Boolean(cycleCustomerIds && cycleCustomerIds.size > 0),
    cycleCustomerIds: cycleCustomerIds || new Set(),
    cycleResourceIds,
  };
}

export function createSampleManualDeadlock(countCustomers = 6, countResources = 8) {
  const customers = generateInitialCustomers(countCustomers).map((customer) => ({ ...customer }));
  const resources = generateInitialResources(countResources).map((resource) => ({ ...resource }));

  if (customers.length < 2 || resources.length < 2) {
    return { customers, resources };
  }

  const [customerA, customerB] = customers;
  const [resourceA, resourceB] = resources;

  customerA.holding = [resourceA.id];
  customerA.waiting = resourceB.id;
  customerA.state = 'waiting';

  customerB.holding = [resourceB.id];
  customerB.waiting = resourceA.id;
  customerB.state = 'waiting';

  resourceA.owner = customerA.id;
  resourceA.available = false;
  resourceA.currentInstances = 1;
  resourceA.waitingThreads = [customerB.id];

  resourceB.owner = customerB.id;
  resourceB.available = false;
  resourceB.currentInstances = 1;
  resourceB.waitingThreads = [customerA.id];

  return { customers, resources };
}

/*
// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
// OLD AUTO-GENERATION CODE (COMMENTED OUT)
export function generateWaitForGraph(customers, resources) {
  // Set autoGenerate to false to use manual graph instead
  const autoGenerate = true;
  
  if (!autoGenerate) {
    return generateManualWaitForGraph();
  }

  const nodes = [];
  const edges = [];

  customers.forEach((c) => {
    nodes.push({
      id: c.id,
      label: c.name,
      type: 'customer',
      state: c.state,
    });
  });

  resources.forEach((r) => {
    nodes.push({
      id: r.id,
      label: r.name,
      type: 'resource',
      state: r.available ? 'available' : 'held',
    });
  });

  // Generate some random edges
  const activeCustomers = customers.filter(c => c.state !== 'idle');
  activeCustomers.forEach((c) => {
    if (c.holding.length > 0) {
      c.holding.forEach((rId) => {
        edges.push({ from: rId, to: c.id, type: 'assigned', cycle: false });
      });
    }
    if (c.waiting) {
      edges.push({ from: c.id, to: c.waiting, type: 'waiting', cycle: false });
    }
  });

  return { nodes, edges };
}
*/

/*
// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
export function generateStressData(tick, level = 5) {
  const scale = level / 5; // 1.0 at level 5, 0.2 at level 1, 2.0 at level 10
  return {
    tick,
    time: `${tick}s`,
    threadSpawns: Math.round(randomInt(5, 40) * scale),
    contentionLevel: Math.min(100, Math.round(randomInt(20, 95) * scale)),
    lockAttempts: Math.round(randomInt(50, 300) * scale),
    lockFailures: Math.round(randomInt(10, 100) * scale),
    avgWaitTime: Math.round(randomInt(5, 500) * scale),
    resourceUtilization: Math.min(100, Math.round(randomInt(40, 99) * scale)),
  };
}
*/

// AUTO-GENERATION DISABLED – MANUAL MODE ACTIVE
// Stub function for compatibility
export function generateStressData(tick, level = 5) {
  return null; // No stress data in manual mode
}

export {
  EVENT_TYPES,
  randomPick,
  randomInt,
};
