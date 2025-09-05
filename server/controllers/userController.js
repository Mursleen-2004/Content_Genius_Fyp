import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getUserProfile = (req, res) => {
  res.json(req.user);
};

export const updateUserProfile = async (req, res) => {
  const userId = req.user._id;
  const { name, password, avatar } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
