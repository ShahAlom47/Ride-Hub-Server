import { Router } from 'express';
const router = Router();

import { addUser, createToken } from '../Controller/userData.controller';

router.post('/jwt', createToken);
router.post('/addUser', addUser);

export default router;