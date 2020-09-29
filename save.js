// Outputs the measurement
void display_reading(uint16_t* reading) {

    int function, scale, decimal;

    float measurement;

    // Extract data items from first number
    function = (reading[0] >> 6) & 0x0f;
    scale = (reading[0] >> 3) & 0x07;
    decimal = reading[0] & 0x07;

    // Extract and convert measurement value
    if (reading[2] < 0x7fff) {
        measurement = (float)reading[2] / pow(10.0, decimal);
    } else {
        measurement = -1 * (float)(reading[2] & 0x7fff) / pow(10.0, decimal);
    }


    // Check for low battery condition
    if (reading[1] & 0x08) {
        if (!low_battery) {
            fprintf(stderr, "LOW BATTERY\n");
        }

        if (low_battery++ > 17) low_battery = 0;

    } else {
        low_battery = FALSE;
    }


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

    }

    // Flush output for realtime displays
    fflush(stdout);
}


// Handler for BLE notification events
void notification_handler(const uuid_t* uuid, const uint8_t* data, size_t data_length, void* user_data) {

    uint16_t reading[3];
    int index;

    // Reset watchdog flag
    active = TRUE;

    if (offline) {
        // Process offline recording dump packet

        if (!offline_function && (data_length < 20)) return;

        if (!offline_function && (data[0] == 0xff)) return;  // skip lead-in

        index = 0;

        if (!offline_function) {
            // Read header

            // Extract recording start timestamp
            struct tm brokentime;

            brokentime.tm_year = data[0] * 100 + data[1];
            brokentime.tm_mon = data[2] - 1;
            brokentime.tm_mday = data[3];
            brokentime.tm_hour = data[4];
            brokentime.tm_min = data[5];
            brokentime.tm_sec = data[6];

            offline_time = mktime(&brokentime);

            // Extract measurement interval
            offline_interval = *((uint32_t *)(data+8));

            // Extract measurement function and units
            offline_function = *((uint16_t *)(data+16));

            index = 18;

        }

        reading[0] = offline_function;
        reading[1] = 0;

        for(;index < 20; index+=2) {

            if (*((uint16_t *)(data+index)) == 0xffff) {
                g_main_loop_quit(loop);
                return;
            }

            reading[2] = *((uint16_t *)(data+index));

            display_reading(reading);

            offline_time += offline_interval;
        }

    } else if ((data_length == 6) && (data[1] >= 0xf0)) {

        // Realtime measurement packet

        display_reading((uint16_t*)data);

    } else {

        fprintf(stderr, "Unrecognized packet: ");

        for (int i = 0; i < data_length; i++) {
            fprintf(stderr, "%02x ", data[i]);
        }

        fprintf(stderr, "\n");

    }


}

static void usage(char *argv[]) {
    printf("%s [-s|-S|-t|-T|-d] [-c|-j] [-n|-u|-m|-b|-k|-M] [-x] [-r] [-q] [-h|-V] [<device_address>]\n", argv[0]);
    printf("\tMeasurement collection\n\n");
    printf("%s -R <seconds per measurement> <number of measurements> [<device_address>]\n", argv[0]);
    printf("\tStart offline measurement recording\n\n");
    printf("\tClient for Owon B35/B35+/B35T+ digital multimeters using bluetooth.\n\n");
    printf("\t-i\t\t Interactive remote control\n");
    printf("\t-s\t\t Timestamp measurements in elapsed seconds from first reading\n");
    printf("\t-S\t\t Timestamp measurements in Unix epoch seconds\n");
    printf("\t-t\t\t Timestamp measurements in elapsed milliseconds from first reading\n");
    printf("\t-T\t\t Timestamp measurements in Javascript epoch milliseconds\n");
    printf("\t-d\t\t Timestamp measurements with ISO date/time\n");
    printf("\t-c\t\t Comma separated values (CSV) output\n");
    printf("\t-j\t\t JSON output\n");
    printf("\t-n\t\t Scale measurements to nano units\n");
    printf("\t-u\t\t Scale measurements to micro units\n");
    printf("\t-m\t\t Scale measurements to milli units\n");
    printf("\t-b\t\t Scale measurements to base units\n");
    printf("\t-k\t\t Scale measurements to kilo units\n");
    printf("\t-M\t\t Scale measurements to mega units\n");
    printf("\t-x\t\t Output measurement value without units or type for use with feedgnuplot\n");
    printf("\t-R\t\t Start offline measurement recording\n");
    printf("\t-r\t\t Download offline measurement recording\n");
    printf("\t-q\t\t Quiet - no status output\n");
    printf("\t-h\t\t Display this help and exit\n");
    printf("\t-V\t\t Display version and exit\n");
    printf("\t<device_address> Address of Owon multimeter to connect\n");
    printf("\t\t\t  otherwise will connect to first meter found if not specified\n");
    printf("\n\tInteractive controls:\n");
    printf("\t\ts - Select\n");
    printf("\t\ta - Auto\n");
    printf("\t\tr - Range\n");
    printf("\t\tl - Backlight\n");
    printf("\t\th - Hold\n");
    printf("\t\tb - Turn off Bluetooth\n");
    printf("\t\td - Delta (Relative)\n");
    printf("\t\tf - Fequency Hz/Duty\n");
    printf("\t\tm - Min/Max\n");
    printf("\t\tn - Normal display\n");

}

// Event handler for interactive controls
static gboolean interactive_read(GIOChannel *chan, GIOCondition cond,
							gpointer user_data) {

    gchar buffer;
    gsize chars_read;

    uint16_t control;

	if (cond & (G_IO_HUP | G_IO_ERR | G_IO_NVAL)) {
		g_io_channel_unref(chan);
		return FALSE;
	}

	g_io_channel_read_chars(chan, &buffer, 1, &chars_read, NULL);

    switch (buffer) {
        case 's':
            control = SELECT;
            break;

        case 'a':
            control = AUTO;
            break;

        case 'r':
            control = RANGE;
            break;

        case 'l':
            control = LIGHT;
            break;

        case 'h':
            control = HOLD;
            break;

        case 'b':
            control = BLUETOOTH_OFF;
            break;

        case 'd':
            control = RELATIVE;
            break;

        case 'f':
            control = HZ;
            break;

        case 'm':
            control = MIN_MAX;
            break;

        case 'n':
            control = NORMAL;
            break;

        default:
            return TRUE;
    }


    if (gattlib_write_char_by_uuid(connection, &g_control_uuid, &control, sizeof(control))) {
        fprintf(stderr, "Failed to send control.\n");
    }


	return TRUE;
}

// Handler for new device discovery
static void ble_discovered_device(const char* addr, const char* name) {

    if ((name != NULL) && (strcmp(BDM, name) == 0) && (address == NULL)) {

        if (!quiet) fprintf(stderr, "Found %s\n", addr);

        address = malloc(18);
        strcpy(address,addr);
   }

}


// Connect to bluetooth multimeter
void connect_device() {

    do {
        if (!quiet) fprintf(stderr, "Connecting...\n");
        connection = gattlib_connect(NULL, address, BDADDR_LE_PUBLIC, BT_SEC_LOW, 0, 0);
        if (connection == NULL) {
            if (!quiet) fprintf(stderr, "Fail to connect to the multimeter bluetooth device.\n");
            sleep(1);
        }
    } while (connection == NULL);

}

// Start the notification listener
void start_listener() {
    gattlib_register_notification(connection, notification_handler, NULL);

    int ret = gattlib_notification_start(connection, &g_measurement_uuid);
    if (ret) {
        fprintf(stderr, "Fail to start listener.\n");
        exit(1);
    }
}

// Attempt to reconnect to the bluetooth multimeter
void reconnect_device() {

    gattlib_disconnect(connection);
    connect_device();
    gattlib_register_notification(connection, notification_handler, NULL);

}


// Connection watchdog

guint timeout_sec = 5;

gboolean watchdog_check(gpointer data) {

    if (!active) {
        if (!quiet) fprintf(stderr, "Timeout\n");

        reconnect_device();
    }

    active = FALSE;
    return TRUE;
}

// SIGINT handler for clean shutdown
void signal_handler(int signal){

    g_main_loop_quit(loop);
}

int main(int argc, char *argv[]) {
    int ret;
    GIOChannel *pchan;

    _Bool scan = TRUE;

    const char* adapter_name = NULL;
    void* adapter = NULL;


    if ((argc > 3) && (argv[1][0] == '-') && (argv[1][1] == 'R')) {

        // Offline recording
        interval = strtoul(argv[2], NULL, 0);
        if (interval < 1) {
            fprintf(stderr, "Measurement interval must be 1 or more seconds.\n");
            return 1;
        }


        num_measurements = strtoul(argv[3], NULL, 0);
        if ((num_measurements < 1) || (num_measurements > MAX_MEASUREMENTS)) {
            fprintf(stderr, "Number of measurements must be between 0 and %d.\n", MAX_MEASUREMENTS);
            return 1;
        }

        if (argc == 5) {
            address = argv[4];
            scan = FALSE;
        }
    } else {
