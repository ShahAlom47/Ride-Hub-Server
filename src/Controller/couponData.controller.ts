import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getCouponCollection } from '../Utils/AllDbCollection';

const couponCollection= getCouponCollection()


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



export {
    getCoupon,
    checkCoupon,


}