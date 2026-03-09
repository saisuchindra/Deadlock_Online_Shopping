import { useState, useCallback, useEffect, useRef } from 'react';

export const useShoppingSimulation = () => {
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [deadlocks, setDeadlocks] = useState([]);
  const [resolvedDeadlocks, setResolvedDeadlocks] = useState([]);
  const [events, setEvents] = useState([]);
  const simulationRef = useRef(null);

  // Initialize shopping scenario
  const initializeSimulation = useCallback(() => {
    // Sample inventory items with limited quantities
    const items = [
      { id: 'shirt_001', name: 'Blue Shirt', price: 25, quantity: 2, locked_by: null },
      { id: 'jeans_001', name: 'Black Jeans', price: 50, quantity: 1, locked_by: null },
      { id: 'shoe_001', name: 'Running Shoes', price: 80, quantity: 3, locked_by: null },
      { id: 'jacket_001', name: 'Winter Jacket', price: 120, quantity: 1, locked_by: null },
      { id: 'hat_001', name: 'Baseball Cap', price: 20, quantity: 2, locked_by: null },
    ];

    // Initialize customers with desires
    const newCustomers = [
      {
        id: 'customer_1',
        name: 'Customer 1 (Alice)',
        cart: [],
        wants: ['shirt_001', 'jeans_001'],
        acquired: [],
        waiting_for: null,
        status: 'browsing',
      },
      {
        id: 'customer_2',
        name: 'Customer 2 (Bob)',
        cart: [],
        wants: ['jeans_001', 'shirt_001'],
        acquired: [],
        waiting_for: null,
        status: 'browsing',
      },
      {
        id: 'customer_3',
        name: 'Customer 3 (Charlie)',
        cart: [],
        wants: ['jacket_001', 'shoe_001'],
        acquired: [],
        waiting_for: null,
        status: 'browsing',
      },
      {
        id: 'customer_4',
        name: 'Customer 4 (Diana)',
        cart: [],
        wants: ['shoe_001', 'jacket_001'],
        acquired: [],
        waiting_for: null,
        status: 'browsing',
      },
    ];

    setInventory(items);
    setCustomers(newCustomers);
    setDeadlocks([]);
    setResolvedDeadlocks([]);
    setEvents([
      {
        id: 1,
        timestamp: new Date().toLocaleTimeString(),
        message: '🛍️ Shopping simulation initialized',
        type: 'info',
      },
    ]);
  }, []);

  // Start simulation
  const startSimulation = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      initializeSimulation();
      addEvent('✅ Simulation started', 'info');
    }
  }, [isRunning, initializeSimulation]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    addEvent('⏹️ Simulation stopped', 'info');
  }, []);

  // Add event to log
  const addEvent = useCallback((message, type = 'info') => {
    setEvents((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        timestamp: new Date().toLocaleTimeString(),
        message,
        type,
      },
    ]);
  }, []);

  // Detect deadlock situation
  const detectDeadlock = useCallback(() => {
    setCustomers((prevCustomers) => {
      const newCustomers = [...prevCustomers];
      const deadlockPairs = [];

      // Check for circular wait conditions
      for (let i = 0; i < newCustomers.length; i++) {
        for (let j = i + 1; j < newCustomers.length; j++) {
          const c1 = newCustomers[i];
          const c2 = newCustomers[j];

          // Check if they're waiting for each other's items
          if (
            c1.waiting_for &&
            c2.waiting_for &&
            c1.acquired.some((item) => c2.wants.includes(item)) &&
            c2.acquired.some((item) => c1.wants.includes(item))
          ) {
            deadlockPairs.push({
              customer1: c1.id,
              customer2: c2.id,
              c1_wants: c1.waiting_for,
              c2_wants: c2.waiting_for,
            });

            c1.status = 'deadlocked';
            c2.status = 'deadlocked';
          }
        }
      }

      if (deadlockPairs.length > 0) {
        setDeadlocks(deadlockPairs);
        addEvent(
          `⚠️ DEADLOCK DETECTED! Customers waiting in circular chain`,
          'warning'
        );
      }

      return newCustomers;
    });
  }, [addEvent]);

  // Simulate customer ordering
  const simulateOrdering = useCallback(() => {
    if (!isRunning) return;

    setCustomers((prevCustomers) => {
      const newCustomers = JSON.parse(JSON.stringify(prevCustomers));

      newCustomers.forEach((customer) => {
        if (customer.status === 'browsing' && customer.acquired.length === 0) {
          // Customer tries to acquire first desired item
          const desiredItem = customer.wants[0];
          customer.status = 'shopping';
          customer.waiting_for = desiredItem;
          addEvent(
            `👤 ${customer.name} wants to buy "${desiredItem}"`,
            'info'
          );

          // Simulate acquiring item
          setTimeout(() => {
            setInventory((prevInventory) =>
              prevInventory.map((item) =>
                item.id === desiredItem
                  ? { ...item, locked_by: customer.id }
                  : item
              )
            );
            customer.acquired.push(desiredItem);
            addEvent(
              `✓ ${customer.name} acquired "${desiredItem}"`,
              'success'
            );
          }, 1000);
        }
      });

      return newCustomers;
    });
  }, [isRunning, addEvent]);

  // Resolve deadlock by releasing resources
  const resolveDeadlock = useCallback((deadlockId) => {
    if (deadlocks.length === 0) return;

    const deadlock = deadlocks[deadlockId];
    if (!deadlock) return;

    // Release resources from one customer (victim preemption)
    const victimId = deadlock.customer1;
    addEvent(
      `🔄 Resolving deadlock - ${victimId} releasing resources`,
      'warning'
    );

    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) => {
        if (customer.id === victimId) {
          return {
            ...customer,
            acquired: [],
            waiting_for: null,
            status: 'browsing',
          };
        }
        return customer;
      })
    );

    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.locked_by === victimId ? { ...item, locked_by: null } : item
      )
    );

    setResolvedDeadlocks((prev) => [...prev, deadlock]);
    setDeadlocks((prev) => prev.filter((_, idx) => idx !== deadlockId));

    addEvent(`✅ Deadlock resolved! Resources released`, 'success');
  }, [deadlocks, addEvent]);

  // Main simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      simulateOrdering();
      detectDeadlock();
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, simulateOrdering, detectDeadlock]);

  return {
    customers,
    inventory,
    deadlocks,
    resolvedDeadlocks,
    events,
    isRunning,
    startSimulation,
    stopSimulation,
    resolveDeadlock,
    initializeSimulation,
    detectDeadlock,
  };
};
