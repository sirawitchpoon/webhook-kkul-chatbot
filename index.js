'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const axios = require('axios');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function borrowCost(agent) {
    let bperiod = agent.parameters.bperiod;
    let bcost = ((bperiod * 10) / 7).toFixed(2);
    
    agent.add("คุณมีค่าใช้จ่ายทั้งสิ้น " + bcost + " บาท");
  }

  function catfactAPI(agent) {
    return axios.get('https://cat-fact.herokuapp.com/facts')
    .then((response) => {
      // เลือกข้อเท็จจริงแบบสุ่ม
      const facts = response.data;
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      
      // ส่งข้อเท็จจริงกลับไปยัง Dialogflow
      agent.add(`นี่คือข้อเท็จจริงเกี่ยวกับแมว: ${randomFact.text}`);
    })
    .catch((error) => {
      console.error('Error:', error);
      agent.add('ขออภัย ฉันไม่สามารถดึงข้อมูลเกี่ยวกับแมวได้ในขณะนี้');
    });
  }
  
  function randomCharacterBA(agent) {
    return axios.get('https://api-blue-archive.vercel.app/api/characters')
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


  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('BCost - custom - yes', borrowCost);
  intentMap.set('cat-fact API', catfactAPI);
  intentMap.set('Random Character BA', randomCharacterBA);

  agent.handleRequest(intentMap);
});