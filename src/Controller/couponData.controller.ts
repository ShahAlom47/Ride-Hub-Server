import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getCouponCollection } from '../Utils/AllDbCollection';

const couponCollection = getCouponCollection()


const getCoupon = async (req: Request, res: Response): Promise<void> => {
    res.send('paice ')

}



const checkCoupon = async (req: Request, res: Response): Promise<void> => {
    const { couponCode, category, amount } = req.body;

    try {
        // Fetch coupon from database
        const coupon = await couponCollection.findOne({
            couponCode,
            category,
            status: 'active'
        });

        // Check if coupon exists
        if (!coupon) {
            res.send({
                success: false,
                message: "Invalid coupon or inactive."
            });
            return;
        }

        // Validate the purchase amount
        if (amount < coupon.minimumPurchase) {
            res.send({
                success: false,
                message: `Minimum purchase of $${coupon.minimumPurchase} required.`
            });
            return;
        }
        // check limit 
        if (coupon.usedCount >= coupon.usageLimit) {
            res.send({
                success: false,
                message: "Coupon usage limit has been reached."
            });
            return;
        }

        // Check valid date range
        const currentDate = new Date();
        if (currentDate < new Date(coupon.validFrom) || currentDate > new Date(coupon.validUntil)) {
            res.send({
                success: false,
                message: "Coupon is not valid at this time."
            });
            return;
        }

        // All checks passed, return success
        res.send({
            success: true,
            message: "Coupon Accepted",
            discountAmount: (coupon.discountValue / 100) * amount
        });

    } catch (error) {
        console.error("Error checking coupon:", error);
        res.send({
            success: false,
            message: "Internal server error."
        });
    }
};

const addCouponUser = async (req: Request, res: Response): Promise<void> => {
    const couponCategory = req.params.category;
    const orderData = req.body;

    try {
        // Coupon khuje ber kora
        const couponFind = await couponCollection.findOne({
            couponCode: orderData?.couponValue,
            category: couponCategory
        });

        // Jodi coupon na thake, tahole response pathano
        if (!couponFind) {
             res.send({ status: false, message: 'This coupon does not exist.' });
             return
        }

        
        const updateRes = await couponCollection.updateOne(
            { _id: new ObjectId(couponFind?._id) },
            {
                $push: { usedBy: orderData },
                $inc: { usedCount: 1 }
            }
        );

       
        if (updateRes?.modifiedCount > 0) {
            res.send({ status: true, message: 'Successfully added user' });
        } else {
            res.send({ status: false, message: 'Failed to add user' });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: false, message: 'Internal Server Error' });
    }
}



export {
    getCoupon,
    checkCoupon,
    addCouponUser,


}