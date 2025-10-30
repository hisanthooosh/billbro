import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Helper Components ---
const Spinner = () => (<div className="flex justify-center items-center h-full"> <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div> </div>);
const Modal = ({ children, onClose }) => (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"> <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md relative"> <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button> {children} </div> </div>);

// --- Main App Component ---
function App() {
    const [email, setEmail] = useState(localStorage.getItem('userEmail') || '');
    const [name, setName] = useState(localStorage.getItem('userName') || '');
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userEmail'));
    const [reports, setReports] = useState([]);
    // NEW: Updated view state to manage the two-step creation process
    // Around Line 23
    // Around Line 23
    // Around Line 23
    const [currentView, setCurrentView] = useState('dashboard'); // ..., signup, createEvent, manageCommunities (NEW)
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('currentUser')) || null); // Store user object or null

    // Around Line 30
    const API_URL = 'http://localhost:5001/api'; // Correct Base API URL

    useEffect(() => {
        if (currentUser) { // Fetch reports if a user is logged in
            fetchReports(currentUser.email); // Pass email to fetch reports
        }
    }, [currentUser]);

    const handleLogin = async (e, email, password) => { // Receive email and password
        e.preventDefault();
        setError(''); // Clear previous errors
        setLoading(true); // Show loading indicator

        if (!email || !password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            // --- CALL THE LOGIN API ---
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: email.trim().toLowerCase(),
                password
            });
            // --- END API CALL ---

            // --- HANDLE SUCCESS ---
            if (response.data && response.data._id) {
                const userData = {
                    _id: response.data._id,
                    name: response.data.name,
                    email: response.data.email,
                    phone: response.data.phone
                    // Add token here later if implementing JWT
                };
                localStorage.setItem('currentUser', JSON.stringify(userData)); // Save user object
                setCurrentUser(userData); // Update state
                setIsLoggedIn(true);
            } else {
                setError('Login failed. Please try again.'); // Should not happen if API is correct
            }
            // --- END SUCCESS HANDLING ---

        } catch (err) {
            // --- HANDLE ERRORS ---
            if (err.response && err.response.status === 401) {
                setError('Invalid email or password.'); // Specific message for bad credentials
            } else {
                setError('Login failed due to a server error. Please try again later.'); // Generic error
                console.error("Login API error:", err);
            }
            // --- END ERROR HANDLING ---
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    // ... handleLogin function ends here ...

    // +++ ADD THIS ENTIRE FUNCTION +++
    const handleSignup = async (name, email, phone, password) => {
        setError(''); // Clear previous errors

        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                password: password
            });

            if (response.data && response.data._id) {
                // Signup successful! Return true to indicate success.
                return { success: true, message: `Account for ${response.data.name} created successfully! Please log in.` };
            } else {
                // Should not happen with 201 response, but handle defensively
                return { success: false, message: 'Signup failed. Unexpected response.' };
            }

        } catch (err) {
            // Handle specific errors like duplicate email
            if (err.response && err.response.data && err.response.data.message) {
                return { success: false, message: `Signup failed: ${err.response.data.message}` };
            } else {
                console.error("Signup API error:", err);
                return { success: false, message: 'Signup failed due to a server error. Please try again later.' };
            }
        }
    };
    // +++ END OF NEW FUNCTION +++

    // handleLogout function starts here...
    const handleLogout = () => {
        localStorage.removeItem('currentUser'); // Clear user object
        setCurrentUser(null); // Reset state
        setIsLoggedIn(false);
        setReports([]);
        setCurrentView('dashboard');
    };
    const fetchReports = async (userEmail) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/reports/user/${userEmail}`);
            setReports(response.data);
        } catch (err) {
            // Keep error handling for personal reports for now
            // setError('Could not fetch reports.'); 
            console.error("Fetch Reports Error:", err);
            setReports([]); // Clear reports on error
        }
        finally { setLoading(false); }
    };

    const viewReportDetail = async (reportId) => {
        setLoading(true);
        try {
            // Ensure the URL includes '/reports/' before the ID
            const response = await axios.get(`${API_URL}/reports/${reportId}`);
            setSelectedReport(response.data);
            setCurrentView('detail');
        } catch (err) {
            setError('Could not fetch report details.');
            // Log the error for debugging
            console.error("View Report Detail Error:", err);
        } finally {
            setLoading(false);
        }
    }

    const deleteReport = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try { await axios.delete(`${API_URL}/reports/${reportId}`); }
            catch (err) { setError('Failed to delete the report.'); }
        }
    };

    // NEW: Function to handle the transition from creating report details to adding expenses
    const handleReportCreated = (newReport) => {
        setSelectedReport(newReport);
        setCurrentView('addExpenses');
    };

    if (!isLoggedIn) { // +++ REPLACE THE ORIGINAL LINE WITH THIS BLOCK +++
        if (currentView === 'signup') {
            // Show Signup page if currentView is 'signup'
            return <SignupPage handleSignup={handleSignup} setCurrentView={setCurrentView} />;
        }
        // Otherwise, default to showing the Login page
        // Make sure LoginPage receives setCurrentView prop now
        return <LoginPage handleLogin={handleLogin} error={error} setCurrentView={setCurrentView} />;
        // +++ END OF REPLACEMENT BLOCK +++
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <Header currentUser={currentUser} onLogout={handleLogout} setCurrentView={setCurrentView} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {currentView === 'dashboard' && (
                    <Dashboard
                        reports={reports} // Pass personal reports for now
                        loading={loading}
                        error={error}
                        onCreateClick={() => setCurrentView('createReport')} // Still goes to personal report creation
                        onViewClick={viewReportDetail} // Still views personal reports
                        onDeleteClick={deleteReport} // Still deletes personal reports
                        setCurrentView={setCurrentView} // <<< ADD THIS PROP
                    />
                )}
                {/* NEW: Step 1 of creation */}
                {currentView === 'createReport' && (
                    <ReportCreationForm email={email}
                        onSuccess={handleReportCreated}
                        onCancel={() => setCurrentView('dashboard')}
                    />
                )}
                {/* NEW: Step 2 of creation */}
                {currentView === 'addExpenses' && selectedReport && (
                    <ExpenseTracker report={selectedReport}
                        onFinish={() => { fetchReports(); setCurrentView('dashboard'); }}
                    />
                )}
                {currentView === 'detail' && selectedReport && (
                    <ReportDetail report={selectedReport}
                        onBack={() => setCurrentView('dashboard')}
                        onRefresh={viewReportDetail}
                    />
                )}
                {/* +++ ADD NEW VIEW CONDITION +++ */}
                {currentView === 'userManagement' && (
                    <UserManagementPage onBack={() => setCurrentView('dashboard')} />
                )}
                {/* +++ END ADD +++ */}
                {currentView === 'createEvent' && (
                    // We will create this component next
                    <CreateEventForm
                        currentUser={currentUser} // Pass the logged-in user
                        // +++ UPDATE onSuccess LOGIC +++
                        onSuccess={(newEvent) => {
                            console.log("Event Created:", newEvent);
                            setSelectedReport(newEvent); // Store the newly created event
                            setCurrentView('manageCommunities'); // Go to the community management page
                            // No need to fetchReports here as we are leaving the dashboard
                        }}
                        // +++ END UPDATE +++
                        onCancel={() => setCurrentView('dashboard')}
                    />

                )}
                {currentView === 'manageCommunities' && selectedReport && ( // selectedReport now holds the event
                    <ManageCommunitiesPage
                        event={selectedReport} // Pass the event data
                        currentUser={currentUser}
                        onFinish={() => {
                            fetchReports(currentUser.email); // Re-fetch personal reports
                            // We might need a way to fetch Events separately later
                            setCurrentView('dashboard');
                        }}
                    />
                )}
            </main>
        </div>
    );
}

// --- Page & Major Components ---

const LoginPage = ({ handleLogin, error, setCurrentView }) => {
    // --- ADD LOCAL STATE FOR INPUTS ---
    const [localEmail, setLocalEmail] = useState('');
    const [localPassword, setLocalPassword] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state for login button
    // --- END ADD ---

    const submitLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Show spinner on button
        await handleLogin(e, localEmail, localPassword); // Call parent login handler
        setLoading(false); // Hide spinner
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Mr. BillBro</h1>
                    <p className="mt-2 text-gray-600">Simple Expense Reporting for Events & Trips</p>
                </div>
                {/* --- UPDATE FORM ONSUBMIT --- */}
                <form onSubmit={submitLogin} className="space-y-6">
                    {/* --- END UPDATE --- */}
                    <input
                        type="email"
                        value={localEmail}
                        onChange={(e) => setLocalEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        required
                    />
                    {/* --- ADD PASSWORD INPUT FIELD --- */}
                    <input
                        type="password"
                        value={localPassword}
                        onChange={(e) => setLocalPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition"
                        required
                    />
                    {/* --- END ADD --- */}
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading} // Disable button while loading
                        className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex justify-center items-center"
                    >
                        {loading ? <Spinner /> : 'Login'} {/* Show spinner or text */}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button onClick={() => setCurrentView('signup')} className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign Up
                    </button>
                </p>
                {/* Maybe add a link/note about manual user creation later */}
            </div>
        </div>
    );
};

// ... LoginPage component ends here };

// +++ ADD THIS ENTIRE COMPONENT +++
const SignupPage = ({ handleSignup, setCurrentView }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); // For success/error messages

    const submitSignup = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' }); // Clear previous message

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setLoading(true);
        const result = await handleSignup(name, email, phone, password);
        setLoading(false);

        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            // Optional: Automatically switch to login after a short delay
            setTimeout(() => {
                setCurrentView('login'); // Go to login page after successful signup
            }, 2000); // 2-second delay
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                    <p className="mt-2 text-gray-600">Join Mr. BillBro</p>
                </div>
                <form onSubmit={submitSignup} className="space-y-4">
                    <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required />
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
                    <Input label="Phone Number (Optional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min. 6 characters)" required />
                    <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />

                    {message.text && (
                        <p className={`text-sm text-center font-medium ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
                    )}

                    <button type="submit" disabled={loading} className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 flex justify-center items-center">
                        {loading ? <Spinner /> : 'Sign Up'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button onClick={() => setCurrentView('login')} className="font-medium text-indigo-600 hover:text-indigo-500">
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
};
// +++ END OF NEW COMPONENT +++

// Header component starts here...
// --- UPDATE PROPS TO RECEIVE 'currentUser' ---
const Header = ({ currentUser, onLogout, setCurrentView }) => (
    // --- END UPDATE ---
    <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            {/* +++ MAKE LOGO CLICKABLE TO GO TO DASHBOARD +++ */}
            <h1
                className="text-2xl font-bold text-indigo-600 cursor-pointer"
                onClick={() => setCurrentView('dashboard')} // Go home on click
            >
                Mr. BillBro
            </h1>
            {/* +++ END UPDATE +++ */}
            <div className='flex items-center space-x-4'>
                {currentUser && (
                    <> {/* Use Fragment to group elements */}
                        {/* +++ ADD USER MANAGEMENT BUTTON +++ */}

                        {/* +++ END ADD +++ */}
                        <span className="text-gray-600 hidden sm:block font-medium">Welcome, {currentUser.name}!</span>
                    </>
                )}
                <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition">
                    Logout
                </button>
            </div>
        </div>
    </header>
);
// Around Line 175
// --- UPDATED Dashboard Component ---
const Dashboard = ({ reports, loading, error, onCreateClick, onViewClick, onDeleteClick, setCurrentView }) => (
    <div>
        {/* Adjusted layout for buttons */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Your Dashboard</h2>
            <div className="flex space-x-4"> {/* Group buttons */}
                {/* NEW "Create Event" button */}
                <button
                    onClick={() => setCurrentView('createEvent')} // Navigate to createEvent view
                    className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-105"
                >
                    + Create New Event
                </button>
                {/* Updated "Create Personal Report" button */}
                <button
                    onClick={onCreateClick} // Still uses the original prop for personal reports
                    className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-transform transform hover:scale-105"
                >
                    + Create Personal Report
                </button>
            </div>
        </div>

        {/* --- Display Personal Reports (No change needed here for now) --- */}
        <h3 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b">My Personal Reports</h3>
        {loading && <Spinner />}
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        {!loading && !reports.length && (
            <div className="text-center py-16 bg-white rounded-lg shadow">
                <p className="text-xl text-gray-500">No personal reports found.</p>
                <p className="text-gray-400 mt-2">Click "Create Personal Report" to get started!</p>
            </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map(report => (
                <div key={report._id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow">
                    <div>
                        {/* Displaying Personal Report details */}
                        <h3 className="text-xl font-bold text-gray-900 truncate">{report.eventName}</h3>
                        <p className="text-sm text-gray-500">{report.organizationName}</p>
                        <p className="text-xs text-gray-400 mt-2">Created: {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <div className='text-left'>
                            <p className="text-sm text-gray-500">Total Spent</p>
                            <p className="text-lg font-semibold text-indigo-600">
                                ₹{report.expenses.reduce((sum, ex) => sum + ex.amount, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => onViewClick(report._id)} className="p-2 text-indigo-600 bg-indigo-100 rounded-full hover:bg-indigo-200 transition" title="View Details">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            </button>
                            <button onClick={() => onDeleteClick(report._id)} className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition" title="Delete Report">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        {/* Placeholder for Events List (to be added later) */}
        {/* <h3 className="text-2xl font-semibold text-gray-700 mt-10 mb-4 pb-2 border-b">My Events</h3> */}
        {/* <p className="text-gray-500">Events you are organizing or part of will appear here.</p> */}
    </div>
);
// --- END of Updated Dashboard Component ---
// NEW: Step 1 Component - Creating the main report details
const ReportCreationForm = ({ email, onSuccess, onCancel }) => {
    const [reportData, setReportData] = useState({
        organizationName: '', eventName: '', eventVenue: '', eventDescription: '',
        numberOfDays: '', startDate: '', endDate: '',
        attendees: { total: '', girls: '', boys: '', list: [] },
        mentor: { name: '', phone: '', rollOrEmpNumber: '' },
        permissionFrom: { name: '', designation: '', phone: '' },
        allocatedAmount: ''
    });
    const [showAttendeeModal, setShowAttendeeModal] = useState(false);

    const handleChange = (e, section) => {
        const { name, value } = e.target;
        if (section) {
            setReportData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
        } else {
            setReportData(prev => ({ ...prev, [name]: value }));
        }
    };

    const saveAttendee = (attendee) => {
        setReportData(prev => ({ ...prev, attendees: { ...prev.attendees, list: [...prev.attendees.list, attendee] } }));
        setShowAttendeeModal(false);
    };

    const deleteAttendee = (index) => {
        setReportData(prev => ({ ...prev, attendees: { ...prev.attendees, list: prev.attendees.list.filter((_, i) => i !== index) } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalReport = {
            ...reportData,
            userEmail: email,
            expenses: [], // Start with empty expenses
            allocatedAmount: Number(reportData.allocatedAmount) || 0,
            numberOfDays: Number(reportData.numberOfDays) || 0,
            attendees: { ...reportData.attendees, total: Number(reportData.attendees.total) || 0, girls: Number(reportData.attendees.girls) || 0, boys: Number(reportData.attendees.boys) || 0 }
        };
        try {
            const response = await axios.post('http://localhost:5001/api/reports', finalReport);
            onSuccess(response.data); // Transition to the next step
        } catch (err) {
            alert('Failed to create report details.');
            console.error(err);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Step 1: Report Details</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                <Section title="Event Details">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input name="organizationName" value={reportData.organizationName} onChange={(e) => handleChange(e)} placeholder="Organization Name" required />
                        <Input name="eventName" value={reportData.eventName} onChange={(e) => handleChange(e)} placeholder="Event Name" required />
                        <Input name="eventVenue" value={reportData.eventVenue} onChange={(e) => handleChange(e)} placeholder="Event Venue" />
                        <TextArea name="eventDescription" value={reportData.eventDescription} onChange={(e) => handleChange(e)} placeholder="Brief Description of Event" className="md:col-span-2 lg:col-span-3" />
                        <Input name="numberOfDays" type="number" value={reportData.numberOfDays} onChange={(e) => handleChange(e)} placeholder="Number of Days" />
                        <Input name="startDate" type="date" value={reportData.startDate} onChange={(e) => handleChange(e)} label="Start Date" />
                        <Input name="endDate" type="date" value={reportData.endDate} onChange={(e) => handleChange(e)} label="End Date" />
                    </div>
                </Section>
                <Section title="Authorization & Leadership">
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-600 mb-2">Permission From</h4>
                            <div className="space-y-3">
                                <Input name="name" value={reportData.permissionFrom.name} onChange={(e) => handleChange(e, 'permissionFrom')} placeholder="Full Name" />
                                <Input name="designation" value={reportData.permissionFrom.designation} onChange={(e) => handleChange(e, 'permissionFrom')} placeholder="Designation" />
                                <Input name="phone" value={reportData.permissionFrom.phone} onChange={(e) => handleChange(e, 'permissionFrom')} placeholder="Phone Number" />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-600 mb-2">Event Head / Mentor</h4>
                            <div className="space-y-3">
                                <Input name="name" value={reportData.mentor.name} onChange={(e) => handleChange(e, 'mentor')} placeholder="Full Name" />
                                <Input name="rollOrEmpNumber" value={reportData.mentor.rollOrEmpNumber} onChange={(e) => handleChange(e, 'mentor')} placeholder="Roll / Employee No." />
                                <Input name="phone" value={reportData.mentor.phone} onChange={(e) => handleChange(e, 'mentor')} placeholder="Phone Number" />
                            </div>
                        </div>
                    </div>
                </Section>
                <Section title="Attendees">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <Input name="total" type="number" value={reportData.attendees.total} onChange={(e) => handleChange(e, 'attendees')} placeholder="Total No. of People" />
                        <Input name="boys" type="number" value={reportData.attendees.boys} onChange={(e) => handleChange(e, 'attendees')} placeholder="No. of Boys" />
                        <Input name="girls" type="number" value={reportData.attendees.girls} onChange={(e) => handleChange(e, 'attendees')} placeholder="No. of Girls" />
                    </div>
                    <div className="space-y-2">
                        {reportData.attendees.list.map((att, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded"> <p>{att.name} ({att.rollOrEmpNumber})</p> <button type="button" onClick={() => deleteAttendee(index)} className="text-red-500 font-bold">&times;</button> </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => setShowAttendeeModal(true)} className="mt-2 w-full text-sm py-2 border border-dashed rounded hover:bg-gray-100">+ Add Attendee Details</button>
                </Section>
                <Section title="Financials">
                    <Input name="allocatedAmount" type="number" value={reportData.allocatedAmount} onChange={(e) => handleChange(e)} placeholder="Allocated Budget (₹)" />
                </Section>
                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-8 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
                    <button type="submit" className="px-8 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold">Save & Add Expenses</button>
                </div>
            </form>
            {showAttendeeModal && <AttendeeModal onSave={saveAttendee} onClose={() => setShowAttendeeModal(false)} />}
        </div>
    );
};

// NEW: Step 2 Component - Adding expenses to the created report
const ExpenseTracker = ({ report: initialReport, onFinish }) => {
    const [report, setReport] = useState(initialReport);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    const totalSpent = report.expenses.reduce((sum, ex) => sum + ex.amount, 0);
    const remainingBalance = report.allocatedAmount - totalSpent;

    const saveExpense = async (expense) => {
        try {
            const response = await axios.post(`http://localhost:5001/api/reports/${report._id}/expenses`, expense);
            setReport(response.data); // Update the report with the new expense list
            setShowExpenseModal(false);
            setCurrentExpense(null); // This closes the modal
        } catch (err) {
            alert('Failed to add expense.');
            console.error(err);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Step 2: Log Expenses</h2>
            <p className="text-gray-600 mb-6">For: <span className="font-semibold text-indigo-600">{report.eventName}</span></p>

            <div className="grid md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
                <div> <p className="text-sm text-gray-500">Allocated Budget</p> <p className="text-2xl font-bold">₹{report.allocatedAmount.toLocaleString()}</p> </div>
                <div> <p className="text-sm text-gray-500">Total Spent</p> <p className="text-2xl font-bold text-red-500">₹{totalSpent.toLocaleString()}</p> </div>
                <div> <p className="text-sm text-gray-500">Remaining Balance</p> <p className="text-2xl font-bold text-green-600">₹{remainingBalance.toLocaleString()}</p> </div>
            </div>

            <h3 className="text-xl font-bold text-gray-700 mb-4">Expense Log</h3>
            <div className="space-y-3 mb-6">
                {report.expenses.length > 0 ? report.expenses.map((exp) => (
                    <div key={exp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div> <p className="font-semibold">{exp.category}: {exp.description}</p> <p className="text-sm text-gray-500">{new Date(exp.date).toLocaleDateString()}</p> </div>
                        <p className="font-bold text-lg">₹{exp.amount.toLocaleString()}</p>
                    </div>
                )) : <p className="text-gray-500 text-center py-4">No expenses logged yet.</p>}
            </div>

            <button type="button" onClick={() => setCurrentExpense({ category: 'Travel', description: '', details: {}, amount: '' })} className="w-full py-3 border-2 border-dashed border-indigo-400 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold"> + Add New Expense </button>

            <div className="flex justify-end mt-8 pt-4 border-t">
                <button onClick={onFinish} className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">Finish & Go to Dashboard</button>
            </div>

            {currentExpense && <ExpenseModal expense={currentExpense} onSave={saveExpense} onClose={() => setCurrentExpense(null)} />}
        </div>
    );
};


// +++ REPLACE the existing CreateEventForm component +++
// (Around line 280)

const CreateEventForm = ({ currentUser, onSuccess, onCancel }) => {
    // State to hold Step 1 event details ONLY
    const [eventData, setEventData] = useState({
        eventName: '',
        numberOfDays: '',
        startDate: '',
        endDate: '',
        eventTime: '', // New optional field
        totalAllocatedAmount: '', // Optional budget
        headName: '', // New fields for event head
        headPhone: '',
        headDesignation: '',
        eventDescription: '', // For additional description
        organizationName: '' // Still need organization name
    });
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const API_URL = 'http://localhost:5001/api';

    // Handle changes for top-level fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setLoading(true);

        // Prepare data for API, ensuring numbers are numbers
        const finalEventData = {
            ...eventData,
            organizerEmail: currentUser.email, // Add the organizer's email
            totalAllocatedAmount: Number(eventData.totalAllocatedAmount) || 0,
            numberOfDays: Number(eventData.numberOfDays) || 0,
            // We removed attendees, mentor, permissionFrom from this initial save
        };

        // Basic validation check
        if (!finalEventData.eventName || !finalEventData.numberOfDays || !finalEventData.startDate || !finalEventData.endDate) {
            setFormError('Event Name, Number of Days, Start Date, and End Date are required.');
            setLoading(false);
            return;
        }


        try {
            const response = await axios.post(`${API_URL}/events`, finalEventData);
            if (response.data && response.data._id) {
                alert('Event details saved successfully! Now add communities.');
                onSuccess(response.data); // Pass the new event data back up
            } else {
                setFormError('Failed to create event. Unexpected response.');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setFormError(`Error: ${err.response.data.message}`);
            } else {
                setFormError('An unexpected server error occurred.');
            }
            console.error("Create Event API Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Event (Step 1: Details)</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Event Core Details */}
                <Section title="Core Event Information">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input name="organizationName" value={eventData.organizationName} onChange={handleChange} placeholder="Organization Name" required />
                        <Input name="eventName" value={eventData.eventName} onChange={handleChange} placeholder="Event Name" required />
                        <Input name="numberOfDays" type="number" value={eventData.numberOfDays} onChange={handleChange} placeholder="Number of Days" required />
                        <Input name="startDate" type="date" value={eventData.startDate} onChange={handleChange} label="Start Date" required />
                        <Input name="endDate" type="date" value={eventData.endDate} onChange={handleChange} label="End Date" required />
                        <Input name="eventTime" type="time" value={eventData.eventTime} onChange={handleChange} label="Event Time (Optional, if 1 day)" />
                    </div>
                </Section>

                {/* Event Head Details */}
                <Section title="Event Head / Coordinator">
                    <div className="grid md:grid-cols-3 gap-4">
                        <Input name="headName" value={eventData.headName} onChange={handleChange} placeholder="Head's Full Name" />
                        <Input name="headDesignation" value={eventData.headDesignation} onChange={handleChange} placeholder="Head's Designation" />
                        <Input name="headPhone" type="tel" value={eventData.headPhone} onChange={handleChange} placeholder="Head's Phone Number" />
                    </div>
                </Section>

                {/* Financials & Description */}
                <Section title="Budget & Description">
                    <div className="grid md:grid-cols-1 gap-4">
                        <Input name="totalAllocatedAmount" type="number" value={eventData.totalAllocatedAmount} onChange={handleChange} placeholder="Total Allocated Budget (Optional, ₹)" />
                        <TextArea name="eventDescription" value={eventData.eventDescription} onChange={handleChange} placeholder="Additional Event Description (Optional)" />
                    </div>
                </Section>

                {formError && <p className="text-red-500 text-sm text-center font-medium">{formError}</p>}

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-8 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
                    <button type="submit" disabled={loading} className="px-8 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 flex items-center justify-center">
                        {loading ? <Spinner /> : 'Save & Add Communities (Step 2)'}
                    </button>
                </div>
            </form>
        </div>
    );
};
// +++ END OF REPLACEMENT +++

// ... after CreateEventForm component ...

// +++ NEW COMPONENT: Manage Communities Page (Step 2) +++
const ManageCommunitiesPage = ({ event, currentUser, onFinish }) => {
    // State for this page will go here (e.g., list of communities, form inputs)
    const [communities, setCommunities] = useState([]); // To store communities later
    const [showAddCommunityModal, setShowAddCommunityModal] = useState(false);
    const [isLoadingCommunities, setIsLoadingCommunities] = useState(false); // For fetching later
    // +++ END ADD +++
    // --- TODO: Add useEffect to fetch existing communities for this event ---
    // useEffect(() => {
    //    fetchCommunities(event._id); 
    // }, [event._id]);

    // +++ FUNCTION TO UPDATE STATE AFTER SAVING +++
    const handleCommunitySaved = (newCommunity) => {
        setCommunities(prev => [...prev, newCommunity]); // Add the new community to the list
    };
    // +++ END ADD +++

    // We will add functions here later to:
    // - Fetch existing communities for this event
    // - Handle adding a new community (calling the backend API)
    // - Search for users to add as heads/members

    return (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Manage Communities</h2>
            <p className="text-gray-600 mb-6">For Event: <span className="font-semibold text-indigo-600">{event.eventName}</span></p>

            {/* +++ UPDATE DISPLAY LOGIC +++ */}
            {isLoadingCommunities && <Spinner />}
            {!isLoadingCommunities && communities.length === 0 && (
                <p className="text-gray-500">No communities created yet.</p>
            )}
            {!isLoadingCommunities && communities.length > 0 && (
                <div className="space-y-3">
                    {communities.map(comm => (
                        <div key={comm._id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{comm.communityName}</p>
                                <p className="text-sm text-gray-500">{comm.description}</p>
                                {/* We'll fetch and display head name later */}
                                <p className="text-xs text-gray-400 mt-1">Head ID: {comm.head}</p>
                            </div>
                            <p className="font-medium text-indigo-600">Budget: ₹{comm.allocatedBudget.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}
            {/* +++ END UPDATE +++ */}

            {/* Button to open the 'Add Community' modal */}
            <Section title="Add New Community">
                <button
                    onClick={() => setShowAddCommunityModal(true)}
                    className="w-full py-3 border-2 border-dashed border-green-400 text-green-600 rounded-lg hover:bg-green-50 transition font-semibold"
                >
                    + Add Community
                </button>
            </Section>


            {/* +++ REPLACE PLACEHOLDER WITH ACTUAL MODAL +++ */}
            {showAddCommunityModal && (
                <AddCommunityModal
                    eventId={event._id} // Pass the event ID
                    onSave={handleCommunitySaved} // Pass the function to update state
                    onClose={() => setShowAddCommunityModal(false)}
                />
            )}
            {/* +++ END REPLACEMENT +++ */}


            {/* Button to finish and go back to dashboard */}
            <div className="flex justify-end mt-8 pt-4 border-t">
                <button
                    onClick={onFinish}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                    Finish & Go to Dashboard
                </button>
            </div>
        </div>
    );
};
// +++ END OF NEW COMPONENT +++

// ReportDetail component starts here...
// --- Updated ReportDetail component ---
const ReportDetail = ({ report, onBack, onRefresh }) => {
    const [editingExpense, setEditingExpense] = useState(null);

    const totalSpent = report.expenses.reduce((sum, ex) => sum + ex.amount, 0);
    const balance = report.allocatedAmount - totalSpent;
    const isOverBudget = balance < 0;

    const handleEditSave = () => { setEditingExpense(null); onRefresh(report._id); };
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

    return (
        <div>
            <style>{` @media print { body * { visibility: hidden; } .no-print { display: none; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; margin: 0; box-shadow: none; border: none; } } `}</style>
            <div className="flex justify-between items-center mb-6 no-print">
                <button onClick={onBack} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"> &larr; Back to Dashboard </button>
                <button onClick={() => window.print()} className="px-5 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">Print / Save as PDF</button>
            </div>

            <div id="print-area" className="p-8 lg:p-12 bg-white rounded-lg shadow-lg">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-800">{report.eventName}</h1>
                    <h2 className="text-2xl text-gray-600">{report.organizationName}</h2>
                    <p className="text-sm text-gray-400 mt-2">Venue: {report.eventVenue || 'N/A'}</p>
                    <p className="text-sm text-gray-400 mt-1">Duration: {formatDate(report.startDate)} - {formatDate(report.endDate)} ({report.numberOfDays} days)</p>
                </div>

                <Section title="Event Summary">
                    <div className="space-y-2 text-sm text-gray-800">
                        <p><strong>Description:</strong> {report.eventDescription || 'N/A'}</p>
                        <p><strong>Permission From:</strong> {report.permissionFrom?.name || 'N/A'} ({report.permissionFrom?.designation || 'N/A'}) - Ph: {report.permissionFrom?.phone || 'N/A'}</p>
                        <p><strong>Mentor:</strong> {report.mentor?.name || 'N/A'} (ID: {report.mentor?.rollOrEmpNumber || 'N/A'}) - Ph: {report.mentor?.phone || 'N/A'}</p>
                    </div>
                </Section>

                {/* NEW: Attendee Table */}
                <Section title={`Attendees (${report.attendees?.total || 0} Total)`}>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100"> <tr> <th className="p-2">Name</th> <th className="p-2">Roll/Emp No.</th> <th className="p-2">Phone Number</th> </tr> </thead>
                        <tbody>
                            {report.attendees?.list.map((att, i) => (<tr key={i} className="border-b"> <td className="p-2">{att.name}</td> <td className="p-2">{att.rollOrEmpNumber}</td> <td className="p-2">{att.phone}</td> </tr>))}
                        </tbody>
                    </table>
                </Section>

                {/* NEW: Updated Financial Summary */}
                <Section title="Financial Summary">
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg"> <p className="text-sm text-blue-800">Allocated Budget</p> <p className="text-xl font-bold text-blue-900">₹{report.allocatedAmount.toLocaleString()}</p> </div>
                        <div className="p-3 bg-red-50 rounded-lg"> <p className="text-sm text-red-800">Total Spent</p> <p className="text-xl font-bold text-red-900">₹{totalSpent.toLocaleString()}</p> </div>
                        <div className={`p-3 rounded-lg ${isOverBudget ? 'bg-yellow-50' : 'bg-green-50'}`}>
                            <p className={`text-sm ${isOverBudget ? 'text-yellow-800' : 'text-green-800'}`}>Balance</p>
                            <p className={`text-xl font-bold ${isOverBudget ? 'text-yellow-900' : 'text-green-900'}`}>₹{balance.toLocaleString()}</p>
                        </div>
                    </div>
                    {isOverBudget && <p className="text-center mt-3 text-yellow-700 font-semibold">Over budget by ₹{Math.abs(balance).toLocaleString()}</p>}
                </Section>

                <Section title="Expense Details">
                    <div className="space-y-8">
                        {report.expenses.map((exp) => (
                            <div key={exp._id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                <div className="col-span-1">
                                    <p className="font-bold text-lg text-indigo-700">{exp.category}</p>
                                    <p className="text-gray-500 text-sm">{formatDate(exp.date)}</p>
                                    <button onClick={() => setEditingExpense(exp)} className="no-print text-xs text-indigo-500 hover:underline mt-1">Edit</button>
                                </div>
                                <div className="col-span-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            {Object.entries(exp.details).map(([key, value]) => (<p key={key} className="text-gray-800"> <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span> {value} </p>))}
                                            {exp.description && <p className="text-sm text-gray-600 mt-2"><em>"{exp.description}"</em></p>}
                                        </div>
                                        <p className="font-bold text-xl text-gray-900">₹{exp.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="mt-4 p-4 border-2 border-dashed bg-gray-50 rounded-md text-center text-gray-400"> [ Bill/Screenshot Area ] </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
                <Section title="Summary Table">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border">Category</th>
                                <th className="p-3 border">Description</th>
                                <th className="p-3 border text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.expenses.map((exp) => (
                                <tr key={exp._id} className="border-b">
                                    <td className="p-3 border font-semibold">{exp.category}</td>
                                    <td className="p-3 border text-gray-600">
                                        {exp.description || exp.details.description || exp.details.vehicle || exp.details.hotelName || exp.details.restaurantName || ''}
                                    </td>

                                    <td className="p-3 border text-right font-medium">{exp.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-200 font-bold">
                                <td colSpan="2" className="p-4 border text-lg">Total Expenses</td>
                                <td className="p-4 border text-lg text-right">₹{totalSpent.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </Section>
            </div>
            {editingExpense && <ExpenseModal expense={editingExpense} onSave={handleEditSave} onClose={() => setEditingExpense(null)} reportId={report._id} />}
        </div>
    );
};

// +++ NEW COMPONENT: User Management Page +++
const UserManagementPage = ({ onBack }) => {
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); // For success/error messages

    const API_URL = 'http://localhost:5001/api';

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' }); // Clear previous messages
        setLoading(true);

        if (!newName || !newEmail || !newPassword) {
            setMessage({ type: 'error', text: 'Name, Email, and Password are required.' });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                name: newName,
                email: newEmail.trim().toLowerCase(),
                phone: newPhone,
                password: newPassword
            });

            if (response.data && response.data._id) {
                setMessage({ type: 'success', text: `User "${response.data.name}" created successfully!` });
                // Clear the form
                setNewName('');
                setNewEmail('');
                setNewPhone('');
                setNewPassword('');
                // Maybe fetch and display users list here in the future
            } else {
                setMessage({ type: 'error', text: 'Failed to create user. Unexpected response from server.' });
            }

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setMessage({ type: 'error', text: `Error: ${err.response.data.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
            }
            console.error("Create User Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                <button onClick={onBack} className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"> &larr; Back to Dashboard </button>
            </div>

            <Section title="Create New User">
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <Input
                        name="newName"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Full Name"
                        required
                    />
                    <Input
                        name="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                    />
                    <Input
                        name="newPhone"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Phone Number (Optional)"
                    />
                    <Input
                        name="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Set Initial Password"
                        required
                        minLength="6" // Add basic password length validation
                    />

                    {message.text && (
                        <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 flex justify-center items-center"
                        >
                            {loading ? <Spinner /> : 'Create User'}
                        </button>
                    </div>
                </form>
            </Section>

            {/* Placeholder for displaying list of users */}
            {/* <Section title="Existing Users">
                <p className="text-gray-500">User list will be displayed here in a future update.</p>
            </Section> */}
        </div>
    );
};
// +++ END NEW COMPONENT +++





// --- Helper & Modal Components ---
const Section = ({ title, children }) => (<div className="py-6"> <h3 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b">{title}</h3> {children} </div>);
const Input = ({ label, className, ...props }) => (<div className="w-full"> {label && <label className="text-sm text-gray-600 font-medium block mb-1">{label}</label>} <input {...props} className={`w-full p-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-300 ${className}`} /> </div>);
const TextArea = (props) => (<textarea {...props} rows="3" className="w-full p-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-300" />);
const AttendeeModal = ({ onSave, onClose }) => {
    const [attendee, setAttendee] = useState({ name: '', phone: '', rollOrEmpNumber: '' });
    const handleChange = (e) => { const { name, value } = e.target; setAttendee(prev => ({ ...prev, [name]: value })); };
    const handleSave = () => { if (attendee.name && attendee.rollOrEmpNumber) { onSave(attendee); } else { alert('Name and Roll/Emp Number are required.'); } }
    return (<Modal onClose={onClose}> <h3 className="text-2xl font-bold text-gray-800 mb-6">Add Attendee</h3> <div className="space-y-4"> <Input name="name" value={attendee.name} onChange={handleChange} placeholder="Full Name" /> <Input name="rollOrEmpNumber" value={attendee.rollOrEmpNumber} onChange={handleChange} placeholder="Roll / Employee No." /> <Input name="phone" value={attendee.phone} onChange={handleChange} placeholder="Phone Number" /> <div className="flex justify-end space-x-4 pt-4"> <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button> <button onClick={handleSave} className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add</button> </div> </div> </Modal>);
};

// Add this new component after AttendeeModal and before ExpenseModal (around line 520)

// +++ NEW COMPONENT: Modal for Adding a Community +++
const AddCommunityModal = ({ eventId, onSave, onClose }) => {
    const [communityName, setCommunityName] = useState('');
    const [description, setDescription] = useState('');
    const [allocatedBudget, setAllocatedBudget] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedHead, setSelectedHead] = useState(null); // Store the selected user object
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const API_URL = 'http://localhost:5001/api';

    // Function to search users
    const handleSearchUsers = async () => {
        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setIsLoadingSearch(true);
        setError('');
        try {
            const response = await axios.get(`${API_URL}/auth/search?q=${searchTerm}`);
            setSearchResults(response.data);
        } catch (err) {
            setError('Failed to search users.');
            console.error("Search Users Error:", err);
            setSearchResults([]);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    // Handle selecting a user from search results
    const handleSelectHead = (user) => {
        setSelectedHead(user);
        setSearchTerm(user.name); // Put name in search box for visual feedback
        setSearchResults([]); // Clear results after selection
    };

    // Handle saving the new community
    const handleSaveCommunity = async () => {
        setError('');
        if (!communityName || !selectedHead) {
            setError('Community Name and selecting a Head are required.');
            return;
        }
        setIsSaving(true);
        try {
            const response = await axios.post(`${API_URL}/events/${eventId}/communities`, {
                communityName,
                description,
                allocatedBudget: Number(allocatedBudget) || 0,
                headUserId: selectedHead._id // Send the selected user's ID
            });

            if (response.data && response.data._id) {
                onSave(response.data); // Pass the new community data back
                onClose(); // Close the modal
            } else {
                setError('Failed to save community. Unexpected response.');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(`Error: ${err.response.data.message}`);
            } else {
                setError('An unexpected server error occurred.');
            }
            console.error("Save Community Error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal onClose={onClose}>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Add New Community</h3>
            <div className="space-y-4">
                <Input
                    name="communityName"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    placeholder="Community Name (e.g., Hospitality, Food)"
                    required
                />
                <TextArea
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what this community handles"
                />
                <Input
                    name="allocatedBudget"
                    type="number"
                    value={allocatedBudget}
                    onChange={(e) => setAllocatedBudget(e.target.value)}
                    placeholder="Budget Allocated (₹, Optional)"
                />

                {/* --- User Search for Head --- */}
                <div>
                    <label className="text-sm text-gray-600 font-medium block mb-1">Select Community Head *</label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedHead(null); // Clear selection if user types again
                                handleSearchUsers(); // Trigger search on type
                            }}
                            placeholder="Search by name, email, or phone..."
                        />
                        {isLoadingSearch && <span className="absolute right-3 top-3 text-gray-400">Searching...</span>}
                    </div>
                    {/* Display search results */}
                    {searchResults.length > 0 && (
                        <ul className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto bg-white absolute z-10 w-full shadow-lg">
                            {searchResults.map(user => (
                                <li
                                    key={user._id}
                                    onClick={() => handleSelectHead(user)}
                                    className="p-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                >
                                    {user.name} ({user.email})
                                </li>
                            ))}
                        </ul>
                    )}
                    {/* Display selected head */}
                    {selectedHead && (
                        <p className="text-sm mt-2 text-green-700 font-medium">Selected Head: {selectedHead.name} ({selectedHead.email})</p>
                    )}
                </div>
                {/* --- End User Search --- */}

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex justify-end space-x-4 pt-4">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50" disabled={isSaving}>Cancel</button>
                    <button onClick={handleSaveCommunity} className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center" disabled={isSaving}>
                        {isSaving ? <Spinner /> : 'Add Community'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
// +++ END OF NEW COMPONENT +++
const ExpenseModal = ({ expense: initialExpense, onSave, onClose, reportId }) => {
    const [expense, setExpense] = useState(initialExpense);
    const isEditMode = !!initialExpense._id;
    const handleChange = (e) => { const { name, value } = e.target; if (['category', 'amount', 'description'].includes(name)) { setExpense(prev => ({ ...prev, [name]: value })); } else { setExpense(prev => ({ ...prev, details: { ...prev.details, [name]: value } })); } };
    const handleSave = async () => {
        const amountAsNumber = Number(expense.amount);
        if (amountAsNumber > 0) {
            const expenseToSave = { ...expense, amount: amountAsNumber };
            if (isEditMode) {
                try { await axios.put(`http://localhost:5001/api/reports/${reportId}/expenses/${expense._id}`, expenseToSave); onSave(); }
                catch (err) { alert('Failed to update expense.'); console.error(err); }
            } else { onSave(expenseToSave); }
        } else { alert("Please enter a valid amount."); }
    };
    const renderFormFields = () => { switch (expense.category) { case 'Travel': return (<> <Input name="vehicle" value={expense.details.vehicle || ''} onChange={handleChange} placeholder="Vehicle (Auto, Bus, etc.)" /> <Input name="pickup" value={expense.details.pickup || ''} onChange={handleChange} placeholder="Pickup Point" /> <Input name="drop" value={expense.details.drop || ''} onChange={handleChange} placeholder="Drop Point" /> <Input name="vehicleNumber" value={expense.details.vehicleNumber || ''} onChange={handleChange} placeholder="Vehicle Number (Optional)" /> </>); case 'Stay': return (<> <Input name="hotelName" value={expense.details.hotelName || ''} onChange={handleChange} placeholder="Hotel/Accommodation Name" /> <Input name="checkIn" value={expense.details.checkIn || ''} onChange={handleChange} placeholder="Check-in Date" /> <Input name="checkOut" value={expense.details.checkOut || ''} onChange={handleChange} placeholder="Check-out Date" /> </>); case 'Food': return (<> <Input name="restaurantName" value={expense.details.restaurantName || ''} onChange={handleChange} placeholder="Restaurant/Hotel Name" /> <Input name="address" value={expense.details.address || ''} onChange={handleChange} placeholder="Address (Optional)" /> </>); case 'Purchase': case 'Other': return <TextArea name="description" value={expense.details.description || ''} onChange={handleChange} placeholder="Description of purchase or other expense" className="sm:col-span-2" />; default: return null; } };
    return (<Modal onClose={onClose}> <h3 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h3> <div className="space-y-4"> <select name="category" value={expense.category} onChange={handleChange} className="w-full p-3 border rounded-md bg-white"> <option>Travel</option> <option>Stay</option> <option>Food</option> <option>Purchase</option> <option>Other</option> </select> <div className="grid sm:grid-cols-2 gap-4">{renderFormFields()}</div> <TextArea name="description" value={expense.description || ''} onChange={handleChange} placeholder="Overall description for this expense entry" /> <Input name="amount" type="number" value={expense.amount} onChange={handleChange} placeholder="Amount (₹)" required /> <div className="mt-2 p-4 border-2 border-dashed rounded-md text-center text-gray-500"> Image Upload Coming Soon! </div> <div className="flex justify-end space-x-4 pt-4"> <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button> <button onClick={handleSave} className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">{isEditMode ? 'Save Changes' : 'Add Expense'}</button> </div> </div> </Modal>);
};

export default App;

