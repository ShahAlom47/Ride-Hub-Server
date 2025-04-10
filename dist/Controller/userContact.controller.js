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
exports.deleteUserMessage = exports.getUserMessage = exports.addUserMessage = void 0;
const mongodb_1 = require("mongodb");
const AllDbCollection_1 = require("../Utils/AllDbCollection");
const userContactCollection = (0, AllDbCollection_1.getUserContactCollection)();
const addUserMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        // Validate if the data exists and has the necessary fields
        if (!data || !data.from || !data.to) {
            res.status(400).send({ status: false, message: 'Invalid input data' });
            return;
        }
        // Insert data into the collection
        const result = yield userContactCollection.insertOne(data);
        if (result === null || result === void 0 ? void 0 : result.insertedId) {
            res.status(201).send({ status: true, message: 'Message added successfully' });
        }
        else {
            res.status(500).send({ status: false, message: 'Failed to add the message' });
        }
    }
    catch (error) {
        console.error('Error adding message:', error);
        res.status(500).send({ status: false, message: 'An error occurred while adding the message' });
    }
});
exports.addUserMessage = addUserMessage;
const getUserMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        console.log(search);
        // Pagination setup
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        // Search condition
        const searchCondition = search
            ? { to: { $regex: search, $options: "i" } } // Case-insensitive search
            : {};
        // Fetch messages with search and pagination
        const messages = yield userContactCollection
            .find(searchCondition)
            .skip(skip)
            .limit(pageSize)
            .toArray();
        // Total count of messages matching the search
        const total = yield userContactCollection.countDocuments(searchCondition);
        res.status(200).send({
            messages,
            total,
            currentPage: pageNumber,
            totalPages: Math.ceil(total / pageSize),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: false, message: "Server error", error });
    }
});
exports.getUserMessage = getUserMessage;
const deleteUserMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleteRes = yield userContactCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (deleteRes.deletedCount === 1) {
            res.status(200).json({ status: true, message: "User message deleted successfully" });
        }
        else {
            res.status(404).json({ status: false, message: "User message not found" });
        }
    }
    catch (error) {
        res.status(500).json({ status: false, message: "An error occurred while deleting the message", error });
    }
});
exports.deleteUserMessage = deleteUserMessage;
