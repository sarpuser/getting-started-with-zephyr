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

The ATWINC1500-XPRO extension board connects to the SAME54 Xplained Pro via one of its EXT
headers. The table below shows the relevant signal mappings for the EXT1 connector (the default
used in this lab). An EXT3 alternative is provided in the collapsible section after the overlay
listing.

| WINC1500 Signal  | XPRO Pin | SAME54 Xplained Pro Port/Pin |
|------------------|----------|------------------------------|
| RESET            | 5        | PA6                          |
| WAKE             | 6        | PA7                          |
| IRQ              | 9        | PB7                          |
| CHIP ENABLE      | 10       | PA27                         |
| SPI CS           | 15       | PB28                         |

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
&sercom4 {
    pinctrl-0 = <&sercom4_spi_xpro>;
    // bold-next-line
    cs-gpios = <&portb 28 GPIO_ACTIVE_LOW>;

    sercom4_cs0_winc1500: WINC1500@0 {
        compatible = "atmel,winc1500";
        reg = <0>;
        spi-max-frequency = <12000000>;
        // bold-start
        irq-gpios    = <&portb 7  GPIO_ACTIVE_LOW>;
        reset-gpios  = <&porta 6 GPIO_ACTIVE_LOW>;
        enable-gpios = <&porta 7  GPIO_ACTIVE_HIGH>,
                       <&porta 27  GPIO_ACTIVE_HIGH>;
        // bold-end
        status = "okay";
    };
};
```

:::info
`enable-gpios` lists two pins, comma separated.  Since the CHIP_EN pin and the WAKE pin largely share functionality for our demo, listing them both allows the software driver to toggle them together when the chip is enabled or disabled.  You could also use a Devicetree GPIO node to configure the WAKE pin separately to manage it on your own.
:::

{/* FIXME: Validate EXT3 headings */}
<details>
<summary>Alternative: EXT3 overlay (SERCOM6)</summary>

If your ATWINC1500-XPRO is connected to the EXT3 header instead of EXT1, use the following
overlay content instead. EXT3 uses SERCOM6 with Port C pins and requires an additional
`pinctrl` node because the default `sercom6_spi_default` pinmux is not defined in the board
files.

**EXT3 Pin Mapping**

| WINC1500 Signal  | EXT3 Pin | SAME54 Xplained Pro Port/Pin |
|------------------|----------|------------------------------|
| SPI CS           | 15       | PC14                         |
| SPI MOSI         | 16       | *(pinctrl)*                  |
| SPI MISO         | 17       | *(pinctrl)*                  |
| SPI SCK          | 18       | *(pinctrl)*                  |
| IRQ              | 9        | PC30                         |
| RESET            | 10       | PC1                          |
| ENABLE (CHIP EN) | 11       | PC10                         |
| ENABLE (VCC EN)  | 12       | PC31                         |

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

<PostOverlay />
