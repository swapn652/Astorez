"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
app.use('/api/auth', require('./routes/seller/seller_auth'));
app.use('/api/items', require('./routes/items/items-data'));
app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
});