import 'dotenv/config'
import Redis from "ioredis";
import mongoose from "mongoose";
import morgan from "morgan";
import Usermodel from "./model/user.model.js";
import express from 'express'
import rateLimit from 'express-rate-limit';


// -- Mongoose
async function mongooseConnect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
}


mongooseConnect();



// -- Redis
const redis = new Redis(process.env.REDIS_URI);


redis.once("connect", () => {
    console.log("Connected to Redis");
})

redis.once("error", (err) => {
    console.log(err);
});



const app = express();
app.use(express.json())
app.use(morgan('dev'))
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.set('views', './views');

const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minutes
    max: 100,                    // 100 requests per window per IP
    message: {
        error: 'Too many requests. Please try again later.'
    },
    statusCode: 429,
    standardHeaders: true,   // sends RateLimit-* headers
    //   legacyHeaders: false,
});



app.use(globalLimiter);







app.get('/', (req, res) => {
    let sum = 0;
    for (let i = 0; i <= 100000000; i++) {
        sum += i;
    }
    res.json({ result: +sum })
})


app.get('/ejs', (req, res) => {
    res.render('index', {
        username: "doremon",
        bio: "I am a cat 🐱",
        image: "https://images.unsplash.com/photo-1518893647222-31f6b0dc2fb6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhY2slMjBuJTIwd2hpdGV8ZW58MHx8MHx8fDA%3D"
    }

    
    )
})
app.get("/user/:id", async (req, res) => {
    try {
        const usercachesdata = await redis.get(`user:${req.params.id}`)
        if (usercachesdata) {
            return res.status(200).json({ data: JSON.parse(usercachesdata), msg: "data from cache" })
        }


        const founduser = await Usermodel.findById(req.params.id);
        if (!founduser) {
            return res.status(404).json({ error: "User not found" })
        }

        await redis.set(`user:${req.params.id}`, JSON.stringify(founduser), "EX", 120)
        res.status(200).json({ data: founduser, msg: "data from db" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" })
    }

})


app.post("/createuser", async (req, res) => {
    try {


        const user = await Usermodel.create(req.body);

        res.status(201).json({ user })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get('/allusers', async (req, res) => {
    const usercachesdata = await redis.get('users')
    if (usercachesdata) {
        return res.status(200).json({ data: JSON.parse(usercachesdata), msg: "data from cache" })
    }
    const users = await Usermodel.find();
    await redis.set(`users`, JSON.stringify(users), "EX", 120)
    res.status(200).json({ users })
})

app.listen(3000, () => {
    console.log("server is running on port", 3000);
})