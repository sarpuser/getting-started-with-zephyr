---
title: "Lab 3: Add a Shell and Winc1500 to your project "
sidebar_label: "Lab 3: Add a Shell and Winc1500 to your project"
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lab 3: Add a Shell and Winc1500 to your project

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

#### 3.1.2: Open `src/producer.c` and `src/consumer.c` and comment out any `printk` calls in the thread functions so the shell prompt is not obscured by continuous output:

```c
// highlight-next-line
// printk("Producer: put message %d\n", cnt);
```

```c
// highlight-next-line
// printk("Consumer: got message %d\n", data);
```

#### 3.1.3: Build and flash the updated firmware:

```bash-session
(.venv) $ west build -p always -b %BOARD% .
```

```bash-session
(.venv) $ west flash
```

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

```bash-session
(.venv) $ west flash
```

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

### Step 3.2: Add a Device Tree Overlay for the ATWINC1500

The ATWINC1500-XPRO extension board connects to the %BOARD_NAME% via one of its EXT headers.
The table below shows the relevant signal mappings for the EXT1 connector (the default used in
this lab). An EXT3 alternative is provided in the collapsible section after the overlay listing.

:::warning Board-specific content
The pin mapping table, overlay peripheral names, and GPIO pin numbers below are specific to
the %BOARD_NAME%. If you are working with a different board, replace these values with the
correct peripheral (e.g. SERCOMx), pinctrl reference, and port/pin numbers for your hardware.
:::

| WINC1500 Signal  | EXT1 Pin | %BOARD_NAME% Port/Pin |
|------------------|----------|-----------------------|
| SPI CS           | 15       | PB28                  |
| SPI MOSI         | 16       | *(pinctrl)*           |
| SPI MISO         | 17       | *(pinctrl)*           |
| SPI SCK          | 18       | *(pinctrl)*           |
| IRQ              | 9        | PB7                   |
| RESET            | 10       | PA6                   |
| ENABLE (CHIP EN) | 11       | PA7                   |
| ENABLE (VCC EN)  | 12       | PA27                  |

:::info
SPI MOSI, MISO, and SCK are managed automatically by the SERCOM4 SPI peripheral through
the `sercom4_spi_default` pinctrl node defined in the board support package — you do not
need to list them as individual GPIOs in the overlay.
:::

#### 3.2.2: Create a `boards/` directory inside your project root and create the overlay file:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ mkdir -p boards
  ```
  ```bash-session
  (.venv) $ touch boards/%BOARD%.overlay
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ mkdir -p boards
  ```
  ```bash-session
  (.venv) $ touch boards/%BOARD%.overlay
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> mkdir boards
  ```
  ```ps-session
  (.venv) PS C:\...\zephyrproject> ni boards\%BOARD%.overlay
  ```

  </TabItem>
</Tabs>

#### 3.2.3: Open `boards/%BOARD%.overlay` and add the following Device Tree content to configure SERCOM4 as an SPI bus and attach the WINC1500 as a device on that bus:

```dts
/
{
    aliases {
    };
};

&gmac {
    status = "disabled";
};

&sercom4 {
    compatible = "atmel,sam0-spi";
    dipo = <3>;
    dopo = <0>;
    #address-cells = <1>;
    #size-cells = <0>;
    cs-gpios = <&portb 28 GPIO_ACTIVE_LOW>;
    pinctrl-0 = <&sercom4_spi_default>;
    pinctrl-names = "default";
    status = "okay";

    sercom4_cs0_winc1500: WINC1500@0 {
        compatible = "atmel,winc1500";
        reg = <0>;
        spi-max-frequency = <12000000>;
        irq-gpios    = <&portb 7  GPIO_ACTIVE_LOW>;
        reset-gpios  = <&porta 6  GPIO_ACTIVE_LOW>;
        enable-gpios = <&porta 7  GPIO_ACTIVE_HIGH>,
                       <&porta 27 GPIO_ACTIVE_HIGH>;
        status = "okay";
    };
};
```

:::info
`&gmac` is disabled because the GMAC Ethernet peripheral shares pins with the EXT1 SPI signals
on the %BOARD_NAME%. Disabling it in the overlay releases those pins for use by SERCOM4.
:::

<details>
<summary>Alternative: EXT3 overlay (SERCOM6)</summary>

If your ATWINC1500-XPRO is connected to the EXT3 header instead of EXT1, use the following
overlay content instead. EXT3 uses SERCOM6 with Port C pins and requires an additional
`pinctrl` node because the default `sercom6_spi_default` pinmux is not defined in the board
files.

**EXT3 Pin Mapping**

| WINC1500 Signal  | EXT3 Pin | %BOARD_NAME% Port/Pin |
|------------------|----------|-----------------------|
| SPI CS           | 15       | PC14                  |
| SPI MOSI         | 16       | *(pinctrl)*           |
| SPI MISO         | 17       | *(pinctrl)*           |
| SPI SCK          | 18       | *(pinctrl)*           |
| IRQ              | 9        | PC30                  |
| RESET            | 10       | PC1                   |
| ENABLE (CHIP EN) | 11       | PC10                  |
| ENABLE (VCC EN)  | 12       | PC31                  |

```dts
/
{
    aliases {
    };
};

&gmac {
    status = "disabled";
};

&pinctrl {
    sercom6_spi_overlay: sercom6_spi_overlay {
        group1 {
            pinmux = <PC5C_SERCOM6_PAD1>,
                     <PC4C_SERCOM6_PAD0>,
                     <PC7C_SERCOM6_PAD3>;
        };
    };
};

&sercom6 {
    compatible = "atmel,sam0-spi";
    dipo = <3>;
    dopo = <0>;
    #address-cells = <1>;
    #size-cells = <0>;
    cs-gpios = <&portc 14 GPIO_ACTIVE_LOW>;
    pinctrl-0 = <&sercom6_spi_overlay>;
    pinctrl-names = "default";
    status = "okay";

    sercom6_cs0_winc1500: WINC1500@0 {
        compatible = "atmel,winc1500";
        reg = <0>;
        spi-max-frequency = <12000000>;
        irq-gpios    = <&portc 30 GPIO_ACTIVE_LOW>;
        reset-gpios  = <&portc 1  GPIO_ACTIVE_LOW>;
        enable-gpios = <&portc 10 GPIO_ACTIVE_HIGH>,
                       <&portc 31 GPIO_ACTIVE_HIGH>;
        status = "okay";
    };
};
```

</details>

#### 3.2.4: Open `prj.conf` and append the following Kconfig options to enable Wi-Fi, the WINC1500 driver, and the networking stack:

```ini
CONFIG_WIFI=y

CONFIG_WIFI_WINC1500=y
CONFIG_NETWORKING=y
CONFIG_NET_IPV4=y
CONFIG_TEST_RANDOM_GENERATOR=y

CONFIG_NET_PKT_RX_COUNT=16
CONFIG_NET_PKT_TX_COUNT=16
CONFIG_NET_BUF_RX_COUNT=32
CONFIG_NET_BUF_TX_COUNT=16
CONFIG_NET_MAX_CONTEXTS=16

CONFIG_NET_DHCPV4=n
CONFIG_DNS_RESOLVER=n

CONFIG_NET_TX_STACK_SIZE=2048
CONFIG_NET_RX_STACK_SIZE=2048

CONFIG_NET_SHELL=y
CONFIG_NET_L2_WIFI_SHELL=y
```

#### 3.2.5: Perform a pristine build to ensure the overlay and new Kconfig options are picked up cleanly:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ west build -p always -b %BOARD% .
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ west build -p always -b %BOARD% .
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> west build -p always -b %BOARD% .
  ```

  </TabItem>
</Tabs>

```bash-session
(.venv) $ west flash
```

After flashing, open the Serial Monitor and run `device list` again. The WINC1500 should now
appear as an initialised device:

```bash-session
uart:~$ device list
```

![Shell device list output showing WINC1500 appearing as an initialised device](/images/lab3/shell_device_list_winc1500.png)

---

### Step 3.3: Scan for and Connect to a Wi-Fi Network

With the WINC1500 driver active and the network shell enabled, you can control Wi-Fi directly
from the Zephyr shell over the Serial Monitor.

#### 3.3.1: Trigger a Wi-Fi scan to discover nearby access points:

```bash-session
uart:~$ wifi scan
```

Wait a few seconds for the scan to complete. A table of discovered SSIDs, signal strengths,
channels, and security modes will be printed to the console.

![Shell wifi scan output showing discovered access points with SSID, channel, and security info](/images/lab3/shell_wifi_scan.png)

#### 3.3.2: Connect to your access point by supplying the SSID and passphrase. The full command syntax is:

```bash-session
uart:~$ wifi connect -s <SSID> -p <passphrase> -k <security>
```

Replace `<SSID>`, `<passphrase>`, and `<security>` with your network details. For a typical
WPA2-PSK network (`-k 1`):

```bash-session
uart:~$ wifi connect -s "YourSSID" -p "YourPassword" -k 1
```

The `-k 1` flag selects WPA2-PSK security. The shell will print a connection status event when
the association completes.

#### 3.3.3: Verify that the network interface has been assigned an IPv4 address:

```bash-session
uart:~$ net ipv4
```

![Shell net ipv4 output showing the assigned IPv4 address on the Wi-Fi interface](/images/lab3/shell_net_ipv4.png)

Because `CONFIG_NET_DHCPV4=n` is set in `prj.conf` for this lab, a static address may need to
be configured depending on your network setup. Confirm that the address shown is reachable from
your host machine.

#### 3.3.4: Inspect the network interface to confirm the Wi-Fi link is up:

```bash-session
uart:~$ net iface
```

#### 3.3.5: Ping a host on your local network to verify end-to-end connectivity:

```bash-session
uart:~$ net ping 192.168.1.1
```

#### 3.3.6: Send a UDP packet to a listening host using the network shell:

```bash-session
uart:~$ net udp send 192.168.0.100 8085 "Hello from YourName"
```

:::info
Replace `192.168.0.100` with the IP address of a machine on your network that is listening on
UDP port 8085. You can open a listener on a host PC with:

```bash
nc -u -l 8085
```
:::

## Results

You have enabled the Zephyr shell, inspected thread state at runtime, attached the ATWINC1500
Wi-Fi module through a Device Tree overlay, and used the network shell to scan for, connect to,
and send data over a Wi-Fi access point  -  all without modifying the Zephyr kernel source.

## Summary

This lab covered three important Zephyr concepts:

- **The shell subsystem** (`CONFIG_SHELL=y`) provides a powerful runtime introspection and
  control interface over any serial backend. The `kernel threads` command shows live thread
  state and stack usage; `device list` confirms which drivers initialised successfully.
- **Device Tree overlays** allow you to describe board-level hardware connections (such as
  an SPI-attached Wi-Fi module) without modifying the upstream board definition files. The
  `cs-gpios`, `irq-gpios`, `reset-gpios`, and `enable-gpios` properties map physical header
  pins directly into the driver.
- **The networking stack and Wi-Fi shell** (`CONFIG_NETWORKING`, `CONFIG_NET_L2_WIFI_SHELL`)
  give you a high-level API for bringing up wireless connectivity with minimal application
  code. Commands like `wifi scan`, `wifi connect`, `net ipv4`, and `net udp send` let you
  test the full network path interactively from the shell.
