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
      agent.add('ขออภัย ฉันไม่สามารถสุ่มตัวละครได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
    });
}


// ข้อมูลตัวอย่าง (ในสถานการณ์จริง คุณอาจจะดึงข้อมูลนี้จากฐานข้อมูล)
const characterData = [
    {
      "_id": "634105cf07843834fd29f022",
      "name": "Asuna",
      "school": "Millennium",
      "birthday": "March 24",
      "photoUrl": "https://static.miraheze.org/bluearchivewiki/thumb/9/9f/Asuna.png/266px-Asuna.png",
      "image": "",
      "imageSchool": "https://static.miraheze.org/bluearchivewiki/thumb/2/2a/Millennium.png/50px-Millennium.png",
      "damageType": "Mystic"
  },
  ];

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

    case 'GetCharacterInfo':
      const characterName = req.body.queryResult.parameters.character_name;
      const character = characterData.find(char => char.name.toLowerCase() === characterName.toLowerCase());

      if (character) {
        return res.json({
          fulfillmentText: `ข้อมูลของ ${character.name}:
          โรงเรียน: ${character.school}
          วันเกิด: ${character.birthday}
          ประเภทความเสียหาย: ${character.damageType}`,
          fulfillmentMessages: [
            {
              card: {
                title: character.name,
                subtitle: `${character.school} | ${character.damageType}`,
                imageUri: character.image,
                buttons: [
                  {
                    text: "ดูรูปภาพเพิ่มเติม",
                    postback: character.photoUrl
                  }
                ]
              }
            }
          ]
        });
      } else {
        return res.json({
          fulfillmentText: `ขออภัย ไม่พบข้อมูลของตัวละคร ${characterName}`
        });
      }

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
