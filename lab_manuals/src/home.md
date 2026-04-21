---
title: Getting Started with ZephyrOS
description: Microchip Masters lab manual wiki  -  24020 FRM6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting Started with ZephyrOS

ZephyrOS is an open source RTOS targeted towards embedded systems that includes community
support for many Microchip development boards. This class will introduce an engineer to the
coding environment, SDK, and debug tools available within the ZephyrOS ecosystem. Using
hands-on examples, the engineer will gain experience with useful OS primitives and tasks,
explore the hardware's Device Tree, build and deploy to target hardware.

**Upon completion, you will:**

- Learn how to install and navigate a ZephyrOS project
- Gain an understanding of the basic ZephyrOS commands and mechanics
- Create a new ZephyrOS project structure, ready for a clean application build
- Use Zephyr's `west` tool to build and debug project code for a given target
- Become familiar with the usage of built-in kernel APIs for message queues, semaphores, and tasks
- Gain insight into the ZephyrOS Devicetree system including sources and overlays

## Prerequisites

The lab material assumes you have prior experience with:

- Any embedded RTOS (Real Time Operating System)
- C language programming

## Conventions

Code blocks use the following conventions to mark changes and important lines:

**Highlighted lines** (yellow background) indicate lines that have been modified.

```c {3}
int a = 1;
int b = 2;
int c = a + b;  // this line is highlighted
```

**Green lines** indicate newly added code. Use `// add-next-line` for a single line or
`// add-start` / `// add-end` for a block.

```c
int a = 1;
// add-next-line
int b = 2;
// add-start
int c = a + b;
int d = c * 2;
// add-end
```

**Red lines** indicate code that should be deleted. Use `// delete-next-line` for a single line or
`// delete-start` / `// delete-end` for a block. `// remove-next-line` and `// remove-start` /
`// remove-end` are aliases that work the same way.

```c
// delete-start
int a = 1;
int b = a / 0;
// delete-end
int c = a + 1;
```

**Bold lines** indicate a line of particular importance. Use `// bold-next-line` for a single line or
`// bold-start` / `// bold-end` for a block.

```c
int a = 1;
// bold-next-line
void importantFunction(void);
```

**Shell session blocks** show the full prompt in a muted color so you can see which terminal you are in. The **Copy** button copies only the command, not the prompt. Selecting text manually also skips the prompt.

```bash-session
(.venv) $ west build -p always -b same54_xpro .
(.venv) $ west flash
```

```bash-session
uart:~$ kernel threads list
```

```ps-session
(.venv) PS C:\Users\you\zephyrproject> west build -p always -b same54_xpro .
```

:::info
Relevant information about a specific topic.
:::

:::warning
A critical detail that could cause issues if overlooked.
:::

:::tip
A helpful suggestion or shortcut that can make your workflow easier.
:::

## Software Requirements

The following software is required for all labs.

- [Visual Studio Code](https://code.visualstudio.com/download)
  - **Serial Monitor** extension  -  install from the VSCode Extensions tab:
    [marketplace.visualstudio.com](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-serial-monitor)
- Zephyr SDK and host tools

All needed software will be pre-installed for the in-person class. For future reference, the
completed lab code can be found at:
[github.com/sarpuser/getting-started-with-zephyt](https://github.com/sarpuser/getting-started-with-zephyt)

### Install required software

See [Appendix A: Host PC Setup Guide](/appendices/appendix-a)

## Navigation

Use the **top navbar** to select your board and navigate the labs:

| Tab | Contents |
|-----|----------|
| **SAME54** | Labs 1–3 for the SAM E54 Xplained Pro |
| **PIC32BZ6** | Labs 1–3 for the PIC32BZ6 board |
| **Appendices** | Host setup guide, VSCode debugging, WINC1500 firmware update |
