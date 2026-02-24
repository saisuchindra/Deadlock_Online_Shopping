#ifndef METRICS_H
#define METRICS_H

void start_timer();
void stop_timer();
void print_metrics();
void increment_request();
void increment_granted();
void increment_denied();

#endif