"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '4000', 10);
dotenv_1.default.config();
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', "http://localhost:3000"],
    credentials: true
}));
const DB_Connection_1 = require("./Utils/DB_Connection");
const dd = DB_Connection_1.connectDB;
const bikeData_route_1 = __importDefault(require("./Routes/bikeData.route"));
const userData_route_1 = __importDefault(require("./Routes/userData.route"));
const shopData_route_1 = __importDefault(require("./Routes/shopData.route"));
const sendEmail_1 = __importDefault(require("./Utils/sendEmail"));
const couponData_route_1 = __importDefault(require("./Routes/couponData.route"));
const paymentData_route_1 = __importDefault(require("./Routes/paymentData.route"));
const userContact_1 = __importDefault(require("./Routes/userContact"));
const photoUpload_1 = require("./Utils/photoUpload");
app.use(express_1.default.json());
app.use('/users', userData_route_1.default);
app.use('/bikeData', bikeData_route_1.default);
app.use('/shopData', shopData_route_1.default);
app.use('/coupon', couponData_route_1.default);
app.use('/payment', paymentData_route_1.default);
app.use('/userContact', userContact_1.default);
app.post('/sendEmail', sendEmail_1.default);
app.post("/upload", photoUpload_1.upload.single("file"), photoUpload_1.uploadImage);
// Routes
app.get('/', (req, res) => {
    res.send('Hello, RideHub is Running');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
