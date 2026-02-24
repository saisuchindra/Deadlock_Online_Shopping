#include <stdio.h>
#include <pthread.h>
#include <stdlib.h>
#include "../include/order_engine.h"
#include "../include/config.h"

#define STRESS_CUSTOMERS 20

void run_stress_test() {
    pthread_t threads[STRESS_CUSTOMERS];
    int ids[STRESS_CUSTOMERS];

    for(int i=0;i<STRESS_CUSTOMERS;i++) {
        ids[i] = i;
        pthread_create(&threads[i], NULL, process_order, &ids[i]);
    }

    for(int i=0;i<STRESS_CUSTOMERS;i++)
        pthread_join(threads[i], NULL);

    printf("Stress test completed.\n");
}