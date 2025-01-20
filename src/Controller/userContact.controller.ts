


import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getUserContactCollection } from '../Utils/AllDbCollection';
import verifyToken from '../Middleware/verifyToken';

const userContactCollection = getUserContactCollection()

const addUserMessage = async (req: Request, res: Response): Promise<void> => {


}




export {
addUserMessage,

}