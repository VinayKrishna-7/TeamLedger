import mongoose from 'mongoose';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Accommodation',
  'Shopping',
  'Groceries',
  'Entertainment',
  'Utilities',
  'Other',
];

const participantShareSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Member ID is required for share'],
    },
    shareAmountMinor: {
      type: Number,
      required: [true, 'Share amount in paise is required'],
      min: [0, 'Share amount cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Share amount must be an integer (paise)',
      },
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    amountMinor: {
      type: Number,
      required: [true, 'Total amount in paise is required'],
      min: [1, 'Expense amount must be greater than zero'],
      validate: {
        validator: Number.isInteger,
        message: 'Amount must be an integer minor unit (paise)',
      },
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    paidByMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Payer member ID is required'],
    },
    participantShares: {
      type: [participantShareSchema],
      validate: {
        validator: function (shares) {
          if (!Array.isArray(shares) || shares.length === 0) return false;
          // Verify sum of shares equals total amountMinor
          const totalShares = shares.reduce((acc, s) => acc + s.shareAmountMinor, 0);
          return totalShares === this.amountMinor;
        },
        message: 'Sum of participant shares must exactly equal the total expense amount in paise',
      },
    },
    category: {
      type: String,
      enum: {
        values: EXPENSE_CATEGORIES,
        message: 'Invalid expense category',
      },
      default: 'Other',
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying group expenses sorted by date
expenseSchema.index({ groupId: 1, date: -1 });

export const Expense = mongoose.model('Expense', expenseSchema);
