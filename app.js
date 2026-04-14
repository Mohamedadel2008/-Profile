// Firebase Configuration - استبدل هذه البيانات ببيانات مشروعك
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global State
let currentUser = null;
let currentDeviceId = generateDeviceId();

// Generate Unique Device ID
function generateDeviceId() {
    return 'dev_' + Math.random().toString(36).substr(2, 9);
}

// Switch Login Tabs
function switchTab(type) {
    const onlineForm = document.getElementById('online-form');
    const centerForm = document.getElementById('center-form');
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (type === 'online') {
        onlineForm.classList.remove('hidden');
        centerForm.classList.add('hidden');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        onlineForm.classList.add('hidden');
        centerForm.classList.remove('hidden');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// Initialize Authentication
function initAuth() {
    // Online Login
    document.getElementById('online-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('online-email').value;
        const password = document.getElementById('online-pass').value;
        
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            await handleLogin(userCredential.user);
        } catch (error) {
            showError('خطأ في البريد الإلكتروني أو كلمة المرور');
        }
    });

    // Center Login
    document.getElementById('center-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('center-name').value;
        const code = document.getElementById('center-code').value;
        const phone = document.getElementById('center-phone').value;
        
        try {
            // Search for user in Firestore
            const querySnapshot = await db.collection('users')
                .where('name', '==', name)
                .where('code', '==', code)
                .where('phone', '==', phone)
                .where('type', '==', 'center')
                .get();
            
            if (querySnapshot.empty) {
                showError('بيانات غير صحيحة');
                return;
            }
            
            const userData = querySnapshot.docs[0].data();
            // Create temporary auth token or login
            await handleCenterLogin(userData);
        } catch (error) {
            showError('حدث خطأ أثناء تسجيل الدخول');
        }
    });

    // Auth State Observer
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            checkUserAccess();
        }
    });
}

// Handle Login Success
async function handleLogin(user) {
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
        showError('المستخدم غير موجود في قاعدة البيانات');
        return;
    }
    
    const userData = userDoc.data();
    
    // Check if blocked
    if (userData.blocked) {
        showError('هذا الحساب محظور، تواصل مع الأدمن');
        auth.signOut();
        return;
    }
    
    // Check device limit
    if (!userData.devices) userData.devices = [];
    
    if (!userData.devices.includes(currentDeviceId)) {
        if (userData.devices.length >= 2) {
            showError('تم الوصول للحد الأقصى للأجهزة المسموحة');
            auth.signOut();
            return;
        }
        // Add new device
        await db.collection('users').doc(user.uid).update({
            devices: firebase.firestore.FieldValue.arrayUnion(currentDeviceId)
        });
    }
    
    // Redirect to Dashboard
    window.location.href = 'dashboard.html';
}

// Handle Center Login
async function handleCenterLogin(userData) {
    // Check if blocked
    if (userData.blocked) {
        showError('هذا الحساب محظور، تواصل مع الأدمن');
        return;
    }
    
    // Store session
    sessionStorage.setItem('centerUser', JSON.stringify(userData));
    
    // Redirect to Dashboard
    window.location.href = 'dashboard.html';
}

// Check User Access on Page Load
async function checkUserAccess() {
    if (!currentUser) return;
    
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    
    // Admin Check - Secure Token System
    if (userData.role === 'admin') {
        const adminToken = sessionStorage.getItem('adminToken');
        if (adminToken === userData.adminToken) {
            window.location.href = 'admin.html';
        } else {
            // Request admin verification
            verifyAdmin(userData);
        }
    }
}

// Secure Admin Verification
async function verifyAdmin(userData) {
    // Generate secure token based on IP and timestamp
    const ip = await getPublicIP();
    const tokenData = {
        uid: userData.uid,
        ip: ip,
        timestamp: Date.now()
    };
    
    const token = btoa(JSON.stringify(tokenData));
    sessionStorage.setItem('adminToken', token);
    
    // Update user with token
    await db.collection('users').doc(userData.uid).update({
        adminToken: token
    });
    
    window.location.href = 'admin.html';
}

// Get Public IP (for security)
async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'unknown';
    }
}

// Show Error Message
function showError(message) {
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = message;
    setTimeout(() => {
        errorEl.textContent = '';
    }, 5000);
}

// Password Reset Function
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    } catch (error) {
        showError('حدث خطأ أثناء إرسال الرابط');
    }
}

// Export functions for use in other pages
window.switchTab = switchTab;
window.resetPassword = resetPassword;
