
import express from 'express';
import crypto from 'crypto';
import User from '../models/User';
// Note: You would need to set up email service like nodemailer here

export const forgotPassword = async (req: express.Request, res: express.Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ message: 'If the email exists, a reset link will be sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Here you would send email with reset link
    // const resetUrl = `${req.protocol}://${req.get('host')}/admin/reset-password/${resetToken}`;
    
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset URL would be: ${req.protocol}://${req.get('host')}/admin/reset-password/${resetToken}`);

    res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: express.Request, res: express.Response) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
