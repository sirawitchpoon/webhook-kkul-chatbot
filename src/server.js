const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post('/webhook', (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;
  let responseText = '';

  // ตรวจสอบ intent และกำหนดการตอบกลับ
  switch(intentName) {
    case 'Welcome':
      responseText = 'ยินดีต้อนรับสู่บริการของเรา!';
      break;
    case 'Fallback':
      responseText = 'ขออภัย ฉันไม่เข้าใจคำถามนั้น กรุณาถามใหม่อีกครั้ง';
      break;
    // เพิ่ม case สำหรับ intent อื่นๆ ตามต้องการ
    default:
      responseText = 'ขอบคุณสำหรับคำถาม เราจะตอบกลับโดยเร็วที่สุด';
  }

  // ส่งการตอบกลับไปยัง Dialogflow
  res.json({
    fulfillmentText: responseText
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});