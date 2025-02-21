const xlsx = require('xlsx');
const Lawyer = require('../models/lawyer');

const parseLawyerRow = (row) => {
    try {
        // Handle name fields
        const firstName = (row.FirstName || '').trim();
        const lastName = (row.LastName || '').trim();
        if (!firstName || !lastName) {
            throw new Error('First name and last name are required');
        }

        console.log(firstName, ' ', lastName);
        // Parse expertise/specializations
        const firmName = (row.FirmName || '').trim();
        const specializationsString = row.Specializations || '';
        const expertise = specializationsString
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        console.log(expertise);
        if (expertise.length === 0) {
            throw new Error('At least one specialization is required');
        }
        
        // Parse experience
        const experience = parseInt(row.Experience || '0');
        if (isNaN(experience) || experience < 0) {
            throw new Error('Invalid experience value');
        }
        console.log(experience);

        // Parse consultation fee
        const fee = parseFloat(row.ConsultationFee || '0');
        if (isNaN(fee) || fee < 0) {
            throw new Error('Invalid consultation fee');
        }
        console.log(fee);

        // Parse languages
        const languagesString = row.Languages || 'English';
        const languages = languagesString
            .split(',')
            .map(lang => lang.trim())
            .filter(lang => lang.length > 0);

        console.log(languages);
        // Create lawyer object with validated data
        return {
            fullName: `${firstName} ${lastName}`,
            email: row.Email ? row.Email.trim().toLowerCase() : '',
            phoneNumber: row.PhoneNumber ? row.PhoneNumber.toString().trim() : '',
            firmName,
            expertise,
            experience,
            location: (row.Location || '').trim(),
            rating: parseFloat(row.Rating || '0'),
            languages,
            consultationFee: fee,
            availability: row.Availability === 'false' ? false : true,
            metadata: {
                importDate: new Date(),
                rowNumber: row.__rowNum__ + 1,
                originalData: { ...row }
            }
        };
    } catch (error) {
        return {
            error: true,
            rowNumber: row.__rowNum__ + 1,
            message: error.message
        };
    }
};

const ingestionController = {
    ingestLawyers: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an Excel file'
                });
            }

            console.log('Processing file:', req.file.originalname);

            // Read Excel file
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(sheet);
            console.log('Raw data:', rawData);
            // Parse and validate each row
            const parsedData = rawData.map(parseLawyerRow);

            // Separate valid and invalid entries
            const validEntries = parsedData.filter(entry => !entry.error);
            const invalidEntries = parsedData.filter(entry => entry.error);

            if (validEntries.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid entries found in the Excel file',
                    errors: invalidEntries
                });
            }

            // Insert valid entries into MongoDB
            const result = await Lawyer.insertMany(validEntries, { 
                ordered: false,
                rawResult: true
            });

            res.status(200).json({
                success: true,
                message: `Successfully processed ${rawData.length} rows`,
                summary: {
                    totalRows: rawData.length,
                    validEntries: validEntries.length,
                    invalidEntries: invalidEntries.length,
                    inserted: result.insertedCount
                },
                errors: invalidEntries
            });

        } catch (error) {
            console.error('Ingestion error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process Excel file',
                error: error.message
            });
        }
    },

    getAllLawyers: async (req, res) => {
        try {
            const lawyers = await Lawyer.find({});
            res.status(200).json({
                success: true,
                count: lawyers.length,
                data: lawyers
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch lawyers',
                error: error.message
            });
        }
    }
};

module.exports = ingestionController;