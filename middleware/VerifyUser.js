const jwt =require( "jsonwebtoken");
// const createError  = require("../error");
// import { createError } from "../error.js";

 const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "You are not authenticated!" });
     
    }
    // console.log("Authorization header:", req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return next(createError(401, "You are not authenticated!"));
    const decode = jwt.verify(token, process.env.JWT);
    req.user = decode;
    return next();
  } catch (err) {
    next(err);
    console.log(err);
  }
};
module.exports={
    verifyToken
}