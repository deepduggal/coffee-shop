import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcrypt';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 255
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
    maxLength: 255
    // select: false,
    // immutable: true
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    // select: false,
    // immutable: true
  },
  role: {
    type: String,
    required: true,
    default: 'user',
    enum: ['user', 'admin', 'guest']
  }
});


UserSchema.pre('save', async function (next) {
  try {
    this.password = await this.hashPassword(this.password);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.hashPassword = async function (password) {
  const salt = await genSalt(10);
  return await hash(password, salt);
};

UserSchema.methods.comparePassword = function (password) {
  return compare(password, this.password);
};

const userModel = model('User', UserSchema);
export default userModel;