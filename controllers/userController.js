import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Register
export const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "User with this name is already registered" });
  }

  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds
  const userObject = { username, password: hashedPwd };

  const user = await User.create(userObject);
  const { userData } = user;

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: user.username,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15d" }
  );

  const refreshToken = jwt.sign(
    { username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  res.json({ userData, accessToken });
};

// Login
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15d" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  const { userData } = foundUser;

  res.json({ userData, accessToken });
};

// Refresh
export const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        { UserInfo: { username: foundUser.username } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const { userData } = foundUser;

      res.json({ userData, accessToken });
    }
  );
};

// Logout
export const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

// Delete
export const deleteUser = async (req, res) => {
  const { username } = req.body;
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  if (!username) {
    return res.status(400).json({ message: "Username Required" });
  }

  const user = await User.findOne({ username }).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();
  res.json(`Username ${result.username} deleted`);
};

export const getUserData = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const token = cookies.jwt;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    const foundUser = await User.findOne({
      username: decoded.username,
    }).exec();

    if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

    const userData = foundUser.userData;

    res.json(userData);
  });
};

export const updateUserWeight = async (req, res) => {
  const { username, value } = req.body;

  if (!username || !value) {
    return res.status(400).json({ message: "Can not update weight" });
  }
  const foundUser = await User.findOne({ username: username }).exec();

  if (foundUser) {
    try {
      foundUser.userData.weight = value;
      foundUser.save();
      const { userData } = foundUser;
      res.json({
        userData,
        message: `Product updated`,
      });
    } catch (err) {
      return res.status(400).json({ message: `Can not update weight` });
    }
  } else {
    return res.status(400).json({ message: `User not founded` });
  }
};
