---
title: "Appendix A: Host PC Setup Guide"
sidebar_label: "Appendix A – Host PC Setup"
sidebar_position: 1
slug: /docs/appendices/appendix-a
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ZephyrOS can be installed and used on most recent builds of Windows, macOS, and Linux. In order to re-create this lab on your own host PC, install the required dependencies as follows.

## Step 1: Follow the Zephyr Getting Started Guide

This step is common to all platforms. Follow the official Zephyr documentation to install the Zephyr SDK, Python dependencies, and toolchain for your operating system:

[https://docs.zephyrproject.org/latest/develop/getting_started/index.html](https://docs.zephyrproject.org/latest/develop/getting_started/index.html)

## Step 2: Install OpenOCD

:::warning Install OpenOCD explicitly
OpenOCD must be installed separately from the Zephyr SDK. Even if your Zephyr environment is fully configured, flashing and debugging with OpenOCD will fail unless OpenOCD is installed on your host and available on your system PATH.
:::

<Tabs groupId="os">
<TabItem value="linux" label="Ubuntu">

Install OpenOCD via `apt` and confirm it is available on your PATH:

```bash
sudo apt install openocd
which openocd
```

Reference: [OpenOCD Debug Host Tools  -  Zephyr Docs](https://docs.zephyrproject.org/latest/develop/flash_debug/host-tools.html#openocd-debug-host-tools)

</TabItem>
<TabItem value="macos" label="macOS">

Install OpenOCD via Homebrew:

```bash
brew install openocd
```

Reference: [OpenOCD Debug Host Tools  -  Zephyr Docs](https://docs.zephyrproject.org/latest/develop/flash_debug/host-tools.html#openocd-debug-host-tools)

</TabItem>
<TabItem value="windows" label="Windows">

Download and install the OpenOCD binary for Windows, then add the OpenOCD `bin/` directory to your system PATH and reboot your machine for the change to take effect.

- Reference: [OpenOCD Debug Host Tools  -  Zephyr Docs](https://docs.zephyrproject.org/latest/develop/flash_debug/host-tools.html#openocd-debug-host-tools)
- PATH guide: [Add to the PATH on Windows 10](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/)

</TabItem>
</Tabs>

## Step 3: Install VSCode and the Serial Monitor Extension

Download and install Visual Studio Code for your platform:

[https://code.visualstudio.com/download](https://code.visualstudio.com/download)

Once installed, open VSCode and navigate to the **Extensions Marketplace** (Ctrl+Shift+X / Cmd+Shift+X). Search for and install the **Serial Monitor** extension.

---

:::info Platform compatibility note
The original lab was developed on a Windows 10 host. The WINC1500 firmware flashing procedure in Supplement C requires a Windows machine. All other lab steps are fully compatible with macOS and Linux.
:::
