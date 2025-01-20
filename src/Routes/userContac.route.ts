import { Router } from 'express';
import { addUserMessage } from '../Controller/userContact.controller';
const router = Router();


router.post('/userContact', addUserMessage);

export default router;