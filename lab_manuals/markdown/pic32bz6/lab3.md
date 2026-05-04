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

The ATWINC1500-XPRO extension board connects to the PIC32WM-BZ6204 Curiosity board via the
XPRO header (J900). The table below shows the signal mappings for this connector.

| WINC1500 Signal | XPRO Pin | PIC32WM-BZ6204 Pin |
|-----------------|----------|--------------------|
| WAKE            | 3        | RPD4 (portd 4)     |
| RESET           | 4        | RPB15 (portb 15)   |
| CHIP_EN         | 6        | RPD2 (portd 2)     |
| IRQ             | 9        | RPB0 (portb 0)     |
| SPI CS          | 15       | RPB1 (portb 1)     |
| SPI MOSI        | 16       | RPB3 (portb 3)     |
| SPI MISO        | 17       | RPA4 (porta 4)     |
| SPI SCK         | 18       | RPE5 (porte 5)     |

:::info
SPI MOSI, MISO, and SCK are managed automatically by the SERCOM4 SPI peripheral through
the `sercom4_spi_xpro` pinctrl node defined in the board support package — you do not
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
/ {
    aliases {
    };
};

&sercom4 {
    compatible = "microchip,sercom-g1-spi";
    dipo = <0>;
    dopo = <2>;
    #address-cells = <1>;
    #size-cells = <0>;
    cs-gpios = <&portb 1 GPIO_ACTIVE_LOW>;
    pinctrl-0 = <&sercom4_spi_xpro>;
    pinctrl-names = "default";
    dmas = <&dmac 4 12>, <&dmac 5 13>;
    dma-names = "rx", "tx";
    status = "okay";

    sercom4_cs0_winc1500: WINC1500@0 {
        compatible = "atmel,winc1500";
        reg = <0>;
        spi-max-frequency = <12000000>;
        // bold-start
        irq-gpios    = <&portb 0  GPIO_ACTIVE_LOW>;
        reset-gpios  = <&portb 15 GPIO_ACTIVE_LOW>;
        enable-gpios = <&portd 2  GPIO_ACTIVE_HIGH>,
                       <&portd 4  GPIO_ACTIVE_HIGH>;
        // bold-end
        status = "okay";
    };
};
```

:::info
`dipo = <0>` places MISO on SERCOM4 PAD[0] (RPA4) and `dopo = <2>` places SCK on PAD[1]
(RPE5) and MOSI on PAD[3] (RPB3). The two `enable-gpios` entries control CHIP_EN (RPD2)
and WAKE (RPD4) respectively.
:::

<PostOverlay />
