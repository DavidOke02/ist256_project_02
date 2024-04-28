import mongoose from "mongoose";
const {Schema, model} = mongoose;

const userSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: false},
    password: {type: String, required: false},
    email: {type: String, required: false},
    phone: {type: String, required: false},

});

userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});


const UserModel = model("User", userSchema);
export default UserModel;