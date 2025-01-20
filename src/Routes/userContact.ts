import { Router } from 'express';
import { addUserMessage, deleteUserMessage, getUserMessage } from '../Controller/userContact.controller';
const router = Router();


router.post('/addUserMessage', addUserMessage);
router.get(`/getUserMessage`, getUserMessage);
router.delete(`/deleteUserMessage/:id`, deleteUserMessage);

export default router;