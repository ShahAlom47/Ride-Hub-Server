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

export { 
    getBikeCollection ,
    getUserCollection,
    getProductCollection,

};
