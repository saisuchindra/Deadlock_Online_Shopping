#include <stdio.h>
#include <time.h>
#include "../include/metrics.h"

static clock_t start_time, end_time;
static int total_requests = 0;
static int granted = 0;
static int denied = 0;

void start_timer() {
    start_time = clock();
}

void stop_timer() {
    end_time = clock();
}

void increment_request() { total_requests++; }
void increment_granted() { granted++; }
void increment_denied() { denied++; }

void print_metrics() {
    double exec_time = (double)(end_time - start_time) / CLOCKS_PER_SEC;

    printf("\n=== Performance Metrics ===\n");
    printf("Execution Time: %.4f seconds\n", exec_time);
    printf("Total Requests: %d\n", total_requests);
    printf("Granted: %d\n", granted);
    printf("Denied: %d\n", denied);
    printf("Throughput: %.2f orders/sec\n",
           total_requests / exec_time);
}