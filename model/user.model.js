import mongoose from "mongoose";


const userscehma = new mongoose.Schema({

    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
  
})


const user = mongoose.model("user",userscehma);
export default user;