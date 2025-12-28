import express from 'express';
const router = express.Router();
import { generateComprehensiveReport } from '../services/reportService';

router.post('/generate', async (req, res) => {
    try {
        const reportData = await generateComprehensiveReport(req.body.location);
        res.json(reportData);
    } catch (error) {
        res.status(500).json({ error: "Failed to synthesize report" });
    }
});

export default router;