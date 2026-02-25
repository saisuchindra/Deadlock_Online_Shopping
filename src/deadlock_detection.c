#include <stdio.h>
#include <pthread.h>
#include <unistd.h>
#include "../include/config.h"
#include "../include/resource_manager.h"

// DFS helpers
static int visited[NUM_CUSTOMERS];
static int recursion_stack[NUM_CUSTOMERS];

// DFS to detect cycle
int dfs_cycle(int node) {

    visited[node] = 1;
    recursion_stack[node] = 1;

    for(int i = 0; i < NUM_CUSTOMERS; i++) {

        if(wait_for[node][i]) {

            if(!visited[i] && dfs_cycle(i))
                return 1;

            else if(recursion_stack[i])
                return 1;
        }
    }

    recursion_stack[node] = 0;
    return 0;
}

// Recovery mechanism
void recover_deadlock() {

    int victim = 0;   // Simple victim selection (lowest ID)

    printf("Recovering... Terminating Customer %d\n", victim);

    for(int i = 0; i < NUM_RESOURCES; i++) {

        if(resource_owner[i] == victim) {

            pthread_mutex_unlock(&resource_locks[i]);
            resource_owner[i] = -1;
            available[i]++;
        }
    }

    for(int i = 0; i < NUM_CUSTOMERS; i++) {
        wait_for[victim][i] = 0;
        wait_for[i][victim] = 0;
    }
}

// Background detection thread
void* detection_thread(void* arg) {

    while(1) {

        sleep(2);   // Periodic detection interval

        // Reset arrays
        for(int i = 0; i < NUM_CUSTOMERS; i++) {
            visited[i] = 0;
            recursion_stack[i] = 0;
        }

        // Check each customer
        for(int i = 0; i < NUM_CUSTOMERS; i++) {

            if(!visited[i] && dfs_cycle(i)) {
                printf("Scanning for deadlock...\n");
                printf("\n🔥 Deadlock Detected in System!\n");

                recover_deadlock();

                break;  // Stop after handling one deadlock
            }
        }
    }

    return NULL;
}