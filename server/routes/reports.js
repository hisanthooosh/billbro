// Defines the API endpoints for PersonalReports
const express = require('express');
const router = express.Router();
const {
    createPersonalReport,
    getPersonalReportsByUser,
    getPersonalReportById,
    addExpenseToPersonalReport,
    deletePersonalReport,
    deleteExpense
} = require('../controllers/PersonalReportController');

// GET all PersonalReports for a specific user (email)
router.get('/user/:email', getPersonalReportsByUser);

// GET a single PersonalReport by its ID
router.get('/:id', getPersonalReportById);

// POST a new PersonalReport
router.post('/', createPersonalReport);

// POST a new expense to a specific PersonalReport
router.post('/:id/expenses', addExpenseToPersonalReport);

// DELETE a PersonalReport
router.delete('/:id', deletePersonalReport);

// DELETE an expense from a PersonalReport
router.delete('/:PersonalReportId/expenses/:expenseId', deleteExpense);


module.exports = router;
