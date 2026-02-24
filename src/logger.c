#include <stdio.h>
#include "../include/logger.h"

void log_event(const char* message) {
    FILE* file = fopen("logs/system.log", "a");
    if(file) {
        fprintf(file, "%s\n", message);
        fclose(file);
    }
}