import { Request, Response } from 'express';
var jwt = require('jsonwebtoken');
import { ObjectId } from 'mongodb';
import { getUserCollection } from '../Utils/AllDbCollection';

const userCollection= getUserCollection()

const createToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userInfo } = req.body;
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT secret is not defined in environment variables.');
        }
        const token = jwt.sign({ data: userInfo }, secret, { expiresIn: '1h' });
        res.status(200).send({ token });
    } catch (error) {
        console.error('Error creating token:', error);
        res.status(500).send({ error: 'Failed to create token' });
    }
};



const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userData = req.body;

        if (!userData || !userData.userEmail || !userData.userName) {
            res.status(400).send({ status: false, message: 'Invalid user data' });
            return;
        }

        const existingUser = await userCollection.findOne({ userEmail: userData.userEmail });
        if (existingUser) {
            res.send({ status: true, message: 'User Already Exists' });
            return;
        }

        const result = await userCollection.insertOne(userData);
      
        if (result.insertedId) {
            res.send({ status: true, message: 'User added successfully' });
        } else {
            res.send({ status: false, message: 'Failed to add user' });
        }
    
    } catch (error) {
        console.error('Error adding user:', error);
        res.send({ status: false, error: 'Failed to create user' });
    }
};


export {
    createToken,
    addUser,

};