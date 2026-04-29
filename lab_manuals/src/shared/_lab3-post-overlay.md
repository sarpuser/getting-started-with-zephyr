import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

#### 3.2.4: Open `prj.conf` and append the following Kconfig options to enable Wi-Fi, the WINC1500 driver, and the networking stack:

```ini
CONFIG_WIFI=y

CONFIG_WIFI_WINC1500=y
CONFIG_NETWORKING=y
CONFIG_NET_IPV4=y
CONFIG_TEST_RANDOM_GENERATOR=y

CONFIG_NET_PKT_RX_COUNT=16
CONFIG_NET_PKT_TX_COUNT=16
CONFIG_NET_BUF_RX_COUNT=32
CONFIG_NET_BUF_TX_COUNT=16
CONFIG_NET_MAX_CONTEXTS=16

CONFIG_NET_DHCPV4=n
CONFIG_DNS_RESOLVER=n

CONFIG_NET_TX_STACK_SIZE=2048
CONFIG_NET_RX_STACK_SIZE=2048

CONFIG_NET_SHELL=y
CONFIG_NET_L2_WIFI_SHELL=y
```

#### 3.2.5: Perform a pristine build to ensure the overlay and new Kconfig options are picked up cleanly:

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

<Tabs groupId="os">
  <TabItem value="linux" label="Ubuntu">

  ```bash-session
  (.venv) $ west flash %FLASH_ARGS_LINUX%
  ```

  </TabItem>
  <TabItem value="macos" label="macOS">

  ```bash-session
  (.venv) $ west flash %FLASH_ARGS_MACOS%
  ```

  </TabItem>
  <TabItem value="windows" label="Windows">

  ```ps-session
  (.venv) PS C:\...\zephyrproject> west flash %FLASH_ARGS_WIN%
  ```

  </TabItem>
</Tabs>

After flashing, open the Serial Monitor and run `device list` again. The WINC1500 should now
appear as an initialised device:

```bash-session
uart:~$ device list
```

![Shell device list output showing WINC1500 appearing as an initialised device](/images/lab3/shell_device_list_winc1500.png)

---

### Step 3.3: Scan for and Connect to a Wi-Fi Network

With the WINC1500 driver active and the network shell enabled, you can control Wi-Fi directly
from the Zephyr shell over the Serial Monitor.

#### 3.3.1: Trigger a Wi-Fi scan to discover nearby access points:

```bash-session
uart:~$ wifi scan
```

Wait a few seconds for the scan to complete. A table of discovered SSIDs, signal strengths,
channels, and security modes will be printed to the console.

![Shell wifi scan output showing discovered access points with SSID, channel, and security info](/images/lab3/shell_wifi_scan.png)

#### 3.3.2: Connect to your access point by supplying the SSID and passphrase. The full command syntax is:

```bash-session
uart:~$ wifi connect -s <SSID> -p <passphrase> -k <security>
```

Replace `<SSID>`, `<passphrase>`, and `<security>` with your network details. For a typical
WPA2-PSK network (`-k 1`):

```bash-session
uart:~$ wifi connect -s "YourSSID" -p "YourPassword" -k 1
```

The `-k 1` flag selects WPA2-PSK security. The shell will print a connection status event when
the association completes.

#### 3.3.3: Verify that the network interface has been assigned an IPv4 address:

```bash-session
uart:~$ net ipv4
```

![Shell net ipv4 output showing the assigned IPv4 address on the Wi-Fi interface](/images/lab3/shell_net_ipv4.png)

Because `CONFIG_NET_DHCPV4=n` is set in `prj.conf` for this lab, a static address may need to
be configured depending on your network setup. Confirm that the address shown is reachable from
your host machine.

#### 3.3.4: Inspect the network interface to confirm the Wi-Fi link is up:

```bash-session
uart:~$ net iface
```

#### 3.3.5: Ping a host on your local network to verify end-to-end connectivity:

```bash-session
uart:~$ net ping 192.168.1.1
```

#### 3.3.6: Send a UDP packet to a listening host using the network shell:

```bash-session
uart:~$ net udp send 192.168.0.100 8085 "Hello from YourName"
```

:::info
Replace `192.168.0.100` with the IP address of a machine on your network that is listening on
UDP port 8085. You can open a listener on a host PC with:

```bash
nc -u -l 8085
```
:::

## Results

You have enabled the Zephyr shell, inspected thread state at runtime, attached the ATWINC1500
Wi-Fi module through a Device Tree overlay, and used the network shell to scan for, connect to,
and send data over a Wi-Fi access point  -  all without modifying the Zephyr kernel source.

## Summary

This lab covered three important Zephyr concepts:

- **The shell subsystem** (`CONFIG_SHELL=y`) provides a powerful runtime introspection and
  control interface over any serial backend. The `kernel threads` command shows live thread
  state and stack usage; `device list` confirms which drivers initialised successfully.
- **Device Tree overlays** allow you to describe board-level hardware connections (such as
  an SPI-attached Wi-Fi module) without modifying the upstream board definition files. The
  `cs-gpios`, `irq-gpios`, `reset-gpios`, and `enable-gpios` properties map physical header
  pins directly into the driver.
- **The networking stack and Wi-Fi shell** (`CONFIG_NETWORKING`, `CONFIG_NET_L2_WIFI_SHELL`)
  give you a high-level API for bringing up wireless connectivity with minimal application
  code. Commands like `wifi scan`, `wifi connect`, `net ipv4`, and `net udp send` let you
  test the full network path interactively from the shell.
