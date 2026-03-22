// ===========================
// ThoughtStack — App Controller
// ===========================

const engine = new ThoughtEngine();
const tierManager = new TierManager();
let currentExam = localStorage.getItem('thoughtstack_exam') || 'JEE';
let currentView = 'dump';
let currentFilter = 'all';
let selectedSubject = null;

// ---- Initialization ----

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initExamSelector();
    initSubjectPills();
    initEditor();
    initModal();
    initMobileNav();
    initTutorChat();
    initFirebaseSync();
    updateStreak();
    updateDumpDate();
    updateProBadge();
    renderTodaysDumps();
    renderCurrentView();
});

// ---- User Authentication ----

let authMode = 'login';

function openAuthModal() {
    const overlay = document.getElementById('auth-overlay');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    const overlay = document.getElementById('auth-overlay');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

function switchAuthTab(mode) {
    authMode = mode;
    const loginTab = document.getElementById('tab-login');
    const signupTab = document.getElementById('tab-signup');
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('btn-auth-submit');
    const passGroup = document.getElementById('auth-password-group');
    const socialGroup = document.getElementById('auth-social-group');
    const extraText = document.getElementById('auth-extra-text');

    if (mode === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        title.textContent = 'Welcome Back';
        submitBtn.textContent = 'Login';
        if(passGroup) passGroup.classList.remove('hidden');
        if(socialGroup) socialGroup.classList.remove('hidden');
        if(extraText) extraText.classList.add('hidden');
    } else if (mode === 'signup') {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        title.textContent = 'Create Account';
        submitBtn.textContent = 'Sign Up';
        if(passGroup) passGroup.classList.remove('hidden');
        if(socialGroup) socialGroup.classList.remove('hidden');
        if(extraText) extraText.classList.add('hidden');
    } else if (mode === 'forgot') {
        loginTab.classList.remove('active');
        signupTab.classList.remove('active');
        title.textContent = 'Reset Password';
        submitBtn.textContent = 'Send Reset Link';
        if(passGroup) passGroup.classList.add('hidden');
        if(socialGroup) socialGroup.classList.add('hidden');
        if(extraText) extraText.classList.remove('hidden');
    }
}

function getFriendlyAuthError(err) {
    const errorCode = err.code || '';
    switch (errorCode) {
        case 'auth/invalid-email': return 'That email address doesn\'t look quite right.';
        case 'auth/user-disabled': return 'This account has been disabled.';
        case 'auth/user-not-found': return 'No account found with this email. Please sign up first.';
        case 'auth/wrong-password': return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use': return 'An account already exists with this email.';
        case 'auth/weak-password': return 'Your password is too weak. Make it at least 6 characters.';
        case 'auth/invalid-credential': return 'Invalid email or password.';
        case 'auth/network-request-failed': return 'Network error. Please check your internet connection.';
        case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
        case 'auth/popup-closed-by-user': return 'Sign-in popup was closed.';
        default: return err.message || 'Something went wrong. Please try again.';
    }
}

async function handleAuthSubmit() {
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email) return showToast('⚠️', 'Email is required');
    if (authMode !== 'forgot' && !password) return showToast('⚠️', 'Password is required');

    const loader = document.getElementById('app-loading-overlay');
    loader.classList.remove('hidden');

    try {
        const { 
            createUserWithEmailAndPassword, 
            signInWithEmailAndPassword, 
            sendEmailVerification, 
            sendPasswordResetEmail 
        } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js");

        if (authMode === 'signup') {
            const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
            await sendEmailVerification(userCredential.user);
            showToast('📧', 'Verification email sent! Please check your inbox.');
        } else if (authMode === 'login') {
            await signInWithEmailAndPassword(window.firebaseAuth, email, password);
            showToast('👋', 'Welcome back!');
        } else if (authMode === 'forgot') {
            await sendPasswordResetEmail(window.firebaseAuth, email);
            showToast('📧', 'Password reset email sent!');
            switchAuthTab('login');
        }
    } catch (err) {
        console.error("Auth failed:", err);
        showToast('❌', getFriendlyAuthError(err));
    } finally {
        loader.classList.add('hidden');
    }
}

async function handleGoogleSignIn() {
    if (!window.firebaseAuth || !window.googleProvider) {
        return showToast('⚠️', 'Authentication system is still loading. Try again in a second.');
    }

    const loader = document.getElementById('app-loading-overlay');
    loader.classList.remove('hidden');

    try {
        const { signInWithPopup } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js");
        await signInWithPopup(window.firebaseAuth, window.googleProvider);
        showToast('👋', 'Google sign-in successful!');
    } catch (err) {
        console.error("Google login error:", err);
        showToast('❌', getFriendlyAuthError(err));
    } finally {
        loader.classList.add('hidden');
    }
}

async function handleSignOut() {
    try {
        const { signOut } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js");
        await signOut(window.firebaseAuth);
        window.location.reload();
    } catch (err) {
        showToast('❌', 'Error signing out.');
    }
}

async function resendVerification() {
    const user = window.firebaseAuth.currentUser;
    if (!user) return;

    try {
        const { sendEmailVerification } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js");
        await sendEmailVerification(user);
        showToast('📧', 'Verification link resent! Please check your spam folder.');
    } catch (err) {
        console.error("Resend failed:", err);
        showToast('❌', 'Could not resend. Try again in a minute.');
    }
}

async function verifyAndReload() {
    const user = window.firebaseAuth.currentUser;
    if (!user) return;
    
    try {
        await user.reload();
        if (user.emailVerified) {
            showToast('✅', 'Email verified! Welcome.');
            window.location.reload();
        } else {
            showToast('⏳', 'Email still not verified. Please check your inbox.');
        }
    } catch (err) {
        window.location.reload();
    }
}

// ---- Account Management ----

function openAccountModal() {
    if (!window.currentUser) return;
    const overlay = document.getElementById('account-overlay');
    const photo = document.getElementById('account-photo');
    const nameDisplay = document.getElementById('account-name-display');
    const emailDisplay = document.getElementById('account-email-display');
    const nameInput = document.getElementById('account-name-input');
    
    photo.src = window.currentUser.photoURL || `https://ui-avatars.com/api/?name=${window.currentUser.email}&background=6c5ce7&color=fff`;
    nameDisplay.textContent = window.currentUser.displayName || window.currentUser.email.split('@')[0];
    emailDisplay.textContent = window.currentUser.email;
    nameInput.value = window.currentUser.displayName || '';
    
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAccountModal() {
    const overlay = document.getElementById('account-overlay');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

async function updateAccountName() {
    if (!window.currentUser) return;
    const newName = document.getElementById('account-name-input').value.trim();
    if (!newName) return showToast('⚠️', 'Name cannot be empty.');
    
    try {
        const { updateProfile } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js");
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js");
        
        // Update Auth Profile
        await updateProfile(window.currentUser, { displayName: newName });
        
        // Update Firestore Doc
        const userRef = doc(window.firebaseDB, "users", window.currentUser.uid);
        await updateDoc(userRef, { name: newName });
        
        // Update UI
        document.getElementById('account-name-display').textContent = newName;
        document.getElementById('user-avatar').title = `Logged in as ${newName}`;
        
        showToast('✅', 'Profile updated successfully!');
    } catch (err) {
        console.error("Failed to update profile:", err);
        showToast('❌', 'Failed to update profile.');
    }
}

async function sendAccountPasswordReset() {
    if (!window.currentUser || !window.currentUser.email) return;
    try {
        const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js");
        await sendPasswordResetEmail(window.firebaseAuth, window.currentUser.email);
        showToast('📧', 'Password reset email sent!');
    } catch (err) {
        console.error("Failed to send reset email:", err);
        showToast('❌', 'Could not send reset email.');
    }
}

async function deleteUserAccount() {
    if (!window.currentUser) return;
    
    const confirmation = confirm("⚠️ DANGER ZONE ⚠️\n\nAre you absolutely sure you want to permanently delete your account?\n\nThis will instantly delete ALL your Brain Dumps, decision models, and your user profile forever. This action CANNOT be undone.");
    
    if (!confirmation) return;
    
    try {
        const { deleteUser } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js");
        const { doc, deleteDoc, collection, getDocs, query } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js");
        
        const uid = window.currentUser.uid;
        
        showToast('⏳', 'Deleting your data... Please do not close the window.');
        
        // 1. Delete all thoughts
        const thoughtsQuery = query(collection(window.firebaseDB, `users/${uid}/thoughts`));
        const snapshots = await getDocs(thoughtsQuery);
        const deletionPromises = [];
        snapshots.forEach(document => {
            deletionPromises.push(deleteDoc(document.ref));
        });
        await Promise.all(deletionPromises);
        
        // 2. Delete user profile doc
        const userRef = doc(window.firebaseDB, "users", uid);
        await deleteDoc(userRef);
        
        // 3. Delete Auth User
        await deleteUser(window.currentUser);
        
        closeAccountModal();
        showToast('👋', 'Account deleted completely. Goodbye!');
        // UI will redirect via onAuthStateChanged automatically
    } catch (err) {
        console.error("Delete account error:", err);
        if (err.code === 'auth/requires-recent-login') {
            showToast('⚠️', 'For security, please sign out, log back in, and try deleting again.');
        } else {
            showToast('❌', 'Failed to delete account. You might need to sign in again.');
        }
    }
}

// ---- Firebase Sync & Profile Management ----

async function initFirebaseSync() {
    if (!window.firebaseAuth || !window.firebaseDB) {
        setTimeout(initFirebaseSync, 500);
        return;
    }

    const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js");
    const { doc, getDoc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js");

    onAuthStateChanged(window.firebaseAuth, async (user) => {
        const appLoadingOverlay = document.getElementById('app-loading-overlay');
        const authOverlay = document.getElementById('auth-overlay');
        const verificationOverlay = document.getElementById('verification-overlay');
        const loginBtn = document.getElementById('btn-login');
        const userAvatar = document.getElementById('user-avatar');
        const userPhoto = document.getElementById('user-photo');

        if (user) {
            // Check verification for Email/Password users
            const isGoogleAuth = user.providerData.some(p => p.providerId === 'google.com');
            const isVerified = user.emailVerified || isGoogleAuth;

            // Update Header UI immediately if user exists (verified or not)
            if (loginBtn) loginBtn.classList.add('hidden');
            if (userAvatar) {
                userAvatar.classList.remove('hidden');
                userPhoto.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=6c5ce7&color=fff`;
                userAvatar.title = `Logged in as ${user.displayName || user.email}`;
            }

            if (!isVerified) {
                // UI: Show verification shield
                authOverlay.classList.add('hidden');
                verificationOverlay.classList.remove('hidden');
                document.getElementById('verification-email-display').textContent = user.email;
                appLoadingOverlay.classList.add('hidden');
                return;
            }

            // USER IS AUTHENTICATED & VERIFIED
            window.currentUser = user;
            authOverlay.classList.add('hidden');
            verificationOverlay.classList.add('hidden');
            document.body.style.overflow = '';

            // Sync User Profile in Firestore
            let needsOnboarding = false;
            try {
                const userRef = doc(window.firebaseDB, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        uid: user.uid,
                        name: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        photoURL: user.photoURL || null,
                        createdAt: serverTimestamp(),
                        lastLoginAt: serverTimestamp(),
                        examType: null,
                        targetYear: null,
                        dailyStudyGoal: null
                    });
                    needsOnboarding = true;
                } else {
                    const data = userSnap.data();
                    if (!data.examType) {
                        needsOnboarding = true;
                    }
                    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
                }
            } catch (err) {
                console.error("Firestore sync error:", err);
                showToast('❌', 'Cloud sync failed. Working in local mode.');
            }

            if (needsOnboarding) {
                document.getElementById('onboarding-overlay').classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                appLoadingOverlay.classList.add('hidden');
                return;
            }

            // Sync and load
            await engine.syncWithFirestore(user.uid);
            renderTodaysDumps();
            renderCurrentView();
            appLoadingOverlay.classList.add('hidden');

        } else {
            // NOT LOGGED IN
            window.currentUser = null;
            authOverlay.classList.add('hidden');
            verificationOverlay.classList.add('hidden');
            document.body.style.overflow = '';

            if (loginBtn) loginBtn.classList.remove('hidden');
            if (userAvatar) userAvatar.classList.add('hidden');

            engine.thoughts = engine.loadThoughts();
            renderTodaysDumps();
            renderCurrentView();
            appLoadingOverlay.classList.add('hidden');
        }
    });
}

async function completeOnboarding() {
    if (!window.currentUser) return;
    
    const exam = document.getElementById('onboard-exam').value;
    const year = document.getElementById('onboard-year').value;
    const hours = document.getElementById('onboard-hours').value;

    if (!year || !hours) {
        showToast('⚠️', 'Please fill in your target year and study goal.');
        return;
    }

    try {
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js");
        const userRef = doc(window.firebaseDB, "users", window.currentUser.uid);
        
        await updateDoc(userRef, {
            examType: exam,
            targetYear: parseInt(year),
            dailyStudyGoal: parseInt(hours)
        });

        // Hide onboarding
        document.getElementById('onboarding-overlay').classList.add('hidden');
        document.body.style.overflow = '';
        
        showToast('✅', 'Profile configured successfully! Welcome aboard.');

        // Finish app prep that was paused
        const appLoadingOverlay = document.getElementById('app-loading-overlay');
        appLoadingOverlay.classList.remove('hidden');
        
        await engine.syncWithFirestore(window.currentUser.uid);
        renderTodaysDumps();
        renderCurrentView();
        
        // Trigger initial theme switch based on exam
        const examOptions = document.querySelectorAll('.exam-option');
        examOptions.forEach(opt => {
            if(opt.dataset.exam === exam) {
                opt.click();
            }
        });
        
        appLoadingOverlay.classList.add('hidden');
    } catch (err) {
        console.error("Onboarding failed:", err);
        showToast('❌', 'Could not save data. Please try again.');
    }
}

// ---- Navigation ----

function initNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const view = tab.dataset.view;
            switchView(view);
        });
    });
}

function switchView(view) {
    currentView = view;

    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.nav-tab[data-view="${view}"]`);
    if (activeTab) activeTab.classList.add('active');

    // Update mobile nav
    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
    const activeMobile = document.querySelector(`.mobile-nav-btn[data-view="${view}"]`);
    if (activeMobile) activeMobile.classList.add('active');

    // Show view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const viewEl = document.getElementById(`view-${view}`);
    if (viewEl) {
        viewEl.classList.add('active');
        viewEl.style.animation = 'none';
        viewEl.offsetHeight; // trigger reflow
        viewEl.style.animation = '';
    }

    renderCurrentView();
}

function renderCurrentView() {
    switch (currentView) {
        case 'dump':
            renderTodaysDumps();
            break;
        case 'timeline': renderTimeline(); break;
        case 'patterns': renderPatterns(); break;
        case 'contradictions': renderContradictions(); break;
        case 'blindspots': renderBlindSpots(); break;
        case 'insights': renderInsights(); break;
        case 'tutor':
            const tutorExamLabel = document.getElementById('tutor-exam-label');
            if (tutorExamLabel) tutorExamLabel.textContent = currentExam;
            break;
    }
}

// ---- Today's Date Display ----

function updateDumpDate() {
    const dateEl = document.getElementById('dump-date');
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ---- Exam Selector ----

function initExamSelector() {
    const btn = document.getElementById('exam-btn');
    const dropdown = document.getElementById('exam-dropdown');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('open');
    });

    document.querySelectorAll('.exam-option').forEach(opt => {
        opt.addEventListener('click', () => {
            currentExam = opt.dataset.exam;
            localStorage.setItem('thoughtstack_exam', currentExam);
            document.body.dataset.course = currentExam;

            document.getElementById('current-exam').textContent = currentExam;
            document.querySelectorAll('.exam-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            dropdown.classList.remove('open');

            renderCurrentView();
            renderSubjectPills();
            showToast('✅', `Switched to ${currentExam}`);
        });
    });

    // Set initial exam
    document.body.dataset.course = currentExam;
    document.getElementById('current-exam').textContent = currentExam;
    document.querySelectorAll('.exam-option').forEach(opt => {
        if (opt.dataset.exam === currentExam) opt.classList.add('active');
    });
}

// ---- Theme Manager ----

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Default to dark mode if not set
    let currentTheme = localStorage.getItem('thoughtstack_theme') || 'dark';
    document.body.dataset.theme = currentTheme;

    themeToggle.addEventListener('click', () => {
        // Toggle theme
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = currentTheme;
        localStorage.setItem('thoughtstack_theme', currentTheme);

        // Trigger spin animation
        themeToggle.classList.add('animating');
        setTimeout(() => themeToggle.classList.remove('animating'), 600);
    });
}

// ---- Subject Pills ----

function initSubjectPills() {
    renderSubjectPills();
}

function renderSubjectPills() {
    const container = document.getElementById('subject-pills');
    if (!container) return;

    const examData = EXAM_SYLLABI[currentExam];
    if (!examData || !examData.subjects) return;

    container.innerHTML = '';
    selectedSubject = null;

    Object.entries(examData.subjects).forEach(([key, subjectData], index) => {
        const pill = document.createElement('button');
        pill.className = 'subject-pill';
        pill.dataset.subject = key;
        pill.style.animationDelay = `${index * 0.05}s`;
        pill.innerHTML = `<span class="subject-pill-icon">${subjectData.icon}</span> ${capitalize(key)}`;
        
        pill.addEventListener('click', () => {
            if (selectedSubject === key) {
                // Deselect
                selectedSubject = null;
                container.querySelectorAll('.subject-pill').forEach(p => p.classList.remove('active'));
            } else {
                // Select
                selectedSubject = key;
                container.querySelectorAll('.subject-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            }
        });

        container.appendChild(pill);
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---- Editor ----

function initEditor() {
    const editor = document.getElementById('dump-editor');
    const wordCount = document.getElementById('word-count');

    editor.addEventListener('input', () => {
        const text = editor.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    });

    // Save button
    document.getElementById('save-dump').addEventListener('click', saveDump);

    // Ctrl+Enter to save
    editor.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            saveDump();
        }
    });
}

async function saveDump() {
    if (!window.currentUser) {
        showToast('🔒', 'Please log in to save and analyze your brain dumps.');
        openAuthModal();
        return;
    }

    const editor = document.getElementById('dump-editor');
    const text = editor.value.trim();

    if (!text) {
        showToast('⚠️', 'Write something before saving!');
        editor.focus();
        return;
    }

    if (text.length < 10) {
        showToast('⚠️', 'Write at least a few sentences for useful analysis.');
        return;
    }

    const saveBtn = document.getElementById('save-dump');
    const originalBtnHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = '<span class="spinner-small"></span> Analyzing...';
    saveBtn.disabled = true;

    try {
        const projectId = import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : 'your-project-id';
        const functionUrl = `https://us-central1-${projectId}.cloudfunctions.net/validateDump`;
        
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error('Validation endpoint error');
        const validation = await response.json();

        if (!validation.valid) {
            showToast('⚠️', validation.reason || 'This doesn\'t look like a study reflection.');
            if (validation.redirect === 'tutor') {
                if (typeof redirectToTutor === 'function') {
                    redirectToTutor(text);
                } else {
                    showToast('🤖', 'AI Tutor screen pending restoration. Please ask there!');
                }
            }
            saveBtn.innerHTML = originalBtnHTML;
            saveBtn.disabled = false;
            return;
        }

        // NEW: Call analyzeDump API
        const analyzeUrl = `https://us-central1-${projectId}.cloudfunctions.net/analyzeDump`;
        const analyzeRes = await fetch(analyzeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, examType: currentExam })
        });

        if (!analyzeRes.ok) throw new Error('Analyze endpoint error');
        const analysis = await analyzeRes.json();

        // Use AI analysis and bypass local engine logic
        const thought = engine.addThought(text, currentExam, selectedSubject, analysis);
        if (typeof engine.saveData === 'function') engine.saveData();

        const insights = [];
        const examData = EXAM_SYLLABI[currentExam];
        const subjectIcon = examData?.subjects[thought.subject]?.icon || '📚';
        
        insights.push({
            label: 'AI-Detected Subject',
            value: String(thought.subject).charAt(0).toUpperCase() + String(thought.subject).slice(1),
            icon: subjectIcon
        });

        if (analysis.topic) {
            insights.push({ label: 'Specific Topic', value: analysis.topic, icon: '📌' });
        }

        const confLabels = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' };
        const confEmojis = { 1: '😰', 2: '🤔', 3: '🤷', 4: '😊', 5: '💪' };
        insights.push({
            label: 'Analysis: Confidence',
            value: `${confEmojis[thought.confidence] || '🤷'} ${confLabels[thought.confidence] || 'Moderate'}`,
            icon: '🎯'
        });

        if (thought.focusQuality) {
            insights.push({
                label: 'Analysis: Focus',
                value: `${thought.focusQuality.label} (${thought.focusQuality.score}/100)`,
                icon: '🔍'
            });
        }

        if (analysis.patternObservation) {
            insights.push({
                label: 'Psychological Pattern',
                value: analysis.patternObservation,
                icon: '🧠'
            });
        }

        showQuickInsights(insights);

        // Render AI Practice Questions
        if (analysis.practiceQuestions && analysis.practiceQuestions.length > 0) {
            document.getElementById('practice-problems').classList.remove('hidden');
            document.getElementById('practice-topic-tag').textContent = analysis.topic || 'Practice';
            
            const list = document.getElementById('practice-problems-list');
            list.innerHTML = analysis.practiceQuestions.map((q, idx) => `
                <div class="problem-card" style="background: var(--surface-light); padding: 15px; border-radius: 8px; margin-bottom: 12px;">
                    <div class="problem-q" style="margin-bottom: 10px;"><strong>Q${idx + 1}:</strong> ${q.question}</div>
                    <div class="problem-options" style="display:flex; flex-direction:column; gap:8px;">
                        ${q.options.map(opt => `<button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="alert(this.textContent.includes('${String(q.answer).replace(/'/g, "\\'")}') ? '✅ Correct! ${String(q.explanation).replace(/'/g, "\\'")}' : '❌ Incorrect. Try again.')">${opt}</button>`).join('')}
                    </div>
                </div>
            `).join('');
            document.getElementById('practice-score-bar').classList.add('hidden'); // Hide static score bar
        }

    } catch (error) {
        console.error("AI flow error:", error);
        
        // Fallback to local engine completely
        const thought = engine.addThought(text, currentExam, selectedSubject);
        const insights = [];
        const examData = EXAM_SYLLABI[currentExam];
        const subjectIcon = examData?.subjects[thought.subject]?.icon || '📚';
        
        insights.push({
            label: 'Subject Detected',
            value: String(thought.subject).charAt(0).toUpperCase() + String(thought.subject).slice(1),
            icon: subjectIcon
        });

        if (thought.topics && thought.topics.length > 0) {
            insights.push({ label: 'Topics Found', value: thought.topics.slice(0, 5).join(', '), icon: '📌' });
        }

        const confLabels = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' };
        const confEmojis = { 1: '😰', 2: '🤔', 3: '🤷', 4: '😊', 5: '💪' };
        insights.push({
            label: 'Confidence Level',
            value: `${confEmojis[thought.confidence]} ${confLabels[thought.confidence]}`,
            icon: '🎯'
        });

        if (thought.focusQuality) {
            insights.push({
                label: 'Focus Quality',
                value: `${thought.focusQuality.label} (${thought.focusQuality.score}/100)`,
                icon: '🔍'
            });
        }
        showQuickInsights(insights);
        
        // Load local fallback relevant practice problems if present
        if (typeof initPracticeProblems === 'function') {
            initPracticeProblems(currentExam, thought.topics);
        }
    }

    // Reset editor
    editor.value = '';
    document.getElementById('word-count').textContent = '0 words';

    // Update streak & today's dumps
    updateStreak();
    renderTodaysDumps();

    saveBtn.innerHTML = originalBtnHTML;
    saveBtn.disabled = false;
    showToast('🧠', 'Thought stacked successfully!');
}



// ---- Practice Problems Management ----

let currentProblems = [];
let correctCount = 0;
let totalAnswered = 0;

function initPracticeProblems(exam, topics) {
    const container = document.getElementById('practice-problems');
    const list = document.getElementById('practice-problems-list');
    const topicTag = document.getElementById('practice-topic-tag');
    const scoreBar = document.getElementById('practice-score-bar');

    // Reset state
    currentProblems = [];
    correctCount = 0;
    totalAnswered = 0;
    scoreBar.classList.add('hidden');
    container.classList.add('hidden');

    if (!exam || !PRACTICE_PROBLEMS[exam]) return;

    // Pick 3-5 problems based on topics
    const examData = PRACTICE_PROBLEMS[exam];
    const matchedTopics = topics && topics.length > 0 ? topics : Object.keys(examData);
    
    // Flatten all problems from matched topics
    let pool = [];
    matchedTopics.forEach(topic => {
        if (examData[topic]) {
            pool = pool.concat(examData[topic].map(p => ({ ...p, topic, originalIndex: Math.random() })));
        }
    });

    if (pool.length === 0) {
        // Fallback to random problems from this exam if no topic match
        Object.keys(examData).forEach(topic => {
            pool = pool.concat(examData[topic].map(p => ({ ...p, topic, originalIndex: Math.random() })));
        });
    }

    // Shuffle and pick 3
    pool.sort((a, b) => a.originalIndex - b.originalIndex);
    currentProblems = pool.slice(0, 3).map((p, idx) => ({ 
        ...p, 
        id: idx, 
        userAnswer: null,
        isAnswered: false 
    }));

    if (currentProblems.length > 0) {
        const primaryTopic = topics && topics.length > 0 ? topics[0] : 'General Recap';
        topicTag.textContent = primaryTopic;
        container.classList.remove('hidden');
        renderProblems(currentProblems);
    }
}

function renderProblems(problems) {
    const list = document.getElementById('practice-problems-list');
    
    list.innerHTML = problems.map((prob, idx) => `
        <div class="problem-card ${prob.isAnswered ? 'answered' : ''}" id="problem-${prob.id}">
            <div class="problem-card-header">
                <p class="problem-question">${prob.q}</p>
                <span class="problem-difficulty ${prob.difficulty}">${prob.difficulty}</span>
            </div>
            <div class="problem-options">
                ${prob.options.map((opt, optIdx) => {
                    let className = 'problem-option';
                    if (prob.isAnswered) {
                        if (optIdx === prob.answer) className += ' correct';
                        else if (optIdx === prob.userAnswer) className += ' wrong';
                    } else if (prob.userAnswer === optIdx) {
                        className += ' selected';
                    }
                    return `
                        <button class="${className}" 
                                onclick="selectOption(${prob.id}, ${optIdx})"
                                ${prob.isAnswered ? 'disabled' : ''}>
                            <span class="problem-option-prefix">${String.fromCharCode(65 + optIdx)}</span>
                            <span>${opt}</span>
                        </button>
                    `;
                }).join('')}
            </div>
            ${prob.isAnswered ? `
                <div class="problem-explanation">
                    <strong>💡 Explanation:</strong> ${prob.explanation}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function selectOption(probId, optIdx) {
    const prob = currentProblems.find(p => p.id === probId);
    if (!prob || prob.isAnswered) return;

    prob.userAnswer = optIdx;
    prob.isAnswered = true;
    
    if (optIdx === prob.answer) {
        correctCount++;
        showToast('✅', 'Correct! Great job.');
    } else {
        showToast('❌', 'Oops! Check the explanation.');
    }
    
    totalAnswered++;
    updateScoreBar();
    renderProblems(currentProblems);
}

function updateScoreBar() {
    const bar = document.getElementById('practice-score-bar');
    const text = document.getElementById('practice-score-text');
    const fill = document.getElementById('practice-score-fill');

    bar.classList.remove('hidden');
    text.textContent = `${correctCount}/${totalAnswered} correct`;
    
    const percentage = (correctCount / totalAnswered) * 100;
    fill.style.width = percentage + '%';
}

function filterPracticeProblems(diff) {
    // Update active button
    document.querySelectorAll('.practice-diff-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diff === diff);
    });

    if (diff === 'all') {
        renderProblems(currentProblems);
    } else {
        const filtered = currentProblems.filter(p => p.difficulty === diff);
        if (filtered.length === 0) {
            document.getElementById('practice-problems-list').innerHTML = `
                <div class="ai-coach-thinking-text" style="text-align: center; width: 100%; padding: 20px;">
                    No ${diff} problems found for this session. Use 'All' to see all matches.
                </div>
            `;
        } else {
            renderProblems(filtered);
        }
    }
}

function retryPracticeProblems() {
    // Reset user answers in current set
    currentProblems.forEach(p => {
        p.userAnswer = null;
        p.isAnswered = false;
    });
    
    correctCount = 0;
    totalAnswered = 0;
    
    document.getElementById('practice-score-bar').classList.add('hidden');
    renderProblems(currentProblems);
    
    showToast('🔄', 'Try again! You got this.');
}

function showQuickInsights(insights) {
    const container = document.getElementById('quick-insights');
    const grid = document.getElementById('insights-grid');

    if (insights.length === 0) {
        container.classList.add('hidden');
        return;
    }

    grid.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <span class="insight-label">${insight.icon} ${insight.label}</span>
            <span class="insight-value">${insight.value}</span>
        </div>
    `).join('');

    container.classList.remove('hidden');

    // Smooth scroll to insights
    setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// ---- Today's Dumps ----

function renderTodaysDumps() {
    const container = document.getElementById('today-dumps');
    const list = document.getElementById('today-dumps-list');
    const todayKey = engine.getTodayKey();
    const todayThoughts = engine.getThoughtsForDay(todayKey);

    if (todayThoughts.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    list.innerHTML = todayThoughts.map(thought => {
        const time = new Date(thought.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const subjectLabel = thought.subject.charAt(0).toUpperCase() + thought.subject.slice(1);
        const subjectIcon = EXAM_SYLLABI[thought.exam]?.subjects[thought.subject]?.icon || '📚';
        const preview = thought.text.substring(0, 150) + (thought.text.length > 150 ? '...' : '');
        const confEmojis = { 1: '😰', 2: '🤔', 3: '🤷', 4: '😊', 5: '💪' };
        const focusLabel = thought.focusQuality ? thought.focusQuality.label : '';

        return `
            <div class="today-dump-card" onclick="openThoughtModal('${thought.id}')">
                <div class="today-dump-header">
                    <span class="today-dump-time">${time}</span>
                    <span class="today-dump-subject">${subjectIcon} ${subjectLabel}</span>
                    <span class="today-dump-conf">${confEmojis[thought.confidence] || ''}</span>
                    ${focusLabel ? `<span class="today-dump-focus">${focusLabel}</span>` : ''}
                </div>
                <div class="today-dump-text">${escapeHtml(preview)}</div>
                <div class="today-dump-tags">
                    ${(thought.topics || []).slice(0, 4).map(t => `<span class="card-tag">${t}</span>`).join('')}
                    ${(thought.habits || []).slice(0, 2).map(h => `<span class="card-tag habit-tag">${h.icon} ${h.label}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// ---- Streak ----

function updateStreak() {
    const streak = engine.getStreak();
    document.getElementById('streak-count').textContent = streak;
}

// ---- Timeline Rendering ----

function renderTimeline() {
    const track = document.getElementById('timeline-track');
    const thoughts = engine.thoughts;

    // Apply filter
    let filtered = thoughts;
    switch (currentFilter) {
        case 'high-confidence':
            filtered = thoughts.filter(t => t.confidence >= 4);
            break;
        case 'confused':
            filtered = thoughts.filter(t => t.sentiment?.confusion > 0);
            break;
        case 'contradiction':
            const contradictions = engine.findContradictions();
            const contradictionIds = new Set();
            contradictions.forEach(c => {
                contradictionIds.add(c.thoughtA.id);
                contradictionIds.add(c.thoughtB.id);
            });
            filtered = thoughts.filter(t => contradictionIds.has(t.id));
            break;
    }

    if (filtered.length === 0) {
        track.innerHTML = `
            <div class="empty-state" style="padding-left: 0;">
                <div class="empty-icon">📝</div>
                <h3>${thoughts.length === 0 ? 'No thoughts yet' : 'No matching thoughts'}</h3>
                <p>${thoughts.length === 0 ? 'Start your first brain dump to see your thinking timeline grow.' : 'Try a different filter to see your thoughts.'}</p>
                ${thoughts.length === 0 ? '<button class="btn btn-secondary" onclick="switchView(\'dump\')">Start Dumping →</button>' : ''}
            </div>
        `;
        return;
    }

    track.innerHTML = filtered.map(thought => {
        const date = new Date(thought.timestamp);
        const timeStr = date.toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const preview = thought.text.substring(0, 200) + (thought.text.length > 200 ? '...' : '');
        const subjectLabel = thought.subject.charAt(0).toUpperCase() + thought.subject.slice(1);
        const confEmojis = { 1: '😰', 2: '🤔', 3: '🤷', 4: '😊', 5: '💪' };

        return `
            <div class="timeline-item" onclick="openThoughtModal('${thought.id}')">
                <div class="timeline-dot"></div>
                <div class="timeline-card">
                    <div class="timeline-card-header">
                        <span class="timeline-subject">${subjectLabel}</span>
                        <span class="timeline-time">${timeStr}</span>
                    </div>
                    <div class="timeline-content">${escapeHtml(preview)}</div>
                    <div class="timeline-card-footer">
                        ${(thought.topics || []).slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('')}
                        <span class="card-tag" style="margin-left:auto">${confEmojis[thought.confidence] || ''} Auto-detected</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Init timeline filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTimeline();
        });
    });
}

// ---- Patterns Rendering ----

function renderPatterns() {
    renderConceptCloud();
    renderTrends();
    renderThemes();
}

function renderConceptCloud() {
    const cloud = document.getElementById('concept-cloud');
    const freq = engine.getTopicFrequency();

    if (freq.length === 0) {
        cloud.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>Brain dump more to see concept patterns emerge!</p></div>';
        return;
    }

    const maxCount = Math.max(...freq.map(f => f.count));
    const colors = ['#6C5CE7', '#00CEC9', '#fd79a8', '#00b894', '#fdcb6e', '#e17055', '#74b9ff', '#a29bfe'];

    cloud.innerHTML = freq.slice(0, 20).map((item, i) => {
        const ratio = item.count / maxCount;
        const sizeClass = ratio > 0.7 ? 'size-lg' : ratio > 0.4 ? 'size-md' : 'size-sm';
        const color = colors[i % colors.length];
        const bg = color + '20';
        const border = color + '40';

        return `<span class="concept-tag ${sizeClass}" style="background: ${bg}; color: ${color}; border-color: ${border};" title="${item.count} mentions">${item.topic}</span>`;
    }).join('');
}

function renderTrends() {
    const chart = document.getElementById('trends-chart');
    const trends = engine.getTrendsByDate(7);
    const subjects = Object.keys(EXAM_SYLLABI[currentExam]?.subjects || {});
    const colors = SUBJECT_COLORS;

    if (engine.thoughts.length === 0) {
        chart.innerHTML = '<div class="empty-state"><p>Start dumping thoughts to see trends!</p></div>';
        return;
    }

    // Find max for scale
    let max = 1;
    Object.values(trends).forEach(day => {
        Object.values(day).forEach(v => { if (v > max) max = v; });
    });

    chart.innerHTML = Object.entries(trends).map(([date, data]) => {
        const bars = subjects.map(s => {
            const count = data[s] || 0;
            const height = Math.max(4, (count / max) * 120);
            const color = colors[s] || '#6C5CE7';
            return `<div class="trend-bar" style="height: ${height}px; background: ${color};" title="${s}: ${count}"></div>`;
        }).join('');

        return `
            <div class="trend-bar-group">
                <div class="trend-bars">${bars}</div>
                <span class="trend-label">${date}</span>
            </div>
        `;
    }).join('');
}

function renderThemes() {
    const container = document.getElementById('themes-list');
    const themes = engine.getRecurringThemes();

    if (themes.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Keep writing! Themes will emerge with more brain dumps.</p></div>';
        return;
    }

    const maxCount = Math.max(...themes.map(t => t.count));

    container.innerHTML = themes.map(theme => {
        const percent = Math.round((theme.count / maxCount) * 100);
        return `
            <div class="theme-item">
                <div class="theme-count">${theme.count}</div>
                <div class="theme-info">
                    <div class="theme-name">${theme.topic}</div>
                    <div class="theme-detail">Mentioned in ${theme.count} dump${theme.count > 1 ? 's' : ''}</div>
                </div>
                <div class="theme-bar">
                    <div class="theme-bar-fill" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ---- Contradiction Engine Rendering ----

function renderContradictions() {
    const feed = document.getElementById('contradiction-feed');
    const insights = engine.getContradictionInsights();

    if (insights.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>Not enough data yet</h3>
                <p>The engine needs more brain dumps across different sessions to find behavioral patterns. Keep writing honestly — the uncomfortable truths will surface.</p>
                <div class="empty-detail">
                    <span>📝 ${engine.thoughts.length} dump${engine.thoughts.length !== 1 ? 's' : ''} so far</span>
                    <span>·</span>
                    <span>Needs: varied topics, multiple sessions, honest writing</span>
                </div>
            </div>
        `;
        return;
    }

    const typeLabels = {
        critical: 'CRITICAL',
        warning: 'PATTERN',
        insight: 'INSIGHT',
        info: 'SIGNAL'
    };

    feed.innerHTML = `
        <div class="insight-count-bar">
            <span class="insight-count">${insights.length} insight${insights.length !== 1 ? 's' : ''} found</span>
            <span class="insight-count-detail">across ${engine.thoughts.length} dumps</span>
        </div>
    ` + insights.map((insight, i) => {
        const quoteHtml = insight.quotes ? `
            <div class="insight-quotes">
                <div class="insight-quote">
                    <small>${insight.quotes.a.date} · Confidence: ${insight.quotes.a.confidence}/5</small>
                    <p>"${escapeHtml(insight.quotes.a.text)}..."</p>
                </div>
                <div class="insight-quote-vs">↕</div>
                <div class="insight-quote">
                    <small>${insight.quotes.b.date} · Confidence: ${insight.quotes.b.confidence}/5</small>
                    <p>"${escapeHtml(insight.quotes.b.text)}..."</p>
                </div>
            </div>
        ` : '';

        return `
            <div class="insight-card type-${insight.type}" style="animation-delay: ${i * 0.08}s">
                <div class="insight-card-accent"></div>
                <div class="insight-card-body">
                    <div class="insight-card-top">
                        <span class="insight-type-badge badge-${insight.type}">${typeLabels[insight.type] || 'NOTE'}</span>
                        ${insight.topic ? `<span class="insight-topic-tag">${insight.topic}</span>` : ''}
                    </div>
                    <div class="insight-card-icon">${insight.icon}</div>
                    <h3 class="insight-card-title">${insight.title}</h3>
                    <p class="insight-card-text">${insight.body}</p>
                    ${quoteHtml}
                    <div class="insight-card-evidence">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
                        ${insight.evidence}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ---- Blind Spots Rendering ----

function renderBlindSpots() {
    const blindSpots = engine.getBlindSpots(currentExam);
    const heatmapData = engine.getHeatmapData(currentExam);

    // Update summary cards
    document.getElementById('critical-gaps-count').textContent = `${blindSpots.critical.length} topics`;
    document.getElementById('weak-areas-count').textContent = `${blindSpots.weak.length} topics`;
    document.getElementById('covered-count').textContent = `${blindSpots.covered.length} topics`;

    // Render heatmap
    const heatmap = document.getElementById('syllabus-heatmap');

    if (Object.keys(heatmapData).length === 0) {
        heatmap.innerHTML = '<div class="empty-state"><p>Select an exam to see your syllabus coverage.</p></div>';
        return;
    }

    heatmap.innerHTML = Object.entries(heatmapData).map(([subject, data]) => {
        const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
        const cells = data.topics.map(topic => {
            return `
                <div class="heatmap-cell heat-${topic.heatLevel}" title="${topic.name}: ${topic.mentions} mention(s)">
                    <span class="topic-name">${topic.name}</span>
                    <span class="mention-count">${topic.mentions} mention${topic.mentions !== 1 ? 's' : ''}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="heatmap-subject">
                <div class="heatmap-subject-title">${data.icon} ${subjectName}</div>
                <div class="heatmap-grid">${cells}</div>
            </div>
        `;
    }).join('');
}

// ---- Insights Rendering ----

function renderInsights() {
    const score = engine.getThinkingScore();
    const activity = engine.getActivityData();
    const bestTime = engine.getBestThinkingTime();
    const stats = engine.getDumpStats();
    const distribution = engine.getSubjectDistribution();

    // Thinking Score
    const scoreCircle = document.getElementById('score-circle');
    const circumference = 327;
    const offset = circumference - (score.total / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
    document.getElementById('score-value').textContent = score.total;

    // Score factors
    document.getElementById('depth-fill').style.width = `${score.depth}%`;
    document.getElementById('breadth-fill').style.width = `${score.breadth}%`;
    document.getElementById('consistency-fill').style.width = `${score.consistency}%`;
    document.getElementById('critical-fill').style.width = `${score.critical}%`;

    // Activity heatmap
    const heatmap = document.getElementById('activity-heatmap');
    heatmap.innerHTML = activity.map(cell => {
        return `<div class="activity-cell level-${cell.level}" title="${cell.date}: ${cell.count} dumps"></div>`;
    }).join('');

    // Best time
    const bestTimeEl = document.getElementById('best-time');
    if (bestTime) {
        bestTimeEl.innerHTML = `
            <div class="time-display">${bestTime}</div>
            <p>Your most productive thinking time</p>
        `;
    }

    // Dump stats
    document.getElementById('total-dumps').textContent = stats.totalDumps;
    document.getElementById('total-words').textContent = stats.totalWords.toLocaleString();
    document.getElementById('avg-confidence').textContent = stats.avgConfidence;

    // Subject distribution
    const distContainer = document.getElementById('subject-dist');
    if (distribution.length === 0) {
        distContainer.innerHTML = '<div class="empty-state"><p>No data yet</p></div>';
    } else {
        distContainer.innerHTML = distribution.map(item => {
            const color = SUBJECT_COLORS[item.subject] || '#6C5CE7';
            return `
                <div class="dist-item">
                    <div class="dist-color" style="background: ${color}"></div>
                    <span class="dist-name">${item.subject.charAt(0).toUpperCase() + item.subject.slice(1)}</span>
                    <div class="dist-bar">
                        <div class="dist-fill" style="width: ${item.percent}%; background: ${color}"></div>
                    </div>
                    <span class="dist-percent">${item.percent}%</span>
                </div>
            `;
        }).join('');
    }
}

// ---- Modal ----

function initModal() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function openThoughtModal(id) {
    const thought = engine.thoughts.find(t => t.id === id);
    if (!thought) return;

    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    const date = new Date(thought.timestamp);
    const timeStr = date.toLocaleString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    const subjectLabel = thought.subject.charAt(0).toUpperCase() + thought.subject.slice(1);
    const subjectIcon = EXAM_SYLLABI[thought.exam]?.subjects[thought.subject]?.icon || '📚';
    const confLabels = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' };
    const confEmojis = { 1: '😰', 2: '🤔', 3: '🤷', 4: '😊', 5: '💪' };

    content.innerHTML = `
        <div class="modal-auto-badge">🤖 Auto-analyzed</div>
        <span class="modal-subject">${subjectIcon} ${subjectLabel} • ${thought.exam || 'General'}</span>
        <h2>Brain Dump</h2>
        <div class="modal-text">${escapeHtml(thought.text)}</div>
        
        <div class="modal-analysis">
            <div class="modal-analysis-row">
                <span class="analysis-label">📌 Topics</span>
                <div class="analysis-tags">
                    ${(thought.topics || []).map(t => `<span class="card-tag" style="background: rgba(108,92,231,0.1); color: var(--accent-primary);">${t}</span>`).join('') || '<span class="text-muted">None detected</span>'}
                </div>
            </div>
            <div class="modal-analysis-row">
                <span class="analysis-label">🎯 Confidence</span>
                <span>${confEmojis[thought.confidence]} ${confLabels[thought.confidence]} (auto-detected)</span>
            </div>
            ${thought.focusQuality ? `
            <div class="modal-analysis-row">
                <span class="analysis-label">🔍 Focus</span>
                <span>${thought.focusQuality.label} — ${thought.focusQuality.score}/100</span>
            </div>` : ''}
            ${thought.habits && thought.habits.length > 0 ? `
            <div class="modal-analysis-row">
                <span class="analysis-label">🔄 Habits</span>
                <div class="analysis-tags">
                    ${thought.habits.map(h => `<span class="card-tag habit-tag">${h.icon} ${h.label}</span>`).join('')}
                </div>
            </div>` : ''}
            <div class="modal-analysis-row">
                <span class="analysis-label">🧠 Type</span>
                <span>${(thought.thinkingType || ['descriptive']).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</span>
            </div>
        </div>

        <div class="modal-meta">
            <span>📅 ${timeStr}</span>
            <span>📝 ${thought.wordCount} words</span>
        </div>
        <div class="modal-actions">
            <button class="btn btn-danger" onclick="deleteThought('${thought.id}')">🗑️ Delete</button>
        </div>
    `;

    overlay.classList.add('open');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
}

function deleteThought(id) {
    if (!confirm('Delete this thought? This cannot be undone.')) return;
    engine.deleteThought(id);
    closeModal();
    updateStreak();
    renderCurrentView();
    showToast('🗑️', 'Thought deleted.');
}

// ---- Mobile Navigation ----

function initMobileNav() {
    if (document.querySelector('.mobile-nav')) return;

    const nav = document.createElement('div');
    nav.className = 'mobile-nav';
    nav.innerHTML = `
        <button class="mobile-nav-btn active" data-view="home">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Home</span>
        </button>
        <button class="mobile-nav-btn" data-view="dump">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 8v8M8 12h8" stroke-linecap="round"/>
            </svg>
            <span>Dump</span>
        </button>
        <button class="mobile-nav-btn" data-view="timeline">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M2 12h4M18 12h4"/>
            </svg>
            <span>Timeline</span>
        </button>
        <button class="mobile-nav-btn" data-view="patterns">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/>
                <path d="M8.5 8.5l7 7" stroke-linecap="round"/>
            </svg>
            <span>Patterns</span>
        </button>
        <button class="mobile-nav-btn" data-view="contradictions">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 22h20L12 2z"/><path d="M12 9v5" stroke-linecap="round"/>
            </svg>
            <span>Radar</span>
        </button>
        <button class="mobile-nav-btn" data-view="blindspots">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span>Gaps</span>
        </button>
        <button class="mobile-nav-btn" data-view="insights">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            <span>Stats</span>
        </button>
    `;

    document.body.appendChild(nav);

    nav.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
}

// ---- Weekly Honest Review ----

function openWeeklyReview() {
    if (!window.currentUser) {
        showToast('🔒', 'Please log in to generate your Weekly Honest Review.');
        openAuthModal();
        return;
    }

    if (!tierManager.canAccess('weekly_review')) {
        openUpgradeModal('weekly_review');
        return;
    }
    const overlay = document.getElementById('review-overlay');
    const review = engine.generateWeeklyReview();
    renderWeeklyReview(review);
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeWeeklyReview() {
    const overlay = document.getElementById('review-overlay');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

function renderWeeklyReview(review) {
    const body = document.getElementById('review-body');
    document.getElementById('review-period').textContent = review.period;

    if (!review.hasData) {
        body.innerHTML = `
            <div class="review-section">
                <div class="review-verdict verdict-critical">
                    <p>${review.verdict}</p>
                </div>
            </div>
            ${review.callouts.map(c => renderCallout(c)).join('')}
            <div class="review-action-item">
                <div class="action-item-label">📌 YOUR ONE THING FOR NEXT WEEK</div>
                <p>${review.actionItem}</p>
            </div>
        `;
        return;
    }

    const s = review.stats;
    const ap = review.activeVsPassive;
    const f = review.focusReport;

    // Delta arrow
    const deltaHtml = s.dumpDelta !== 0 ? `<span class="stat-delta ${s.dumpDelta > 0 ? 'delta-up' : 'delta-down'}">${s.dumpDelta > 0 ? '↑' : '↓'} ${Math.abs(s.dumpDelta)} vs last week</span>` : '';

    // Confidence emoji
    const confEmoji = s.avgConfidence >= 4 ? '😎' : s.avgConfidence >= 3 ? '🙂' : s.avgConfidence >= 2 ? '😐' : '😟';
    
    // Focus color
    const focusColor = f.avgScore >= 65 ? 'var(--success)' : f.avgScore >= 40 ? 'var(--warning)' : 'var(--danger)';

    body.innerHTML = `
        <!-- Stats Overview -->
        <div class="review-section">
            <h2 class="review-section-title">📊 The Numbers</h2>
            <div class="review-stats-grid">
                <div class="review-stat">
                    <span class="review-stat-value">${s.totalDumps}</span>
                    <span class="review-stat-label">dumps</span>
                    ${deltaHtml}
                </div>
                <div class="review-stat">
                    <span class="review-stat-value">${s.totalWords.toLocaleString()}</span>
                    <span class="review-stat-label">words written</span>
                    <span class="review-stat-sub">~${s.avgWords} per dump</span>
                </div>
                <div class="review-stat">
                    <span class="review-stat-value">${s.activeDays}<small>/7</small></span>
                    <span class="review-stat-label">days active</span>
                </div>
                <div class="review-stat">
                    <span class="review-stat-value">${s.uniqueTopics}</span>
                    <span class="review-stat-label">topics touched</span>
                </div>
                <div class="review-stat">
                    <span class="review-stat-value">${confEmoji} ${s.avgConfidence}</span>
                    <span class="review-stat-label">avg confidence</span>
                </div>
                <div class="review-stat">
                    <span class="review-stat-value" style="color:${focusColor}">${f.avgScore}</span>
                    <span class="review-stat-label">avg focus score</span>
                </div>
            </div>
        </div>

        <!-- The Verdict -->
        <div class="review-section">
            <h2 class="review-section-title">⚖️ The Verdict</h2>
            <div class="review-verdict">
                <p>${review.verdict}</p>
            </div>
        </div>

        <!-- Active vs Passive -->
        <div class="review-section">
            <h2 class="review-section-title">🏋️ Active vs Passive Study</h2>
            <div class="review-ap-container">
                <div class="review-ap-bar">
                    <div class="ap-bar-fill ap-active" style="width: ${ap.activePercent || 0}%"></div>
                    <div class="ap-bar-fill ap-mixed" style="width: ${ap.mixed && (ap.active + ap.passive + ap.mixed) > 0 ? Math.round((ap.mixed / (ap.active + ap.passive + ap.mixed)) * 100) : 0}%"></div>
                    <div class="ap-bar-fill ap-passive" style="width: ${ap.passivePercent || 0}%"></div>
                </div>
                <div class="review-ap-legend">
                    <span class="ap-legend-item"><span class="ap-dot ap-active-dot"></span> Active: ${ap.active} session${ap.active !== 1 ? 's' : ''}</span>
                    <span class="ap-legend-item"><span class="ap-dot ap-mixed-dot"></span> Mixed: ${ap.mixed} session${ap.mixed !== 1 ? 's' : ''}</span>
                    <span class="ap-legend-item"><span class="ap-dot ap-passive-dot"></span> Passive: ${ap.passive} session${ap.passive !== 1 ? 's' : ''}</span>
                    ${ap.undetected > 0 ? `<span class="ap-legend-item"><span class="ap-dot ap-undetected-dot"></span> Unclassified: ${ap.undetected}</span>` : ''}
                </div>
                ${ap.passivePercent > 50 ? `<p class="ap-warning">⚠️ More passive than active. You're consuming, not producing. Flip it.</p>` : ''}
            </div>
        </div>

        <!-- Topic Coverage -->
        ${review.topicCoverage.length > 0 ? `
        <div class="review-section">
            <h2 class="review-section-title">📚 What You Actually Studied</h2>
            <div class="review-topic-list">
                ${review.topicCoverage.slice(0, 10).map((t, i) => {
                    const maxCount = review.topicCoverage[0].count;
                    const width = Math.max(15, Math.round((t.count / maxCount) * 100));
                    return `
                        <div class="review-topic-row">
                            <span class="review-topic-name">${t.topic}</span>
                            <div class="review-topic-bar">
                                <div class="review-topic-bar-fill" style="width: ${width}%"></div>
                            </div>
                            <span class="review-topic-count">${t.count}x</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>` : ''}

        <!-- Focus Report -->
        <div class="review-section">
            <h2 class="review-section-title">🧠 Focus Report</h2>
            <div class="review-focus-grid">
                <div class="focus-block focus-high">
                    <span class="focus-block-value">${f.high}</span>
                    <span class="focus-block-label">High Focus</span>
                    <span class="focus-block-pct">${f.highPercent}%</span>
                </div>
                <div class="focus-block focus-mid">
                    <span class="focus-block-value">${f.mid}</span>
                    <span class="focus-block-label">Medium</span>
                    <span class="focus-block-pct">${100 - f.highPercent - f.lowPercent}%</span>
                </div>
                <div class="focus-block focus-low">
                    <span class="focus-block-value">${f.low}</span>
                    <span class="focus-block-label">Low Focus</span>
                    <span class="focus-block-pct">${f.lowPercent}%</span>
                </div>
            </div>
        </div>

        <!-- Callouts -->
        ${review.callouts.length > 0 ? `
        <div class="review-section">
            <h2 class="review-section-title">🔊 Honest Callouts</h2>
            <div class="review-callouts">
                ${review.callouts.map(c => renderCallout(c)).join('')}
            </div>
        </div>` : ''}

        <!-- Action Item -->
        <div class="review-action-item">
            <div class="action-item-label">📌 YOUR ONE THING FOR NEXT WEEK</div>
            <p>${review.actionItem}</p>
        </div>
    `;
}

function renderCallout(callout) {
    const typeClass = callout.type === 'positive' ? 'callout-positive' 
        : callout.type === 'critical' ? 'callout-critical' 
        : callout.type === 'insight' ? 'callout-insight' 
        : 'callout-warning';

    return `
        <div class="review-callout ${typeClass}">
            <span class="callout-icon">${callout.icon}</span>
            <p class="callout-text">${callout.text}</p>
        </div>
    `;
}

// ---- Toast ----

// ---- Pro Badge ----

function updateProBadge() {
    const badge = document.getElementById('pro-badge');
    const label = document.getElementById('pro-badge-label');
    if (tierManager.isPro()) {
        badge.classList.add('is-pro');
        label.textContent = 'PRO';
        badge.title = 'ThoughtStack Pro';
    } else {
        badge.classList.remove('is-pro');
        label.textContent = 'FREE';
        badge.title = 'Upgrade to Pro';
    }
    // Toggle pro-specific UI
    document.body.classList.toggle('tier-pro', tierManager.isPro());
    document.body.classList.toggle('tier-free', !tierManager.isPro());
}

// ---- Upgrade Modal ----

function openUpgradeModal(feature) {
    const overlay = document.getElementById('upgrade-overlay');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Update the free tier card based on current status
    const currentDiv = overlay.querySelector('.tier-current');
    if (currentDiv) {
        currentDiv.textContent = tierManager.isPro() ? '' : 'Current Plan';
    }

    // Update the upgrade button
    const upgradeBtn = document.getElementById('btn-upgrade');
    if (tierManager.isPro()) {
        upgradeBtn.textContent = '\u2714 You\'re on Pro';
        upgradeBtn.disabled = true;
        upgradeBtn.style.opacity = '0.6';
    } else {
        upgradeBtn.textContent = 'Start Pro \u2014 \u20b999/mo';
        upgradeBtn.disabled = false;
        upgradeBtn.style.opacity = '1';
    }
}

function closeUpgradeModal() {
    const overlay = document.getElementById('upgrade-overlay');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

function handleUpgrade() {
    tierManager.activatePro();
    updateProBadge();
    closeUpgradeModal();
    showToast('\u2b50', 'Welcome to ThoughtStack Pro! All features unlocked.');
}

// ---- Decision Clarifier ----

// Removed AI Tutor, Decision Clarifier AI, and Gemini API logic.

// Make functions globally available
window.switchView = switchView;
window.openThoughtModal = openThoughtModal;
window.deleteThought = deleteThought;
window.openWeeklyReview = openWeeklyReview;
window.closeWeeklyReview = closeWeeklyReview;
window.openUpgradeModal = openUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.handleUpgrade = handleUpgrade;
window.handleGoogleSignIn = handleGoogleSignIn;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleAuthSubmit = handleAuthSubmit;
window.handleSignOut = handleSignOut;
window.resendVerification = resendVerification;
window.verifyAndReload = verifyAndReload;
window.openAccountModal = openAccountModal;
window.closeAccountModal = closeAccountModal;
window.updateAccountName = updateAccountName;
window.sendAccountPasswordReset = sendAccountPasswordReset;
window.deleteUserAccount = deleteUserAccount;
window.completeOnboarding = completeOnboarding;

// ===========================
// AI Tutor Chat Controller
// ===========================

let tutorChatHistory = []; // Local history state

function initTutorChat() {
    const input = document.getElementById('tutor-input');
    const sendBtn = document.getElementById('tutor-send-btn');

    if (sendBtn) {
        sendBtn.addEventListener('click', sendTutorMessage);
    }

    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendTutorMessage();
            }
        });

        // Auto-expand textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
        });
    }
}

async function sendTutorMessage() {
    const input = document.getElementById('tutor-input');
    const text = input.value.trim();
    if (!text) return;

    // Reset input
    input.value = '';
    input.style.height = 'auto';

    // Update history and UI
    const userMessage = { role: 'user', content: text };
    tutorChatHistory.push(userMessage);
    renderTutorMessage('user', text);

    // Show typing indicator
    const chatArea = document.getElementById('tutor-chat-area');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'tutor-typing';
    typingIndicator.id = 'tutor-typing-indicator';
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatArea.appendChild(typingIndicator);
    chatArea.scrollTop = chatArea.scrollHeight;

    try {
        const projectId = import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : 'your-project-id';
        const functionUrl = `https://us-central1-${projectId}.cloudfunctions.net/tutorChat`;

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: tutorChatHistory })
        });

        if (!response.ok) throw new Error('Tutor API error');
        const data = await response.json();

        // Remove indicator
        const indicator = document.getElementById('tutor-typing-indicator');
        if (indicator) indicator.remove();

        // Update history and UI
        const aiMessage = { role: 'assistant', content: data.reply };
        tutorChatHistory.push(aiMessage);
        renderTutorMessage('ai', data.reply);

    } catch (error) {
        console.error("Tutor error:", error);
        const indicator = document.getElementById('tutor-typing-indicator');
        if (indicator) indicator.remove();
        showToast('⚠️', 'The AI Tutor is temporarily offline. Please try again later.');
    }
}

function renderTutorMessage(role, text) {
    const chatArea = document.getElementById('tutor-chat-area');
    
    // Remove welcome screen if present
    const welcome = chatArea.querySelector('.tutor-welcome');
    if (welcome) welcome.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `tutor-message ${role}`;
    messageEl.textContent = text;
    chatArea.appendChild(messageEl);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function redirectToTutor(initialQuestion) {
    switchView('tutor');
    if (initialQuestion) {
        const input = document.getElementById('tutor-input');
        if (input) {
            input.value = initialQuestion;
            sendTutorMessage();
        }
    }
}

// Make globally accessible
window.initTutorChat = initTutorChat;
window.sendTutorMessage = sendTutorMessage;
window.redirectToTutor = redirectToTutor;

// Navigation & View
window.switchView = switchView;
window.openWeeklyReview = openWeeklyReview;
window.closeWeeklyReview = closeWeeklyReview;
window.openUpgradeModal = openUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.handleUpgrade = handleUpgrade;

// Practice
window.selectOption = selectOption;
window.retryPracticeProblems = retryPracticeProblems;
window.filterPracticeProblems = filterPracticeProblems;

// Auth
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleAuthSubmit = handleAuthSubmit;
window.handleGoogleSignIn = handleGoogleSignIn;
window.handleSignOut = handleSignOut;
window.resendVerification = resendVerification;
window.verifyAndReload = verifyAndReload;

// Account & Profile
window.openAccountModal = openAccountModal;
window.closeAccountModal = closeAccountModal;
window.updateAccountName = updateAccountName;
window.sendAccountPasswordReset = sendAccountPasswordReset;
window.deleteUserAccount = deleteUserAccount;
window.completeOnboarding = completeOnboarding;

// Ensure loader is hidden eventually
window.addEventListener('load', () => {
    const loader = document.getElementById('app-loading-overlay');
    if (loader && !loader.classList.contains('hidden')) {
        // Only hide if Firebase initialization didn't already handle it (after a timeout)
        setTimeout(() => loader.classList.add('hidden'), 2000);
    }
});
