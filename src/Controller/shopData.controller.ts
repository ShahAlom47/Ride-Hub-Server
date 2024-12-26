import { Request, Response } from 'express';
import { getProductCollection } from '../Utils/AllDbCollection';
import { ObjectId } from 'mongodb';

const productCollection = getProductCollection();


const getAllShopProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { item, page, searchValue } = req.query;


        // Set up a query object
        const query: any = {};

        // Add search functionality if searchValue is provided
        if (searchValue) {
            const searchRegex = new RegExp(searchValue as string, 'i'); // Case-insensitive regex
            query.$or = [
                { name: searchRegex },
                { category: searchRegex },
                { brand: searchRegex },
                { description: searchRegex },
            ];
        }

        // Paginate results (default: 10 items per page)
        const itemsPerPage = 9;
        const limitItems = parseInt(item as string, 10) || itemsPerPage;
        const currentPage = parseInt(page as string, 10) || 1;
        const skip = (currentPage - 1) * itemsPerPage;

        // Query the database
        const result = await productCollection
            .find(query)
            .skip(skip)
            .limit(limitItems)
            .toArray();

        // Get the total number of matching items
        const totalItems = await productCollection.countDocuments(query);
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Send the response
        res.send({ data: result, totalPage: totalPages, currentPage });

    } catch (error) {
        console.error('Error Getting Product', error);
        res.status(500).send({ error: 'Error Getting Product' });
    }
};



const getProductDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const result = await productCollection.findOne({ _id: new ObjectId(id) })
        res.send(result)

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




const productOnline = async (req: Request, res: Response): Promise<void> => {
    try {

        const result = await productCollection.find({}).limit(8).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching products:", error);

        res.status(500).json({ message: "Failed to fetch products." });
    }
};


const editProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const updateData = req.body;
        const id = req.params.id;


        if (!ObjectId.isValid(id)) {
            res.json({ success: false, message: "Invalid product ID" });
            return;
        }


        const result = await productCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );


        if (result.matchedCount === 0) {
            res.json({ success: false, message: "Product not found" });
            return;
        }

        res.send({ success: true, message: "Product updated successfully" });
    } catch (error) {
        console.error(error);
        res.send({ success: false, message: "Something went wrong" });
    }
};




const addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const productData = req.body;
     
        if (!productData || typeof productData !== "object") {
            res.send({ success: false, message: "Invalid product data" });
            return;
        }

        const result = await productCollection.insertOne(productData);

        if (result.insertedId) {
            res.send({ success: true, message: "Product added successfully", productId: result.insertedId });
            return;
        }

        res.send({ success: false, message: "Failed to add the product" });
    } catch (error:any) {
        console.error("Error adding product:", error);
        res.send({
            success: false,
            message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
        });
    }
};


export default editProduct;




export {

    getAllShopProduct,
    getProductDetails,
    updateProductStock,
    productOnline,
    editProduct,
    addProduct,

};