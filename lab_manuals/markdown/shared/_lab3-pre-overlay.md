import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Procedure

### Step 3.1: Enable and Explore the Zephyr Shell

#### 3.1.1: Open `prj.conf` and add the following line to enable the Zephyr shell subsystem:

```ini
CONFIG_GPIO=y
# add-next-line
CONFIG_SHELL=y
```

#### 3.1.2: Open `src/producer.c` and `src/consumer.c` and remove the `printk` calls in the thread functions so the shell prompt is not obscured by continuous output:

In `producer.c`:

```c
        if(counter++>=10) {
            // remove-next-line
            printk("(producer) Putting %d into message queue\n", data);
            k_msgq_put(notifyMsgQueue, &data, K_NO_WAIT);
            data++;
            counter = 0;
        }
```

In `consumer.c`:

```c
    while (1) {
        k_msgq_get(notifyMsgQueue, &data, K_FOREVER);
        // remove-next-line
        printk("(consumer) Received data: %d\n", data);
    }
```

#### 3.1.3: Build and flash the updated firmware:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ west build -p always -b %BOARD% application
  ```
  ```bash-session
  (.venv) $ west flash %FLASH_ARGS_LINUX%
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ west build -p always -b %BOARD% application
  ```
  ```bash-session
  (.venv) $ west flash %FLASH_ARGS_MACOS%
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> west build -p always -b %BOARD% application
  ```
  ```ps-session
  (.venv) PS C:\...\zephyrproject> west flash %FLASH_ARGS_WIN%
  ```

  </TabItem>
</Tabs>

#### 3.1.4: Open the Serial Monitor. To use the interactive shell you must configure line endings to **CRLF** (both send and receive). Set this option in the Serial Monitor settings panel before connecting.

![Serial Monitor settings panel showing CRLF line ending configuration](/images/lab3/serial_monitor_crlf.png)

Once connected you should see the `uart:~$` prompt. Type `help` to list all registered shell
modules and their top-level commands:

```bash-session
uart:~$ help
```

![Zephyr shell help output listing available command modules](/images/lab3/shell_help_output.png)

#### 3.1.5: List all registered Zephyr devices by typing the following command at the shell prompt:

```bash-session
uart:~$ device list
```

![Shell output of device list showing all initialised drivers](/images/lab3/shell_device_list.png)

Observe the output  -  every driver that was compiled into the image and successfully initialised
will appear here.

#### 3.1.6: List all active Zephyr threads and their current state, priority, and stack usage:

```bash-session
uart:~$ kernel thread list
```

![Shell output of kernel threads showing auto-generated numeric thread names](/images/lab3/shell_thread_list_before.png)

Notice that the producer and consumer threads appear with auto-generated numeric names. The
next step will make them easier to identify.

#### 3.1.7: Open `main.c` and add the following two calls immediately after the `k_thread_create` calls for the producer and consumer threads:

```c
	k_tid_t producer_tid = k_thread_create(&producerThread_data,
                         producerThreadstack_area,
                         K_THREAD_STACK_SIZEOF(producerThreadstack_area),
                         producerThread,
                         (void*)&led, (void*)&consumerQueue, (void*)NULL,
                         PRIORITY, 0, K_NO_WAIT);

	k_tid_t consumer_tid = k_thread_create(&consumerThread_data,
                          consumerThreadstack_area,
                          K_THREAD_STACK_SIZEOF(consumerThreadstack_area),
                          consumerThread,
                          (void*)NULL, (void*)&consumerQueue, (void*)NULL,
                          PRIORITY, 0, K_NO_WAIT);

  // add-start
	k_thread_name_set(producer_tid, (const char *)"producer");
	k_thread_name_set(consumer_tid, (const char *)"consumer");
  // add-end

	while (1) {
		k_msleep(SLEEP_TIME_MS);
	}
```

#### 3.1.8: Rebuild, flash, and rerun `kernel thread list` in the shell. The producer and consumer threads should now appear with their human-readable names.

```bash-session
uart:~$ kernel thread list
```

![Shell output of kernel threads after naming, showing producer and consumer thread names](/images/lab3/shell_thread_list_after.png)

{/* pdf-page-break */}

#### 3.1.9: CHALLENGE  -  Stack Usage Analysis

While looking at the `kernel thread list` output, examine the **unused stack** column for your
producer and consumer threads. The `STACKSIZE` macro in `main.c` is currently set to 1024 bytes
for both threads.

Consider: is 1024 bytes the right size? If the unused stack is very large you are wasting RAM.
If it is very small the thread is at risk of a stack overflow. Try reducing `STACKSIZE` for
one or both threads and observe whether the firmware still builds and runs correctly. What is
the minimum safe stack size for each thread?

---
