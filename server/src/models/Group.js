import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    members: {
      type: [memberSchema],
      validate: {
        validator: function (members) {
          return Array.isArray(members) && members.length >= 1;
        },
        message: 'A group must have at least one member',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to find member by ID
groupSchema.methods.hasMember = function (memberId) {
  if (!memberId) return false;
  const idStr = memberId.toString();
  return this.members.some((m) => m._id.toString() === idStr);
};

groupSchema.methods.getMember = function (memberId) {
  if (!memberId) return null;
  const idStr = memberId.toString();
  return this.members.find((m) => m._id.toString() === idStr) || null;
};

export const Group = mongoose.model('Group', groupSchema);
