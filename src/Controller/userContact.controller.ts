


import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getUserContactCollection } from '../Utils/AllDbCollection';

const userContactCollection = getUserContactCollection()


const addUserMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;

        // Validate if the data exists and has the necessary fields
        if (!data || !data.from || !data.to) {
            res.status(400).send({ status: false, message: 'Invalid input data' });
            return;
        }

        // Insert data into the collection
        const result = await userContactCollection.insertOne(data);

        if (result?.insertedId) {
            res.status(201).send({ status: true, message: 'Message added successfully' });
        } else {
            res.status(500).send({ status: false, message: 'Failed to add the message' });
        }
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).send({ status: false, message: 'An error occurred while adding the message' });
    }
};





const getUserMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
console.log(search);
    // Pagination setup
    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageSize;

    // Search condition
    const searchCondition = search
      ? { to: { $regex: search as string, $options: "i" } } // Case-insensitive search
      : {};

    // Fetch messages with search and pagination
    const messages = await userContactCollection
      .find(searchCondition)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // Total count of messages matching the search
    const total = await userContactCollection.countDocuments(searchCondition);

    res.status(200).send({
        messages,
        total,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / pageSize),
     
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: false, message: "Server error", error });
  }
};



const deleteUserMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleteRes = await userContactCollection.deleteOne({ _id: new ObjectId(id) }); 
        
        if (deleteRes.deletedCount === 1) {
            res.status(200).json({status:true, message: "User message deleted successfully" });
        } else {
            res.status(404).json({status:false, message: "User message not found" });
        }
    } catch (error) {
        res.status(500).json({status:false, message: "An error occurred while deleting the message", error });
    }
};




export {
    addUserMessage,
    getUserMessage,
    deleteUserMessage

}