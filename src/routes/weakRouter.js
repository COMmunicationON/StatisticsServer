const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const dbController = require('../controllers/dbController.js');

let db

// 2. 취약한 발음 (음절)
router.get('/weakPron', async function (req, res, next) {
    try {
        const client = await dbController;
        console.log('weakRouter.js => DB연결성공');
        const db = client.db('comon');
        const collection = db.collection('weak');
        
        // const user_id = req.query.user_id;
        
        // // user_id를 이용하여 ObjectId로 변환하여 해당 user_id에 해당하는 도큐먼트를 조회
        // const document = await collection.findOne({ user_id: ObjectId(user_id) });

        const documents = await collection.find({}).toArray();

        if (!documents) {
            // 해당 user_id에 해당하는 도큐먼트가 없는 경우
            return res.status(404).json({ error: '해당 도큐먼트를 찾을 수 없습니다.' });
        }

        // sum%count가 60 미만인 원소를 저장할 배열 초기화
        let weakPhonemes = [];

        // documents를 순회하면서 sum%count가 60 미만인 원소를 추출하여 저장
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
        if (weakPhonemes.length > 4) {
            weakPhonemes = weakPhonemes.slice(0, 4);
        }

        res.status(200).json(weakPhonemes.map(phoneme => phoneme.phoneme));
    } catch (error) {
        res.status(500).json({ error: '서버 내부 문제로 인해 요청을 처리할 수 없습니다.' });
    }
});

module.exports = router;