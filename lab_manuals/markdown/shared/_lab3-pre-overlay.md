import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Purpose

In this lab, the student will enable the Zephyr shell over UART, inspect running threads with
built-in shell commands, name threads for easier debugging, add a Device Tree overlay to expose
the ATWINC1500 Wi-Fi module over SPI, and use the network shell to scan for and connect to a
Wi-Fi access point.

## Overview

Lab 3 builds on the two-thread project from Lab 2. First you will enable the Zephyr shell and
explore the system at runtime. Next you will write a Device Tree overlay that wires the
ATWINC1500-XPRO extension board to the %BOARD_NAME%'s SPI peripheral. Finally you will add the
necessary Kconfig options and use the network shell to bring up a Wi-Fi connection.

## Procedure

### Step 3.1: Enable and Explore the Zephyr Shell

#### 3.1.1: Open `prj.conf` and add the following line to enable the Zephyr shell subsystem:

```ini
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

```bash-session
(.venv) $ west build -p always -b %BOARD% application
```

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ west flash %FLASH_ARGS_LINUX%
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ west flash %FLASH_ARGS_MACOS%
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

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
uart:~$ kernel threads
```

![Shell output of kernel threads showing auto-generated numeric thread names](/images/lab3/shell_thread_list_before.png)

Notice that the producer and consumer threads appear with auto-generated numeric names. The
next step will make them easier to identify.

#### 3.1.7: Open `main.c` and add the following two calls immediately after the `k_thread_create` calls for the producer and consumer threads:

```c
k_thread_name_set(producer_tid, (const char *)"producer");
k_thread_name_set(consumer_tid, (const char *)"consumer");
```

#### 3.1.8: Rebuild, flash, and rerun `kernel threads` in the shell. The producer and consumer threads should now appear with their human-readable names.

```bash-session
(.venv) $ west build
```

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ west flash %FLASH_ARGS_LINUX%
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ west flash %FLASH_ARGS_MACOS%
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> west flash %FLASH_ARGS_WIN%
  ```

  </TabItem>
</Tabs>

![Shell output of kernel threads after naming, showing producer and consumer thread names](/images/lab3/shell_thread_list_after.png)

#### 3.1.9: CHALLENGE  -  Stack Usage Analysis

:::info
While looking at the `kernel threads` output, examine the **unused stack** column for your
producer and consumer threads. The `STACKSIZE` macro in `main.c` is currently set to 1024 bytes
for both threads.

Consider: is 1024 bytes the right size? If the unused stack is very large you are wasting RAM.
If it is very small the thread is at risk of a stack overflow. Try reducing `STACKSIZE` for
one or both threads and observe whether the firmware still builds and runs correctly. What is
the minimum safe stack size for each thread?
:::

---
