#include <pthread.h>
#include "../include/resource_manager.h"
#include "../include/order_engine.h"

void run_prevention() {
    pthread_t threads[NUM_CUSTOMERS];
    int ids[NUM_CUSTOMERS];

    for(int i=0;i<NUM_CUSTOMERS;i++) {
        ids[i] = i;
        pthread_create(&threads[i], NULL, process_order, &ids[i]);
    }

    for(int i=0;i<NUM_CUSTOMERS;i++)
        pthread_join(threads[i], NULL);
}