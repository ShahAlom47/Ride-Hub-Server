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
exports.changeUserRoll = exports.deleteUser = exports.getAllFirebaseUsers = exports.getAllUser = exports.clearCartProduct = exports.getUserData = exports.removeCartProduct = exports.getCartProduct = exports.addToCartProduct = exports.addUser = exports.createToken = void 0;
var jwt = require('jsonwebtoken');
const mongodb_1 = require("mongodb");
const AllDbCollection_1 = require("../Utils/AllDbCollection");
const admin = require('firebase-admin');
const auth_1 = require("firebase-admin/auth");
const serviceAccount = require('../../firbaseConfig/firebaseAdminKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const userCollection = (0, AllDbCollection_1.getUserCollection)();
const productCollection = (0, AllDbCollection_1.getProductCollection)();
const createToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userInfo } = req.body;
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT secret is not defined in environment variables.');
        }
        const token = jwt.sign({ data: userInfo }, secret, { expiresIn: '1h' });
        res.status(200).send({ token });
    }
    catch (error) {
        console.error('Error creating token:', error);
        res.status(500).send({ error: 'Failed to create token' });
    }
});
exports.createToken = createToken;
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        if (!userData || !userData.userEmail || !userData.userName) {
            res.status(400).send({ status: false, message: 'Invalid user data' });
            return;
        }
        const existingUser = yield userCollection.findOne({ userEmail: userData.userEmail });
        if (existingUser) {
            res.send({ status: true, message: 'User Already Exists' });
            return;
        }
        const result = yield userCollection.insertOne(userData);
        if (result.insertedId) {
            res.send({ status: true, message: 'User added successfully' });
        }
        else {
            res.send({ status: false, message: 'Failed to add user' });
        }
    }
    catch (error) {
        console.error('Error adding user:', error);
        res.send({ status: false, error: 'Failed to create user' });
    }
});
exports.addUser = addUser;
const getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = req.params.email;
        if (!userEmail) {
            res.status(400).send({ status: false, message: 'Invalid user email' });
            return;
        }
        const user = yield userCollection.findOne({ userEmail: userEmail }, { projection: { userPassword: 0 } });
        if (!user) {
            res.status(404).send({ status: false, message: 'User Not Found' });
            return;
        }
        res.status(200).send({ data: user, status: true, message: 'success' });
    }
    catch (error) {
        console.error('Error getting user:', error);
        res.status(500).send({ status: false, error: 'Failed to getting user' });
    }
});
exports.getUserData = getUserData;
const addToCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = req.params.email; // Get the user ID from params
        const { id } = req.body; // Get the product ID from the request body
        const user = yield userCollection.findOne({ userEmail: userEmail });
        if (!user) {
            res.send({ status: false, message: 'User not found' });
            return;
        }
        if (!user.cartProductIds) {
            user.cartProductIds = [];
        }
        if (!user.cartProductIds.includes(id)) {
            user.cartProductIds.push(id); // Add product ID to the cart
        }
        else {
            res.send({ status: false, message: 'Product already in cart' });
            return;
        }
        yield userCollection.updateOne({ userEmail: userEmail }, { $set: { cartProductIds: user.cartProductIds } });
        res.send({ status: true, message: 'Product added to cart successfully' });
    }
    catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send({ status: false, message: 'Failed to add product to cart' });
    }
});
exports.addToCartProduct = addToCartProduct;
const getCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = req.params.email;
        const user = yield userCollection.findOne({ userEmail: userEmail });
        if (!user) {
            res.send({ status: false, message: 'User not found' });
            return;
        }
        const cartProductIds = user.cartProductIds.map((id) => new mongodb_1.ObjectId(id));
        const products = yield productCollection.find({ _id: { $in: cartProductIds } }).toArray();
        const productsWithQuantity = products.map(product => {
            const cartItem = user.cartProductIds.find((item) => item === product._id.toString());
            return Object.assign(Object.assign({}, product), { quantity: 1 });
        });
        res.send(productsWithQuantity);
    }
    catch (error) {
        console.error('Error getting product :', error);
        res.status(500).send({ status: false, message: 'Failed to get product' });
    }
});
exports.getCartProduct = getCartProduct;
const removeCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userEmail, id } = req.query;
        const user = yield userCollection.findOne({ userEmail: userEmail });
        if (!user) {
            res.send({ status: false, message: 'User not found' });
            return;
        }
        const updatedCartProducts = user.cartProductIds.filter((item) => item !== id);
        const result = yield userCollection.updateOne({ userEmail: userEmail }, { $set: { cartProductIds: updatedCartProducts } });
        if (result.modifiedCount === 0) {
            res.send({ status: false, message: 'Failed to remove the product from cart' });
            return;
        }
        res.send({ status: true, message: 'Product removed from cart successfully' });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send({ status: false, message: 'Failed to delete product' });
    }
});
exports.removeCartProduct = removeCartProduct;
const clearCartProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = req.params.email;
        const user = yield userCollection.findOne({ userEmail: userEmail });
        if (!user) {
            res.send({ status: false, message: 'User not found' });
            return;
        }
        const result = yield userCollection.updateOne({ userEmail: userEmail }, { $set: { cartProductIds: [] } });
        if (result.modifiedCount === 0) {
            res.send({ status: false, message: 'Failed to remove the product from cart' });
            return;
        }
        res.send({ status: true, message: 'Product removed from cart successfully' });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send({ status: false, message: 'Failed to delete product' });
    }
});
exports.clearCartProduct = clearCartProduct;
const getAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userCollection.find().toArray();
        if (!users) {
            res.status(404).send({ status: false, message: 'Users Not Found' });
            return;
        }
        res.status(200).send({ data: users, status: true, message: 'success' });
    }
    catch (error) {
        console.error('Error getting users:', error);
        res.status(500).send({ status: false, error: 'Failed to getting users' });
    }
});
exports.getAllUser = getAllUser;
const getAllFirebaseUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = [];
        const listAllUsers = (nextPageToken) => __awaiter(void 0, void 0, void 0, function* () {
            const listUsersResult = yield admin.auth().listUsers(1000, nextPageToken);
            listUsersResult.users.forEach((userRecord) => {
                users.push(userRecord.toJSON());
            });
            if (listUsersResult.pageToken) {
                yield listAllUsers(listUsersResult.pageToken);
            }
        });
        yield listAllUsers();
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users.', error });
    }
});
exports.getAllFirebaseUsers = getAllFirebaseUsers;
// delete   user  
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firebaseId, databaseId } = req.query;
    if (!firebaseId || !databaseId) {
        res.status(400).json({
            status: false,
            message: "Firebase ID and Database ID are required.",
        });
        return;
    }
    try {
        const auth = (0, auth_1.getAuth)();
        yield auth.deleteUser(firebaseId);
        const deleteResult = yield userCollection.deleteOne({ _id: new mongodb_1.ObjectId(databaseId) });
        if (deleteResult.deletedCount === 1) {
            res.status(200).json({
                status: true,
                message: "User successfully deleted from Firebase and database.",
            });
        }
        else {
            res.status(404).json({
                status: false,
                message: "User deleted from Firebase but not found in the database.",
            });
        }
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            status: false,
            message: "Failed to delete user. Please try again later.",
        });
    }
});
exports.deleteUser = deleteUser;
const changeUserRoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { role } = req.body;
    console.log(role);
    try {
        const updatedUser = yield userCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { userRole: role } });
        if (updatedUser.matchedCount === 0) {
            res.send({ status: false, message: 'User not found' });
            return;
        }
        res.send({ status: true, message: `Role updated to ${role} successfully!` });
    }
    catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ status: false, message: 'Failed to update user role' });
    }
});
exports.changeUserRoll = changeUserRoll;
exports.default = addToCartProduct;
