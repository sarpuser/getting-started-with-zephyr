import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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
