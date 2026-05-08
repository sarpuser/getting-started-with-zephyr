---
title: "Appendix E: Setting Up OpenOCD for PKOB-Equipped Boards"
sidebar_label: "Appendix E: Setting Up OpenOCD for PKOB-Equipped Boards"
sidebar_position: 5
slug: appendix-e
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Appendix E: Setting Up OpenOCD for PKOB-Equipped Boards

Some newer Microchip development boards use a PKOB (PICkit On Board) programmer/debugger instead of the EDBG interface. The PKOB is not yet supported by the upstream OpenOCD release. Two setup steps are required to use these boards with Zephyr:

1. Clone the Microchip custom OpenOCD repository
2. Flash the PKOB with CMSIS-DAP firmware so that OpenOCD can communicate with it

:::note
Once the PKOB is running CMSIS-DAP firmware, MPLAB X will not be able to detect the board. To use MPLAB X again, restore the original firmware. See [Switching Back to MPLAB Firmware](#switching-back-to-mplab-firmware) below.
:::

## Step 1: Cloning the Custom OpenOCD Repository

Adding new board support to the upstream OpenOCD release takes time. Microchip provides a customized OpenOCD binary that supports the latest boards ahead of upstream. Clone the repository into your Zephyr workspace:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  $ cd ~/zephyrproject
  $ git clone https://github.com/MicrochipTech/openOCD-wireless
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  $ cd ~/zephyrproject
  $ git clone https://github.com/MicrochipTech/openOCD-wireless
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  PS C:\Users\...> cd C:\Users\...\zephyrproject
  PS C:\Users\...\zephyrproject> git clone https://github.com/MicrochipTech/openOCD-wireless
  ```

  </TabItem>
</Tabs>

The cloned repository contains both the OpenOCD binaries and the PKOB firmware files used in the next step.

## Step 2: Flashing CMSIS-DAP Firmware onto the PKOB

### Installing pycmsisdapswitcher

Activate your Zephyr virtual environment and install the `pycmsisdapswitcher` tool:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  $ source ~/zephyrproject/.venv/bin/activate
  ```
  ```bash-session
  (.venv) $ pip install pycmsisdapswitcher
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  $ source ~/zephyrproject/.venv/bin/activate
  ```
  ```bash-session
  (.venv) $ pip install pycmsisdapswitcher
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  PS C:\Users\...\zephyrproject> .\.venv\Scripts\Activate.ps1
  ```
  ```ps-session
  (.venv) PS C:\Users\...\zephyrproject> pip install pycmsisdapswitcher
  ```

  </TabItem>
</Tabs>

### Switching to CMSIS-DAP Firmware

With your board connected via USB, run the following from your Zephyr workspace directory to flash the CMSIS-DAP firmware:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ cd ~/zephyrproject
  (.venv) $ pycmsisdapswitcher --action switch --target=evalboard --source=openOCD-wireless/pkob4-cmsis_dap-switcher/pkob4_app_cmsis-dap.hex --fwtype=cmsis
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ cd ~/zephyrproject
  (.venv) $ pycmsisdapswitcher --action switch --target=evalboard --source=openOCD-wireless/pkob4-cmsis_dap-switcher/pkob4_app_cmsis-dap.hex --fwtype=cmsis
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\Users\...\zephyrproject> pycmsisdapswitcher --action switch --target=evalboard --source=openOCD-wireless\pkob4-cmsis_dap-switcher\pkob4_app_cmsis-dap.hex --fwtype=cmsis
  ```

  </TabItem>
</Tabs>

:::note
The firmware switching process can be inconsistent. If the command fails, disconnect and reconnect the board and try running it again.
:::

Once the switch is successful, reconnect the board. OpenOCD and `west flash` will now be able to communicate with the board through the PKOB.

## Switching Back to MPLAB Firmware

To use MPLAB X with the board again, restore the original PKOB firmware:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ cd ~/zephyrproject
  (.venv) $ pycmsisdapswitcher --action switch --target=evalboard --source=openOCD-wireless/pkob4-cmsis_dap-switcher/pkob4_app.hex --fwtype=mplab
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ cd ~/zephyrproject
  (.venv) $ pycmsisdapswitcher --action switch --target=evalboard --source=openOCD-wireless/pkob4-cmsis_dap-switcher/pkob4_app.hex --fwtype=mplab
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\Users\...\zephyrproject> pycmsisdapswitcher --action switch --target=evalboard --source=openOCD-wireless\pkob4-cmsis_dap-switcher\pkob4_app.hex --fwtype=mplab
  ```

  </TabItem>
</Tabs>

:::note
As with the CMSIS-DAP switch, if the command fails, disconnect and reconnect the board and try again.
:::

After a successful switch, reconnect the board — MPLAB X will detect it as normal.
