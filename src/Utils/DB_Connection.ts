import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// MongoDB URI from environment variable
const uri = process.env.MONGO_URI  || "mongodb+srv://ridehub47:pass@ridehub.ou0p3.mongodb.net/?retryWrites=true&w=majority&appName=RideHub";

// Create a new MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let  db = client.db('Ride_Hub'); 

async function connectDB(): Promise<Db> {
  try {
    // await client.connect(); // Ensure client is connected
    // console.log("Connected to MongoDB!");

    
    await client.db("admin").command({ ping: 1 });

    db = client.db('Ride_Hub'); // Use the correct database name
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Call connectDB to initialize the connection
connectDB().catch(console.error);

export { db,connectDB};


