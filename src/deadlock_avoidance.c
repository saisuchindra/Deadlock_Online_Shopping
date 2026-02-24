#include <pthread.h>
#include "../include/order_engine.h"
#include "../include/deadlock_manager.h"

void run_avoidance() {
    run_prevention(); // reuse same logic with banker check inside order engine
}