import mongoose, { Schema, Model, Document, Types } from "mongoose";

export type TransactionType = "income" | "expense";

export interface ITransaction extends Document {
  user: Types.ObjectId;
  type: TransactionType;
  amount: number;
  category: string;
  source: string;
  note: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    source: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> =
  (mongoose.models.Transaction as Model<ITransaction>) ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
