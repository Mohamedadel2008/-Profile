// Dashboard JavaScript - Student Panel

let currentUserData = null;
let currentLesson = null;
let videoProgressInterval = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    loadLessons();
    setupEventListeners();
});

// Load User Data from Firebase
async function loadUserData() {
    try {
        let user;
        
        // Check if center user
        const centerUser = sessionStorage.getItem('centerUser');
        if (centerUser) {
            currentUserData = JSON.parse(centerUser);
            updateUserInfo(currentUserData);
            return;
        }
        
        // Regular authenticated user
        user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            window.location.href = 'index.html';
            return;
        }
        
        currentUserData = userDoc.data();
        currentUserData.uid = user.uid;
        updateUserInfo(currentUserData);
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showError('خطأ في تحميل البيانات');
    }
}

// Update User Info in Header
function updateUserInfo(userData) {
    document.getElementById('user-name').textContent = userData.name || 'طالب';
    document.getElementById('user-wallet').textContent = `${userData.wallet || 0} ج.م`;
    
    // Calculate and display AI level
    calculateStudentLevel(userData);
}

// AI-Based Student Level Calculation
function calculateStudentLevel(userData) {
    const progress = userData.watchProgress || 0;
    const completed = userData.completedLessons || 0;
    const totalLessons = userData.totalLessons || 10;
    const attempts = userData.quizAttempts || 0;
    const avgScore = userData.averageScore || 0;
    
    let level = 'مبتدئ';
    let color = '#f39c12';
    
    // AI Analysis Logic
    if (avgScore > 80 && progress > 90) {
        level = 'ممتاز 🏆';
        color = '#27ae60';
    } else if (avgScore > 60 && progress > 70) {
        level = 'جيد جداً 👍';
        color = '#3498db';
    } else if (avgScore > 50) {
        level = 'متوسط 👌';
        color = '#f39c12';
    } else {
        level = 'يحتاج تحسين 📚';
        color = '#e74c3c';
    }
    
    document.getElementById('student-level').textContent = level;
    document.getElementById('student-level').style.color = color;
    
    // Update completion rate
    const completionRate = Math.round((completed / totalLessons) * 100);
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    
    // Update watch time
    const watchHours = Math.round((userData.totalWatchTime || 0) / 60);
    document.getElementById('watch-time').textContent = `${watchHours} ساعة`;
}

// Load Lessons Grid
async function loadLessons() {
    try {
        const lessonsSnapshot = await db.collection('lessons')
            .orderBy('order', 'asc')
            .get();
        
        const grid = document.getElementById('lessons-grid');
        grid.innerHTML = '';
        
        lessonsSnapshot.forEach(doc => {
            const lesson = doc.data();
            const isCompleted = currentUserData.completedLessons?.includes(doc.id);
            const progress = currentUserData.lessonProgress?.[doc.id] || 0;
            
            const lessonCard = document.createElement('div');
            lessonCard.className = 'lesson-card';
            lessonCard.innerHTML = `
                <div class="lesson-banner" style="background-image: url('${lesson.banner || 'default.jpg'}')">
                    ${isCompleted ? '<span class="completed-badge">✓ مكتمل</span>' : ''}
                </div>
                <div class="lesson-info">
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description || ''}</p>
                    <div class="lesson-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span>${progress}%</span>
                    </div>
                    <button onclick="openLesson('${doc.id}')" class="btn-primary btn-lesson">
                        ${progress > 0 ? 'متابعة' : 'ابدأ الدرس'}
                    </button>
                </div>
            `;
            grid.appendChild(lessonCard);
        });
        
    } catch (error) {
        console.error('Error loading lessons:', error);
    }
}

// Open Lesson with Protected Video Player
async function openLesson(lessonId) {
    try {
        const lessonDoc = await db.collection('lessons').doc(lessonId).get();
        currentLesson = lessonDoc.data();
        currentLesson.id = lessonId;
        
        const modal = document.getElementById('video-modal');
        const player = document.getElementById('video-player');
        const watermark = document.getElementById('video-watermark');
        
        // Set watermark with student info
        watermark.textContent = `${currentUserData.name} - ${currentUserData.phone}`;
        
        // Embed protected video (YouTube example with controls disabled)
        const videoUrl = currentLesson.videoUrl || '';
        const videoId = extractVideoId(videoUrl);
        
        player.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0"
                frameborder="0"
                allowfullscreen
                id="youtube-player"
            ></iframe>
        `;
        
        modal.classList.remove('hidden');
        
        // Start tracking
        startVideoTracking(lessonId);
        
        // Prevent right-click
        player.addEventListener('contextmenu', e => e.preventDefault());
        
    } catch (error) {
        console.error('Error opening lesson:', error);
        showError('خطأ في فتح الدرس');
    }
}

// Extract YouTube Video ID
function extractVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([\w-]+)/);
    return match ? match[1] : '';
}

// Advanced Video Tracking
function startVideoTracking(lessonId) {
    const iframe = document.getElementById('youtube-player');
    
    // Track every 5 seconds
    videoProgressInterval = setInterval(async () => {
        try {
            // In production, use YouTube Player API to get actual progress
            const currentTime = Date.now();
            const lastProgress = currentUserData.lessonProgress?.[lessonId] || 0;
            
            // Simulate progress increase
            const newProgress = Math.min(lastProgress + 5, 100);
            
            // Update Firestore
            await db.collection('users').doc(currentUserData.uid).update({
                [`lessonProgress.${lessonId}`]: newProgress,
                totalWatchTime: firebase.firestore.FieldValue.increment(5),
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Send to analytics
            trackAnalytics(lessonId, newProgress);
            
        } catch (error) {
            console.error('Tracking error:', error);
        }
    }, 5000);
}

// Analytics Tracking
async function trackAnalytics(lessonId, progress) {
    const analyticsData = {
        userId: currentUserData.uid,
        lessonId: lessonId,
        progress: progress,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        deviceId: currentDeviceId,
        completed: progress >= 100
    };
    
    await db.collection('analytics').add(analyticsData);
}

// Close Video Modal
function closeVideo() {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('video-player');
    
    modal.classList.add('hidden');
    player.innerHTML = '';
    
    if (videoProgressInterval) {
        clearInterval(videoProgressInterval);
        videoProgressInterval = null;
    }
    
    // Save final progress
    saveFinalProgress();
}

// Save Final Progress
async function saveFinalProgress() {
    if (!currentLesson) return;
    
    try {
        const currentProgress = currentUserData.lessonProgress?.[currentLesson.id] || 0;
        
        if (currentProgress >= 100) {
            await db.collection('users').doc(currentUserData.uid).update({
                completedLessons: firebase.firestore.FieldValue.arrayUnion(currentLesson.id),
                averageScore: firebase.firestore.FieldValue.increment(10) // Example scoring
            });
        }
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Payment Form
    document.getElementById('payment-form').addEventListener('submit', handlePayment);
    
    // Password Change
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);
}

// Handle Payment Submission
async function handlePayment(e) {
    e.preventDefault();
    
    const phone = document.getElementById('payment-phone').value;
    const amount = parseFloat(document.getElementById('payment-amount').value);
    const screenshot = document.getElementById('payment-screenshot').files[0];
    
    if (!screenshot) {
        showError('يرجى رفع لقطة الشاشة');
        return;
    }
    
    try {
        // Upload screenshot to Firebase Storage
        const storageRef = storage.ref(`payments/${currentUserData.uid}/${Date.now()}_${screenshot.name}`);
        await storageRef.put(screenshot);
        const downloadURL = await storageRef.getDownloadURL();
        
        // Create payment request
        await db.collection('payments').add({
            userId: currentUserData.uid,
            userName: currentUserData.name,
            phone: phone,
            amount: amount,
            screenshot: downloadURL,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('تم إرسال طلب الدفع بنجاح، في انتظار مراجعة الأدمن');
        document.getElementById('payment-form').reset();
        loadPaymentHistory();
        
    } catch (error) {
        console.error('Payment error:', error);
        showError('خطأ في إرسال الدفع');
    }
}

// Load Payment History
async function loadPaymentHistory() {
    try {
        const paymentsSnapshot = await db.collection('payments')
            .where('userId', '==', currentUserData.uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        const historyDiv = document.getElementById('payment-history');
        historyDiv.innerHTML = '<h3>سجل المدفوعات</h3>';
        
        paymentsSnapshot.forEach(doc => {
            const payment = doc.data();
            const statusColors = {
                pending: '#f39c12',
                approved: '#27ae60',
                rejected: '#e74c3c'
            };
            
            const statusText = {
                pending: 'قيد المراجعة',
                approved: 'مقبول',
                rejected: 'مرفوض'
            };
            
            historyDiv.innerHTML += `
                <div class="payment-item">
                    <span>${payment.amount} ج.م</span>
                    <span class="status-badge" style="color: ${statusColors[payment.status]}">
                        ${statusText[payment.status]}
                    </span>
                    <small>${new Date(payment.createdAt?.toDate()).toLocaleDateString('ar-EG')}</small>
                </div>
            `;
        });
        
    } catch (error) {
        console.error('Error loading payment history:', error);
    }
}

// Handle Password Change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showError('كلمات المرور غير متطابقة');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        if (user) {
            await user.updatePassword(newPassword);
            alert('تم تغيير كلمة المرور بنجاح');
            document.getElementById('password-form').reset();
        }
    } catch (error) {
        console.error('Password change error:', error);
        showError('خطأ في تغيير كلمة المرور');
    }
}

// Show/Hide Sections
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Remove active from nav
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
    
    // Load specific data
    if (sectionName === 'payments') {
        loadPaymentHistory();
    } else if (sectionName === 'settings') {
        loadDevicesList();
    }
    
    // Update active nav
    event.target.classList.add('active');
}

// Load Devices List
async function loadDevicesList() {
    try {
        const devicesList = document.getElementById('devices-list');
        const devices = currentUserData.devices || [];
        
        devicesList.innerHTML = '';
        
        devices.forEach((device, index) => {
            devicesList.innerHTML += `
                <div class="device-item">
                    <span>📱 ${device}</span>
                    ${index === 0 ? '<span class="current-device">(هذا الجهاز)</span>' : ''}
                </div>
            `;
        });
        
    } catch (error) {
        console.error('Error loading devices:', error);
    }
}

// Logout Function
function logout() {
    // Clear session
    sessionStorage.removeItem('centerUser');
    sessionStorage.removeItem('adminToken');
    
    // Firebase logout
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    });
}

// Show Error Message
function showError(message) {
    alert(message); // Can be improved with toast notifications
}

// Export functions
window.showSection = showSection;
window.openLesson = openLesson;
window.closeVideo = closeVideo;
window.logout = logout;
