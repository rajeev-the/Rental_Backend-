

export async function damageCheck({ beforeImages, afterImages }) {
  let totalDiff = 10000;

//   for (let i = 0; i < beforeImages.length; i++) {
//     const before = await sharp(beforeImages[i]).raw().toBuffer();
//     const after = await sharp(afterImages[i]).raw().toBuffer();

//     const diff = pixelmatch(before, after, null, 500, 500);
//     totalDiff += diff;
//   }

  const damageDetected = totalDiff > 5000;

  return {
    damageDetected,
    severity: totalDiff > 20000 ? "high" : totalDiff > 10000 ? "medium" : "low",
    areas: ["unknown"], // can't detect exact area
    confidence: Math.min(totalDiff / 30000, 1),
  };
}



// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function damageCheck({ beforeImages, afterImages }) {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

//   const results = [];

//   for (let i = 0; i < beforeImages.length; i++) {
//     const beforeBase64 = fs.readFileSync(beforeImages[i], {
//       encoding: "base64",
//     });

//     const afterBase64 = fs.readFileSync(afterImages[i], {
//       encoding: "base64",
//     });

//     const prompt = `
// Compare these two images:
// - First image: BEFORE
// - Second image: AFTER

// Detect damage and return STRICT JSON:

// {
//   "damageDetected": boolean,
//   "severity": "low | medium | high",
//   "areas": ["list of damaged parts"],
//   "confidence": number (0 to 1)
// }
// `;

//     const response = await model.generateContent([
//       prompt,
//       {
//         inlineData: {
//           data: beforeBase64,
//           mimeType: "image/jpeg",
//         },
//       },
//       {
//         inlineData: {
//           data: afterBase64,
//           mimeType: "image/jpeg",
//         },
//       },
//     ]);

//     const text = response.response.text();

//     try {
//       const parsed = JSON.parse(text);
//       results.push(parsed);
//     } catch (err) {
//       console.log("Parsing error:", text);
//     }
//   }

//   // Combine results
//   let damageDetected = results.some((r) => r.damageDetected);
//   let avgConfidence =
//     results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;

//   const severityRank = { low: 1, medium: 2, high: 3 };
//   let maxSeverity = "low";

//   for (let r of results) {
//     if (severityRank[r.severity] > severityRank[maxSeverity]) {
//       maxSeverity = r.severity;
//     }
//   }

//   return {
//     damageDetected,
//     severity: maxSeverity,
//     areas: results.flatMap((r) => r.areas || []),
//     confidence: avgConfidence,
//   };
// }