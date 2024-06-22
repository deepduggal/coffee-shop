import jwt from 'jsonwebtoken';

async function signToken(req, res) {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}