"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const bikeData_controller_1 = __importStar(require("../Controller/bikeData.controller"));
router.get('/all-bikeData', bikeData_controller_1.getBikeData);
router.get('/bike-details/:id', bikeData_controller_1.getBikeDetails);
router.patch('/updateBikeView/:id', bikeData_controller_1.default);
router.get('/latest-bike', bikeData_controller_1.getLatestBikes);
router.post('/getWishListData/:category', bikeData_controller_1.getWishListData);
router.patch('/updateRentStatus/:id', bikeData_controller_1.updateBikeRentStatus);
router.patch('/editBikeData/:id', bikeData_controller_1.editBikeData);
router.patch('/changeBikePhoto/:id', bikeData_controller_1.editBikePhoto);
router.post('/addBike', bikeData_controller_1.addBike);
router.delete('/deleteBike/:id', bikeData_controller_1.deleteBike);
router.get('/getMyRentedBike/:email', bikeData_controller_1.getUserRentedBike);
exports.default = router;
