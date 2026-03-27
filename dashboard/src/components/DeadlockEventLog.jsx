import React from 'react';
import EventLog from './EventLog';

export default function DeadlockEventLog({ events }) {
  return (
    <EventLog
      events={events}
      title="Deadlock Event Log"
      emptyMessage="No deadlock activity yet. Connect customers to resources to begin."
    />
  );
}
