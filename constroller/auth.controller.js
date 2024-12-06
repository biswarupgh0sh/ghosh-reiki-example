import { MongoClient } from "mongodb";
import authenticator from "../coco/coco/authenticator.js";
import verifier from "../coco/coco/verifier.js";
import DatabaseHandler from "../coco/db/DatabaseHandler.js";
import { User } from "../models/user.model.js";
import "dotenv/config";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    //checking wheather user has given all the required info to signuup
    if (!username || !email || !password) {
      return (
        res.status(300),
        json({ success: false, message: "All fields required" })
      );
    }
    const client = new MongoClient(process.env.MONGO_URL);

    //initializing db for localClient
    const localClientDB = new DatabaseHandler("mongodb", process.env.MONGO_URL_LOCALCLIENT);
    //initializing db for verifier
    const localVerifierDB = new DatabaseHandler("mongodb", process.env.MONGO_URL_LOCALVERIFIER);
    //initializing db for 1st authenticator
    const localAuthenticator1DB = new DatabaseHandler("mongodb", process.env.MONGO_URL_LOCALAUTHENTICATOR1);
    //initializing db for 2nd authenticator
    const localAuthenticator2DB = new DatabaseHandler("mongodb", process.env.MONGO_URL_LOCALAUTHENTICATOR2);
    //initializing db for 3rd authenticator
    const localAuthenticator3DB = new DatabaseHandler("mongodb", process.env.MONGO_URL_LOCALAUTHENTICATOR3);
    //initializing globalDB
    const globalDB = new DatabaseHandler('mongodb', process.env.MONGO_URL_GLOBAL);

    //initializing verifier api
    const verifierApi = verifier(localVerifierDB, globalDB);

    //initializing 1st authenticator api
    const auth1Api = authenticator(localAuthenticator1DB, globalDB);
    //initializing 2nd authenticator api
    const auth2Api = authenticator(localAuthenticator2DB, globalDB);
    //initializing 3rd authenticator api
    const auth3Api = authenticator(localAuthenticator3DB, globalDB);

    await client.connect();

    const handler = new DatabaseHandler('mongodb', client.db('myDatabase'));

    const apiMap = {
      verifierApi,
      auth1Api,
      auth2Api,
      auth3Api,
  };
  
  const authAPIs = ['auth1Api', 'auth2Api', 'auth3Api'];
  const verifierAPIs = ['verifierApi'];

  const clientAPI = client(localClientDB, apiMap, verifierAPIs, authAPIs);
    
  clientAPI.register(username, password, '1234');
    




    //checking wheather user already has an account
    const alreadyExist = await User.findOne({ email });

    //returning when user is already there in the database
    if (alreadyExist) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists, please login to your account",
        });
    }

    //creating the user
    const user = new User({
      username,
      email,
      password,
      signupTime: Date.now(),
    });

    //saving the user
    await user.save();

    //returning success message along with the user object without the password
    return res.status(201).json({
      success: true,
      message: "user created successfully",
      user: {
        ...user._doc,
        pasword: undefined,
      },
    });
  } catch (e) {
    res
      .status(500)
      .json({
        success: false,
        message: `Signup wasn't successful: ${e.messagee}`,
      });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(300)
        .json({
          success: false,
          message: "user associated with this email doesn't exist",
        });
    }
  } catch (e) {
    res
      .status(500)
      .json({
        success: false,
        message: `Login wasn't really successful: ${e.message}`,
      });
  }
};
