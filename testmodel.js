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
        'x-api-key': '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',
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

callLLMModel()

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