---
title: "Lab 1: Build and Deploy a Sample Application"
sidebar_label: "Lab 1: Build and Deploy a Sample Application"
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lab 1: Build and Deploy a Sample Application

## Purpose

In this lab, the student will build and deploy their first sample application, then copy the files from this sample
application into their own project directory, making a skeleton ZephyrOS project that will be used for the rest of
these labs.

## Overview

This lab will begin by opening VSCode and a terminal pane.  You will then initiate your Python Virtual
Environment (VENV) and use this terminal to issue “west” commands to build and flash code to your %BOARD_NAME% device. You will also open a second terminal window and use SerialMonitor to view serial output from your device.

## Procedure

### Step 1.1: Build a sample application using *west*

#### 1.1.1: Launch a VSCode window by clicking on the VSCode icon or by changing directory to your project directory and typing:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  $ cd ~/zephyrproject
  ```
  ```bash-session
  $ code .
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  $ cd ~/zephyrproject
  ```
  ```bash-session
  $ code .
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  PS C:\Users\[UserID]> cd zephyrproject
  ```
  ```ps-session
  PS C:\Users\[UserID]\zephyrproject> code .
  ```

  </TabItem>
</Tabs>

#### 1.1.2: Opening VSCode will result in a confirmation window asking you to trust the folder, choose the button labeled “Yes, I trust the authors”

![VSCode trust dialog asking whether to trust folder authors](/images/lab1/vscode_trust_dialog.png)

#### 1.1.3: When VSCode is loaded, enable autosave by navigating to **File → AutoSave**

#### 1.1.4: Open a terminal pane in VSCode by navigating to **Terminal → New Terminal**

![VSCode Terminal menu showing New Terminal option](/images/lab1/vscode_terminal_menu.png)

#### 1.1.5: The `west` tool is a Python executable that can be installed globally on a system, or locally within a Python Virtual Environment (venv). Our West install is in one such venv. Each time a new terminal window is opened, the environment should be sourced with the following command:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  $ source ~/zephyrproject/.venv/bin/activate
  ```

  When complete, your terminal prompt will include the name of your virtual environment:

  ```bash-session
  (.venv) $
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  $ source ~/zephyrproject/.venv/bin/activate
  ```

  When complete, your terminal prompt will include the name of your virtual environment:

  ```bash-session
  (.venv) $
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  PS C:\Users\[UserID]\zephyrproject> .\.venv\Scripts\Activate.ps1
  ```

  When complete, your terminal prompt will include the name of your virtual environment:

  ```ps-session
  (.venv) PS C:\Users\[UserID]\zephyrproject> .
  ```

  </TabItem>
</Tabs>

You can learn more about Python Virtual Environments here: [docs.python.org/3/tutorial/venv.html](https://docs.python.org/3/tutorial/venv.html)

#### 1.1.6: From within your terminal (and `.venv`), build your first sample project targeting the %BOARD_NAME% board:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ west build -p always -b %BOARD% zephyr/samples/basic/blinky
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ west build -p always -b %BOARD% zephyr/samples/basic/blinky
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\Users\[UserID]\zephyrproject> west build -p always -b %BOARD% zephyr\samples\basic\blinky
  ```

  </TabItem>
</Tabs>

:::info
Observe the output and success messages from your build, which may resemble the following:

![West build success output showing memory region usage](/images/lab1/west_build_output.png)
:::

---

### Step 1.2: Flash the sample application to your target device using *west*

#### 1.2.1: To flash your %BOARD_NAME% with the compiled code, connect your %BOARD_NAME% board with your MicroUSB cable connected to the "Debug USB" port of your target, allow your Operating System to find and mount the device, then type:

```bash-session
(.venv) $ west flash
```

:::info
The device is now programmed and LED0 should be flashing at a rate of 1Hz.
:::

#### 1.2.2: Observe the code of the sample application by using the VSCode Navigation pane to expand `zephyr/samples/basic/blinky/src` and opening `main.c` in the main panel. Many of these code elements will be discussed within the remainder of this course.

![VSCode showing blinky main.c open with file tree expanded](/images/lab1/vscode_main_c.png)

---

### Step 1.3: Populate a new project tree, then build and deploy your custom project

#### 1.3.1: It is often easiest to use collateral from a sample project to begin creating your own project. Right-Click/Copy the `blinky` folder from this sample project and paste them to the root of the project. Then, rename the folder you just pasted to `application` You can delete the `README.rst` and `sample.yml` files.

![VSCode right-click context menu with Copy highlighted on blinky project files](/images/lab1/vscode_copy_files.png)

You can also use your terminal window and run the following commands:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ cp -r zephyr/samples/blinky application
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ cp -r zephyr/samples/blinky/
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> Copy-Item -Recurse zephyr\samples\basic\blinky application
  ```

  </TabItem>
</Tabs>

#### 1.3.2: Build this Blinky code in its new location:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ west build -p always -b %BOARD% application
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ west build -p always -b %BOARD% application
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> west build -p always -b %BOARD% application
  ```

  </TabItem>
</Tabs>

#### 1.3.3: Close any existing VSCode tabs for `main.c`, then reopen `main.c` from `./application/src/`. Edit the blink time in `main.c` to change the sleep time between blinks:

`src/main.c` Line 12:

```c {1}
#define SLEEP_TIME_MS 500
```

#### 1.3.4: Rebuild your code with the custom changes included. If you do not need a clean build and your target options haven't changed since your last build, you can simply type:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ west build
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ west build
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> west build
  ```

  </TabItem>
</Tabs>

:::tip
You can skip the full `west build -p always…` command for incremental builds. West is generally
smart enough to detect code changes and recompile as necessary before flashing. If newly added
code doesn't seem to be running as intended, try a pristine build again.
:::

#### 1.3.5: Flash this newly built code to your %BOARD_NAME% device and observe the new blink frequency:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ west flash
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ west flash
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> west flash
  ```

  </TabItem>
</Tabs>

#### 1.3.6: In a **new terminal window** (**Terminal → New Terminal**), select the "SERIAL MONITOR" tab and connect to the serial port (Start Monitoring) of the device (EDBG Virtual COM Port) to see print statements from our `main()` loop.

![VSCode Serial Monitor tab showing LED state ON/OFF output from device](/images/lab1/serial_monitor.png)

## Results

Congratulations! You have successfully built and flashed your first Zephyr projects!

## Summary

This lab introduced you to VSCode, *west*, the Zephyr sample application repository, and
SerialMonitor  -  these are all of the tools you'll need to use for the rest of these labs.
