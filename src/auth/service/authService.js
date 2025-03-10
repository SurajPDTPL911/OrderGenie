import db from "../../config/knexClient.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUserService = async (username, password) => {
  try {
    const existingUser = await db("User").where({ username }).first();

    if (existingUser) {
      return { status: 400, message: "User already exists!" };
    }

    const userId = uuidv4();

    const hashedPassword = await bcrypt.hash(password, 10);

    const time = new Date();

    const [newUser] = await db("User")
      .insert({
        id: userId,
        username,
        password: hashedPassword,
        updated_at: time,
      })
      .returning(["id", "username"]);

    return {
      status: 200,
      message: "User registered successfully",
      user: newUser,
    };
  } catch (error) {
    console.log(`error : ${error}`);
    return { status: 500, error: "Server error!" };
  }
};

export const loginUserService = async (username, password) => {
  try {
    const user = await db("User").where({ username }).first();

    if (!user) {
      return { status: 400, message: "User isn't signed up" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { status: 400, message: "Incorrect password" };
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return { status: 200, token };
  } catch (error) {
    console.log(`error : ${error}`);
    return { status: 500, error: "Server error!" };
  }
};
