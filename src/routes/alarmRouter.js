const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const dbController = require('../controllers/dbController.js');

let db

// 공지 및 게시판 정보 반환
router.get('/getAnnouncement', async function (req, res, next) {
    try {
        const client = await dbController;
        console.log('AnnouncementRouter.js => DB연결성공')
        const db = client.db('comon');
        const collection = db.collection('announcement');

        // createdAt 날짜가 최신인 순으로 정렬하여 최신 10개의 공지사항 가져오기
        const latestAnnouncements = await collection.find({})
                                                    .sort({ createdAt: -1 })
                                                    .limit(10)
                                                    .project({ title: 1, content: 1, _id: 0 })
                                                    .toArray();

        res.json(latestAnnouncements);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '서버에서 오류가 발생했습니다.' });
    }

});

// 마지막 훈련으로부터 경과한 시간 반환
router.get('/getTimeElapsed', async function(req, res, next) {
    try {
        const client = await dbController;
        console.log('alarmRouter.js => DB연결성공')
        const db = client.db('comon');
        const collection = db.collection('score');

        // 문서 가져오기
        const documents = await collection.find({}).toArray();

         // 첫 번째 도큐먼트를 선택
         const document = documents[0];

        if (!document) {
            return res.status(404).json({ error: '사용자의 점수 도큐먼트를 찾을 수 없습니다.' });
        }

        // syllable_score, word_score, sentence_score에서 가장 마지막 object를 찾는 함수
        const getLastObjectCreatedAt = (scoreArray) => {
            if (scoreArray.length === 0) {
                return null; // 배열이 비어있으면 null 반환
            } else {
                return scoreArray[scoreArray.length - 1].createdAT;
            }
        };

        // 각 score 타입별로 마지막 object의 createdAT 값을 찾음
        const lastSyllableScoreCreatedAt = getLastObjectCreatedAt(document.syllable_score);
        const lastWordScoreCreatedAt = getLastObjectCreatedAt(document.word_score);
        const lastSentenceScoreCreatedAt = getLastObjectCreatedAt(document.sentence_score);

        // UTC 기준으로 현재 시간 가져오기
        const currentTime = new Date(new Date().toUTCString());

        // 마지막 점수가 있는 경우에만 차이 계산
        let syllableTimeElapsed = null;
        let wordTimeElapsed = null;
        let sentenceTimeElapsed = null;
        if (lastSyllableScoreCreatedAt) {
            syllableTimeElapsed = Math.floor((currentTime - lastSyllableScoreCreatedAt) / (1000 * 60 * 60 * 24)) + 1;
        }
        if (lastWordScoreCreatedAt) {
            wordTimeElapsed = Math.floor((currentTime - lastWordScoreCreatedAt) / (1000 * 60 * 60 * 24)) + 1;
        }
        if (lastSentenceScoreCreatedAt) {
            sentenceTimeElapsed = Math.floor((currentTime - lastSentenceScoreCreatedAt) / (1000 * 60 * 60 * 24)) + 1;
        }

        // 최종 response 객체 생성
        const response = {
            lastSyllableScoreCreatedAt,
            syllableTimeElapsed,
            lastWordScoreCreatedAt,
            wordTimeElapsed,
            lastSentenceScoreCreatedAt,
            sentenceTimeElapsed
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '서버에서 오류가 발생했습니다.' });
    }
});






module.exports = router;