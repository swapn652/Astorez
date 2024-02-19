import express, {Express, Request, Response} from "express";
const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/auth', require('./routes/seller/seller_auth'))
app.use('/api/items', require('./routes/items/items-data'))
  

app.listen(PORT, ()=>{
  console.log(`Listening at port ${PORT}`);
}); 