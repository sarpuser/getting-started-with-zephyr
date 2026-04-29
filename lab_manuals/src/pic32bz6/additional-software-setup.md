---
title: "Additional Software Setup"
sidebar_label: "Additional Software Setup"
sidebar_position: 2
slug: additional-software
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Additional Software Setup

This board requires additional software setup. Follow the instructions below.

## Switching to Microchip4Zephyr Repo

Zephyr support for this board has not yet been released to the main Zephyr repo. To that end, we need to use the Microchip fork of Zephyr. This fork contains the support for the latest Microchip boards, and will eventually be mainlined into Zephyr. For instructions on switching to the Zephyr4Microchip repo, see [Appendix D: Using the Zephyr4Microchip repo](/appendices/appendix-d).

## Downloading and Using the Custom OpenOCD Binary

Since adding new boards to OpenOCD