const express = require("express")
const mongoose = require("mongoose")
const Auth = require("./authModel")
const dotenv = require("dotenv").config()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 8000
mongoose.connect(process.env.MOGODB_URL)
    .then(() => {
        console.log("mongodb connected")

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })


app.post("/sign-up", async (req, res) => {
    const { firstName, lastName, email, password, state } = req.body
    if (!email) {
        return res.status(400).json({ message: "Email is required" });

    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new Auth({
        firstName, lastName, email, password: hashedPassword, state
    })
    await newUser.save()
    res.json({ message: "User created successfully", newUser: firstName, lastName, email, state });


})
// login day
app.post("/login", async (req, res) => {
    const { email, password } = req.body
    const User = await Auth.findOne({ email })
    if (!User) {
        return res.status(404).json({ message: "user not found" })
    }
    const isMatch = await bcrypt.compare(password, User?.password)
    if (!isMatch) {
        return res.status(400).json({ message: "incorrrect email or pasasswor" })
    }
    // generate token
    const accessToken = jwt.sign(
        { User },
        process.env.ACCESSTOKEN,
        { expiresIn: "3d" }
    )
    const refreshToken = jwt.sign(
        { User },
        process.env.REFRENCETOKEN,
        { expiresIn: "30d" })
    res.status(200).json({
        message: "login successful",
        accessToken,
        user: {
            email: User?.email,
            firstName: User?.firstName,
            lastName: User?.lastName,
            state: User?.state
        }
    })
})

app.post("/forgot-password", async (req, res) => {
    const { email } = req.body
    const User = await Auth.findOne({ email })
    if (!User) {
        return res.status(404).json({ message: "user not found" })
    }
    res.status(200).json({ message: "please check email" })

})
app.patch("/reset-password", async (req, res) => {
    const { email, password } = req.body
    const User = await Auth.findOne({ email })
    if (!User) {
        return res.status(404).json({ message: "user not found" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    User.password = hashedPassword
    await User.save()
    res.status(200).json({ message: "password reset successful" })

})
