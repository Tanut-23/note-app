import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

//Create schema

const UserSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true, minlength: 6 },
  createOn: { type: Date, default: new Date().getTime() },
});

//Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  //Salt
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Use schema = moddel

export const User = model("User", UserSchema);
