import { Request, Response, NextFunction } from 'express';

var jwt = require('jsonwebtoken');
const JWT_SECRET = "astorezSellers";

const fetchuser = (req:any, res:Response, next:NextFunction)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token"});
    }

    try {
        const userData = jwt.verify(token, JWT_SECRET);
        req.user = userData.user;
        next();  
    } catch (error) {
        res.status(401).send({error: "Please authenticate using a valid token"});
    }
}

export default fetchuser;