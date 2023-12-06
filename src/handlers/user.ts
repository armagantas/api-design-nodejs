import prisma from "../database";
import { comparePasswords, createJWT, hashPassword } from "../modules/auth";

export const createNewUser = async (req, res, next) => {
  try {
    const user = await prisma.user.create({
      data: {
        username: req.body.username,
        password: await hashPassword(req.body.password),
      },
    });

    const token = createJWT(user);
    res.json({
      username: req.body.username,
      token: token,
    });
  } catch (error) {
    error.type = "input";
    next(error);
  }
};

export const signIn = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      username: req.body.username,
    },
  });

  const isValid = await comparePasswords(req.body.password, user.password);
  if (!isValid) {
    res.status(401).json({ message: "Passwords did not match." });
    return;
  }

  const token = createJWT(user);
  res.json({ username: req.body.username, token });
};
