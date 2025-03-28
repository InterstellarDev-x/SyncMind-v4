import mongoose  from "mongoose";
const schema = mongoose.Schema

const ContentType = ['image' , 'youtube' , 'article' , 'audio' , 'twitter'] 


const Users = new schema({
    email : { type : String , require : true ,  unique : true  },
    password  : { type : String , require : true}
})

const Content = new schema({
    tittle : { type : String , require : true },
    type : { type : String , enum : ContentType  , require : true},
    link : { type : String , require : true , unique : true},
    tag : [{ type : mongoose.Types.ObjectId , ref : "tag" }], 
    user_id : { type : mongoose.Types.ObjectId , require : true , ref : "users"}
})


const Tags = new schema({
    tag : { type : String , require : true }
})

const Sharedlink = new schema({
    hash : { type : String , require : true },
    userId : { type : mongoose.Types.ObjectId , require  : true , ref : "users"  , unique : true}
})




export const UserModel = mongoose.model("users" , Users)
export const ContenModel = mongoose.model("content" , Content)
export const TagModel = mongoose.model("tag" , Tags)
export const SharedlinkModel = mongoose.model("sharedlink" , Sharedlink)


