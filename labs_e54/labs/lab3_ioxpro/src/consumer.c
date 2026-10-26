#include <zephyr/kernel.h>
#include "consumer.h"

void consumerThread(void*, void*inMsgQueue, void*){
	struct k_msgq *notifyMsgQueue = (struct k_msgq*)inMsgQueue;
	uint32_t data = 0;

	while (1) {
           k_msgq_get(notifyMsgQueue, &data, K_FOREVER);
	}
}
