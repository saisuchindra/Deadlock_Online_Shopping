#ifndef RESOURCE_MANAGER_H
#define RESOURCE_MANAGER_H

#include <pthread.h>
#include "config.h"

extern pthread_mutex_t resource_locks[NUM_RESOURCES];
extern int available[NUM_RESOURCES];
extern int resource_owner[NUM_RESOURCES];
extern int wait_for[NUM_CUSTOMERS][NUM_CUSTOMERS];

void init_resources();
void request_resources(int customer_id, int request[]);
void release_resources(int customer_id, int request[]);

#endif