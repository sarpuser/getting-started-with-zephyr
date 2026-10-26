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
      uint32_t data = 0;
	while (1) {
            gpio_pin_toggle_dt(toggleLED);
            led_state = !led_state;
            if(counter++>=10) {
                  struct sensor_value temp_val;
                  sensor_sample_fetch(temp_dev);
                  sensor_channel_get(temp_dev, SENSOR_CHAN_AMBIENT_TEMP, &temp_val);
                  printk("Temperature: %d.%06d C\n", temp_val.val1, temp_val.val2);
	            k_msgq_put(notifyMsgQueue, &data, K_NO_WAIT);
                  data++;
                  counter = 0;
            }

           k_msleep(SLEEP_TIME_MS);
	}
}
