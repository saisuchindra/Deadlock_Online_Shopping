#include <stdio.h>
#include <pthread.h>
#include "../include/resource_manager.h"

pthread_mutex_t resource_locks[NUM_RESOURCES];
int available[NUM_RESOURCES] = {1,1};  // Use 1 for clearer deadlock
int resource_owner[NUM_RESOURCES];
int wait_for[NUM_CUSTOMERS][NUM_CUSTOMERS];

void init_resources() {

    for(int i = 0; i < NUM_RESOURCES; i++) {
        pthread_mutex_init(&resource_locks[i], NULL);
        resource_owner[i] = -1;
    }

    for(int i = 0; i < NUM_CUSTOMERS; i++)
        for(int j = 0; j < NUM_CUSTOMERS; j++)
            wait_for[i][j] = 0;
}

void request_resources(int customer_id, int request[]) {

    for(int i = 0; i < NUM_RESOURCES; i++) {

        if(request[i] == 1) {

            if(pthread_mutex_trylock(&resource_locks[i]) == 0) {

                resource_owner[i] = customer_id;
                available[i]--;

            } else {

                int owner = resource_owner[i];

                if(owner != -1) {
                    wait_for[customer_id][owner] = 1;
                    printf("Customer %d waiting for resource %d held by %d\n",
                           customer_id, i, owner);
                }

                pthread_mutex_lock(&resource_locks[i]);

                wait_for[customer_id][owner] = 0;
                resource_owner[i] = customer_id;
                available[i]--;
            }
        }
    }
}

void release_resources(int customer_id, int request[]) {

    for(int i = 0; i < NUM_RESOURCES; i++) {

        if(request[i] == 1) {

            pthread_mutex_unlock(&resource_locks[i]);
            resource_owner[i] = -1;
            available[i]++;
        }
    }
}