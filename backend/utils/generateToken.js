import jwt from "jsonwebtoken";

/*
  İstifadəçinin id-sini JWT_SECRET ilə imzalanmış tokenə çevirir.
  Token JWT_EXPIRE müddətindən (məs. 7d) sonra etibarsız olur.
*/
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

export default generateToken;
