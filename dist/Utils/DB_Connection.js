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
exports.db = void 0;
exports.connectDB = connectDB;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
// MongoDB URI from environment variable
const uri = process.env.MONGO_URI || "mongodb+srv://ridehub47:pass@ridehub.ou0p3.mongodb.net/?retryWrites=true&w=majority&appName=RideHub";
// Create a new MongoClient
const client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
let db = client.db('Ride_Hub');
exports.db = db;
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // await client.connect(); // Ensure client is connected
            // console.log("Connected to MongoDB!");
            yield client.db("admin").command({ ping: 1 });
            exports.db = db = client.db('Ride_Hub'); // Use the correct database name
            return db;
        }
        catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    });
}
// Call connectDB to initialize the connection
connectDB().catch(console.error);
