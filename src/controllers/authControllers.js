import { compareSync, hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const signUp = async (req, res) => {
  const { username, email, password, name, avatar } = req.body;

  let user = await prismaClient.user.findFirst({
    where: {
      username,
    },
  });
  if (user) {
    res.status(400).send("user exist");
  }
  user = await prismaClient.user.create({
    data: {
      name,
      username,
      email,
      password: hashSync(password, 10),
      avatar,
    },
  });
  res.status(200).send(user);
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  let user = await prismaClient.user.findFirst({
    where: {
      username,
    },
  });
  if (!user) {
    res.status(401).send("username not found");
  }
  if (!compareSync(password, user.password)) {
    res.status(401).send("wrong pw");
  }
  const accessToken = jwt.sign(
    {
      userId: user.userId,
      userRole: user.role,
    },
    process.env.JWT_KEY
  );

  res.status(200).send([user, { accessToken: accessToken }]);
};
