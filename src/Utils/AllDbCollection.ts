import { Collection } from 'mongodb';
import { db } from './DB_Connection';

const getBikeCollection = (): Collection => {
    if (!db) {
        console.log(db);
        throw new Error('Database not initialized');
    }
    return db.collection('bike-Data');
}

export { getBikeCollection };
