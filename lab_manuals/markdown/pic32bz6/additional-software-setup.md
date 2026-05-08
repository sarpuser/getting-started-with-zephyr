---
title: "Additional Software Setup"
sidebar_label: "Additional Software Setup"
sidebar_position: 2
slug: additional-software
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Additional Software Setup

This board requires additional software setup. Complete both steps below before proceeding to the labs.

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
  $ git -C zephyr checkout mchp_pic32cx_v420
  ```
  ```bash-session
  $ source .venv/bin/activate
  ```
  ```bash-session
  (.venv) $ west update
  ```
  ```bash-session
  (.venv) $ west blob fetch hal_microchip
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
  $ git -C zephyr checkout mchp_pic32cx_v420
  ```
  ```bash-session
  $ source .venv/bin/activate
  ```
  ```bash-session
  (.venv) $ west update
  ```
  ```bash-session
  (.venv) $ west blob fetch hal_microchip
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
  (.venv) PS C:\Users\...\zephyrproject> west blob fetch hal_microchip
  ```

  </TabItem>
</Tabs>

## Downloading the Custom OpenOCD Binary

Adding new board support to the upstream OpenOCD release takes time. Microchip provides a customized OpenOCD binary that supports the latest boards ahead of upstream. Clone the repository into your Zephyr workspace:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  $ cd ~/zephyrproject
  $ git clone https://github.com/sarpuser/openOCD-wireless.git
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  $ cd ~/zephyrproject
  $ git clone https://github.com/sarpuser/openOCD-wireless.git
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  PS C:\Users\...> cd C:\Users\...\zephyrproject
  PS C:\Users\...\zephyrproject> git clone https://github.com/sarpuser/openOCD-wireless.git
  ```

  </TabItem>
</Tabs>
