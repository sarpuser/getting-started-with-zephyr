#include <zephyr/kernel.h>
#include <zephyr/drivers/gpio.h>
#include "producer.h"
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
	            k_msgq_put(notifyMsgQueue, &data, K_NO_WAIT);
                  data++;
                  counter = 0;
            }

           k_msleep(SLEEP_TIME_MS);
	}
}
