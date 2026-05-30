import { Queue } from "bullmq";
import IORedis from 'ioredis'

const connection = new IORedis(
    'redis://default:faqCfHvwLwIUCgsjnIPEqCcZCevWD6rF@redis-13748.crce206.ap-south-1-1.ec2.cloud.redislabs.com:13748',
    {
    maxRetriesPerRequest: null, // ⚠️ important for BullMQ
  }
)

export const aiQueue =  new Queue("ai-damage_queue",{connection});