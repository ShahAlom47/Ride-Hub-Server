import { Request, Response } from 'express';
import { getBikeCollection, getProductCollection } from '../Utils/AllDbCollection';
import { ObjectId } from 'mongodb';
import { error } from 'console';


const bikeDataCollection = getBikeCollection();
const productCollection = getProductCollection();

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
const getLatestBikes = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await bikeDataCollection.aggregate([
            {
                $group: {
                    _id: '$brand',
                    bikes: { $push: '$$ROOT' }

                }
            },
            {
                $project: {
                    brand: '$_id',
                    bikes: { $slice: ['$bikes', 2] }
                }
            },
            {
                $unwind: "$bikes"
            },
            {
                $replaceRoot: { newRoot: "$bikes" }
            }


        ]).toArray();

        res.send({ data: results });
    } catch (error) {
        console.error('Error fetching latest bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


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

// edit bike data 


const editBikeData = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const updateData = req.body;

    try {
        // Find existing bike data
        const bikeData = await bikeDataCollection.findOne({ _id: new ObjectId(id) });

        if (!bikeData) {
            res.status(404).send({ success: false, message: 'Bike data not found' });
            return;
        }
        delete updateData._id;
        // Update the bike data
        const updateRes = await bikeDataCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData } // Use `$set` to update specific fields
        );


        if (updateRes.modifiedCount > 0) {
            res.send({ success: true, message: 'Bike Data updated' });
        } else {
            res.send({ success: false, message: 'No changes made to the Bike Data' });
        }
    } catch (error) {
        console.error('Error updating bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const editBikePhoto = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const { imageUrl } = req.body;

    console.log(id, imageUrl);

    if (!ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid bike ID' });
        return;
    }

    if (!imageUrl) {
        res.status(400).json({ success: false, message: 'Image URL is required' });
        return;
    }

    try {

        const updateRes = await bikeDataCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { bike_image: imageUrl } }
        );

        if (updateRes.modifiedCount > 0) {
            res.json({ success: true, message: 'Bike photo updated successfully' });
        } else {
            res.json({ success: false, message: 'No changes made to the bike photo' });
        }
    } catch (error) {
        console.error('Error updating bike photo:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const getWishListData = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = req.params.category;
        const { ids } = req.body;

        if (!category || !ids || !Array.isArray(ids)) {
            res.send({ success: false, message: 'Category or IDs not available' });
            return;
        }

        if (category === 'bike') {
            const bikeIds = ids.map(id => new ObjectId(id));

            const bikes = await bikeDataCollection.find({
                _id: { $in: bikeIds }
            }).toArray();

            res.send(bikes);
            return;
        }
        if (category === 'product') {
            const bikeIds = ids.map(id => new ObjectId(id));

            const bikes = await productCollection.find({
                _id: { $in: bikeIds }
            }).toArray();

            res.send(bikes);
            return;
        }

    } catch (error) {
        console.error('Error fetching WishData:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


//    update    bike rent status 
const updateBikeRentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const bikeId = req.params.id;
        const rentDate = req.body;
        // console.log(bikeId,rentDate);

        // বাইক খুঁজে বের করা
        const findBike = await bikeDataCollection.findOne({ _id: new ObjectId(bikeId) });
        if (!findBike) {
            res.send({ status: false, message: 'Bike Not Found' });
            return;
        }


        if (!findBike?.rentals) {
            const rentRes = await bikeDataCollection.updateOne(
                { _id: new ObjectId(bikeId) },
                {
                    $set: {
                        rentals: [rentDate]
                    }
                }
            );

            if (rentRes.modifiedCount > 0) {
                res.send({ status: true, message: 'Rent date Added successfully' });
                return;
            }
        }


        const rentRes = await bikeDataCollection.updateOne(
            { _id: new ObjectId(bikeId) },
            {
                $push: {
                    rentals: rentDate
                }
            }
        );

        if (rentRes.modifiedCount > 0) {
            res.send({ status: true, message: 'Rent date Added successfully' });
        } else {
            res.send({ status: false, message: 'Failed to add rent date' });
        }

    } catch (err) {
        console.log(err);
        res.send({ status: false, message: 'An error occurred' });
    }
};


// add bike 
const addBike = async (req: Request, res: Response): Promise<void> => {


    try {
        const bikeData = req.body;
        console.log(bikeData);

        if (!bikeData) {
            res.send({ success: false, message: 'Invalid bike data provided' });
            return;
        }

        // Insert data into the database
        const addRes = await bikeDataCollection.insertOne(bikeData);

        if (addRes.acknowledged) {
            res.send({ success: true, message: 'Successfully added bike data', data: addRes });
        } else {
            res.send({ success: false, message: 'Failed to add bike data' });
        }
    } catch (error) {
        // Log the error and send a response
        console.error('Error adding bike data:', error);
        res.status(500).send({ success: false, message: 'An error occurred while adding bike data', error });
    }
};


// delete bike 


const deleteBike = async (req: Request, res: Response): Promise<void> => {
    try {
       
        const bikeId = req.params.id;
        if (!bikeId) {
            res.status(400).send({ success: false, message: "Bike ID is required." });
            return;
        }

     
        const deleteRes = await bikeDataCollection.deleteOne({ _id: new ObjectId(bikeId) });

    
        if (deleteRes.deletedCount > 0) {
            res.status(200).send({ success: true, message: "Bike deleted successfully." });
        } else {
            res.status(404).send({ success: false, message: "Bike not found." });
        }
    } catch (error) {
   
        console.error("Error deleting bike:", error);
        res.status(500).send({ success: false, message: "Internal server error." });
    }
};



// Define the Bike and Rental interfaces
interface Rental {
    rent_start_date: string;
    rent_end_date: string;
    renterUser: string;
}

interface Bike {
    _id: ObjectId;
    brand: string;
    model: string;
    bike_image: string;
    rental_price_per_day: number;
    rentals: Rental[];
}



const getUserRentedBike = async (req: Request, res: Response): Promise<void> => {
    try {
        const userEmail = req.params.email;
        console.log("User Email:", userEmail);

     
        const bikes = await bikeDataCollection.find({
            rentals: {
                $elemMatch: {
                    renterUser: userEmail,
                },
            },
        }).toArray();

      
        const userRentals = bikes.flatMap((bike) => {
            return bike.rentals
                .filter((rental:any) => rental?.renterUser === userEmail)
                .map((rental:any) => ({
                    bikeId: bike._id,
                    brand: bike.brand,
                    model: bike.model,
                    bikeImage: bike.bike_image,
                    rental_price_per_day: bike.rental_price_per_day,
                    rentalDetails: rental,
                }));
        });

        console.log("User Rentals:", userRentals);

        // Respond with the transformed data
        res.status(200).json(userRentals);
    } catch (error) {
        console.error("Error fetching user rented bikes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




export default updateBikeView;


export {
    getBikeData,
    getBikeDetails,
    updateBikeView,
    getLatestBikes,
    getWishListData,
    updateBikeRentStatus,
    editBikeData,
    editBikePhoto,
    addBike,
    deleteBike,
    getUserRentedBike,

};
