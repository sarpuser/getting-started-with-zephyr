#include <zephyr/kernel.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>
#include "producer.h"

#define LM75_NODE DT_NODELABEL(temp_sensor)

static const struct device *const temp_dev = DEVICE_DT_GET(LM75_NODE);

void producerThread(void *inLed, void* inMsgQueue, void*) {
      struct gpio_dt_spec *toggleLED = (struct gpio_dt_spec*)inLed;
      struct k_msgq *notifyMsgQueue = (struct k_msgq*)inMsgQueue;
      bool led_state = true;
      int counter = 0;
      int32_t data = 0;

      if (!device_is_ready(temp_dev)) {
            printk("(producer) Temperature sensor %s is not ready\n", temp_dev->name);
            return;
      }

	while (1) {
            gpio_pin_toggle_dt(toggleLED);
            led_state = !led_state;
            if(counter++>=10) {
                  struct sensor_value temp_val;

                  if (sensor_sample_fetch(temp_dev) == 0 &&
                      sensor_channel_get(temp_dev, SENSOR_CHAN_AMBIENT_TEMP, &temp_val) == 0) {
                        /* Send the temperature in milli-degrees Celsius. */
                        data = (int32_t)sensor_value_to_milli(&temp_val);
                        k_msgq_put(notifyMsgQueue, &data, K_NO_WAIT);
                  } else {
                        printk("(producer) Failed to read temperature\n");
                  }
                  counter = 0;
            }

           k_msleep(SLEEP_TIME_MS);
	}
}
