import express from 'express';
import { 
  getAllTrips, createTrip, getTripById, 
  addDestination, addActivity, addParticipant, 
  getBudgetSummary, discoverySearch 
} from '../controllers/tripController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAllTrips);
router.post('/', authMiddleware, createTrip);
router.get('/search', authMiddleware, discoverySearch);
router.get('/:id', authMiddleware, getTripById);
router.post('/destination', authMiddleware, addDestination);
router.post('/activity', authMiddleware, addActivity);
router.post('/participant', authMiddleware, addParticipant);
router.get('/:id/budget', authMiddleware, getBudgetSummary);

export default router;
