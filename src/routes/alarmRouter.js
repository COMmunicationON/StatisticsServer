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

module.exports = router;