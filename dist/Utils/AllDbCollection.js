"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserContactCollection = exports.getPaymentCollection = exports.getCouponCollection = exports.getProductCollection = exports.getUserCollection = exports.getBikeCollection = void 0;
const DB_Connection_1 = require("./DB_Connection");
const getBikeCollection = () => {
    if (!DB_Connection_1.db) {
        console.log(DB_Connection_1.db);
        throw new Error('Database not initialized');
    }
    return DB_Connection_1.db.collection('bike-Data');
};
exports.getBikeCollection = getBikeCollection;
const getUserCollection = () => {
    if (!DB_Connection_1.db) {
        console.log(DB_Connection_1.db);
        throw new Error('Database not initialized');
    }
    return DB_Connection_1.db.collection('userData');
};
exports.getUserCollection = getUserCollection;
const getProductCollection = () => {
    if (!DB_Connection_1.db) {
        console.log(DB_Connection_1.db);
        throw new Error('Database not initialized');
    }
    return DB_Connection_1.db.collection('shopProductsData');
};
exports.getProductCollection = getProductCollection;
const getCouponCollection = () => {
    if (!DB_Connection_1.db) {
        console.log(DB_Connection_1.db);
        throw new Error('Database not initialized');
    }
    return DB_Connection_1.db.collection('couponData');
};
exports.getCouponCollection = getCouponCollection;
const getPaymentCollection = () => {
    if (!DB_Connection_1.db) {
        console.log(DB_Connection_1.db);
        throw new Error('Database not initialized');
    }
    return DB_Connection_1.db.collection('paymentData');
};
exports.getPaymentCollection = getPaymentCollection;
const getUserContactCollection = () => {
    if (!DB_Connection_1.db) {
        console.log(DB_Connection_1.db);
        throw new Error('Database not initialized');
    }
    return DB_Connection_1.db.collection('UserContactData');
};
exports.getUserContactCollection = getUserContactCollection;
