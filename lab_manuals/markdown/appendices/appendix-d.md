---
Title: "Appendix D: Using the Zephyr4Microchip Repo"
sidebar_label: "Appendix D: Using the Zephyr4Microchip Repo"
sidebar_position: 4
slug: appendix-d
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Appendix D: Using the Zephyr4Microchip Repo

The Zephyr4Microchip repo is a fork of the main Zephyr repository that contains support for the latest Microchip dev boards. These contributions will eventually be mainlined to the main Zephyr repo. For more information, take a look at the [Zephyr4Microchip website](https://www.microchip.com/en-us/tools-resources/develop/zephyr).

## Using the Zephyr4Microchip repo *before* running `west init`

Instead of running `west init` to download the main Zephyr repo, it is possible to directly download the Microchip4Zephyr repo. Go to the folder for your zephyr project and run the following in your terminal:

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  $ source ~/zephyrproject/.venv/bin/activate
  ```
  ```bash-session
  (.venv) $ west init -m https://github.com/Zephyr4Microchip/zephyr.git --mr mchp_pic32cxbz_v420
  ```
  ```bash-session
  (.venv) $ west blob fetch hal_microchip
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  $ source ~/zephyrproject/.venv/bin/activate
  ```
  ```bash-session
  (.venv) $ west init -m https://github.com/Zephyr4Microchip/zephyr.git --mr mchp_pic32cxbz_v420
  ```
  ```bash-session
  (.venv) $ west blob fetch hal_microchip
  ```
  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  PS C:\Users\...\zephyrproject> .\.venv\Scripts\Activate.ps1
  ```
  ```ps-session
  (.venv) PS C:\Users\...\zephyrproject> west init -m https://github.com/Zephyr4Microchip/zephyr.git --mr mchp_pic32cxbz_v420
  ```
  ```ps-session
  (.venv) PS C:\Users\...\zephyrproject> west blob fetch hal_microchip
  ```

  </TabItem>
</Tabs>

## Switching to the Zephyr4Microchip repo *after* running `west init`

If you already ran `west init` and downloaded the regular Zephyr repo, you need to change the git remote and run `west update`. Run the following in your terminal in your zephyr project directory:

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