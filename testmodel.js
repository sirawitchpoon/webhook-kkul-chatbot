const axios = require('axios');

const testHuggingFaceAPI = async () => {
  const SPACE_URL = 'https://huggingface.co/spaces/Sirawitch/kkulchatbot';  // Replace with your actual Space URL
  
  const data = {
    data: [userQuery]
  };

  console.log('Calling LLM with query:', userQuery);

  try {
    const response = await axios.post(SPACE_URL, data);
    
    if (!response.data || !response.data.data || response.data.data.length === 0) {
      throw new Error('Unexpected response format from Hugging Face Space');
    }
    
    const modelReply = response.data.data[0];
    console.log('Model reply:', modelReply);
    return `คำถามของคุณคือ: "${userQuery}"\n\nคำตอบ: ${modelReply}`;
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    return `เกิดข้อผิดพลาดในการเรียกใช้ LLM: ${error.message}`;
  }
};

testHuggingFaceAPI();

// ข้อมูลตัวอย่าง (ในสถานการณ์จริง คุณอาจจะดึงข้อมูลนี้จากฐานข้อมูล)
// const characterData = [
//     {
//       "_id": "634105cf07843834fd29f022",
//       "name": "Asuna",
//       "school": "Millennium",
//       "birthday": "March 24",
//       "photoUrl": "https://static.miraheze.org/bluearchivewiki/thumb/9/9f/Asuna.png/266px-Asuna.png",
//       "image": "",
//       "imageSchool": "https://static.miraheze.org/bluearchivewiki/thumb/2/2a/Millennium.png/50px-Millennium.png",
//       "damageType": "Mystic"
//   },
//   ];

    // case 'GetCharacterInfo':
    //   const characterName = req.body.queryResult.parameters.character_name;
    //   const character = characterData.find(char => char.name.toLowerCase() === characterName.toLowerCase());

    //   if (character) {
    //     return res.json({
    //       fulfillmentText: `ข้อมูลของ ${character.name}:
    //       โรงเรียน: ${character.school}
    //       วันเกิด: ${character.birthday}
    //       ประเภทความเสียหาย: ${character.damageType}`,
    //       fulfillmentMessages: [
    //         {
    //           card: {
    //             title: character.name,
    //             subtitle: `${character.school} | ${character.damageType}`,
    //             imageUri: character.image,
    //             buttons: [
    //               {
    //                 text: "ดูรูปภาพเพิ่มเติม",
    //                 postback: character.photoUrl
    //               }
    //             ]
    //           }
    //         }
    //       ]
    //     });
    //   } else {
    //     return res.json({
    //       fulfillmentText: `ขออภัย ไม่พบข้อมูลของตัวละคร ${characterName}`
    //     });
    //   }