import mongoose, { Schema, Document, Model, Types } from "mongoose";

export enum TokenType {
  PASSWORD_RESET = "password_reset",
  EMAIL_VERIFICATION = "email_verification",
}

export interface IAuthToken extends Document {
  user: Types.ObjectId;
  token: string;
  token_type: TokenType;
  expires_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const authTokenSchema = new Schema<IAuthToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    token: { type: String, required: true, unique: true },
    token_type: {
      type: String,
      enum: Object.values(TokenType),
      required: true,
    },
    expires_at: { type: Date, required: true },
  },
  { timestamps: true }
);

authTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const AuthToken: Model<IAuthToken> = mongoose.model<IAuthToken>(
  "auth_token",
  authTokenSchema
);
export default AuthToken;
