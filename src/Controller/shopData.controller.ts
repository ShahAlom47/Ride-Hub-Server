import { Request, Response } from 'express';
import { getProductCollection } from '../Utils/AllDbCollection';

const productCollection = getProductCollection();


const getAllShopProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { item, page, } = req.query;



        const result = await productCollection.find().toArray()
        res.send(result)

    } catch (error) {
        console.error('Error Getting Product', error);
        res.status(500).send({ error: 'Error Getting Product' });
    }
}


export {

    getAllShopProduct


};