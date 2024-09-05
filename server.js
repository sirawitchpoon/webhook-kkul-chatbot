const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

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

  if (intent === 'GetCharacterInfo') {
    const characterName = req.body.queryResult.parameters.character_name;
    const character = characterData.find(char => char.name.toLowerCase() === characterName.toLowerCase());

    if (character) {
      const response = {
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
      };
      res.json(response);
    } else {
      res.json({
        fulfillmentText: `ขออภัย ไม่พบข้อมูลของตัวละคร ${characterName}`
      });
    }
  } else {
    res.json({
      fulfillmentText: 'ขออภัย ไม่เข้าใจคำขอ กรุณาลองใหม่อีกครั้ง'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});