import { Request, Response } from 'express';
var jwt = require('jsonwebtoken');
import { Collection, ObjectId } from 'mongodb';
import { getProductCollection, getUserCollection } from '../Utils/AllDbCollection';
import { database } from 'firebase-admin';
const admin = require('firebase-admin');
import { getAuth } from "firebase-admin/auth"

const serviceAccount = require('../../firbaseConfig/firebaseAdminKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


const userCollection = getUserCollection()
const productCollection = getProductCollection()

const createToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userInfo } = req.body;
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT secret is not defined in environment variables.');
        }
        const token = jwt.sign({ data: userInfo }, secret, { expiresIn: '1h' });
        res.status(200).send({ token });
    } catch (error) {
        console.error('Error creating token:', error);
        res.status(500).send({ error: 'Failed to create token' });
    }
};



const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userData = req.body;

        if (!userData || !userData.userEmail || !userData.userName) {
            res.status(400).send({ status: false, message: 'Invalid user data' });
            return;
        }

        const existingUser = await userCollection.findOne({ userEmail: userData.userEmail });
        if (existingUser) {
            res.send({ status: true, message: 'User Already Exists' });
            return;
        }

        const result = await userCollection.insertOne(userData);

        if (result.insertedId) {
            res.send({ status: true, message: 'User added successfully' });
        } else {
            res.send({ status: false, message: 'Failed to add user' });
        }

    } catch (error) {
        console.error('Error adding user:', error);
        res.send({ status: false, error: 'Failed to create user' });
    }
};
const getUserData = async (req: Request, res: Response): Promise<void> => {
    try {
        const userEmail = req.params.email;
        if (!userEmail) {
            res.status(400).send({ status: false, message: 'Invalid user email' });
            return;
        }

        const user = await userCollection.findOne({ userEmail: userEmail }, { projection: { userPassword: 0 } });

        if (!user) {
            res.status(404).send({ status: false, message: 'User Not Found' });
            return;
        }

        res.status(200).send({ data: user, status: true, message: 'success' });

    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).send({ status: false, error: 'Failed to getting user' });
    }
};






const addToCartProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const userEmail = req.params.email;  // Get the user ID from params
        const { id } = req.body;  // Get the product ID from the request body

        const user = await userCollection.findOne({ userEmail: userEmail });

        if (!user) {
            res.send({ status: false, message: 'User not found' });
            return
        }

        if (!user.cartProductIds) {
            user.cartProductIds = [];
        }


        if (!user.cartProductIds.includes(id)) {
            user.cartProductIds.push(id);  // Add product ID to the cart
        } else {

            res.send({ status: false, message: 'Product already in cart' });
            return
        }

        await userCollection.updateOne(
            { userEmail: userEmail },
            { $set: { cartProductIds: user.cartProductIds } }
        );

        res.send({ status: true, message: 'Product added to cart successfully' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send({ status: false, message: 'Failed to add product to cart' });
    }
};




const getCartProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const userEmail = req.params.email;

        const user = await userCollection.findOne({ userEmail: userEmail });

        if (!user) {
            res.send({ status: false, message: 'User not found' });
            return;
        }

        const cartProductIds = user.cartProductIds.map((id: string) => new ObjectId(id));

        const products = await productCollection.find({ _id: { $in: cartProductIds } }).toArray();

        const productsWithQuantity = products.map(product => {

            const cartItem = user.cartProductIds.find((item: string) => item === product._id.toString());
            return {
                ...product,
                quantity: 1
            };
        });

        res.send(productsWithQuantity);

    } catch (error) {
        console.error('Error getting product :', error);
        res.status(500).send({ status: false, message: 'Failed to get product' });
    }
};


const removeCartProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userEmail, id } = req.query;
        const user = await userCollection.findOne({ userEmail: userEmail });

        if (!user) {
            res.send({ status: false, message: 'User not found' });
            return;
        }

        const updatedCartProducts = user.cartProductIds.filter((item: string) => item !== id);

        const result = await userCollection.updateOne(
            { userEmail: userEmail },
            { $set: { cartProductIds: updatedCartProducts } }
        );
        if (result.modifiedCount === 0) {
            res.send({ status: false, message: 'Failed to remove the product from cart' });
            return;
        }

        res.send({ status: true, message: 'Product removed from cart successfully' });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send({ status: false, message: 'Failed to delete product' });
    }
};


const clearCartProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const userEmail = req.params.email;
        const user = await userCollection.findOne({ userEmail: userEmail });

        if (!user) {
            res.send({ status: false, message: 'User not found' });
            return;
        }

        const result = await userCollection.updateOne(
            { userEmail: userEmail },
            { $set: { cartProductIds: [] } }
        );
        if (result.modifiedCount === 0) {
            res.send({ status: false, message: 'Failed to remove the product from cart' });
            return;
        }

        res.send({ status: true, message: 'Product removed from cart successfully' });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send({ status: false, message: 'Failed to delete product' });
    }
};

const getAllUser = async (req: Request, res: Response): Promise<void> => {
    try {


        const users = await userCollection.find().toArray();

        if (!users) {
            res.status(404).send({ status: false, message: 'Users Not Found' });
            return;
        }

        res.status(200).send({ data: users, status: true, message: 'success' });

    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).send({ status: false, error: 'Failed to getting users' });
    }
};




const getAllFirebaseUsers = async (req: Request, res: Response): Promise<void> => {

    try {
        const users: any[] = [];
        const listAllUsers = async (nextPageToken?: string) => {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            listUsersResult.users.forEach((userRecord: any) => {
                users.push(userRecord.toJSON());
            });
            if (listUsersResult.pageToken) {
                await listAllUsers(listUsersResult.pageToken);
            }
        };
        await listAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users.', error });
    }
};


// delete   user  
const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { firebaseId, databaseId } = req.query;

    if (!firebaseId || !databaseId) {
        res.status(400).json({
            status: false,
            message: "Firebase ID and Database ID are required.",
        });
        return;
    }

    try {

        const auth = getAuth();
        await auth.deleteUser(firebaseId as string);


        const deleteResult = await userCollection.deleteOne({ _id: new ObjectId(databaseId as string) });

        if (deleteResult.deletedCount === 1) {
            res.status(200).json({
                status: true,
                message: "User successfully deleted from Firebase and database.",
            });
        } else {
            res.status(404).json({
                status: false,
                message: "User deleted from Firebase but not found in the database.",
            });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            status: false,
            message: "Failed to delete user. Please try again later.",
        });
    }
};


const changeUserRoll = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // প্যারামিটার থেকে আইডি নেওয়া
    const { role } = req.body; // বডি থেকে নতুন রোল নেওয়া
    console.log(role);

    try {
        // MongoDB ডাটাবেসে রোল আপডেট করা
        const updatedUser = await userCollection.updateOne(
            { _id: new ObjectId(id) }, // ফিল্টার: _id দিয়ে মিলছে
            { $set: { firebaseRole: role } } // আপডেট অপারেটর: firebaseRole আপডেট হচ্ছে
        );

        // যদি ইউজার না পাওয়া যায়
        if (updatedUser.matchedCount === 0) {
            res.send({ status: false, message: 'User not found' });
            return;
        }

        // সফলতার মেসেজ
        res.send({ status: true, message: `Role updated to ${role} successfully!` });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ status: false, message: 'Failed to update user role' });
    }
};



export default addToCartProduct;



export {
    createToken,
    addUser,
    addToCartProduct,
    getCartProduct,
    removeCartProduct,
    getUserData,
    clearCartProduct,
    getAllUser,
    getAllFirebaseUsers,
    deleteUser,
    changeUserRoll,
};