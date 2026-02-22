const askAI = require("./aiReply");

async function generateFollowup(question, course, phone){

const prompt = `
User asked: "${question}"
Course: ${course}

Write ONE WhatsApp follow-up message.

FORMAT:
• short heading
• bullet points allowed
• emojis allowed
• attractive & easy to read

RULES:
• send ONLY one final message
• do NOT give options
• do NOT explain anything
• do NOT include headings like "option 1"
• no placeholders
• no robotic tone
• build trust & clarity
• encourage reply
• do NOT add * 
End the message with:

───────────────
🎓 Take the next step toward your career

🌐 View program details:
https://whatsappchatbot-81iy.onrender.com/w/${phone.replace("@c.us","")}

🟢 Apply now:
https://whatsappchatbot-81iy.onrender.com/a/${phone.replace("@c.us","")}

📞 For guidance & support:
+91XXXXXXXXXX
───────────────
`;
  const reply = await askAI(prompt);

  return reply || `🙂 Just checking in.

Let me know if you need more details about the ${course}.`;
}

module.exports = generateFollowup;