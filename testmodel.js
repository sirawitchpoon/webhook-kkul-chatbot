const axios = require('axios');

const testHuggingFaceAPI = async () => {
  const API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B';
  const token = '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'; // แทนที่ด้วย token ของคุณ
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  try {
    console.log('Sending request to Hugging Face API...');
    console.log('API URL:', API_URL);
    console.log('Headers:', JSON.stringify(headers, null, 2));

    const response = await axios.post(API_URL, {
      inputs: '<human>: สวัสดี\n<bot>:'
    }, { headers });

    console.log('Hugging Face API response:', response.data);
  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
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