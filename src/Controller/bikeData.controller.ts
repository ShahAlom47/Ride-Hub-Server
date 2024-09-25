import { Request, Response } from 'express';
import { getBikeCollection } from '../Utils/AllDbCollection';
import { ObjectId } from 'mongodb';


const bikeDataCollection = getBikeCollection();

const getBikeData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { item, page, brand, model, engine, sortValue, searchValue } = req.query;


        if (typeof item !== 'string' || typeof page !== 'string') {
            res.status(400).json({ error: 'Invalid item value' });
            return;
        }

        const filter: any = {};
        if (typeof brand === 'string' && brand) filter.brand = brand;
        if (typeof model === 'string' && model) filter.model = model;
        if (typeof engine === 'string' && engine) filter.engine_capacity = engine;
        if (typeof searchValue === 'string' && searchValue) {
            filter.$or = [
                { brand: { $regex: searchValue, $options: 'i' } },
                { model: { $regex: searchValue, $options: 'i' } }
            ];
        }

        const sortOptions: any = {};
        if (sortValue === 'titleAse') {
            sortOptions.brand = 1; // A-Z
        } else if (sortValue === 'titleDes') {
            sortOptions.brand = -1; // Z-A
        } else if (sortValue === 'priceAse') {
            sortOptions.rental_price_per_day = -1; // High to Low
        } else if (sortValue === 'priceDes') {
            sortOptions.rental_price_per_day = 1; // Low to High
        }

        const itemPerPage: number = parseInt(item);
        const currentPage = parseInt(page);


        const totalBikeCount = await bikeDataCollection.countDocuments(filter);
        const totalAvailableBike = await bikeDataCollection.countDocuments({ availability: true });


        const result = await bikeDataCollection
            .find(filter)
            .limit(itemPerPage)
            .skip((currentPage - 1) * itemPerPage)
            .sort(sortOptions)
            .toArray();


        const totalPage: number = Math.ceil(totalBikeCount / itemPerPage);

        res.status(200).send({ data: result, totalPage, totalAvailableBike, currentPage });
    } catch (error) {
        console.error('Error fetching bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const getBikeDetails = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id
    try {
        const data = await bikeDataCollection.findOne({ _id: new ObjectId(id) })
        res.send(data)

    }
    catch (error) {
        console.error('Error fetching bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }



}


// update bike card view count 



const updateBikeView = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    try {
        const bikeData = await bikeDataCollection.findOne({ _id: new ObjectId(id) });

        if (!bikeData) {
            res.send({ success: false, message: 'Bike data not found' });
            return;
        }

        const updateRes = await bikeDataCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { total_view: (bikeData.total_view + 1) } }
        );

        if (updateRes.modifiedCount > 0) {
            res.send({ success: true, message: 'Bike view count updated' });
        } else {
            res.send({ success: false, message: 'Bike view count not updated' });
        }
    } catch (error) {
        console.error('Error updating bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default updateBikeView;


export {
    getBikeData,
    getBikeDetails,
    updateBikeView,
    
};
