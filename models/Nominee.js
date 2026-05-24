import mongoose from "mongoose";

const nomineeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    nomineeName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      //   unique: true,
      lowercase: true,
      //   index: true,
    },

    gender: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      required: true,
    },
    isUnlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
nomineeSchema.index(
  {
    user: 1,
    email: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("Nominee", nomineeSchema);
