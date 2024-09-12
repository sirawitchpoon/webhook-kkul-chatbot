const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // เพิ่ม axios

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;


async function callLLMModel(agent, userQuery) {
  try {
    const response = await axios.post('https://api.anthropic.com/v1/chat/completions', {
      model: "claude-3-opus-20240229",  // หรือโมเดลอื่นที่คุณต้องการใช้
      max_tokens: 1000,
      messages: [
        {role: "user", content: userQuery}
      ]
    }, {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });

    const answer = response.data.content[0].text;
    agent.add(answer);
  } catch (error) {
    console.error('Error calling Anthropic LLM:', error);
    agent.add('ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำถามของคุณ กรุณาลองใหม่อีกครั้ง');
  }
}

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
      agent.add('ขออภัย ฉันไม่สามารถสุ่มตัวละครได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
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
