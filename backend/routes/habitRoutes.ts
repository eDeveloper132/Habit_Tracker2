import express from 'express';
import { 
  createHabit, 
  getHabits, 
  getHabitById, 
  updateHabit, 
  deleteHabit,
  trackHabit,
  getHabitHistory
} from '../controllers/habitController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.route('/')
  .post(authMiddleware, createHabit)
  .get(authMiddleware, getHabits);

router.route('/:id')
  .get(authMiddleware, getHabitById)
  .put(authMiddleware, updateHabit)
  .delete(authMiddleware, deleteHabit);

// Habit tracking routes
router.post('/track/:id', authMiddleware, trackHabit);
router.get('/history/:id', authMiddleware, getHabitHistory);

export default router;