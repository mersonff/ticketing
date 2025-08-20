import express, { Request, Response } from 'express';
import { User } from '../models/user';

const router = express.Router();

router.get('/api/users/list', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('email id createdAt');
    res.send({ users });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch users' });
  }
});

export { router as listUsersRouter };
