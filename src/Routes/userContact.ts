import { Router } from 'express';
import { addUserMessage, getUserMessage } from '../Controller/userContact.controller';
const router = Router();


router.post('/addUserMessage', addUserMessage);
router.get(`/getUserMessage`, getUserMessage);

export default router;