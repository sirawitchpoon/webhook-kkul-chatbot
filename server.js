const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

async function randomCharacterBA() {
  try {
    const response = await axios.get('https://api-blue-archive.vercel.app/api/characters', { timeout: 3000 });
    const characters = response.data.data;
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
   
    const text = `นักเรียนที่น่ารักในวันนี้ของคุณคือ: ${randomChar.name} จากโรงเรียน ${randomChar.school} วันเกิดคือ ${randomChar.birthday}`;
    const imageUrl = randomChar.image;
    return { text, imageUrl };
  } catch (error) {
    console.error('Error:', error);
    return { text: `เกิดข้อผิดพลาด: ${error.message}`, imageUrl: null };
  }
}

async function callLLMModel(userQuery) {
  try {
    const url = 'https://api.float16.cloud/dedicate/78y8fJLuzE/v1/chat/completions';
    const headers = {
      'Authorization': 'Bearer float16-AG0F8yNce5s1DiXm1ujcNrTaZquEdaikLwhZBRhyZQNeS7Dv0X',
      'Content-Type': 'application/json'
    };
    const data = {
      model: "openthaigpt/openthaigpt1.5-7b-instruct",
      messages: [
        { role: "system", content: "คุณคือผู้ช่วยตอบคำถามที่ฉลาดและซื่อสัตย์" },
        { role: "user", content: userQuery }
      ]
    };
    
    const response = await axios.post(url, data, { headers });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Float16 LLM:', error);
    return 'ขออภัยค่ะ เกิดข้อผิดพลาดในการเรียกใช้ LLM กรุณาลองใหม่อีกครั้งในภายหลังนะคะ';
  }
}

app.post('/webhook', async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const userQuery = req.body.queryResult.parameters.userQuery;
  let fulfillmentText = '';
  let fulfillmentMessages = [];

  try {
    switch(intent) {
      case 'Default Welcome Intent':
        fulfillmentText = 'ยินดีต้อนรับสู่แชทบอทของเรา! คุณสามารถถามคำถามได้เลยค่ะ';
        break;
      case 'Default Fallback Intent':
        fulfillmentText = "ขออภัยค่ะ ฉันไม่เข้าใจคำถามของคุณ กรุณาถามใหม่อีกครั้งนะคะ";
        break;
      case 'LLM':
        const llmResponse = await callLLMModel(userQuery);
        fulfillmentText = `จากคำถามว่า: "${userQuery}"\n\nได้คำตอบ: ${llmResponse}`;
        break;
      case 'GetRandomCharacterBAIntent':
        const { text, imageUrl } = await randomCharacterBA();
        fulfillmentText = text;
        if (imageUrl) {
          fulfillmentMessages = [
            {
              text: {
                text: [fulfillmentText]
              }
            },
            {
              image: {
                imageUri: imageUrl,
                accessibilityText: "Blue Archive Character Image"
              }
            }
          ];
        }
        break;  
      default:
        fulfillmentText = 'ขออภัยค่ะ ไม่เข้าใจคำขอ กรุณาลองใหม่อีกครั้งนะคะ';
    }
  } catch (error) {
    console.error('Error in webhook:', error);
    fulfillmentText = 'ขออภัยค่ะ เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้งในภายหลังนะคะ';
  }

  if (fulfillmentMessages.length > 0) {
    res.json({ fulfillmentMessages });
  } else {
    res.json({ fulfillmentText });
  }
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    fulfillmentText: 'ขออภัยค่ะ เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้งในภายหลังนะคะ'
  });
});

app.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});