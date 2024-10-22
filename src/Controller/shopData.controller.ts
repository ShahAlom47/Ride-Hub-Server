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



const updateProductStock = async (req: Request, res: Response): Promise<void> => {
    const { soldProductsData } = req.body;

    try {
        // Iterate through the sold products and update the stock
        for (const soldProduct of soldProductsData) {
            const { productId, quantity } = soldProduct;

            const productObjectId = new ObjectId(productId);

            const updateResult = await productCollection.updateOne(
                { _id: productObjectId },
                { $inc: { stock: -quantity } } 
            );

            if (updateResult.matchedCount === 0) {
                console.error(`Product with ID ${productId} not found`);
            }
        }

        res.status(200).send({ success: true, message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).send({ success: false, message: 'Failed to update stock. Please try again.' });
    }
};

export {

    getAllShopProduct,
    getProductDetails,
    updateProductStock,


};