#include <stdio.h>
#include <pthread.h>

#include "../include/resource_manager.h"
#include "../include/deadlock_manager.h"
#include "../include/detection.h"
#include "../include/stress.h"
#include "../include/rag.h"

int main() {

    init_resources();

    // Start detection thread
    pthread_t detector;
    pthread_create(&detector, NULL, detection_thread, NULL);

    run_prevention();   
    
    int choice;

    printf("\n=== Deadlock Management Framework ===\n");
    printf("1. Prevention Mode\n");
    printf("2. Avoidance Mode (Banker)\n");
    printf("3. Detection Mode\n");
    printf("4. Stress Test\n");
    printf("5. Generate RAG\n");
    printf("Enter choice: ");
    scanf("%d", &choice);

    switch(choice) {

        case 1:
            run_prevention();
            break;

        case 2:
            run_avoidance();
            break;

        case 3:
            printf("Detection thread is already running in background...\n");
            break;

        case 4:
            run_stress_test();
            break;

        case 5:
            generate_rag();
            break;

        default:
            printf("Invalid option\n");
    }

    // Optional: wait for detection thread (not mandatory)
    pthread_join(detector, NULL);

    return 0;
}