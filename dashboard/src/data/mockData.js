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

export function generateInitialCustomers(count = 6) {
  return CUSTOMER_NAMES.slice(0, count).map((name, i) => ({
    id: `C${i}`,
    name,
    holding: [],
    waiting: null,
    state: 'idle', // idle, running, waiting, deadlocked
  }));
}

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

export function generateWaitForGraph(customers, resources) {
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

export function generateStressData(tick) {
  return {
    tick,
    time: `${tick}s`,
    threadSpawns: randomInt(5, 40),
    contentionLevel: randomInt(20, 95),
    lockAttempts: randomInt(50, 300),
    lockFailures: randomInt(10, 100),
    avgWaitTime: randomInt(5, 500),
    resourceUtilization: randomInt(40, 99),
  };
}

export {
  EVENT_TYPES,
  randomPick,
  randomInt,
};
