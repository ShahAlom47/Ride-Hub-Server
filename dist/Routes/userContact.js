"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userContact_controller_1 = require("../Controller/userContact.controller");
const router = (0, express_1.Router)();
router.post('/addUserMessage', userContact_controller_1.addUserMessage);
router.get(`/getUserMessage`, userContact_controller_1.getUserMessage);
router.delete(`/deleteUserMessage/:id`, userContact_controller_1.deleteUserMessage);
exports.default = router;
