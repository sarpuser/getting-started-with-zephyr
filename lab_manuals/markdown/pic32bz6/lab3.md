---
title: "Lab 3: Add a Shell and Winc1500 to your project"
sidebar_label: "Lab 3: Add a Shell and Winc1500 to your project"
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import PreOverlay from './_lab3-pre-overlay.md';
import PostOverlay from './_lab3-post-overlay.md';

# Lab 3: Add a Shell and Winc1500 to your project

<PreOverlay />

### Step 3.2: Add a Device Tree Overlay for the ATWINC1500

#### 3.2.1: Using the WINC1500-XPRO User Guide and the PIC32-BZ6 Curiosity User Guide, find the correct pins to connect the WINC1500-XPRO to the PIC32-BZ6 Curiosity’s EXT1 connector.

| WINC1500 Signal | XPRO Pin | PIC32WM-BZ6204 Pin |
|-----------------|----------|--------------------|
| RESET           | 5        | RPB14              |
| WAKE            | 6        | RPD2               |
| IRQ             | 9        | RPB0               |
| CHIP_EN         | 10       | RPD3               |
| CHIP_SELECT     | 15       | RPB1               |


#### 3.2.2: Create a `boards/` directory inside your `application` directory and create the overlay file:

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

#### 3.2.3: Open `application/boards/%BOARD%.overlay` and add the following Device Tree content to switch SERCOM4 to the XPRO header pins and attach the WINC1500 as a device on that bus:

```dts
&pinctrl {
    sercom4_spi_xpro: sercom4_spi_xpro {
        group1 {
            pinmux = <PE5_SCOM4P1_OUT>,   /* SCK  – PAD1 */
                    <PB3_SCOM4P3_OUT>,   /* MOSI – PAD3 */
                    <PA4_SCOM4P0_IN>;    /* MISO – PAD0 */
        };
    };
};

&sercom4 {
    pinctrl-0 = <&sercom4_spi_xpro>;
    // bold-next-line
    cs-gpios = <&portb 1 GPIO_ACTIVE_LOW>;

    sercom4_cs0_winc1500: WINC1500@0 {
        compatible = "atmel,winc1500";
        reg = <0>;
        spi-max-frequency = <12000000>;
        // bold-start
        irq-gpios    = <&portb 0  GPIO_ACTIVE_LOW>;
        reset-gpios  = <&portb 14 GPIO_ACTIVE_LOW>;
        enable-gpios = <&portd 2  GPIO_ACTIVE_HIGH>,
                       <&portd 3  GPIO_ACTIVE_HIGH>;
        // bold-end
        status = "okay";
    };
};
```

:::info
`enable-gpios` lists two pins, comma separated.  Since the CHIP_EN pin and the WAKE pin largely share functionality for our demo, listing them both allows the software driver to toggle them together when the chip is enabled or disabled.  You could also use a Devicetree GPIO node to configure the WAKE pin separately to manage it on your own.
:::

<PostOverlay />
