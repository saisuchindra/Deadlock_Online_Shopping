#include <stdio.h>
#include "../include/config.h"
#include "../include/rag.h"

void generate_rag() {
    FILE *file = fopen("docs/resource_allocation_graph.dot", "w");

    fprintf(file, "digraph RAG {\n");

    for(int i=0;i<NUM_CUSTOMERS;i++)
        fprintf(file, "C%d [shape=circle];\n", i);

    for(int i=0;i<NUM_RESOURCES;i++)
        fprintf(file, "R%d [shape=box];\n", i);

    // Example static edges
    fprintf(file, "C0 -> R1;\n");
    fprintf(file, "R1 -> C2;\n");

    fprintf(file, "}\n");

    fclose(file);

    printf("RAG file generated in docs/resource_allocation_graph.dot\n");
}