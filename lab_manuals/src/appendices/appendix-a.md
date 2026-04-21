---
title: "Appendix A: Host PC Setup Guide"
sidebar_label: "Appendix A: Host PC Setup"
sidebar_position: 1
slug: appendix-a
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

```bash
sudo apt install openocd
```

Reference: [OpenOCD Debug Host Tools  -  Zephyr Docs](https://docs.zephyrproject.org/latest/develop/flash_debug/host-tools.html#openocd-debug-host-tools)

</TabItem>
<TabItem value="macos" label="macOS">

Install OpenOCD via [Homebrew](https://brew.sh/):

```bash
brew install openocd
```

Reference: [OpenOCD Debug Host Tools - Zephyr Docs](https://docs.zephyrproject.org/latest/develop/flash_debug/host-tools.html#openocd-debug-host-tools)

</TabItem>
<TabItem value="windows" label="Windows">

Download the pre-built Windows binary from the [Zephyr host-tools page](https://docs.zephyrproject.org/latest/develop/flash_debug/host-tools.html#openocd-debug-host-tools)
  and extract it to a folder of your choice (e.g. `C:\openocd`).

  **Add OpenOCD to your system PATH:**

  1. Press **Win + S** and search for **"Edit the system environment variables"**, then click it.
  2. In the System Properties dialog, click **Environment Variables...**.
  3. Under **System variables**, select **Path** and click **Edit...**.
  4. Click **New** and enter the full path to the OpenOCD `bin\` folder (e.g. `C:\openocd\bin`).
  5. Click **OK** on all dialogs to save, then **reboot**.

  {/* TODO: add screenshot of the Environment Variables dialog with the OpenOCD bin path entered */}
  ![Windows Environment Variables dialog showing OpenOCD bin path added to Path](/images/windows_openocd_path.png)

  Verify the install by opening a new PowerShell window and running:

  ```powershell
  openocd --version
  ```

</TabItem>
</Tabs>

## Step 3: Install VSCode and the Serial Monitor Extension

Download and install Visual Studio Code for your platform:

[https://code.visualstudio.com/download](https://code.visualstudio.com/download)

Once installed, open VSCode and navigate to the **Extensions Marketplace** (Ctrl+Shift+X / Cmd+Shift+X). Search for and install the **Serial Monitor** extension.
