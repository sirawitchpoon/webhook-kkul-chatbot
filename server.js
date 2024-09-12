const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // เพิ่ม axios

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// ฟังก์ชันสำหรับสุ่มตัวละครจาก API พร้อมการตั้งค่า timeout
function randomCharacterBA(agent) {
    return axios.get('https://api-blue-archive.vercel.app/api/characters', { timeout: 3000 }) // ตั้งค่า timeout 3 วินาที
    .then((response) => {
      const characters = response.data.data;
      const randomChar = characters[Math.floor(Math.random() * characters.length)];
      
      agent.add(`นักเรียนที่น่ารักในวันนี้ของคุณคือ: ${randomChar.name} จากโรงเรียน ${randomChar.school} วันเกิดคือ ${randomChar.birthday}`);
    })
    .catch((error) => {
      console.error('Error:', error);
      agent.add(`เกิดข้อผิดพลาด: ${error.message}`);
    });
}

function callLLMModel(agent, userQuery) {
  const API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B';
  const token = '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'; // แทนที่ด้วย token ของคุณ
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  const data = {
      inputs: `<human>: ${userQuery}\n<bot>:`
  };

  console.log('Calling LLM with query:', userQuery);

  return axios.post(API_URL, data, { headers })
      .then((response) => {
          if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
              throw new Error('Unexpected response format from Hugging Face API');
          }
          const modelReply = response.data[0]?.generated_text.split('<bot>:')[1]?.trim() || "ขออภัย ฉันไม่สามารถให้คำตอบได้ในขณะนี้";
          console.log('Model reply:', modelReply);
          agent.add(modelReply);
      })
      .catch((error) => {
          console.error('Error details:', error.response?.data || error.message);
          agent.add(`เกิดข้อผิดพลาด: ${error.message}`);
      });
}

app.post('/webhook', (req, res) => {
  const intent = req.body.queryResult.intent.displayName;

  switch(intent) {
    case 'Default Welcome Intent':
      return res.json({
        fulfillmentText: 'Welcome to my agent!'
      });

    case 'Default Fallback Intent':
      return res.json({
        fulfillmentText: "I didn't understand. I'm sorry, can you try again?"
      });

    case 'AskLLMIntent': // Intent หลักที่ผู้ใช้จะพิมพ์ "LLM" ก่อน
      return res.json({
        fulfillmentText: 'คุณต้องการถามอะไรกับ LLM กรุณาพิมพ์คำถามของคุณ'
      });

    case 'AskLLMIntent - custom': // Follow-up Intent ที่จะรับคำถามจากผู้ใช้
      callLLMModel({
        add: (message) => {
          console.log('Response to user:', message);
          res.json({
            fulfillmentText: message
          });
        }
      }, userQuery); // ใช้ข้อความที่ผู้ใช้ถาม
      break;

    case 'GetRandomCharacterBAIntent': // Intent สำหรับเรียกฟังก์ชัน randomCharacterBA
      randomCharacterBA({
        add: (message) => res.json({
          fulfillmentText: message
        })
      });
      break;

    default:
      return res.json({
        fulfillmentText: 'ขออภัย ไม่เข้าใจคำขอ กรุณาลองใหม่อีกครั้ง'
      });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});
