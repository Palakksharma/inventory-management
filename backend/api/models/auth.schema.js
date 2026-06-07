import mongoose from "mongoose";
import bcrypt from "bcrypt";
const authSchema = new mongoose.Schema({
    userName:{
        type:String
    },
    email:{
        type:String,
        required : true,
        unique:true,
    },
   
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["manager","admin","driver"],
        default:"manager",
    },
   warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }

},
{
    timestamps:true
});
authSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
});


authSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const Auth = mongoose.model("Auth", authSchema); //auth bnana hai auth schema ko refer krke
