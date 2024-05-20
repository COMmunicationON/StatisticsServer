const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const dbController = require('../controllers/dbController.js');

let db
dbController.then((client)=>{
  console.log('StatisticsRouter.js => DB연결성공')
  db = client.db('comon');
  collection = db.collection('weak');
}).catch((err)=>{
  console.log(err)
})

// 2. 취약한 발음 (음절)
router.get('/weakPron', async function (req, res, next) {
    try {
        const documents = await collection.find({}).toArray();
        
        // sum%count가 60 미만인 원소를 저장할 배열 초기화
        let weakPhonemes = [];

        // sum%count가 60 미만인 원소를 추출하여 저장
        documents.forEach(doc => {
            for (const phoneme in doc.phonemes) {
                const sumCountRatio = doc.phonemes[phoneme].sum / doc.phonemes[phoneme].count;
                if (sumCountRatio < 60) {
                    weakPhonemes.push({ phoneme, sumCountRatio });
                }
            }
        });

        // weakPhonemes 배열 정렬
        weakPhonemes.sort((a, b) => a.sumCountRatio - b.sumCountRatio);

        // 반환할 원소 개수가 5개를 초과하는 경우, 배열을 슬라이스하여 5개의 원소만 선택
        if (weakPhonemes.length > 5) {
            weakPhonemes = weakPhonemes.slice(0, 5);
        }

        // 성공 시 200 상태 코드와 결과 반환
        res.status(200).json(weakPhonemes.map(phoneme => phoneme.phoneme));
    } catch (error) {
        // 실패 시 500 상태 코드와 에러 메시지 반환
        res.status(500).json({ error: 'DB 연결 문제로 인해 요청을 처리할 수 없습니다.' });
    }
});

module.exports = router;