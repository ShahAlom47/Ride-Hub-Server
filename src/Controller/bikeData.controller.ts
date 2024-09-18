import { Request, Response } from 'express';
import { getBikeCollection } from '../Utils/AllDbCollection';


const bikeDataCollection = getBikeCollection();

const getBikeData = async (req: Request, res: Response): Promise<void> => {
    try {
       
        const result = await bikeDataCollection.find().toArray();
     
        res.status(200).send(result);
    } catch (error) {
     
        console.error('Error fetching bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { getBikeData };
