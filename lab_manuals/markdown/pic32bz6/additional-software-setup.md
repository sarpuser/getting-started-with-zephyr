---
title: "Additional Software Setup"
sidebar_label: "Additional Software Setup"
sidebar_position: 2
slug: additional-software
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Additional Software Setup

This board requires additional software setup. Complete all steps below before proceeding to the labs.

## Switching to the Zephyr4Microchip Repo

Zephyr support for this board has not yet been released to the main Zephyr repo. To that end, we need to use the Microchip fork of Zephyr. This fork contains support for the latest Microchip boards and will eventually be mainlined into Zephyr. Since you have already completed the Zephyr Getting Started Guide, run the following commands from your Zephyr project directory to switch to the Microchip fork:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  $ git -C zephyr remote set-url origin https://github.com/Zephyr4Microchip/zephyr
  ```
  ```bash-session
  $ git -C zephyr fetch
  ```
  ```bash-session
  $ git -C zephyr checkout mchp_pic32cxbz_v420
  ```
  ```bash-session
  $ source .venv/bin/activate
  ```
  ```bash-session
  (.venv) $ west update
  ```
  ```bash-session
  (.venv) $ west blobs fetch hal_microchip
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  $ git -C zephyr remote set-url origin https://github.com/Zephyr4Microchip/zephyr
  ```
  ```bash-session
  $ git -C zephyr fetch
  ```
  ```bash-session
  $ git -C zephyr checkout mchp_pic32cxbz_v420
  ```
  ```bash-session
  $ source .venv/bin/activate
  ```
  ```bash-session
  (.venv) $ west update
  ```
  ```bash-session
  (.venv) $ west blobs fetch hal_microchip
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  PS C:\Users\...\zephyrproject> git -C zephyr remote set-url origin https://github.com/Zephyr4Microchip/zephyr
  ```
  ```ps-session
  PS C:\Users\...\zephyrproject> git -C zephyr fetch
  ```
  ```ps-session
  PS C:\Users\...\zephyrproject> git -C zephyr checkout mchp_pic32cx_v420
  ```
  ```ps-session
  PS C:\Users\...\zephyrproject> .\.venv\Scripts\Activate.ps1
  ```
  ```ps-session
  (.venv) PS C:\Users\...\zephyrproject> west update
  ```
  ```ps-session
  (.venv) PS C:\Users\...\zephyrproject> west blobs fetch hal_microchip
  ```

  </TabItem>
</Tabs>

## Downloading the Custom OpenOCD Binary

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

## Installing Zephyr SDK v0.17.4

:::warning
The Zephyr Getting Started Guide installs the latest SDK, which is currently v1.0.1. This version is **not compatible** with the Microchip Zephyr fork used in this course. You must install SDK v0.17.4 alongside it.
:::

Run the following commands from your Zephyr project directory. Once installed, the build system will automatically select v0.17.4.

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  $ source .venv/bin/activate
  ```
  ```bash-session
  (.venv) $ west sdk install --version 0.17.4 -t arm-zephyr-eabi
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  $ source .venv/bin/activate
  ```
  ```bash-session
  (.venv) $ west sdk install --version 0.17.4 -t arm-zephyr-eabi
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  PS C:\Users\...\zephyrproject> .\.venv\Scripts\Activate.ps1
  ```
  ```ps-session
  (.venv) PS C:\Users\...\zephyrproject> west sdk install --version 0.17.4 -t arm-zephyr-eabi
  ```

  </TabItem>
</Tabs>

:::tip
The `-t arm-zephyr-eabi` flag installs only the ARM cross-compiler toolchain, which targets the ARM Cortex-M4 processor on this board. Without it, `west sdk install` downloads cross-compilers for every supported target architecture (~4 GB). The host machine architecture (your laptop's CPU) is detected automatically regardless of this flag.
:::
