#ifndef BANKER_H
#define BANKER_H

#include "config.h"

int is_safe_state();
int bankers_request(int customer_id, int request[]);

#endif