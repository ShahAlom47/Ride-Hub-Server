import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getCouponCollection } from '../Utils/AllDbCollection';

const couponCollection= getCouponCollection()


const getCoupon = async (req: Request, res: Response): Promise<void> => {
res.send('paice ')


}

const checkCoupon = async (req:Request, res: Response): Promise<void> => {

res.send('paice')


}



export {
    getCoupon,
    checkCoupon,


}