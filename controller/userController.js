import UserModel from "../model/userModel.js";

export async function getAllUsers(req, res) {
    try {
        const users = await UserModel.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export async function getUser(req, res) {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            res.status(404).json({message: "User not found"});
        }
        else {
            res.json(user);
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export async function createUser(req, res) {
    try {
        const newUser = new UserModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username ? req.body.username : '',
            password: req.body.password ? req.body.password : '',
            //email: req.body.email,
            //phone: req.body.phone,
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);

    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export async function login(req, res) {
    const {username, password} = req.body;
    console.log(req.body);
    console.log(username, password);
    try {
        const user = await UserModel.findOne({username});
        if (!user || user.password !== password) {
            return res.status(401).json({message: "Invalid login info"});
        }

        res.json(user)
    } catch (error){
        res.status(500).json({message: error.message});
    }
}