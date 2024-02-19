import express, {Express, Request, Response} from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { body, validationResult } from "express-validator";
import { error } from "console";
import * as bcrypt from "bcryptjs";
import { constants } from "buffer";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = "astorezSellers";

import { RequestHandler } from 'express';
import fetchuser from '../../middleware/fetchuser';

var jwt = require("jsonwebtoken"); 
  
// Get all users
router.get('/', async (req: Request, res: Response)=>{
    const allSeller = await prisma.sellers.findMany();
    res.json(allSeller);
})

// ROUTE 1: Creating a new user using POST request
router.post('/signup', [
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'Enter a valid name').isLength({min:3}),
    body('password', 'Enter a password of atleast length 5').isLength({min: 5})
], async (req:Request, res:Response)=>{

    // If there are validation errors 
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
  try {
    let success = false;
    // If user already exists
    let user = await prisma.sellers.findUnique({where:{email: req.body.email}});
    if(user){
      return res.status(400).json({success, error: "User already exists"});
      // res.send("User already exists");
    }
    
    // Generated salt for hashing the user password 
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // None of the above errors occured create a new user
    const newUser = await prisma.sellers.create({data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPass
    }});
    
    const data = {
        user:{
            id: newUser.id
        }
    }
    
    success = true;
    const authToken = jwt.sign(data, JWT_SECRET);
    // console.log(authToken);
    res.json({success, authToken});
    // console.log(newUser);
   

  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json("Internal Server Error");
  }
})


// ROUTE 2: Authenticating a user 
router.post("/login", [
    body('email', 'Enter a valid emial id').isEmail()
],async (req:Request, res:Response)=>{

    // If there are any errors, return error message
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }

    // Destructing 
    const {email, password} = req.body;

    try {
        
        let user:any = await prisma.sellers.findUnique({where:{ email: email}});
        if(!user){
            return res.status(400).json({success: "Invalid credentials"});
        }

        const comparePass = await bcrypt.compare(password, user.password);
        if(!comparePass){
            return res.status(400).json({success: "Invalid credentials"});
        }

        const data = {
            user:{
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        res.send({authToken});

    } catch (error: any) {
        console.error(error.message);
        return res.status(500).json("Internal Server Error");
    }
})


// ROUTE 3: Get user data
router.post('/getuser', fetchuser, async (req:any, res:Response) => {
   try {
        const userId = req.user.id;
        const user = await prisma.sellers.findUnique({where:{id: userId}})
        res.send(user);
      } catch (error:any) {
        console.error(error.message);
        res.status(500).send("Some error occurred: " + error.message);
      }
})

module.exports = router;