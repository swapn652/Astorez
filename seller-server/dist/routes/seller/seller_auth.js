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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const bcrypt = __importStar(require("bcryptjs"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = "astorezSellers";
const fetchuser_1 = __importDefault(require("../../middleware/fetchuser"));
var jwt = require("jsonwebtoken");
// Get all users
router.get('/', async (req, res) => {
    const allSeller = await prisma.sellers.findMany();
    res.json(allSeller);
});
// ROUTE 1: Creating a new user using POST request
router.post('/signup', [
    (0, express_validator_1.body)('email', 'Enter a valid email').isEmail(),
    (0, express_validator_1.body)('name', 'Enter a valid name').isLength({ min: 3 }),
    (0, express_validator_1.body)('password', 'Enter a password of atleast length 5').isLength({ min: 5 })
], async (req, res) => {
    // If there are validation errors 
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        let success = false;
        // If user already exists
        let user = await prisma.sellers.findUnique({ where: { email: req.body.email } });
        if (user) {
            return res.status(400).json({ success, error: "User already exists" });
            // res.send("User already exists");
        }
        // Generated salt for hashing the user password 
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        // None of the above errors occured create a new user
        const newUser = await prisma.sellers.create({ data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPass
            } });
        const data = {
            user: {
                id: newUser.id
            }
        };
        success = true;
        const authToken = jwt.sign(data, JWT_SECRET);
        // console.log(authToken);
        res.json({ success, authToken });
        // console.log(newUser);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json("Internal Server Error");
    }
});
// ROUTE 2: Authenticating a user 
router.post("/login", [
    (0, express_validator_1.body)('email', 'Enter a valid emial id').isEmail()
], async (req, res) => {
    // If there are any errors, return error message
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    // Destructing 
    const { email, password } = req.body;
    try {
        let user = await prisma.sellers.findUnique({ where: { email: email } });
        if (!user) {
            return res.status(400).json({ success: "Invalid credentials" });
        }
        const comparePass = await bcrypt.compare(password, user.password);
        if (!comparePass) {
            return res.status(400).json({ success: "Invalid credentials" });
        }
        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, JWT_SECRET);
        res.send({ authToken });
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json("Internal Server Error");
    }
});
// ROUTE 3: Get user data
router.post('/getuser', fetchuser_1.default, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.sellers.findUnique({ where: { id: userId } });
        res.send(user);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred: " + error.message);
    }
});
module.exports = router;
