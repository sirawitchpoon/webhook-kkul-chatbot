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
    const imageUrl = randomChar.image; // Assuming the API returns an image URL

    return { text, imageUrl };
  } catch (error) {
    console.error('Error:', error);
    return { text: `เกิดข้อผิดพลาด: ${error.message}`, imageUrl: null };
  }
}

async function callLLMModel(userQuery) {
  const HUGGINGFACE_SPACE_URL = 'https://sirawitch-kkulchatbot.hf.space/webhook';
  
  try {
    const response = await axios.post(HUGGINGFACE_SPACE_URL, {
      queryResult: {
        queryText: userQuery
      }
    });

    if (response.data && response.data.fulfillmentText) {
      return response.data.fulfillmentText;
    } else {
      throw new Error('Unexpected response format from Huggingface Space');
    }
  } catch (error) {
    console.error('Error calling Huggingface Space:', error);
    return `เกิดข้อผิดพลาดในการเรียกใช้ LLM: ${error.message}`;
  }
}

app.post('/webhook', async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const userQuery = req.body.queryResult.parameters.userQuery;

  let fulfillmentText = '';

  try {
    switch(intent) {
      case 'Default Welcome Intent':
        fulfillmentText = 'ยินดีต้อนรับสู่แชทบอทของเรา! คุณสามารถถามคำถามได้เลยค่ะ';
        break;

      case 'Default Fallback Intent':
        fulfillmentText = "ขออภัยค่ะ ฉันไม่เข้าใจคำถามของคุณ กรุณาถามใหม่อีกครั้งนะคะ";
        break;

      case 'AskLLMIntent':
        fulfillmentText = 'คุณต้องการถามอะไรกับ LLM กรุณาพิมพ์คำถามของคุณ';
        break;

      case 'AskLLMIntent - custom':
        if (!userQuery) {
          fulfillmentText = 'ขออภัยค่ะ ไม่พบคำถามของคุณ กรุณาถามคำถามอีกครั้งนะคะ';
        } else {
          const llmResponse = await callLLMModel(userQuery);
          fulfillmentText = `คำถามของคุณคือ: "${userQuery}"\n\nคำตอบ: ${llmResponse}`;            
          return res.json({ fulfillmentText });  // ส่งการตอบกลับที่สอง
        }
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

  res.json({ fulfillmentText });
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