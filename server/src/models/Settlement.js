import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required'],
      index: true,
    },
    paidByMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Payer member ID is required'],
    },
    receivedByMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Receiver member ID is required'],
      validate: {
        validator: function (val) {
          return val.toString() !== this.paidByMemberId.toString();
        },
        message: 'Payer and receiver must be different members',
      },
    },
    amountMinor: {
      type: Number,
      required: [true, 'Settlement amount in paise is required'],
      min: [1, 'Settlement amount must be greater than zero'],
      validate: {
        validator: Number.isInteger,
        message: 'Settlement amount must be an integer minor unit (paise)',
      },
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
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

settlementSchema.index({ groupId: 1, date: -1 });

export const Settlement = mongoose.model('Settlement', settlementSchema);
