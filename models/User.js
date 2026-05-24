import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    googleId: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: "",
    },
    nominees: [
      {
        nomineeName: {
          type: String,
          required: true,
        },

        email: {
          type: String,
          required: true,
        },

        gender: {
          type: String,
          enum: ["Male", "Female", "Other"],
          required: true,
        },

        note: {
          type: String,
          default: "",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
