# Queue/Broker Snippets (retry/DLQ/shutdown)

## BullMQ: retry/backoff and graceful shutdown
```ts
import { Queue, Worker } from 'bullmq'
export const queue = new Queue('emails')
export const worker = new Worker('emails', processor, {
  concurrency: 5,
  settings: { backoffStrategies: { expo: (attempts) => Math.pow(2, attempts) * 1000 } }
})
// enqueue with attempts/backoff
queue.add('send', payload, { attempts: 5, backoff: { type: 'expo' } })
// graceful shutdown
globalThis.addEventListener?.('beforeunload', () => worker.close())
```

## Kafka: consumer group and DLQ pattern (pseudo)
```ts
// process message; on non-retriable error, publish to DLQ topic
```

## RabbitMQ: prefetch/QoS and DLX
```ts
// set channel.prefetch(10); bind queue with dead-letter-exchange
```

## SQS: redrive policy and idempotency
```ts
// visibility timeout, MessageDeduplicationId for FIFO, and DLQ redrive policy
```

