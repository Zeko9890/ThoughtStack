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
    initDecisionClarifier();
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

function saveDump() {
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

    // Just send raw text + exam. Engine auto-extracts everything.
    const thought = engine.addThought(text, currentExam);

    // Show auto-extracted insights
    const insights = engine.getQuickInsights(thought);
    showQuickInsights(insights);

    // Reset editor
    editor.value = '';
    document.getElementById('word-count').textContent = '0 words';

    // Update streak & today's dumps
    updateStreak();
    renderTodaysDumps();

    // Trigger AI Coach response
    runAICoach(text, thought);

    showToast('🧠', 'Thought stacked! Everything auto-analyzed.');
}

// ---- AI Coach — Problem-Solving Advice + Motivation ----

async function runAICoach(dumpText, thought) {
    const container = document.getElementById('ai-coach-response');
    const thinkingEl = document.getElementById('ai-coach-thinking');
    const contentEl = document.getElementById('ai-coach-content');

    // Show the coach container with thinking state
    container.classList.remove('hidden');
    thinkingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    contentEl.innerHTML = '';

    // Smooth scroll to AI coach
    setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);

    const apiKey = localStorage.getItem('thoughtstack_gemini_key');

    if (apiKey) {
        // --- REAL AI (Gemini) ---
        try {
            const subjectName = thought.subject.charAt(0).toUpperCase() + thought.subject.slice(1);
            const confLabels = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' };
            const topicsStr = (thought.topics || []).join(', ') || 'general study';
            const confusionLevel = thought.sentiment?.confusion || 0;
            const insightLevel = thought.sentiment?.insight || 0;
            const habitsStr = (thought.habits || []).map(h => h.label).join(', ') || 'none detected';

            const prompt = `You are a warm, empathetic yet no-nonsense AI study coach for an Indian student preparing for ${currentExam}. The student just finished a brain-dump about their study session. 

Here is their brain dump:
"${dumpText}"

Context about this dump:
- Subject: ${subjectName}
- Topics covered: ${topicsStr}
- Confidence level: ${confLabels[thought.confidence]} (${thought.confidence}/5)
- Confusion signals detected: ${confusionLevel}
- Insight/eureka signals: ${insightLevel}
- Study habits spotted: ${habitsStr}
- Focus quality: ${thought.focusQuality?.label || 'Unknown'} (${thought.focusQuality?.score || '?'}/100)

Your job:
1. **Acknowledge** what they studied and what's going well (be specific to their content)
2. **Identify the core problem** — if they expressed confusion, frustration, or struggle, pinpoint exactly what seems to be the issue and suggest a concrete approach to solve it (specific techniques, resources, or strategies)
3. **Give 2-3 actionable next steps** — very specific things they can do RIGHT NOW to improve their understanding
4. **End with genuine motivation** — not generic "you can do it" but something specific to THEIR situation, their progress, their exam

Rules:
- Be direct and specific, not generic
- Use bolding for key points
- Keep it concise (under 200 words)
- Sound like a supportive senior who's been through this exam, not a robot
- If they seem to be doing well, celebrate that and push them to go deeper
- If they seem confused, be reassuring but honest about the work needed`;

            const payload = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            const llmResponse = data.candidates[0].content.parts[0].text;

            // Parse markdown to HTML
            const htmlFormatted = llmResponse
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');

            thinkingEl.classList.add('hidden');
            contentEl.innerHTML = `<div class="ai-raw-response">${htmlFormatted}</div>`;
            contentEl.classList.remove('hidden');
            contentEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (err) {
            console.error('AI Coach (Gemini) failed:', err);
            // Fallback to mock engine
            generateMockCoachResponse(dumpText, thought, thinkingEl, contentEl);
        }

    } else {
        // --- MOCK ENGINE (No API Key) ---
        // Simulate a brief delay for realism
        setTimeout(() => {
            generateMockCoachResponse(dumpText, thought, thinkingEl, contentEl);
        }, 2000);
    }
}

function generateMockCoachResponse(dumpText, thought, thinkingEl, contentEl) {
    const subjectName = thought.subject.charAt(0).toUpperCase() + thought.subject.slice(1);
    const confidence = thought.confidence;
    const confusion = thought.sentiment?.confusion || 0;
    const insightCount = thought.sentiment?.insight || 0;
    const topics = thought.topics || [];
    const habits = thought.habits || [];
    const focusScore = thought.focusQuality?.score || 50;
    const wordCount = thought.wordCount || dumpText.split(/\s+/).length;

    let acknowledgeHtml = '';
    let problemHtml = '';
    let stepsHtml = '';
    let motivationText = '';

    // ---- 1. Acknowledge what went well ----
    if (confidence >= 4 && insightCount > 0) {
        acknowledgeHtml = `<p>Really solid session on <strong>${subjectName}</strong>! You're clearly building real understanding, not just surface-level reading. ${topics.length > 0 ? `Your grasp of <strong>${topics.slice(0, 2).join('</strong> and <strong>')}</strong> is getting sharper.` : ''}</p>`;
    } else if (confidence >= 3) {
        acknowledgeHtml = `<p>Good effort on <strong>${subjectName}</strong> today. ${topics.length > 0 ? `You covered ${topics.slice(0, 3).join(', ')} — that takes focus.` : 'You showed up and put in the work — that matters.'}</p>`;
    } else {
        acknowledgeHtml = `<p>Hey, the fact that you sat down and studied <strong>${subjectName}</strong> today already puts you ahead of most. ${wordCount > 100 ? 'And you wrote a detailed dump — that shows you\'re taking this seriously.' : 'Every session counts, even the rough ones.'}</p>`;
    }

    // ---- 2. Identify the core problem ----
    if (confusion > 0 && confidence <= 2) {
        const confusedTopics = topics.length > 0 ? topics.slice(0, 2).join(' and ') : subjectName;
        problemHtml = `
            <div class="coach-section">
                <div class="coach-section-title">🔍 What I noticed</div>
                <div class="coach-section-body">
                    <p>You're hitting a wall with <strong>${confusedTopics}</strong> — and that's completely normal. Most toppers have been exactly where you are right now. The confusion isn't a sign of weakness, it's your brain wrestling with something new.</p>
                    <p>Here's the thing: <strong>confusion that you recognize is halfway to clarity.</strong> The students who fail are the ones who don't even notice they're confused.</p>
                </div>
            </div>`;
    } else if (confusion > 0) {
        problemHtml = `
            <div class="coach-section">
                <div class="coach-section-title">🔍 What I noticed</div>
                <div class="coach-section-body">
                    <p>There are some foggy areas in your understanding — that's normal when you're pushing into deeper territory. The key is not to leave these gaps unresolved.</p>
                </div>
            </div>`;
    } else if (focusScore < 40) {
        problemHtml = `
            <div class="coach-section">
                <div class="coach-section-title">🔍 What I noticed</div>
                <div class="coach-section-body">
                    <p>Your focus seemed a bit scattered this session. That's okay — we all have off days. But let's make sure this doesn't become a pattern. Try shorter, more intense study blocks next time.</p>
                </div>
            </div>`;
    }

    // ---- 3. Actionable next steps ----
    const steps = [];

    if (confusion > 0) {
        steps.push(`<strong>Isolate the confusion</strong> — Open a blank page and write down exactly what you don't understand about ${topics[0] || subjectName}. Be as specific as possible. "I don't get it" becomes "I don't understand why X leads to Y."`);
        steps.push(`<strong>Watch one targeted explanation</strong> — Find a 10-min video specifically on the concept that's confusing you. Sometimes a different perspective is all you need.`);
    }

    if (confidence <= 3) {
        steps.push(`<strong>Do 3 practice problems</strong> — Not easy ones. Pick problems that are slightly above your comfort level on ${topics[0] || subjectName}. Struggle is where learning happens.`);
    }

    if (habits.some(h => h.label === 'passive reading')) {
        steps.push(`<strong>Switch from reading to doing</strong> — You mentioned reading/going through notes. Try active recall instead: close the book and write down everything you remember. Then check what you missed.`);
    }

    if (habits.some(h => h.label === 'pressure/stress' || h.label === 'burnt out')) {
        steps.push(`<strong>Take care of yourself</strong> — I can sense the pressure. Take a 20-minute walk or rest before your next session. A fresh mind solves 2x faster than a tired one.`);
    }

    if (confidence >= 4 && insightCount > 0) {
        steps.push(`<strong>Teach it to someone</strong> — You seem to have a solid grasp. Explain what you learned to a friend or even to yourself out loud. If you can teach it, you truly own it.`);
        steps.push(`<strong>Attempt PYQs on this topic</strong> — Test your understanding against actual previous year questions. This is where theory meets reality.`);
    }

    if (focusScore >= 70) {
        steps.push(`<strong>Ride this momentum</strong> — Your focus was strong today. Schedule another session at the same time tomorrow to build a streak. Consistency beats intensity.`);
    }

    // Fallback if no steps generated
    if (steps.length === 0) {
        steps.push(`<strong>Review today's topics tomorrow</strong> — Space repetition is your secret weapon. Revisit ${topics[0] || subjectName} after 24 hours and see how much you retain.`);
        steps.push(`<strong>Connect the dots</strong> — Try linking what you studied today with something you learned last week. Cross-topic connections make knowledge stick.`);
    }

    stepsHtml = steps.slice(0, 3).map(step => `<div class="coach-step">${step}</div>`).join('');

    // ---- 4. Motivation ----
    const motivations = {
        highConfidence: [
            `You're building real momentum. This is what separates the ones who clear ${currentExam} from the ones who just "prepare." Keep stacking.`,
            `${currentExam} rewards consistent thinkers, not last-minute crammers. You're doing exactly the right thing. Keep this up.`,
            `Every dump you write is proof that you're not just studying — you're thinking. That's the difference maker.`
        ],
        lowConfidence: [
            `Listen — every topper who cleared ${currentExam} has sat exactly where you're sitting right now, feeling exactly what you're feeling. The only difference? They didn't stop. Neither will you.`,
            `Confusion today is clarity tomorrow. The fact that you recognized what you don't know is already half the battle. You've got this.`,
            `${currentExam} is hard. It's supposed to be. But you're here, putting in the work, being honest about your gaps. That takes more courage than most people have.`
        ],
        moderate: [
            `Steady progress is still progress. You're one session closer to where you need to be. Don't underestimate the power of showing up consistently.`,
            `You studied, you reflected, you identified what needs work. That's the loop that leads to results. Keep going — you're closer than you think.`,
            `The students who crack ${currentExam} aren't the ones who never struggled. They're the ones who kept showing up after the struggle. Just like you did today.`
        ]
    };

    let motivationPool;
    if (confidence >= 4) motivationPool = motivations.highConfidence;
    else if (confidence <= 2) motivationPool = motivations.lowConfidence;
    else motivationPool = motivations.moderate;

    motivationText = motivationPool[Math.floor(Math.random() * motivationPool.length)];

    // ---- Assemble final HTML ----
    const finalHtml = `
        <div class="coach-section">
            <div class="coach-section-title">✨ Recognition</div>
            <div class="coach-section-body">${acknowledgeHtml}</div>
        </div>
        ${problemHtml}
        <div class="coach-section">
            <div class="coach-section-title">🛠️ Your Next Moves</div>
            <div class="coach-section-body">${stepsHtml}</div>
        </div>
        <div class="coach-motivation">${motivationText}</div>
    `;

    thinkingEl.classList.add('hidden');
    contentEl.innerHTML = finalHtml;
    contentEl.classList.remove('hidden');

    setTimeout(() => {
        contentEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
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

function initDecisionClarifier() {
    const textarea = document.getElementById('dc-textarea');
    const wordCount = document.getElementById('dc-word-count');
    if (!textarea) return;

    textarea.addEventListener('input', () => {
        const words = textarea.value.trim().split(/\s+/).filter(Boolean).length;
        wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    });
    
    // Pre-fill API key input if it exists
    const existingKey = localStorage.getItem('thoughtstack_gemini_key');
    if(existingKey) {
        const input = document.getElementById('dc-gemini-key');
        if(input) input.value = existingKey;
    }
}

function saveGeminiKey() {
    const key = document.getElementById('dc-gemini-key').value.trim();
    if(key) {
        localStorage.setItem('thoughtstack_gemini_key', key);
        showToast('🔑', 'API Key saved securely to your browser.');
        document.getElementById('dc-api-settings').classList.add('hidden');
    } else {
        localStorage.removeItem('thoughtstack_gemini_key');
        showToast('ℹ️', 'API Key removed. Reverting to mock-engine.');
    }
}

async function runDecisionClarifier() {
    if (!window.currentUser) {
        showToast('🔒', 'Please log in to use the Decision Clarifier.');
        openAuthModal();
        return;
    }

    if (!tierManager.canAccess('decision_clarifier')) {
        openUpgradeModal('decision_clarifier');
        return;
    }

    const textarea = document.getElementById('dc-textarea');
    const text = textarea.value.trim();

    if (text.split(/\s+/).length < 10) {
        showToast('✍️', 'Write at least 10 words about your decision. The more context, the sharper the questions.');
        return;
    }

    const apiKey = localStorage.getItem('thoughtstack_gemini_key');
    const thinkingState = document.getElementById('dc-thinking');
    const resultState = document.getElementById('dc-results');
    const aiResultState = document.getElementById('dc-ai-results');
    const btn = document.getElementById('dc-clarify-btn');

    // UI Prep
    thinkingState.classList.remove('hidden');
    resultState.classList.add('hidden');
    aiResultState.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    // Smooth scroll to orb
    thinkingState.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (!apiKey) {
        // MOCK ENGINE
        setTimeout(() => {
            const result = DecisionClarifier.clarify(text); // from engine.js
            renderDecisionResult(result, text);
            thinkingState.classList.add('hidden');
            btn.disabled = false;
            btn.textContent = '🔮 Clarify My Thinking';
        }, 3000); // 3-second simulated processing delay
        return;
    }

    // REAL LLM ENGINE (Gemini)
    try {
        const payload = {
            contents: [{
                parts: [{
                    text: `You are a world-class strategic advisor and cognitive coach. Analyze the following decision a student is wrestling with. Provide a short, hard-hitting analysis. Identify the core conflict. Then, ask 3 sharp, incisive questions designed to break their mental loop and force clarity. Format nicely with bolding and spacing.\n\nThe student's dilemma:\n"${text}"`
                }]
            }]
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const llmResponse = data.candidates[0].content.parts[0].text;
        
        // Simple Markdown parsing
        const htmlFormatted = llmResponse
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        thinkingState.classList.add('hidden');
        aiResultState.innerHTML = htmlFormatted;
        aiResultState.classList.remove('hidden');
        aiResultState.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        console.error("Gemini AI failed:", err);
        showToast('❌', 'AI Request failed. Check your API key or connection.');
        thinkingState.classList.add('hidden');
    } finally {
        btn.disabled = false;
        btn.textContent = '🔮 Clarify My Thinking';
    }
}

function renderDecisionResult(result, originalText) {
    const container = document.getElementById('dc-results');
    container.classList.remove('hidden');

    container.innerHTML = `
        <div class="dc-result-header">
            <span class="dc-result-type-badge">${result.typeName}</span>
            <span class="dc-result-meta">${result.meta.wordCount} words analyzed</span>
        </div>
        <div class="dc-result-intro">
            <p>You\'re wrestling with a <strong>${result.typeName.toLowerCase()}</strong> decision.${result.meta.hasConflict ? ' I can see the conflict in your words.' : ''} ${result.meta.hasUrgency ? 'I sense urgency \u2014 but fast decisions aren\'t always good ones.' : 'Take your time with this.'}</p>
        </div>
        <h4 class="dc-questions-title">3 Questions to Sharpen Your Thinking</h4>
        <div class="dc-questions">
            ${result.questions.map((q, i) => `
                <div class="dc-question" style="animation-delay: ${(i + 1) * 0.2}s">
                    <span class="dc-question-num">${i + 1}</span>
                    <p>${q}</p>
                </div>
            `).join('')}
        </div>
        <div class="dc-result-footer">
            <p>Sit with these questions. Don\'t answer them instantly. The best decisions happen when you sleep on the right question.</p>
        </div>
    `;

    // Scroll to results
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- Toast ----

function showToast(icon, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---- Utility ----

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Make functions globally available
window.switchView = switchView;
window.openThoughtModal = openThoughtModal;
window.deleteThought = deleteThought;
window.openWeeklyReview = openWeeklyReview;
window.closeWeeklyReview = closeWeeklyReview;
window.openUpgradeModal = openUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.handleUpgrade = handleUpgrade;
window.runDecisionClarifier = runDecisionClarifier;
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
window.saveGeminiKey = saveGeminiKey;
