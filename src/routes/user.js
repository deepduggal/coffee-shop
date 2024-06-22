import { Router } from "express";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import { genSalt, hash } from "bcrypt";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found.');
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

const checkPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isMatch = user.comparePassword(password);
    if (!isMatch) throw new Error('Password is incorrect.');
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

const signToken = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET, {
      expiresIn: '1h',
    });
    req.token = token;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User has been registered.', user, token: req.token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  req.user = user;
  req.user.id = user._id;
  res.status(200).json({ message: 'User has been logged in.', token: req.token, user: req.user });
};

// Admin-Role-Only Get All Users
const getAllUsers = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    console.log(req.user.role)
    return res.status(403).json({ error: 'You do not have the required role.' });
  }
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;


    // getDefinedSubset
    const valuestoUpdate = {};
    ['name', 'email', 'password'].forEach((userProperty) => {
      if (req.body[userProperty]) {
        valuestoUpdate[userProperty] = req.body[userProperty];
      }
    });

    // Fyi Hashing new password in pre save hook

    const user = await User.findByIdAndUpdate(req.params.id, valuestoUpdate, { new: true, });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.save();
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
const deleteUserById = async (req, res, next) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};


const userRouter = Router();

userRouter.route('/register').post(register);

userRouter.route('/login').post(checkEmail, checkPassword, signToken, login);

//** Auth required for routes below here **
userRouter.use(auth);

userRouter.route('/')
  .get(auth, role(['admin']), getAllUsers);

userRouter.route('/:id')
  .get(getUserById)
  // .post(createUser) // use /user/register
  .put(updateUserById)
  .delete(deleteUserById);

export default userRouter;