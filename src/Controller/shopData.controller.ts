import { Request, Response } from 'express';
import { getProductCollection } from '../Utils/AllDbCollection';
import { ObjectId } from 'mongodb';

const productCollection = getProductCollection();


const getAllShopProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { item, page, } = req.query;



        const result = await productCollection.find().toArray()
        res.send({data:result , totalPage:3 , currentPage:1})

    } catch (error) {
        console.error('Error Getting Product', error);
        res.status(500).send({ error: 'Error Getting Product' });
    }
}


const getProductDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const result = await productCollection.findOne({_id: new ObjectId(id)})
        res.send(result )

    } catch (error) {
        console.error('Error Getting Product details', error);
        res.status(500).send({ error: 'Error Getting Product details' });
    }
}


export {

    getAllShopProduct,
    getProductDetails,


};