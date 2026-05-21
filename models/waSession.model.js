import mongoose from "mongoose";

// Stores WhatsApp Baileys auth state in MongoDB
// so sessions survive server restarts on Railway
const waSessionSchema = new mongoose.Schema({
  _id: { type: String }, // filename key (e.g. "creds" or "app-state-sync-key-xxx")
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.model("WaSession", waSessionSchema);
