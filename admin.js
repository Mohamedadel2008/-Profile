// Admin Panel JavaScript - Super Control

let currentAdminData = null;
let selectedStudent = null;
let allStudents = [];

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', async () => {
    await verifyAdminAccess();
    loadAdminOverview();
    setupAdminEventListeners();
});

// Verify Admin Access with Secure Token
async function verifyAdminAccess() {
    try {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            window.location.href = 'index.html';
            return;
        }
        
        const userData = userDoc.data();
        
        // Check admin role
        if (userData.role !== 'admin') {
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Verify admin token
        const adminToken = sessionStorage.getItem('adminToken');
        if (!adminToken || adminToken !== userData.adminToken) {
            // Regenerate token
            await regenerateAdminToken(user.uid);
        }
        
        currentAdminData = userData;
        document.getElementById('admin-name').textContent = userData.name || 'الأدمن';
        
    } catch (error) {
        console.error('Admin verification error:', error);
        window.location.href = 'index.html';
    }
}

// Regenerate Admin Token for Security
async function regenerateAdminToken(uid) {
    const ip = await getPublicIP();
    const tokenData = {
        uid: uid,
        ip: ip,
        timestamp: Date.now(),
        secret: Math.random().toString(36).substr(2)
    };
    
    const newToken = btoa(JSON.stringify(tokenData));
    
    await db.collection('users').doc(uid).update({
        adminToken: newToken,
        lastAdminLogin: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    sessionStorage.setItem('adminToken', newToken);
    return newToken;
}

// Load Admin Overview Stats
async function loadAdminOverview() {
    try {
        // Get total students
        const studentsSnapshot = await db.collection('users')
            .where('type', 'in', ['online', 'center'])
            .get();
        document.getElementById('total-students').textContent = studentsSnapshot.size;
        allStudents = studentsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        
        // Get pending payments
        const paymentsSnapshot = await db.collection('payments')
            .where('status', '==', 'pending')
            .get();
        document.getElementById('pending-payments').textContent = paymentsSnapshot.size;
        
        // Get active lessons
        const lessonsSnapshot = await db.collection('lessons').get();
        document.getElementById('active-lessons').textContent = lessonsSnapshot.size;
        
        // Calculate monthly revenue
        const approvedPayments = await db.collection('payments')
            .where('status', '==', 'approved')
            .get();
        
        let monthlyRevenue = 0;
        const now = new Date();
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        
        approvedPayments.forEach(doc => {
            const payment = doc.data();
            const createdAt = payment.createdAt?.toDate();
            if (createdAt && createdAt > oneMonthAgo) {
                monthlyRevenue += payment.amount || 0;
            }
        });
        
        document.getElementById('monthly-revenue').textContent = `${monthlyRevenue.toLocaleString()} ج.م`;
        
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

// Show/Hide Admin Sections
function showAdminSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Remove active from nav
    document.querySelectorAll('.admin-sidebar .nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
    
    // Load specific data
    switch(sectionName) {
        case 'students':
            loadStudentsTable();
            break;
        case 'lessons':
            loadLessonsList();
            break;
        case 'payments':
            loadPendingPayments();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'devices':
            loadDevicesMonitor();
            break;
    }
    
    // Update active nav
    event.target.classList.add('active');
}

// Load Students Table
function loadStudentsTable() {
    const tableDiv = document.getElementById('students-table');
    
    tableDiv.innerHTML = `
        <table class="data-table-content">
            <thead>
                <tr>
                    <th>الاسم</th>
                    <th>النوع</th>
                    <th>الهاتف</th>
                    <th>المحفظة</th>
                    <th>المستوى</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${allStudents.map(student => `
                    <tr>
                        <td>${student.name || 'N/A'}</td>
                        <td>${student.type || 'N/A'}</td>
                        <td>${student.phone || 'N/A'}</td>
                        <td>${student.wallet || 0}</td>
                        <td>${calculateLevelBadge(student)}</td>
                        <td>
                            <span class="status-badge ${student.blocked ? 'blocked' : 'active'}">
                                ${student.blocked ? 'محظور' : 'نشط'}
                            </span>
                        </td>
                        <td>
                            <button onclick="openStudentModal('${student.id}')" class="btn-sm">👁️ عرض</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Calculate Level Badge for Student
function calculateLevelBadge(student) {
    const avgScore = student.averageScore || 0;
    const progress = student.watchProgress || 0;
    
    if (avgScore > 80 && progress > 90) return '<span class="level-excellent">ممتاز</span>';
    if (avgScore > 60) return '<span class="level-good">جيد</span>';
    if (avgScore > 50) return '<span class="level-average">متوسط</span>';
    return '<span class="level-weak">ضعيف</span>';
}

// Search Students
function searchStudents() {
    const query = document.getElementById('student-search').value.toLowerCase();
    
    const filtered = allStudents.filter(student => {
        return (student.name?.toLowerCase().includes(query) || 
                student.phone?.includes(query) ||
                student.email?.toLowerCase().includes(query));
    });
    
    // Re-render table with filtered results
    const tableDiv = document.getElementById('students-table');
    tableDiv.innerHTML = `
        <table class="data-table-content">
            <thead>
                <tr>
                    <th>الاسم</th>
                    <th>النوع</th>
                    <th>الهاتف</th>
                    <th>المحفظة</th>
                    <th>المستوى</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(student => `
                    <tr>
                        <td>${student.name || 'N/A'}</td>
                        <td>${student.type || 'N/A'}</td>
                        <td>${student.phone || 'N/A'}</td>
                        <td>${student.wallet || 0}</td>
                        <td>${calculateLevelBadge(student)}</td>
                        <td>
                            <span class="status-badge ${student.blocked ? 'blocked' : 'active'}">
                                ${student.blocked ? 'محظور' : 'نشط'}
                            </span>
                        </td>
                        <td>
                            <button onclick="openStudentModal('${student.id}')" class="btn-sm">👁️ عرض</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Open Student Detail Modal
async function openStudentModal(studentId) {
    try {
        const studentDoc = await db.collection('users').doc(studentId).get();
        selectedStudent = {id: studentId, ...studentDoc.data()};
        
        // Populate modal
        document.getElementById('modal-student-name').textContent = selectedStudent.name || 'طالب';
        document.getElementById('modal-student-email').textContent = selectedStudent.email || 'N/A';
        document.getElementById('modal-student-phone').textContent = selectedStudent.phone || 'N/A';
        document.getElementById('modal-student-wallet').textContent = `${selectedStudent.wallet || 0} ج.م`;
        document.getElementById('modal-student-level').innerHTML = calculateLevelBadge(selectedStudent);
        
        // Load progress details
        const progressDiv = document.getElementById('modal-student-progress');
        const lessonProgress = selectedStudent.lessonProgress || {};
        
        progressDiv.innerHTML = Object.entries(lessonProgress).map(([lessonId, progress]) => `
            <div class="progress-item">
                <span>الدرس ${lessonId}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span>${progress}%</span>
            </div>
        `).join('') || '<p>لا يوجد تقدم مسجل</p>';
        
        // Load devices
        const devicesDiv = document.getElementById('modal-student-devices');
        const devices = selectedStudent.devices || [];
        
        devicesDiv.innerHTML = devices.map((device, index) => `
            <div class="device-item">
                <span>📱 ${device}</span>
                <button onclick="removeDevice('${studentId}', '${device}')" class="btn-sm btn-danger">حذف</button>
            </div>
        `).join('') || '<p>لا توجد أجهزة مسجلة</p>';
        
        // Update block button
        const blockBtn = document.getElementById('btn-block');
        blockBtn.textContent = selectedStudent.blocked ? 'فك الحظر' : 'حظر الحساب';
        blockBtn.className = selectedStudent.blocked ? 'btn-success' : 'btn-warning';
        
        // Show modal
        document.getElementById('student-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error opening student modal:', error);
        alert('خطأ في تحميل بيانات الطالب');
    }
}

// Close Student Modal
function closeStudentModal() {
    document.getElementById('student-modal').classList.add('hidden');
    selectedStudent = null;
}

// Toggle Block Student
async function toggleBlockStudent() {
    if (!selectedStudent) return;
    
    try {
        const newBlockedStatus = !selectedStudent.blocked;
        
        await db.collection('users').doc(selectedStudent.id).update({
            blocked: newBlockedStatus
        });
        
        // Update local data
        selectedStudent.blocked = newBlockedStatus;
        
        // Update button
        const blockBtn = document.getElementById('btn-block');
        blockBtn.textContent = newBlockedStatus ? 'فك الحظر' : 'حظر الحساب';
        blockBtn.className = newBlockedStatus ? 'btn-success' : 'btn-warning';
        
        // Refresh students table
        loadStudentsTable();
        
        alert(`تم ${newBlockedStatus ? 'حظر' : 'فك حظر'} الحساب بنجاح`);
        
    } catch (error) {
        console.error('Error toggling block:', error);
        alert('خطأ في تحديث الحالة');
    }
}

// Reset Student Password
async function resetStudentPassword() {
    if (!selectedStudent || !selectedStudent.email) {
        alert('الطالب ليس لديه بريد إلكتروني');
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(selectedStudent.email);
        alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريد الطالب');
    } catch (error) {
        console.error('Error resetting password:', error);
        alert('خطأ في إعادة تعيين كلمة المرور');
    }
}

// Remove Student Device
async function removeDevice(studentId, deviceId) {
    if (!confirm('هل أنت متأكد من حذف هذا الجهاز؟')) return;
    
    try {
        await db.collection('users').doc(studentId).update({
            devices: firebase.firestore.FieldValue.arrayRemove(deviceId)
        });
        
        // Refresh modal
        openStudentModal(studentId);
        
        alert('تم حذف الجهاز بنجاح');
        
    } catch (error) {
        console.error('Error removing device:', error);
        alert('خطأ في حذف الجهاز');
    }
}

// Load Pending Payments
async function loadPendingPayments() {
    try {
        const paymentsSnapshot = await db.collection('payments')
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();
        
        const container = document.getElementById('payments-pending');
        
        if (paymentsSnapshot.empty) {
            container.innerHTML = '<p class="no-data">لا توجد مدفوعات معلقة</p>';
            return;
        }
        
        container.innerHTML = paymentsSnapshot.docs.map(doc => {
            const payment = doc.data();
            return `
                <div class="payment-card">
                    <div class="payment-header">
                        <h4>${payment.userName}</h4>
                        <span class="amount">${payment.amount} ج.م</span>
                    </div>
                    <div class="payment-body">
                        <p>📱 ${payment.phone}</p>
                        <img src="${payment.screenshot}" alt="لقطة الدفع" class="payment-screenshot">
                    </div>
                    <div class="payment-actions">
                        <button onclick="approvePayment('${doc.id}')" class="btn-success">✓ قبول</button>
                        <button onclick="rejectPayment('${doc.id}')" class="btn-danger">✗ رفض</button>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// Approve Payment
async function approvePayment(paymentId) {
    try {
        const paymentDoc = await db.collection('payments').doc(paymentId).get();
        const payment = paymentDoc.data();
        
        // Update payment status
        await db.collection('payments').doc(paymentId).update({
            status: 'approved',
            reviewedBy: currentAdminData.uid,
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Add to student wallet
        await db.collection('users').doc(payment.userId).update({
            wallet: firebase.firestore.FieldValue.increment(payment.amount)
        });
        
        // Send notification (can be implemented with Firebase Cloud Messaging)
        await db.collection('notifications').add({
            userId: payment.userId,
            message: `تم قبول دفعتك بقيمة ${payment.amount} ج.م`,
            type: 'payment_approved',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });
        
        alert('تم قبول الدفع وإضافة المبلغ للمحفظة');
        loadPendingPayments();
        loadAdminOverview();
        
    } catch (error) {
        console.error('Error approving payment:', error);
        alert('خطأ في قبول الدفع');
    }
}

// Reject Payment
async function rejectPayment(paymentId) {
    try {
        const paymentDoc = await db.collection('payments').doc(paymentId).get();
        const payment = paymentDoc.data();
        
        // Update payment status
        await db.collection('payments').doc(paymentId).update({
            status: 'rejected',
            reviewedBy: currentAdminData.uid,
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Send notification
        await db.collection('notifications').add({
            userId: payment.userId,
            message: 'تم رفض دفعتك، يرجى التواصل مع الدعم',
            type: 'payment_rejected',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });
        
        alert('تم رفض الدفع');
        loadPendingPayments();
        
    } catch (error) {
        console.error('Error rejecting payment:', error);
        alert('خطأ في رفض الدفع');
    }
}

// Load Analytics
async function loadAnalytics() {
    try {
        const period = parseInt(document.getElementById('analytics-period').value);
        const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
        
        // Get analytics data
        const analyticsSnapshot = await db.collection('analytics')
            .where('timestamp', '>=', startDate)
            .get();
        
        // Calculate level distribution
        const levelDist = {
            excellent: 0,
            good: 0,
            average: 0,
            weak: 0
        };
        
        allStudents.forEach(student => {
            const avgScore = student.averageScore || 0;
            const progress = student.watchProgress || 0;
            
            if (avgScore > 80 && progress > 90) levelDist.excellent++;
            else if (avgScore > 60) levelDist.good++;
            else if (avgScore > 50) levelDist.average++;
            else levelDist.weak++;
        });
        
        // Display level distribution
        const levelsDiv = document.getElementById('student-levels');
        levelsDiv.innerHTML = `
            <h3>توزيع المستويات</h3>
            <div class="level-bars">
                <div class="level-bar">
                    <span>ممتاز</span>
                    <div class="bar"><div class="fill excellent" style="width: ${(levelDist.excellent / allStudents.length) * 100}%"></div></div>
                    <span>${levelDist.excellent}</span>
                </div>
                <div class="level-bar">
                    <span>جيد</span>
                    <div class="bar"><div class="fill good" style="width: ${(levelDist.good / allStudents.length) * 100}%"></div></div>
                    <span>${levelDist.good}</span>
                </div>
                <div class="level-bar">
                    <span>متوسط</span>
                    <div class="bar"><div class="fill average" style="width: ${(levelDist.average / allStudents.length) * 100}%"></div></div>
                    <span>${levelDist.average}</span>
                </div>
                <div class="level-bar">
                    <span>ضعيف</span>
                    <div class="bar"><div class="fill weak" style="width: ${(levelDist.weak / allStudents.length) * 100}%"></div></div>
                    <span>${levelDist.weak}</span>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Load Devices Monitor
async function loadDevicesMonitor() {
    try {
        const devicesSnapshot = await db.collection('devices').get();
        const monitorDiv = document.getElementById('devices-monitor');
        
        if (devicesSnapshot.empty) {
            monitorDiv.innerHTML = '<p class="no-data">لا توجد أجهزة مسجلة</p>';
            return;
        }
        
        monitorDiv.innerHTML = `
            <table class="data-table-content">
                <thead>
                    <tr>
                        <th>الجهاز</th>
                        <th>الطالب</th>
                        <th>آخر نشاط</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${devicesSnapshot.docs.map(doc => {
                        const device = doc.data();
                        return `
                            <tr>
                                <td>📱 ${device.deviceId}</td>
                                <td>${device.userName || 'N/A'}</td>
                                <td>${device.lastActive?.toDate().toLocaleString('ar-EG') || 'غير معروف'}</td>
                                <td>
                                    <span class="status-badge ${device.allowed ? 'active' : 'blocked'}">
                                        ${device.allowed ? 'مسموح' : 'ممنوع'}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading devices:', error);
    }
}

// Show Add Lesson Form
function showAddLessonForm() {
    document.getElementById('add-lesson-form').classList.remove('hidden');
}

// Setup Admin Event Listeners
function setupAdminEventListeners() {
    // Add Lesson Form
    document.getElementById('add-lesson-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('lesson-title').value;
        const description = document.getElementById('lesson-desc').value;
        const videoUrl = document.getElementById('lesson-video').value;
        const bannerUrl = document.getElementById('lesson-banner').value;
        const order = parseInt(document.getElementById('lesson-order').value);
        
        try {
            await db.collection('lessons').add({
                title,
                description,
                videoUrl,
                banner: bannerUrl,
                order,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: currentAdminData.uid
            });
            
            alert('تم إضافة الدرس بنجاح');
            document.getElementById('add-lesson-form').reset();
            document.getElementById('add-lesson-form').classList.add('hidden');
            loadLessonsList();
            
        } catch (error) {
            console.error('Error adding lesson:', error);
            alert('خطأ في إضافة الدرس');
        }
    });
    
    // Analytics Period Change
    document.getElementById('analytics-period').addEventListener('change', loadAnalytics);
}

// Load Lessons List
async function loadLessonsList() {
    try {
        const lessonsSnapshot = await db.collection('lessons')
            .orderBy('order', 'asc')
            .get();
        
        const listDiv = document.getElementById('lessons-list');
        
        listDiv.innerHTML = lessonsSnapshot.docs.map(doc => {
            const lesson = doc.data();
            return `
                <div class="lesson-item">
                    <div class="lesson-header">
                        <h4>${lesson.title}</h4>
                        <span class="lesson-order">#${lesson.order}</span>
                    </div>
                    <p>${lesson.description || 'لا يوجد وصف'}</p>
                    <div class="lesson-actions">
                        <button onclick="editLesson('${doc.id}')" class="btn-sm">✏️ تعديل</button>
                        <button onclick="deleteLesson('${doc.id}')" class="btn-sm btn-danger">🗑️ حذف</button>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading lessons:', error);
    }
}

// Admin Logout
function adminLogout() {
    // Clear admin token
    sessionStorage.removeItem('adminToken');
    
    // Firebase logout
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    });
}

// Export functions
window.showAdminSection = showAdminSection;
window.searchStudents = searchStudents;
window.openStudentModal = openStudentModal;
window.closeStudentModal = closeStudentModal;
window.toggleBlockStudent = toggleBlockStudent;
window.resetStudentPassword = resetStudentPassword;
window.removeDevice = removeDevice;
window.approvePayment = approvePayment;
window.rejectPayment = rejectPayment;
window.showAddLessonForm = showAddLessonForm;
window.adminLogout = adminLogout;
