import {Worker } from "bullmq";
import IORedis from "ioredis";
import { damageCheck } from "./controllers/aicontroller.js";
import Rental from "./model/Rental.js";
import AIReport from "./model/AIReport.js";

const connection = new IORedis(
     'redis://default:faqCfHvwLwIUCgsjnIPEqCcZCevWD6rF@redis-13748.crce206.ap-south-1-1.ec2.cloud.redislabs.com:13748',
    {
    maxRetriesPerRequest: null, // ⚠️ important for BullMQ
  }
);

const worker = new Worker("ai-damage-queue", async(job)=>{
    const { rentalId, beforeImages, afterImages } = job.data;

      // 🔮 AI CALL
    const aiResult = await damageCheck({
      beforeImages,
      afterImages,
    });

      // 🧾 Save report
    const report = await AIReport.create({
      rentalId,
      damageDetected: aiResult.damageDetected,
      severity: aiResult.severity,
      areas: aiResult.areas,
      confidence: aiResult.confidence,
      rawResponse: aiResult,
    });

    // 🔄 Update rental
    await Rental.findByIdAndUpdate(rentalId, {
      aiReportId: report._id,
      status: "completed",
    });




},{
    connection
});

worker.on("completed",(job)=>{
 console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job.id}`, err);
});