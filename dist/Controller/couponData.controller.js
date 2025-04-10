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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCouponUser = exports.checkCoupon = exports.getCoupon = void 0;
const mongodb_1 = require("mongodb");
const AllDbCollection_1 = require("../Utils/AllDbCollection");
const couponCollection = (0, AllDbCollection_1.getCouponCollection)();
const getCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('paice ');
});
exports.getCoupon = getCoupon;
const checkCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { couponCode, category, amount } = req.body;
    try {
        // Fetch coupon from database
        const coupon = yield couponCollection.findOne({
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
    }
    catch (error) {
        console.error("Error checking coupon:", error);
        res.send({
            success: false,
            message: "Internal server error."
        });
    }
});
exports.checkCoupon = checkCoupon;
const addCouponUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const couponCategory = req.params.category;
    const orderData = req.body;
    try {
        // Coupon khuje ber kora
        const couponFind = yield couponCollection.findOne({
            couponCode: orderData === null || orderData === void 0 ? void 0 : orderData.couponValue,
            category: couponCategory
        });
        // Jodi coupon na thake, tahole response pathano
        if (!couponFind) {
            res.send({ status: false, message: 'This coupon does not exist.' });
            return;
        }
        const updateRes = yield couponCollection.updateOne({ _id: new mongodb_1.ObjectId(couponFind === null || couponFind === void 0 ? void 0 : couponFind._id) }, {
            $push: { usedBy: orderData },
            $inc: { usedCount: 1 }
        });
        if ((updateRes === null || updateRes === void 0 ? void 0 : updateRes.modifiedCount) > 0) {
            res.send({ status: true, message: 'Successfully added user' });
        }
        else {
            res.send({ status: false, message: 'Failed to add user' });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: false, message: 'Internal Server Error' });
    }
});
exports.addCouponUser = addCouponUser;
