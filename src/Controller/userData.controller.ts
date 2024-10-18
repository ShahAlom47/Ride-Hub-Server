import { Request, Response } from 'express';
var jwt = require('jsonwebtoken');
import { ObjectId } from 'mongodb';
import { getProductCollection, getUserCollection } from '../Utils/AllDbCollection';

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

        res.status(200).send({data:user,status:true,message:'success'});

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


// const getCartProduct = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const userEmail = req.params.email;

//         const user = await userCollection.findOne({ userEmail: userEmail });

//         const cartProductIds = user?.cartProductIds.map((id: string) => new ObjectId(id));

//         const result = await productCollection.find({ _id: { $in: cartProductIds } }).toArray();

//         res.send(result);

//     } catch (error) {
//         console.error('Error getting product :', error);
//         res.status(500).send({ status: false, message: 'Failed to getting product ' });
//     }
// };

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


export default addToCartProduct;



export {
    createToken,
    addUser,
    addToCartProduct,
    getCartProduct,
    removeCartProduct,
    getUserData,
};