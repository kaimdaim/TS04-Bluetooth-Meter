switch (format) {
        case space:
        case csv:

            if (timestamp) {
                print_timestamp();
                printf("%c", (format?',':' '));
            }

            print_measurement(measurement, decimal, scale);

            if (show_units) {
                printf("%c", (format?',':' '));
                print_units(scale, function);
                printf("%c", (format?',':' '));
                print_type(reading[1]);
            }
            printf("\n");

            break;

        case json:

            printf("{");

            if (timestamp) {
                printf("\"timestamp\":");
                if (timestamp == date) printf("\"");
                print_timestamp();
                if (timestamp == date) printf("\"");
                printf(", ");
            }

            printf("\"measurement\":");
            print_measurement(measurement, decimal, scale);

            if (show_units) {
                printf(", \"units\":\"");
                print_units(scale, function);
                printf("\", \"type\":\"");
                print_type(reading[1]);
                printf("\"");
            }
            printf(" }\n");

            break;
