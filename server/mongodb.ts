import mongoose from "mongoose"

const connectToDB = async (uri: string) => {
 await mongoose.connect(uri)
}
export default connectToDB