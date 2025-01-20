import { Router } from 'express';
import { addUserMessage } from '../Controller/userContact.controller';
const router = Router();


router.post('/addUserMessage', addUserMessage);

export default router;