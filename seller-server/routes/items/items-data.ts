import { constants } from "buffer";
import express, { Express, Request, Response, Router } from "express";

const router = express.Router();
import fetchuser from '../../middleware/fetchuser';

// ROUTE 1: Fetch all the items related to user

router.get('/fetchallitems', fetchuser, (req, res) => {
    try {
        
    } catch (error) {
        
    }
})







module.exports = Router;