const express = require('express');
const dbController = require('../controllers/dbController.js');
var router = express.Router();
const mongoose = require('mongoose');
const Feedback = require('./../models/feedbackModel.js');

let db

// 1. 훈련 파트별 평균점수
router.get('/getPartAverage', async function (req, res, next) {
    try {
        const client = await dbController;
        console.log('StatisticsRouter.js => DB연결성공')
        const db = client.db('comon');
        const collection = db.collection('score');

        const documents = await collection.find({}).toArray();

        // 각 문서에서 sum과 count 필드를 이용하여 평균값을 계산
        const averages = documents.map(doc => {
            const syllableAverage = doc.sum.syllable / doc.count.syllable;
            const wordAverage = doc.sum.word / doc.count.word;
            const sentenceAverage = doc.sum.sentence / doc.count.sentence;

            return {
                user_id: doc.user_id["$oid"],
                syllable_average: syllableAverage,
                word_average: wordAverage,
                sentence_average: sentenceAverage
            };
        });

        // res.json(averages);

        res.json(averages[0]); // 첫 번째 요소만 반환
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 3. 세부 평가항목별 평균점수
router.get('/getFeedbackAverage', async (req, res) => {
    try {
        const client = await dbController;
        console.log('StatisticsRouter.js => DB연결성공')
        const db = client.db('comon');
        const collection = db.collection('score');

        // 도큐먼트 가져오기
        const documents = await collection.find({}).toArray();
        
        if (!documents || documents.length === 0) {
            return res.status(404).json({ error: '사용자의 score 데이터를 찾을 수 없습니다.' });
        }

        // 첫 번째 도큐먼트를 선택
        const document = documents[0];

        // syllable_score, word_score, sentence_score에서 각 항목의 점수들을 추출하여 배열로 저장
        const syllableScores = document.syllable_score;
        const wordScores = document.word_score;
        const sentenceScores = document.sentence_score;

        // 각 항목의 평균 계산
        const syllableAvg = calculateAverageScores(syllableScores);
        const wordAvg = calculateAverageScores(wordScores);
        const sentenceAvg = calculateAverageScores(sentenceScores);

        const result = {
            syllable_score: syllableAvg,
            word_score: wordAvg,
            sentence_score: sentenceAvg
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
    }
});

// 점수들의 평균을 계산하는 함수
function calculateAverageScores(scores) {
    if (scores.length === 0) return {};

    // 각 항목의 점수들을 배열로 추출
    const accuracyScores = scores.map(score => score.accuracy_score);
    const fluencyScores = scores.map(score => score.fluency_score);
    const completenessScores = scores.map(score => score.completeness_score);
    const pronScores = scores.map(score => score.pron_score);

    // 각 항목의 평균 계산
    const accuracyAvg = calculateAverage(accuracyScores);
    const fluencyAvg = calculateAverage(fluencyScores);
    const completenessAvg = calculateAverage(completenessScores);
    const pronAvg = calculateAverage(pronScores);

    return {
        accuracy_avg: accuracyAvg.toFixed(1),
        fluency_avg: fluencyAvg.toFixed(1),
        completeness_avg: completenessAvg.toFixed(1),
        pron_avg: pronAvg.toFixed(1)
    };
}

// 4. 총 맞춘 문제 갯수
router.get('/getTotalCount', async function (req, res, next) {
    try {
        const client = await dbController;
        console.log('StatisticsRouter.js => DB연결성공');
        const db = client.db('comon');
        const collection = db.collection('score');

        // 문서 가져오기
        const documents = await collection.find({}).toArray();

         // 첫 번째 도큐먼트를 선택
         const document = documents[0];

        if (!document) {
            return res.status(404).json({ error: '사용자의 점수 도큐먼트를 찾을 수 없습니다.' });
        }

        // total count 계산 (소수점 이하 제거)
        const totalCount = Math.floor(Object.values(document.sum).reduce((total, value) => total + value, 0) / Object.values(document.count).reduce((total, value) => total + value, 0));

        // total problem number 계산
        const totalProblemNum = Object.values(document.count).reduce((total, value) => total + value, 0) * 10;

        // percentage 계산 (수정된 부분)
        let percentage = (totalCount / totalProblemNum) * 100; // percentage 계산
        percentage = Math.round(percentage * 10) / 10; // 소수점 첫째 자리까지 반올림
        
        res.json({ totalCount, totalProblemNum, percentage });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '서버에서 오류가 발생했습니다.' });
    }
});



// 배열의 평균을 계산하는 함수
function calculateAverage(scores) {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return sum / scores.length;
}

module.exports = router;

// 1. 레벨 진척도
router.get('/getLevelAndProcess', async function (req, res, next) {
    try {
        const client = await dbController;
        console.log('alarmRouter.js => DB연결성공');
        const db = client.db('comon');
        const collection = db.collection('score');

        // 문서 가져오기
        const documents = await collection.find({}).toArray();

        // 첫 번째 도큐먼트를 선택
        const document = documents[0];

        if (!document) {
            return res.status(404).json({ error: '사용자의 점수 도큐먼트를 찾을 수 없습니다.' });
        }

        // syllable_score, word_score, sentence_score를 합친 배열 생성
        const allScores = [
            ...document.syllable_score,
            ...document.word_score,
            ...document.sentence_score
        ];

        // 전체 레벨 비율 계산
        const calculateOverallLevelProcess = (scores) => {
            const levelCounts = {};
            const totalScores = scores.length;

            // 레벨 개수 세기
            scores.forEach(score => {
                if (levelCounts[score.level]) {
                    levelCounts[score.level]++;
                } else {
                    levelCounts[score.level] = 1;
                }
            });

            // 레벨 비율 계산
            const levelProcess = {};
            for (const level in levelCounts) {
                levelProcess[level] = (levelCounts[level] / totalScores) * 100;
            }

            return levelProcess;
        };

        // 전체 레벨 비율 계산
        const overallLevelProcess = calculateOverallLevelProcess(allScores);

        // 가장 높은 비율을 차지하는 레벨과 그 비율을 찾기
        let maxLevel = null;
        let maxProcess = 0;
        for (const level in overallLevelProcess) {
            if (overallLevelProcess[level] > maxProcess) {
                maxProcess = overallLevelProcess[level];
                maxLevel = level;
            }
        }

        // 최종 response 객체 생성
        const response = {
            level: maxLevel,
            process: maxProcess
        };

        res.json(response);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '서버에서 오류가 발생했습니다.' });
    }
});