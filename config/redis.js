import { createClient } from 'redis';

const client = createClient({
  url: 'redis://default:faqCfHvwLwIUCgsjnIPEqCcZCevWD6rF@redis-13748.crce206.ap-south-1-1.ec2.cloud.redislabs.com:13748'
});

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => console.log('✅ Redis connected'));

await client.connect();


export default client;