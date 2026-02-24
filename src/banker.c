#include <stdio.h>
#include "../include/banker.h"
#include "../include/resource_manager.h"

int max_demand[NUM_CUSTOMERS][NUM_RESOURCES];
int allocation[NUM_CUSTOMERS][NUM_RESOURCES];

int is_safe_state() {
    int work[NUM_RESOURCES];
    int finish[NUM_CUSTOMERS] = {0};

    for(int i=0;i<NUM_RESOURCES;i++)
        work[i] = available[i];

    int count = 0;
    while(count < NUM_CUSTOMERS) {
        int found = 0;
        for(int i=0;i<NUM_CUSTOMERS;i++) {
            if(!finish[i]) {
                int j;
                for(j=0;j<NUM_RESOURCES;j++) {
                    if(max_demand[i][j] - allocation[i][j] > work[j])
                        break;
                }
                if(j == NUM_RESOURCES) {
                    for(int k=0;k<NUM_RESOURCES;k++)
                        work[k] += allocation[i][k];
                    finish[i] = 1;
                    found = 1;
                    count++;
                }
            }
        }
        if(!found) return 0;
    }
    return 1;
}

int bankers_request(int customer_id, int request[]) {

    for(int i=0;i<NUM_RESOURCES;i++) {
        available[i] -= request[i];
        allocation[customer_id][i] += request[i];
    }

    if(is_safe_state())
        return 1;

    for(int i=0;i<NUM_RESOURCES;i++) {
        available[i] += request[i];
        allocation[customer_id][i] -= request[i];
    }

    return 0;
}