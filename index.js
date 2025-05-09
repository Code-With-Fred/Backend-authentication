const express = require("express")
const mongoose = require("mongoose")
const Auth = require("./authModel")
const dotenv = require("dotenv").config()
const bcrypt = require("bcryptjs")

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
        firstName, lastName, email, password:hashedPassword, state
    })
    await newUser.save()
    res.json({ message: "User created successfully", newUser:firstName, lastName, email, state});


})
