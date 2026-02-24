#include <stdio.h>
#include <unistd.h>
#include "../include/config.h"
#include "../include/resource_manager.h"

void* process_order(void* arg) {

    int id = *(int*)arg;

    int request1[NUM_RESOURCES] = {0};
    int request2[NUM_RESOURCES] = {0};

    if(id % 2 == 0) {

        // Even customers lock Resource 0 first
        request1[0] = 1;
        request_resources(id, request1);

        sleep(1);

        // Then try Resource 1
        request2[1] = 1;
        request_resources(id, request2);

    } else {

        // Odd customers lock Resource 1 first
        request1[1] = 1;
        request_resources(id, request1);

        sleep(1);

        // Then try Resource 0
        request2[0] = 1;
        request_resources(id, request2);
    }

    sleep(2);

    release_resources(id, request1);
    release_resources(id, request2);

    printf("Customer %d finished.\n", id);

    return NULL;
}