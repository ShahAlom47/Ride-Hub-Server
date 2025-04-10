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
exports.deleteProduct = exports.addProduct = exports.editProduct = exports.productOnline = exports.updateProductStock = exports.getProductDetails = exports.getAllShopProduct = void 0;
const AllDbCollection_1 = require("../Utils/AllDbCollection");
const mongodb_1 = require("mongodb");
const productCollection = (0, AllDbCollection_1.getProductCollection)();
const getAllShopProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { item, page, searchValue } = req.query;
        // Set up a query object
        const query = {};
        // Add search functionality if searchValue is provided
        if (searchValue) {
            const searchRegex = new RegExp(searchValue, 'i'); // Case-insensitive regex
            query.$or = [
                { name: searchRegex },
                { category: searchRegex },
                { brand: searchRegex },
                { description: searchRegex },
            ];
        }
        // Paginate results (default: 10 items per page)
        const itemsPerPage = 9;
        const limitItems = parseInt(item, 10) || itemsPerPage;
        const currentPage = parseInt(page, 10) || 1;
        const skip = (currentPage - 1) * itemsPerPage;
        // Query the database
        const result = yield productCollection
            .find(query)
            .skip(skip)
            .limit(limitItems)
            .toArray();
        // Get the total number of matching items
        const totalItems = yield productCollection.countDocuments(query);
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        // Send the response
        res.send({ data: result, totalPage: totalPages, currentPage });
    }
    catch (error) {
        console.error('Error Getting Product', error);
        res.status(500).send({ error: 'Error Getting Product' });
    }
});
exports.getAllShopProduct = getAllShopProduct;
const getProductDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const result = yield productCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        res.send(result);
    }
    catch (error) {
        console.error('Error Getting Product details', error);
        res.status(500).send({ error: 'Error Getting Product details' });
    }
});
exports.getProductDetails = getProductDetails;
const updateProductStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { soldProductsData } = req.body;
    try {
        // Iterate through the sold products and update the stock
        for (const soldProduct of soldProductsData) {
            const { productId, quantity } = soldProduct;
            const productObjectId = new mongodb_1.ObjectId(productId);
            const updateResult = yield productCollection.updateOne({ _id: productObjectId }, { $inc: { stock: -quantity } });
            if (updateResult.matchedCount === 0) {
                console.error(`Product with ID ${productId} not found`);
            }
        }
        res.status(200).send({ success: true, message: 'Stock updated successfully' });
    }
    catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).send({ success: false, message: 'Failed to update stock. Please try again.' });
    }
});
exports.updateProductStock = updateProductStock;
const productOnline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield productCollection.find({}).limit(8).toArray();
        res.send(result);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products." });
    }
});
exports.productOnline = productOnline;
const editProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateData = req.body;
        const id = req.params.id;
        if (!mongodb_1.ObjectId.isValid(id)) {
            res.json({ success: false, message: "Invalid product ID" });
            return;
        }
        const result = yield productCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updateData });
        if (result.matchedCount === 0) {
            res.json({ success: false, message: "Product not found" });
            return;
        }
        res.send({ success: true, message: "Product updated successfully" });
    }
    catch (error) {
        console.error(error);
        res.send({ success: false, message: "Something went wrong" });
    }
});
exports.editProduct = editProduct;
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productData = req.body;
        if (!productData || typeof productData !== "object") {
            res.send({ success: false, message: "Invalid product data" });
            return;
        }
        const result = yield productCollection.insertOne(productData);
        if (result.insertedId) {
            res.send({ success: true, message: "Product added successfully", productId: result.insertedId });
            return;
        }
        res.send({ success: false, message: "Failed to add the product" });
    }
    catch (error) {
        console.error("Error adding product:", error);
        res.send({
            success: false,
            message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
        });
    }
});
exports.addProduct = addProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if ID is a valid ObjectId
        if (!mongodb_1.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, message: "Invalid product ID" });
            return;
        }
        // Delete the product from the database
        const result = yield productCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        // Check if the product was deleted
        if (result.deletedCount === 0) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        // Respond with success if the product was deleted
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});
exports.deleteProduct = deleteProduct;
exports.default = editProduct;
