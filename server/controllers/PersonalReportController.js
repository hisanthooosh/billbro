const PersonalReport = require('../models/PersonalReport');

// Create a new PersonalReport
const createPersonalReport = async (req, res) => {
    try {
        const newPersonalReport = new PersonalReport(req.body); 
        const savedPersonalReport = await newPersonalReport.save();
        res.status(201).json(savedPersonalReport);
    } catch (error) {
        // Log error creating report
        console.error("!!! ERROR Creating PersonalReport:", error); 
        res.status(400).json({ message: error.message });
    }
};

// Get all PersonalReports for a user by email
const getPersonalReportsByUser = async (req, res) => {
    try {
        const personalReports = await PersonalReport.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        res.status(200).json(personalReports);
    } catch (error) {
        console.error("!!! ERROR Getting PersonalReports by User:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get a single PersonalReport by ID
const getPersonalReportById = async (req, res) => {
    try {
        const personalReport = await PersonalReport.findById(req.params.id);
        if (!personalReport) {
             console.log('PersonalReport not found for ID:', req.params.id);
             return res.status(404).json({ message: 'PersonalReport not found' });
        }
        res.status(200).json(personalReport);
    } catch (error) {
        console.error("!!! ERROR Getting PersonalReport by ID:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- UPDATED: Add an expense to a PersonalReport WITH DEBUG LOGGING ---
const addExpenseToPersonalReport = async (req, res) => {
    // +++ ADD LOGGING +++
    console.log('--- Add Expense to PersonalReport Request Received ---');
    console.log('PersonalReport ID (from URL params):', req.params.id); // Check if ID is received correctly
    console.log('Expense Data (from request body):', JSON.stringify(req.body, null, 2)); // Log the incoming data cleanly
    // +++ END LOGGING +++

    try {
        // Find the report
        const personalReport = await PersonalReport.findById(req.params.id);
        if (!personalReport) {
            // +++ ADD LOGGING +++
            console.log('PersonalReport not found for ID:', req.params.id);
            // +++ END LOGGING +++
            return res.status(404).json({ message: 'PersonalReport not found' });
        }

        // Add the expense data from the request body
        console.log('Pushing expense data to PersonalReport...'); // Log before pushing
        personalReport.expenses.push(req.body);

        // Try to save the updated report
        console.log('Attempting to save PersonalReport...'); // Log before saving
        const updatedPersonalReport = await personalReport.save();
        console.log('PersonalReport saved successfully!'); // Log on success

        // Send back the updated report
        res.status(200).json(updatedPersonalReport); // Use 200 OK after update

    } catch (error) {
        // --- THIS IS THE MOST IMPORTANT PART ---
        // If any error occurs during findById, push, or save, it should be caught here.
        // +++ ADD DETAILED ERROR LOGGING +++
        console.error('!!! ERROR Adding Expense to PersonalReport:', error); // Log the full error object
        // Send back a more specific error status if possible, default to 400
        res.status(400).json({ 
            message: 'Failed to add expense. See server logs for details.', 
            error: error.message // Optionally send back the basic error message
        });
        // +++ END DETAILED LOGGING +++
    }
};
// --- END OF UPDATED FUNCTION ---

// Delete a PersonalReport
const deletePersonalReport = async (req, res) => {
    try {
        const personalReport = await PersonalReport.findByIdAndDelete(req.params.id);
        if (!personalReport) {
             console.log('PersonalReport not found for deletion:', req.params.id);
             return res.status(404).json({ message: 'PersonalReport not found' });
        }
        res.status(200).json({ message: 'PersonalReport deleted successfully' });
    } catch (error) {
        console.error("!!! ERROR Deleting PersonalReport:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete an expense from a PersonalReport
const deleteExpense = async (req, res) => {
    try {
        const { PersonalReportId, expenseId } = req.params;
        const personalReport = await PersonalReport.findById(PersonalReportId);
        if (!personalReport) {
             console.log('PersonalReport not found for deleting expense:', PersonalReportId);
             return res.status(404).json({ message: 'PersonalReport not found' });
        }

        console.log(`Attempting to pull expense ${expenseId} from report ${PersonalReportId}`);
        personalReport.expenses.pull({ _id: expenseId });
        await personalReport.save();
        console.log('Expense removed and report saved.');
        res.status(200).json(personalReport);
    } catch (error) {
        console.error("!!! ERROR Deleting Expense from PersonalReport:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update a specific expense within a PersonalReport
const updateExpense = async (req, res) => {
     // +++ ADD LOGGING +++
     console.log('--- Update Expense in PersonalReport Request Received ---');
     console.log('PersonalReport ID:', req.params.PersonalReportId);
     console.log('Expense ID:', req.params.expenseId);
     console.log('Update Data:', JSON.stringify(req.body, null, 2));
     // +++ END LOGGING +++
    try {
        const { PersonalReportId, expenseId } = req.params;
        const personalReport = await PersonalReport.findById(PersonalReportId);
        if (!personalReport) {
             console.log('PersonalReport not found for updating expense:', PersonalReportId);
             return res.status(404).json({ message: 'PersonalReport not found' });
        }

        const expense = personalReport.expenses.id(expenseId);
        if (!expense) {
             console.log(`Expense with ID ${expenseId} not found within report ${PersonalReportId}`);
             return res.status(404).json({ message: 'Expense not found' });
        }

        // Update the expense fields with the new data
        console.log('Updating expense fields...');
        expense.set(req.body); // Use set() to apply updates from request body
        
        console.log('Attempting to save PersonalReport after expense update...');
        await personalReport.save();
        console.log('PersonalReport saved successfully after expense update.');
        res.status(200).json(personalReport);
    } catch (error) {
        console.error("!!! ERROR Updating Expense in PersonalReport:", error);
        res.status(400).json({ message: error.message });
    }
};


module.exports = {
    createPersonalReport,
    getPersonalReportsByUser,
    getPersonalReportById,
    addExpenseToPersonalReport,
    deletePersonalReport,
    deleteExpense,
    updateExpense 
};
