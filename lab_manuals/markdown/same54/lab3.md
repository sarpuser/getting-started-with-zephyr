---
title: "Lab 3: Add a Shell and Temperature Sensor to Your Project"
sidebar_label: "Lab 3: Shell and Temperature Sensor"
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import PreOverlay from './_lab3-pre-overlay.md';

# Lab 3: Add a Shell and Temperature Sensor to Your Project

## Purpose

In this lab, you will enable the Zephyr shell over UART, inspect the running system with built-in
shell commands, and add and configure a driver for the AT30TSE758 temperature sensor on the
Microchip IO1 Xplained Pro.

## Overview

Lab 3 builds on the two-thread project from Lab 2. First you will enable the Zephyr shell and use
it to inspect devices and threads at runtime. Next you will enable the I²C shell, find the
temperature sensor on the bus, and describe it in a Devicetree overlay. Finally you will enable
Zephyr's sensor subsystem and read converted temperature values from the shell.

<PreOverlay />

### Step 3.2: Find the Temperature Sensor on the I²C Bus

The Microchip IO1 Xplained Pro includes an AT30TSE758 temperature sensor. In this lab, Zephyr's
generic LM75-compatible driver will expose the sensor through the sensor subsystem.

#### 3.2.1: Connect the IO1 Xplained Pro board to the `EXT2` header on the SAME54 Xplained Pro, and then press the `RESET` button.

The `EXT2` header is connected to a SERCOM peripheral that the SAME54 board definition already
configures as an I²C controller.

#### 3.2.2: Open `prj.conf` and add the following options to enable the I²C subsystem and its shell commands:

```ini
CONFIG_GPIO=y
CONFIG_SHELL=y
# add-start
CONFIG_I2C=y
CONFIG_I2C_SHELL=y
# add-end
```

#### 3.2.3: Build and flash the updated firmware:

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

#### 3.2.4: Scan the I²C bus from the UART shell:

```bash-session
uart:~$ i2c scan i2c0
```

![I²C scan output showing a device at address 0x4f](/images/lab3/i2c_scan_temperature_sensor.png)

The device at address `0x4f` is the IO1 board's temperature sensor.

#### 3.2.5: Read two bytes from the temperature register at address `0x00`:

```bash-session
uart:~$ i2c read i2c0 4f 00 2
```

![I²C read output from the temperature sensor at address 0x4f](/images/lab3/i2c_read_temperature_sensor.png)

Use `i2c help` to see the other commands provided by the I²C shell:

```bash-session
uart:~$ i2c help
```

---

### Step 3.3: Add a Devicetree Overlay for the Temperature Sensor

The bus scan confirms that hardware responds at `0x4f`. Next, describe that device to Zephyr so
the LM75-compatible driver can bind to it.

#### 3.3.1: Create a `boards/` directory inside your `application` directory and create the overlay file:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ mkdir -p application/boards
  ```
  ```bash-session
  (.venv) $ touch application/boards/%BOARD%.overlay
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ mkdir -p application/boards
  ```
  ```bash-session
  (.venv) $ touch application/boards/%BOARD%.overlay
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> mkdir application\boards
  ```
  ```ps-session
  (.venv) PS C:\...\zephyrproject> ni application\boards\%BOARD%.overlay
  ```

  </TabItem>
</Tabs>

#### 3.3.2: Open `application/boards/%BOARD%.overlay` and add the following Devicetree content:

```dts
&sercom7 {
    /* sercom7 is enabled as I2C in the base DTS. */
    #address-cells = <1>;
    #size-cells = <0>;

    temp_sensor: lm75@4f {
        compatible = "lm75";
        reg = <0x4f>;
        status = "okay";
    };
};
```

:::info
The AT30TSE758 is register-compatible with the LM75 for the operations used in this lab, so the
generic `lm75` binding and driver can communicate with it.
:::

#### 3.3.3: Append the three highlighted options to `prj.conf` to enable the sensor subsystem, its shell commands, and the LM75 driver. Your Lab 3 configuration should now include all of the following:

```ini
CONFIG_SHELL=y
CONFIG_I2C=y
CONFIG_I2C_SHELL=y
# add-start
CONFIG_SENSOR=y
CONFIG_SENSOR_SHELL=y
CONFIG_LM75=y
# add-end
```

#### 3.3.4: Perform a pristine build, flash the board, and reopen the Serial Monitor:

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

Run `device list` and confirm that `lm75@4f` appears as an initialized device:

```bash-session
uart:~$ device list
```

![Zephyr device list showing the LM75-compatible temperature sensor](/images/lab3/shell_device_list_temperature_sensor.png)

---

### Step 3.4: Read the Temperature Through the Sensor Subsystem

#### 3.4.1: Query the sensor by its Devicetree node name:

```bash-session
uart:~$ sensor get lm75@4f
```

![Sensor shell output showing the ambient temperature from lm75@4f](/images/lab3/sensor_get_lm75.png)

#### 3.4.2: Query the same sensor by its `temp_sensor` node label:

```bash-session
uart:~$ sensor get temp_sensor
```

![Sensor shell output showing the ambient temperature from temp_sensor](/images/lab3/sensor_get_temp_sensor.png)

Place your finger over the sensor and rerun either command several times. Observe how the
reported ambient temperature changes.

#### 3.4.3: CHALLENGE - Read the Sensor from the Producer Thread

Using what you learned in the previous labs, update `producer.c` to read the current temperature
and deliver it to `consumer.c` through the message queue. The consumer thread then prints each
reading to the console.

First, disable the shells in `prj.conf`. The application threads will now print to the same
UART that the shell uses, so the periodic temperature output would interleave with the
`uart:~$` prompt and any commands you type. Remove the three shell options and keep the drivers:

```ini
CONFIG_GPIO=y
# remove-next-line
CONFIG_SHELL=y
CONFIG_I2C=y
# remove-next-line
CONFIG_I2C_SHELL=y
CONFIG_SENSOR=y
# remove-next-line
CONFIG_SENSOR_SHELL=y
CONFIG_LM75=y
```

When your code is complete, perform a pristine build and flash the board. The Serial Monitor
should print a new temperature reading about once per second. Place your finger over the sensor
and watch the value rise.

<details>
<summary>Solution</summary>

At the top of `producer.c`, add the device and sensor APIs between the existing Zephyr includes
and `producer.h`:

```c
#include <zephyr/kernel.h>
#include <zephyr/drivers/gpio.h>
// add-start
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>
// add-end
#include "producer.h"
```

Below the includes and before `producerThread()`, get the Devicetree node and create a device
handle. These declarations must be at file scope, outside the thread function:

```c
#include "producer.h"

// add-start
#define LM75_NODE DT_NODELABEL(temp_sensor)

static const struct device *const temp_dev = DEVICE_DT_GET(LM75_NODE);
// add-end

void producerThread(void *inLed, void* inMsgQueue, void*) {
```

Inside `producerThread()`, change `data` to a signed value (temperatures can be negative) and
confirm that the sensor driver initialized before entering the loop:

```c
    struct gpio_dt_spec *toggleLED = (struct gpio_dt_spec*)inLed;
    struct k_msgq *notifyMsgQueue = (struct k_msgq*)inMsgQueue;
    bool led_state = true;
    int counter = 0;
    // highlight-next-line
    int32_t data = 0;

    // add-start
    if (!device_is_ready(temp_dev)) {
        printk("(producer) Temperature sensor %s is not ready\n", temp_dev->name);
        return;
    }
    // add-end

    while (1) {
```

Replace the body of the existing `if(counter++>=10)` block so that it fetches a sample, converts
it to milli-degrees Celsius, and places that value in the message queue:

```c
        if(counter++>=10) {
            // remove-start
            k_msgq_put(notifyMsgQueue, &data, K_NO_WAIT);
            data++;
            // remove-end
            // add-start
            struct sensor_value temp_val;

            if (sensor_sample_fetch(temp_dev) == 0 &&
                sensor_channel_get(temp_dev, SENSOR_CHAN_AMBIENT_TEMP, &temp_val) == 0) {
                /* Send the temperature in milli-degrees Celsius. */
                data = (int32_t)sensor_value_to_milli(&temp_val);
                k_msgq_put(notifyMsgQueue, &data, K_NO_WAIT);
            } else {
                printk("(producer) Failed to read temperature\n");
            }
            // add-end
            counter = 0;
        }
```

:::info
A `struct sensor_value` holds an integer part (`val1`) and a fractional part in millionths
(`val2`). `sensor_value_to_milli()` combines them into a single integer, which fits in the
existing 4-byte message queue slots without changing `main.c`.
:::

Finally, update `consumer.c` to receive the temperature as a signed value and print it:

```c
void consumerThread(void*, void*inMsgQueue, void*){
    struct k_msgq *notifyMsgQueue = (struct k_msgq*)inMsgQueue;
    // highlight-next-line
    int32_t data = 0;

    while (1) {
        k_msgq_get(notifyMsgQueue, &data, K_FOREVER);
        // add-next-line
        printk("(consumer) Temperature: %d.%03d C\n", data / 1000, data % 1000);
    }
}
```

</details>

## Results

You enabled Zephyr's shell and I²C support, found the IO1 Xplained Pro temperature sensor on the
bus, described it in a Devicetree overlay, and read converted temperature values through the
sensor subsystem.

## Summary

This lab introduced three useful Zephyr development tools:

- The shell provides runtime inspection and interactive access to enabled subsystems.
- An I²C bus scan can confirm a peripheral's address before a driver is configured.
- Devicetree and Kconfig work together to describe hardware and include its driver. Once the
  LM75-compatible device is initialized, both the sensor shell and application code can use
  Zephyr's common sensor API instead of accessing raw registers directly.
