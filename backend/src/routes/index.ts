import { Router } from 'express';
import authRoutes from './auth.routes';
import recipeRoutes from './recipe.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', data: { uptime: process.uptime() } });
});

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);

export default router;
