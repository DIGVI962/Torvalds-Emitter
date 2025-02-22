import mongoose, { Schema } from 'mongoose';

const LawFirmSchema = new Schema({
	lastName: { type: String, required: true },
	firmName: { type: String, required: true },
	location: { type: String, required: true },
	specializations: { type: [String], required: true },
	email: { type: String, required: false },
});

// Prevent model re-compilation in development
const LawFirm =
	mongoose.models.LawFirm || mongoose.model('LawFirm', LawFirmSchema);
export default LawFirm;
