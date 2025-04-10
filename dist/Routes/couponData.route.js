"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const couponData_controller_1 = require("../Controller/couponData.controller");
router.get('/getCoupon', couponData_controller_1.getCoupon);
router.post('/checkCoupon', couponData_controller_1.checkCoupon);
router.patch('/addCouponUser/:category', couponData_controller_1.addCouponUser);
exports.default = router;
