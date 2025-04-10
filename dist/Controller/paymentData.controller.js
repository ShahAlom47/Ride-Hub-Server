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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummery = exports.updateOrderStatus = exports.getAllOrder = exports.cancelOrder = exports.getUserOrderData = exports.addPaymentData = exports.getStripeSecretKey = void 0;
const stripe_1 = __importDefault(require("stripe"));
const AllDbCollection_1 = require("../Utils/AllDbCollection");
const mongodb_1 = require("mongodb");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const paymentCollection = (0, AllDbCollection_1.getPaymentCollection)();
const getStripeSecretKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount } = req.body;
        const amountValue = typeof amount === 'string' ? parseFloat(amount) : amount;
        const amountInt = Math.round(100 * amountValue);
        const MAX_AMOUNT = 99999999; // in the smallest currency unit, for AED this is 999,999.99 AED
        // Check if the amount exceeds the maximum allowed
        if (amountInt > MAX_AMOUNT) {
            res.send({ error: 'Amount must be no more than 999,999 AED' });
            return;
        }
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: amountInt,
            currency: "aed",
            payment_method_types: ["card"],
        });
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    }
    catch (error) {
        console.error('Error creating payment intent:', error);
        res.send({ error: 'Failed to create payment intent' });
    }
});
exports.getStripeSecretKey = getStripeSecretKey;
const addPaymentData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentData } = req.body;
        // Check if paymentData is provided
        if (!paymentData) {
            res.send({ status: false, message: 'Payment data is missing.' });
            return;
        }
        const addingRes = yield paymentCollection.insertOne(paymentData);
        if (addingRes.insertedId) {
            res.send({ status: true, message: 'Payment completed successfully.', orderId: addingRes === null || addingRes === void 0 ? void 0 : addingRes.insertedId });
            return;
        }
        else {
            res.send({ status: false, message: 'Failed to process payment.' });
        }
    }
    catch (error) {
        console.error('Error adding payment data:', error);
        res.send({ status: false, message: 'An error occurred while adding payment data.' });
    }
});
exports.addPaymentData = addPaymentData;
const getUserOrderData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userEmail = req.params.email;
        const result = yield paymentCollection.find({ userEmail: userEmail, status: { $ne: 'Cancelled' } }).toArray();
        res.send(result);
        return;
    }
    catch (error) {
        console.error('Error getting order data : ', error);
        res.send({ error: 'Failed to create payment intent' });
    }
});
exports.getUserOrderData = getUserOrderData;
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        if (!mongodb_1.ObjectId.isValid(productId)) {
            res.send({ status: false, message: 'Invalid Product ID' });
            return;
        }
        const updateRes = yield paymentCollection.updateOne({ _id: new mongodb_1.ObjectId(productId) }, { $set: { status: 'Cancelled' } });
        if (updateRes.modifiedCount === 0) {
            res.send({ status: false, message: 'Order not found or already cancelled.' });
            return;
        }
        res.send({ status: true, message: 'Order cancelled successfully.' });
    }
    catch (error) {
        console.error('Error while cancelling order: ', error);
        res.send({ error: 'Failed to cancel order. Please try again later.' });
    }
});
exports.cancelOrder = cancelOrder;
const getAllOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemPerPage = parseInt(req.query.item) || 10;
    const searchValue = req.query.search || '';
    const filterDateString = req.query.filterDate; // Get as string
    const filterDate = filterDateString ? new Date(filterDateString) : null;
    const currentPage = parseInt(req.query.currentPage) || 1;
    console.log(filterDate);
    try {
        const query = {};
        // Search query
        if (searchValue) {
            query.$or = [
                { name: { $regex: searchValue, $options: 'i' } },
                { email: { $regex: searchValue, $options: 'i' } }
            ];
        }
        // Month and Year filtering
        if (filterDate) {
            const month = filterDate.getMonth() + 1; // Local time zone month
            const year = filterDate.getFullYear(); // Local time zone year
            query.$expr = {
                $and: [
                    { $eq: [{ $month: { $toDate: "$orderDate" } }, month] },
                    { $eq: [{ $year: { $toDate: "$orderDate" } }, year] }
                ]
            };
        }
        const skipItems = (currentPage - 1) * itemPerPage;
        const orders = yield paymentCollection.find(query)
            .skip(skipItems)
            .limit(itemPerPage)
            .sort({ orderDate: -1 })
            .toArray();
        // Order summary aggregation
        const orderSummary = yield paymentCollection.aggregate([
            {
                $match: { status: { $ne: "Cancelled" } }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$finalAmount" },
                    totalTransactions: { $sum: 1 },
                    totalCustomers: { $addToSet: "$userEmail" },
                    totalProductsSold: { $sum: "$totalProduct" }
                }
            },
            {
                $project: {
                    totalRevenue: 1,
                    totalTransactions: 1,
                    totalCustomers: { $size: "$totalCustomers" },
                    totalProductsSold: 1
                }
            }
        ]).toArray();
        const totalOrders = yield paymentCollection.countDocuments(query);
        // Sending response with orders, pagination info, and summary
        res.send({
            orders,
            totalPages: Math.ceil(totalOrders / itemPerPage),
            currentPage,
            orderSummary: orderSummary[0] || {} // Return the first item of the aggregation result or empty object if none
        });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send({ message: 'Server error occurred' });
    }
});
exports.getAllOrder = getAllOrder;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const updateRes = yield paymentCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $set: { status: status }
        });
        if (updateRes.modifiedCount > 0) {
            res.send({ status: true, message: 'Order Status Updated Successfully' });
            return;
        }
        res.send({ status: false, message: 'Order Status Update Failed' });
    }
    catch (error) {
        res.send({ status: false, message: 'Order Status Update Failed' });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const getSummery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ৬ মাস আগের তারিখ বের করা
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const [summaryData] = yield paymentCollection.aggregate([
            {
                $addFields: {
                    createdAt: {
                        $toDate: "$createdAt", // `createdAt` কে Date টাইপে রূপান্তর
                    },
                },
            },
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        type: "$type",
                    },
                    totalAmount: { $sum: "$finalAmount" },
                },
            },
            {
                $group: {
                    _id: "$_id.month",
                    Shop: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", "product_purchase"] }, "$totalAmount", 0],
                        },
                    },
                    Bike: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", "rent_bike"] }, "$totalAmount", 0],
                        },
                    },
                    totalMonthAmount: { $sum: "$totalAmount" },
                },
            },
            {
                $addFields: {
                    monthName: {
                        $arrayElemAt: [
                            [
                                "", // Placeholder for index 0
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                            ],
                            "$_id",
                        ],
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $group: {
                    _id: null,
                    monthlyData: {
                        $push: {
                            month: "$monthName",
                            Shop: "$Shop",
                            Bike: "$Bike",
                            totalMonthAmount: "$totalMonthAmount",
                        },
                    },
                    totalShopAmount: { $sum: "$Shop" },
                    totalBikeAmount: { $sum: "$Bike" },
                    totalAmount: { $sum: "$totalMonthAmount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    monthlyData: 1,
                    totalShopAmount: 1,
                    totalBikeAmount: 1,
                    totalAmount: 1,
                },
            },
        ]).toArray();
        res.status(200).json(summaryData);
    }
    catch (error) {
        console.error("Error generating summary data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getSummery = getSummery;
exports.default = getSummery;
