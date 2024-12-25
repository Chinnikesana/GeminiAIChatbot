// import {connect, disconnect} from 'mongoose';
// import mongoose from 'mongoose';
// async function connectionToDB(){
//   try{
//     await mongoose.connect("mongodb://localhost:27017/MERN-CHATBOT"
//   )
//   }catch(err){
//     console.log("connection to database failed!")
//   }
// }
// async function disconnectToDB(){
//   try{
//     await disconnect()
//   }catch(err){
//     console.log(err.message)
//   }
// }
// export default {connectionToDB, disconnectToDB};
import mongoose from 'mongoose';
async function connectionToDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/MERN-CHATBOT"
        // useNewUrlParser: true,
        // useUnifiedTopology: true
        );
        console.log("Connected to database successfully!");
    }
    catch (err) {
        console.error("Connection to database failed!", err);
    }
}
async function disconnectToDB() {
    try {
        await mongoose.disconnect();
    }
    catch (err) {
        console.error(err.message);
    }
}
export default { connectionToDB, disconnectToDB };
//# sourceMappingURL=connection.js.map