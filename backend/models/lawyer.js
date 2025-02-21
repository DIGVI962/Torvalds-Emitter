const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        // required: true,
        // unique: true
    },
    firmName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        // required: true
    },
    expertise: {
        type: [String],
        required: true
    },
    experience: {
        type: Number,
        // required: true
    },
    location: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    languages: {
        type: [String],
        default: ['English']
    },
    consultationFee: {
        type: Number,
        // required: true
    },
    availability: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lawyer', lawyerSchema);