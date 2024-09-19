import { Request, Response } from 'express';
import { getBikeCollection } from '../Utils/AllDbCollection';
import { availableMemory } from 'process';


const bikeDataCollection = getBikeCollection();

const getBikeData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { item ,page} = req.query;

        if (typeof item !== 'string'||typeof page !== 'string' ) {
            res.status(400).json({ error: 'Invalid item value' });
            return;
        }


        const itemPerPage: number = parseInt(item)
        const currentPage = parseInt(page)
        


        const totalBikeCount = await bikeDataCollection.estimatedDocumentCount()
        const totalAvailableBike = await bikeDataCollection.countDocuments({availability:true})

        const result = await bikeDataCollection.
            find().
            limit(itemPerPage).
            skip((currentPage-1)*itemPerPage).
            toArray();

        console.log(typeof item);

        const totalPage: number = Math.ceil(totalBikeCount / itemPerPage)

        res.status(200).send({ data: result, totalPage, totalAvailableBike,currentPage });
    } catch (error) {

        console.error('Error fetching bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { getBikeData };
