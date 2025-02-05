import { Collection } from 'mongodb';
import { db } from './DB_Connection';

const getBikeCollection = (): Collection => {
    if (!db) {
        console.log(db);
        throw new Error('Database not initialized');
    }
    return db.collection('bike-Data');
}
const getUserCollection = (): Collection => {
    if (!db) {
        console.log(db);
        throw new Error('Database not initialized');
    }
    return db.collection('userData');
}
const getProductCollection = (): Collection => {
    if (!db) {
        console.log(db);
        throw new Error('Database not initialized');
    }
    return db.collection('shopProductsData');
}
const getCouponCollection = (): Collection => {
    if (!db) {
        console.log(db);
        throw new Error('Database not initialized');
    }
    return db.collection('couponData');
}
const getPaymentCollection = (): Collection => {
    if (!db) {
        console.log(db);
        throw new Error('Database not initialized');
    }
    return db.collection('paymentData');
}

const getUserContactCollection = (): Collection => {
    if (!db) {
        console.log(db);
        throw new Error('Database not initialized');
    }
    return db.collection('UserContactData');
}

export { 
    getBikeCollection ,
    getUserCollection,
    getProductCollection,
    getCouponCollection,
    getPaymentCollection,
    getUserContactCollection

};
