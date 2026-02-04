
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}))

app.use(cookieParser())
 
interface IUser{
    userId:string,
    name:string,
    email:string,
    status:boolean
}

const users:IUser[]=[]

const USER_ID = "user_id "

let GLOBAL_COUNT = 0
const accessToken = "accessToken " + String(GLOBAL_COUNT)  
const refreshToken = "refreshToken " + String(GLOBAL_COUNT)

function authMiddleware(req:Request, res:Response, next:NextFunction) {
    try {
        const token = req.cookies.accessToken
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const userId = USER_ID + token.split(" ")[1]

        const user = users.find(user => user.userId === userId)
        if (user?.status) {
            return res.status(403).json({ message: "Forbidden" })
        }
        req.user = {userId}
        next()
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" })
    }   
}


app.post("/login", (req, res) => {
    const { name, email } = req.body
    const userId = USER_ID + String(GLOBAL_COUNT)
    const user: IUser = {
        userId,
        name,
        email,
        status: false
    }
    users.push(user)
    GLOBAL_COUNT++
    res.json({ message: "Login successful",accessToken,refreshToken})
})

app.get('/profile',authMiddleware,(req,res) => {  
    const user = users.find(user => user.userId === req?.user?.userId)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    res.json({ message: "Profile",user })
})


app.patch('/update-profile',authMiddleware,(req,res) => {
    const { name, email } = req.body
    const user = users.find(user => user.userId === req?.user?.userId)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    user.name = name
    user.email = email
    res.json({ message: "Profile updated successfully",user })   
})


app.patch('/update-status',(req,res) => {
    const user = users.find(user => user.userId === req?.user?.userId)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    user.status = !user.status
    res.json({ message: "Profile updated successfully",user})   
})


app.listen(3001, () => {
    console.log("Server started on port 3001")
})

