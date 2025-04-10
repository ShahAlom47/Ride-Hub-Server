"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRentedBike = exports.deleteBike = exports.addBike = exports.editBikePhoto = exports.editBikeData = exports.updateBikeRentStatus = exports.getWishListData = exports.getLatestBikes = exports.updateBikeView = exports.getBikeDetails = exports.getBikeData = void 0;
const AllDbCollection_1 = require("../Utils/AllDbCollection");
const mongodb_1 = require("mongodb");
const bikeDataCollection = (0, AllDbCollection_1.getBikeCollection)();
const productCollection = (0, AllDbCollection_1.getProductCollection)();
const getBikeData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { item, page, brand, model, engine, sortValue, searchValue } = req.query;
        if (typeof item !== 'string' || typeof page !== 'string') {
            res.status(400).json({ error: 'Invalid item value' });
            return;
        }
        const filter = {};
        if (typeof brand === 'string' && brand)
            filter.brand = brand;
        if (typeof model === 'string' && model)
            filter.model = model;
        if (typeof engine === 'string' && engine)
            filter.engine_capacity = engine;
        if (typeof searchValue === 'string' && searchValue) {
            filter.$or = [
                { brand: { $regex: searchValue, $options: 'i' } },
                { model: { $regex: searchValue, $options: 'i' } }
            ];
        }
        const sortOptions = {};
        if (sortValue === 'titleAse') {
            sortOptions.brand = 1; // A-Z
        }
        else if (sortValue === 'titleDes') {
            sortOptions.brand = -1; // Z-A
        }
        else if (sortValue === 'priceAse') {
            sortOptions.rental_price_per_day = -1; // High to Low
        }
        else if (sortValue === 'priceDes') {
            sortOptions.rental_price_per_day = 1; // Low to High
        }
        const itemPerPage = parseInt(item);
        const currentPage = parseInt(page);
        const totalBikeCount = yield bikeDataCollection.countDocuments(filter);
        const totalAvailableBike = yield bikeDataCollection.countDocuments({ availability: true });
        const result = yield bikeDataCollection
            .find(filter)
            .limit(itemPerPage)
            .skip((currentPage - 1) * itemPerPage)
            .sort(sortOptions)
            .toArray();
        const totalPage = Math.ceil(totalBikeCount / itemPerPage);
        res.status(200).send({ data: result, totalPage, totalAvailableBike, currentPage });
    }
    catch (error) {
        console.error('Error fetching bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getBikeData = getBikeData;
const getBikeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const data = yield bikeDataCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        res.send(data);
    }
    catch (error) {
        console.error('Error fetching bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getBikeDetails = getBikeDetails;
const getLatestBikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield bikeDataCollection.aggregate([
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
    }
    catch (error) {
        console.error('Error fetching latest bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getLatestBikes = getLatestBikes;
// update bike card view count 
const updateBikeView = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const bikeData = yield bikeDataCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!bikeData) {
            res.send({ success: false, message: 'Bike data not found' });
            return;
        }
        const updateRes = yield bikeDataCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { total_view: (bikeData.total_view + 1) } });
        if (updateRes.modifiedCount > 0) {
            res.send({ success: true, message: 'Bike view count updated' });
        }
        else {
            res.send({ success: false, message: 'Bike view count not updated' });
        }
    }
    catch (error) {
        console.error('Error updating bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.updateBikeView = updateBikeView;
// edit bike data 
const editBikeData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const updateData = req.body;
    try {
        // Find existing bike data
        const bikeData = yield bikeDataCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!bikeData) {
            res.status(404).send({ success: false, message: 'Bike data not found' });
            return;
        }
        delete updateData._id;
        // Update the bike data
        const updateRes = yield bikeDataCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updateData } // Use `$set` to update specific fields
        );
        if (updateRes.modifiedCount > 0) {
            res.send({ success: true, message: 'Bike Data updated' });
        }
        else {
            res.send({ success: false, message: 'No changes made to the Bike Data' });
        }
    }
    catch (error) {
        console.error('Error updating bike data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.editBikeData = editBikeData;
const editBikePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { imageUrl } = req.body;
    console.log(id, imageUrl);
    if (!mongodb_1.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid bike ID' });
        return;
    }
    if (!imageUrl) {
        res.status(400).json({ success: false, message: 'Image URL is required' });
        return;
    }
    try {
        const updateRes = yield bikeDataCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { bike_image: imageUrl } });
        if (updateRes.modifiedCount > 0) {
            res.json({ success: true, message: 'Bike photo updated successfully' });
        }
        else {
            res.json({ success: false, message: 'No changes made to the bike photo' });
        }
    }
    catch (error) {
        console.error('Error updating bike photo:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
exports.editBikePhoto = editBikePhoto;
const getWishListData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = req.params.category;
        const { ids } = req.body;
        if (!category || !ids || !Array.isArray(ids)) {
            res.send({ success: false, message: 'Category or IDs not available' });
            return;
        }
        if (category === 'bike') {
            const bikeIds = ids.map(id => new mongodb_1.ObjectId(id));
            const bikes = yield bikeDataCollection.find({
                _id: { $in: bikeIds }
            }).toArray();
            res.send(bikes);
            return;
        }
        if (category === 'product') {
            const bikeIds = ids.map(id => new mongodb_1.ObjectId(id));
            const bikes = yield productCollection.find({
                _id: { $in: bikeIds }
            }).toArray();
            res.send(bikes);
            return;
        }
    }
    catch (error) {
        console.error('Error fetching WishData:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getWishListData = getWishListData;
//    update    bike rent status 
const updateBikeRentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bikeId = req.params.id;
        const rentDate = req.body;
        // console.log(bikeId,rentDate);
        // বাইক খুঁজে বের করা
        const findBike = yield bikeDataCollection.findOne({ _id: new mongodb_1.ObjectId(bikeId) });
        if (!findBike) {
            res.send({ status: false, message: 'Bike Not Found' });
            return;
        }
        if (!(findBike === null || findBike === void 0 ? void 0 : findBike.rentals)) {
            const rentRes = yield bikeDataCollection.updateOne({ _id: new mongodb_1.ObjectId(bikeId) }, {
                $set: {
                    rentals: [rentDate]
                }
            });
            if (rentRes.modifiedCount > 0) {
                res.send({ status: true, message: 'Rent date Added successfully' });
                return;
            }
        }
        const rentRes = yield bikeDataCollection.updateOne({ _id: new mongodb_1.ObjectId(bikeId) }, {
            $push: {
                rentals: rentDate
            }
        });
        if (rentRes.modifiedCount > 0) {
            res.send({ status: true, message: 'Rent date Added successfully' });
        }
        else {
            res.send({ status: false, message: 'Failed to add rent date' });
        }
    }
    catch (err) {
        console.log(err);
        res.send({ status: false, message: 'An error occurred' });
    }
});
exports.updateBikeRentStatus = updateBikeRentStatus;
// add bike 
const addBike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bikeData = req.body;
        console.log(bikeData);
        if (!bikeData) {
            res.send({ success: false, message: 'Invalid bike data provided' });
            return;
        }
        // Insert data into the database
        const addRes = yield bikeDataCollection.insertOne(bikeData);
        if (addRes.acknowledged) {
            res.send({ success: true, message: 'Successfully added bike data', data: addRes });
        }
        else {
            res.send({ success: false, message: 'Failed to add bike data' });
        }
    }
    catch (error) {
        // Log the error and send a response
        console.error('Error adding bike data:', error);
        res.status(500).send({ success: false, message: 'An error occurred while adding bike data', error });
    }
});
exports.addBike = addBike;
// delete bike 
const deleteBike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bikeId = req.params.id;
        if (!bikeId) {
            res.status(400).send({ success: false, message: "Bike ID is required." });
            return;
        }
        const deleteRes = yield bikeDataCollection.deleteOne({ _id: new mongodb_1.ObjectId(bikeId) });
        if (deleteRes.deletedCount > 0) {
            res.status(200).send({ success: true, message: "Bike deleted successfully." });
        }
        else {
            res.status(404).send({ success: false, message: "Bike not found." });
        }
    }
    catch (error) {
        console.error("Error deleting bike:", error);
        res.status(500).send({ success: false, message: "Internal server error." });
    }
});
exports.deleteBike = deleteBike;
const getUserRentedBike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = req.params.email;
        console.log("User Email:", userEmail);
        const bikes = yield bikeDataCollection.find({
            rentals: {
                $elemMatch: {
                    renterUser: userEmail,
                },
            },
        }).toArray();
        const userRentals = bikes.flatMap((bike) => {
            return bike.rentals
                .filter((rental) => (rental === null || rental === void 0 ? void 0 : rental.renterUser) === userEmail)
                .map((rental) => ({
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
    }
    catch (error) {
        console.error("Error fetching user rented bikes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUserRentedBike = getUserRentedBike;
exports.default = updateBikeView;
