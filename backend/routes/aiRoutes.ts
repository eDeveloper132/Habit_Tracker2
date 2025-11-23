import express from 'express';
import { 
  getHabitRecommendations,
  getHabitInsights,
  getPersonalizedInsights,
  predictHabitSuccess
} from '../controllers/aiController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected AI routes
router.get('/recommendations', authMiddleware, getHabitRecommendations);
router.get('/insights/:id', authMiddleware, getHabitInsights); // Insights for specific habit
router.get('/insights', authMiddleware, getPersonalizedInsights); // General personalized insights
router.post('/predict-success', authMiddleware, predictHabitSuccess);

export default router;