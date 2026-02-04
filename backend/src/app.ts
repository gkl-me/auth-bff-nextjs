
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

const USER_ID = "userId"

let GLOBAL_COUNT = 0
let USER_COUNT = 1
let  accessToken = "accessToken" + String(GLOBAL_COUNT)  
let refreshToken = "refreshToken" + String(GLOBAL_COUNT)

function authMiddleware(req:Request, res:Response, next:NextFunction) {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        console.log("token",token)
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const userId = token.split("_")[1]

        const user = users.find(user => user.userId === userId)
        if (user?.status) {
            return res.status(403).json({ message: "Forbidden" })
        }
        console.log("user authenticated",userId)
        req.user = {userId}
        next()
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" })
    }   
}


app.post("/login", (req, res) => {
    console.log("/login")
    const { name, email } = req.body
    const userId = USER_ID + String(USER_COUNT)
    const user: IUser = {
        userId,
        name,
        email,
        status: false
    }
    users.push(user)
    GLOBAL_COUNT++
    USER_COUNT++
    accessToken = "accessToken" + String(GLOBAL_COUNT)  +"_" + userId
    refreshToken = "refreshToken" + String(GLOBAL_COUNT) +"_" + userId
    console.log("user logged in",user)
    res.json({ message: "Login successful",accessToken,refreshToken})
})


app.post("/refresh-token", (req, res) => {
    console.log("/refresh-token")
    const { token } = req.body
    const userId = token.split("_")[1]
    const user = users.find(user => user.userId === userId)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    GLOBAL_COUNT++
    accessToken = "accessToken" + String(GLOBAL_COUNT)  +"_" + userId
    refreshToken = "refreshToken" + String(GLOBAL_COUNT) +"_" + userId
    console.log("user token refreshed",user)
    console.log("NEW TOKEN",accessToken,refreshToken)
    res.json({ message: "Refresh token successful",accessToken,refreshToken})
})


app.get('/profile',authMiddleware,(req,res) => {  
    console.log("/profile")
    const user = users.find(user => user.userId === req?.user?.userId)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    res.json({ message: "Profile",user })
})


app.patch('/update-profile',authMiddleware,(req,res) => {
    console.log("/update-profile")
    const { name, email } = req.body
    const user = users.find(user => user.userId === req?.user?.userId)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    user.name = name
    user.email = email
    res.json({ message: "Profile updated successfully",user })   
})


app.get('/admin/users',authMiddleware,(req,res) => {
    console.log("/admin/users")
    res.json({ message: "Users",users })
})


app.patch('/admin/user-status/:id',authMiddleware,(req,res) => {
    console.log("/admin/user-status/:id")

    const userId = req.params.id
    const user = users.find(user => user.userId === userId)
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    user.status = !user.status
    res.json({ message: "Profile updated successfully",user})   
})


app.listen(3001, () => {
    console.log("Server started on port 3001")
})

