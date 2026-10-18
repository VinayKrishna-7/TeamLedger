import mongoose from 'mongoose';

/**
 * Middleware factory to validate MongoDB ObjectId parameters in route params.
 * e.g. validateObjectId('groupId') or validateObjectId('expenseId')
 */
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName}: must be a valid 24-character hexadecimal ObjectId`,
      });
    }
    next();
  };
};
