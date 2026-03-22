// ===========================
// ThoughtStack — Analysis Engine
// ===========================

class ThoughtEngine {
    constructor() {
        this.thoughts = this.loadThoughts();
        this.uid = null;
    }

    // ---- Persistence ----

    loadThoughts() {
        try {
            const data = localStorage.getItem('thoughtstack_thoughts');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    saveThoughts() {
        localStorage.setItem('thoughtstack_thoughts', JSON.stringify(this.thoughts));
        this.backupToFirestore();
    }

    async syncWithFirestore(uid) {
        if (!uid || !window.firebaseDB) return;
        this.uid = uid;
        
        try {
            const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js");
            const q = query(collection(window.firebaseDB, `users/${this.uid}/thoughts`), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            
            const cloudThoughts = [];
            querySnapshot.forEach((doc) => {
                cloudThoughts.push(doc.data());
            });

            if (cloudThoughts.length > 0) {
                // Simplistic merge: prefer cloud for now
                this.thoughts = cloudThoughts;
                localStorage.setItem('thoughtstack_thoughts', JSON.stringify(this.thoughts));
                return true;
            }
        } catch (err) {
            console.error("Firestore sync failed:", err);
        }
        return false;
    }

    async backupToFirestore() {
        if (!this.uid || !window.firebaseDB || this.thoughts.length === 0) return;
        
        try {
            const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js");
            // Backup the most recent thought
            const latest = this.thoughts[0];
            await setDoc(doc(window.firebaseDB, `users/${this.uid}/thoughts`, latest.id), latest);
        } catch (err) {
            console.error("Firestore backup failed:", err);
        }
    }

    // Accept raw text + exam + manual subject + optional AI analysis.
    addThought(rawText, exam, manualSubject = null, aiAnalysis = null) {
        const text = rawText.trim();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const now = new Date();

        const entry = {
            id: this.generateId(),
            text,
            exam,
            timestamp: Date.now(),
            date: now.toISOString(),
            dayKey: this.getDayKey(now),
            wordCount,
            // Use AI analysis if available, otherwise fall back to local engine
            subject: aiAnalysis ? aiAnalysis.subject : this.detectSubject(text, exam, manualSubject),
            confidence: aiAnalysis ? aiAnalysis.confidence : this.detectConfidence(text),
            focusQuality: aiAnalysis ? aiAnalysis.focusQuality : this.detectFocusQuality(text),
            topics: aiAnalysis ? [aiAnalysis.topic] : this.extractTopics(text),
            patternObservation: aiAnalysis ? aiAnalysis.patternObservation : null,
            habits: aiAnalysis ? [] : this.detectHabits(text), // Local engine habits
            sentiment: aiAnalysis ? null : this.analyzeSentiment(text),
            thinkingType: aiAnalysis ? null : this.classifyThinking(text),
            keywords: aiAnalysis ? [] : this.extractKeywords(text)
        };

        this.thoughts.unshift(entry);
        this.saveThoughts();
        return entry;
    }

    deleteThought(id) {
        this.thoughts = this.thoughts.filter(t => t.id !== id);
        this.saveThoughts();
    }

    generateId() {
        return 'ts_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }

    getDayKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // Get all thoughts for a specific day
    getThoughtsForDay(dayKey) {
        return this.thoughts.filter(t => t.dayKey === dayKey);
    }

    // Get today's day key
    getTodayKey() {
        return this.getDayKey(new Date());
    }

    // ---- Auto-Detection: Subject ----

    detectSubject(text, exam, manualSubject = null) {
        if (manualSubject) {
            // Verify manual subject belongs to the exam syllabus
            const syllabus = EXAM_SYLLABI[exam];
            if (syllabus && syllabus.subjects[manualSubject]) {
                return manualSubject;
            }
        }

        const lower = text.toLowerCase();
        const scores = { physics: 0, chemistry: 0, mathematics: 0, biology: 0, general: 0 };

        // Physics signals
        const physicsTerms = [
            'force', 'velocity', 'acceleration', 'momentum', 'energy', 'work',
            'gravity', 'friction', 'torque', 'wave', 'optics', 'lens', 'mirror',
            'electric', 'magnetic', 'current', 'voltage', 'resistance', 'circuit',
            'potential', 'field', 'charge', 'capacitor', 'inductor', 'shm',
            'oscillation', 'pendulum', 'thermodynamics', 'heat', 'temperature',
            'entropy', 'carnot', 'newton', 'coulomb', 'gauss', 'faraday',
            'ampere', 'ohm', 'kirchhoff', 'projectile', 'kinematics',
            'photon', 'quantum', 'nuclear', 'radioactive', 'semiconductor',
            'diode', 'transistor', 'inclined plane', 'pulley', 'spring',
            'pressure', 'density', 'buoyancy', 'viscosity', 'bernoulli',
            'fluids', 'mechanics', 'rotation', 'angular', 'moment of inertia'
        ];

        // Chemistry signals
        const chemistryTerms = [
            'element', 'compound', 'reaction', 'molecule', 'atom', 'ion',
            'bond', 'covalent', 'ionic', 'orbital', 'hybridization', 'vsepr',
            'acid', 'base', 'ph', 'buffer', 'equilibrium', 'le chatelier',
            'oxidation', 'reduction', 'redox', 'electrochemistry', 'galvanic',
            'electrolysis', 'nernst', 'catalyst', 'kinetics', 'rate law',
            'organic', 'inorganic', 'alkane', 'alkene', 'alkyne', 'benzene',
            'aromatic', 'alcohol', 'aldehyde', 'ketone', 'carboxylic',
            'amine', 'ester', 'polymer', 'isomer', 'stereochemistry',
            'periodic', 'electronegativity', 'ionization', 'mole',
            'stoichiometry', 'solution', 'solubility', 'concentration',
            'titration', 'indicator', 'coordination', 'ligand',
            'crystal', 'lattice', 'enthalpy', 'gibbs', 'hess'
        ];

        // Mathematics signals
        const mathTerms = [
            'equation', 'function', 'graph', 'derivative', 'integral',
            'limit', 'continuity', 'differentiation', 'integration',
            'matrix', 'determinant', 'vector', 'scalar', 'dot product',
            'cross product', 'probability', 'permutation', 'combination',
            'binomial', 'sequence', 'series', 'progression', 'complex number',
            'quadratic', 'polynomial', 'trigonometry', 'sine', 'cosine',
            'tangent', 'logarithm', 'exponential', 'calculus', 'algebra',
            'geometry', 'coordinate', 'conic', 'parabola', 'ellipse',
            'hyperbola', 'circle', 'slope', 'intercept', 'asymptote',
            'theorem', 'proof', 'induction', 'set', 'relation',
            'differential equation', 'maxima', 'minima', 'area under',
            'statistics', 'mean', 'variance', 'standard deviation'
        ];

        // Biology signals
        const biologyTerms = [
            'cell', 'dna', 'rna', 'protein', 'gene', 'chromosome',
            'mitosis', 'meiosis', 'photosynthesis', 'respiration',
            'krebs', 'glycolysis', 'atp', 'enzyme', 'substrate',
            'evolution', 'darwin', 'mutation', 'allele', 'dominant',
            'recessive', 'genotype', 'phenotype', 'mendel', 'heredity',
            'ecosystem', 'food chain', 'biodiversity', 'species',
            'taxonomy', 'kingdom', 'phylum', 'organ', 'tissue',
            'hormone', 'neuron', 'synapse', 'immunity', 'antibody',
            'vaccine', 'pathogen', 'virus', 'bacteria', 'fungus',
            'plant', 'animal', 'morphology', 'anatomy', 'physiology',
            'digestion', 'excretion', 'reproduction', 'embryo',
            'biotechnology', 'cloning', 'pcr', 'genetic engineering'
        ];

        // General/UPSC signals
        const generalTerms = [
            'constitution', 'parliament', 'democracy', 'government',
            'history', 'geography', 'economy', 'gdp', 'inflation',
            'polity', 'governance', 'international', 'foreign policy',
            'current affairs', 'ethics', 'society', 'culture',
            'environment', 'ecology', 'climate', 'disaster',
            'security', 'development', 'planning', 'policy'
        ];

        physicsTerms.forEach(term => { if (lower.includes(term)) scores.physics++; });
        chemistryTerms.forEach(term => { if (lower.includes(term)) scores.chemistry++; });
        mathTerms.forEach(term => { if (lower.includes(term)) scores.mathematics++; });
        biologyTerms.forEach(term => { if (lower.includes(term)) scores.biology++; });
        generalTerms.forEach(term => { if (lower.includes(term)) scores.general++; });

        // Get the subject with highest score
        const entries = Object.entries(scores).filter(([s]) => {
            // Filter by exam subjects
            const syllabus = EXAM_SYLLABI[exam];
            return syllabus ? Object.keys(syllabus.subjects).includes(s) : true;
        });

        const best = entries.sort((a, b) => b[1] - a[1])[0];
        if (best && best[1] > 0) return best[0];

        // Fallback: first subject of current exam
        const syllabus = EXAM_SYLLABI[exam];
        if (syllabus) return Object.keys(syllabus.subjects)[0];
        return 'general';
    }

    // ---- Auto-Detection: Confidence Level ----

    detectConfidence(text) {
        const lower = text.toLowerCase();
        let score = 3; // Default: moderate

        // High confidence signals push up
        const highConfidence = [
            'i understand', 'makes sense', 'clicked', 'figured out',
            'i get it', 'finally understood', 'crystal clear', 'easy',
            'confident', 'i know', 'obvious', 'clearly', 'definitely',
            'i\'m sure', 'no doubt', 'i can solve', 'mastered', 'nailed it',
            'straightforward', 'intuitive', 'makes perfect sense', 'eureka'
        ];

        // Low confidence signals push down
        const lowConfidence = [
            'confused', 'don\'t understand', 'not sure', 'unclear',
            'struggling', 'hard to grasp', 'tricky', 'difficult',
            'lost', 'stuck', 'can\'t figure', 'no idea', 'bewildered',
            'overwhelming', 'frustrating', 'makes no sense', 'doubt',
            'uncertain', 'maybe', 'i think', 'possibly', 'might be',
            'not confident', 'worried', 'nervous', 'blank', 'forgetting'
        ];

        let highCount = 0;
        let lowCount = 0;

        highConfidence.forEach(phrase => {
            if (lower.includes(phrase)) highCount++;
        });

        lowConfidence.forEach(phrase => {
            if (lower.includes(phrase)) lowCount++;
        });

        // Adjust score based on balance
        const net = highCount - lowCount;
        if (net >= 3) score = 5;
        else if (net >= 1) score = 4;
        else if (net === 0) score = 3;
        else if (net >= -2) score = 2;
        else score = 1;

        return score;
    }

    // ---- Auto-Detection: Focus/Attention Quality ----

    detectFocusQuality(text) {
        const lower = text.toLowerCase();
        const wordCount = text.split(/\s+/).filter(Boolean).length;

        let focusScore = 50; // baseline
        const signals = [];

        // Depth of engagement (longer = more focused)
        if (wordCount > 200) { focusScore += 20; signals.push('Deep engagement'); }
        else if (wordCount > 100) { focusScore += 10; signals.push('Good engagement'); }
        else if (wordCount < 30) { focusScore -= 15; signals.push('Brief — were you distracted?'); }

        // Topic coherence — if they mention many unrelated subjects, likely scattered
        const topicCount = this.extractTopics(text).length;
        if (topicCount === 0) { /* no topics found, can't judge */ }
        else if (topicCount <= 3) { focusScore += 15; signals.push('Focused on few topics'); }
        else if (topicCount <= 6) { focusScore += 5; signals.push('Moderate breadth'); }
        else { focusScore -= 10; signals.push('Scattered across many topics'); }

        // Distraction signals
        const distractionPhrases = [
            'distracted', 'couldn\'t focus', 'phone', 'instagram', 'youtube',
            'zoned out', 'wasn\'t paying attention', 'mind wandered',
            'kept thinking about', 'couldn\'t concentrate', 'bored',
            'sleepy', 'tired', 'drowsy', 'half asleep', 'dozed off'
        ];

        const focusPhrases = [
            'focused', 'deep study', 'flow state', 'in the zone',
            'concentrated', 'uninterrupted', 'productive', 'engaged',
            'absorbed', 'immersed', 'intense session'
        ];

        distractionPhrases.forEach(p => {
            if (lower.includes(p)) { focusScore -= 12; signals.push(`Distraction: "${p}"`); }
        });

        focusPhrases.forEach(p => {
            if (lower.includes(p)) { focusScore += 12; signals.push(`Focus: "${p}"`); }
        });

        // Analytical depth signals (relating concepts = more engaged)
        const deepThinkCount = ANALYSIS_PROMPTS.deep_thinking_indicators.filter(
            ind => lower.includes(ind)
        ).length;
        if (deepThinkCount >= 3) { focusScore += 10; signals.push('Connecting concepts'); }

        const quality = Math.max(0, Math.min(100, focusScore));
        let label;
        if (quality >= 80) label = '🎯 Laser Focused';
        else if (quality >= 60) label = '👀 Attentive';
        else if (quality >= 40) label = '😐 Moderate';
        else if (quality >= 20) label = '😶‍🌫️ Distracted';
        else label = '😴 Zoned Out';

        return { score: quality, label, signals };
    }

    // ---- Auto-Detection: Study Habits ----

    detectHabits(text) {
        const lower = text.toLowerCase();
        const habits = [];

        // Time-related patterns
        const timePatterns = {
            'late night': ['late night', 'midnight', '2am', '3am', '1am', 'stayed up late', 'night owl'],
            'early morning': ['early morning', 'woke up early', '5am', '6am', 'sunrise', 'morning study'],
            'last minute': ['last minute', 'exam tomorrow', 'cramming', 'one day left', 'night before'],
            'regular schedule': ['daily routine', 'every day', 'scheduled', 'routine']
        };

        // Study method patterns
        const methodPatterns = {
            'active recall': ['recalled', 'tried to remember', 'without looking', 'from memory', 'tested myself', 'flashcard'],
            'passive reading': ['just read', 'only read', 'went through notes', 'skimmed', 'browsed through'],
            'problem solving': ['solved problems', 'practiced questions', 'numericals', 'pyq', 'mock test', 'practice test', 'attempted'],
            'note making': ['made notes', 'wrote down', 'summarized', 'mind map', 'diagram'],
            'video learning': ['watched video', 'youtube', 'lecture video', 'online class', 'recorded lecture'],
            'group study': ['studied with', 'friends', 'group study', 'discussed with', 'study group', 'peer'],
            'revision': ['revised', 'revision', 'went over again', 're-read', 'reviewed', 'refreshed']
        };

        // Emotional patterns
        const emotionPatterns = {
            'pressure/stress': ['stressed', 'pressure', 'anxious', 'worried', 'panic', 'overwhelmed'],
            'motivated': ['motivated', 'pumped', 'excited', 'ready', 'determined', 'goal'],
            'burnt out': ['burnt out', 'exhausted', 'drained', 'can\'t study anymore', 'need a break', 'fatigue'],
            'procrastinating': ['procrastinat', 'delaying', 'putting off', 'tomorrow', 'didn\'t study', 'wasted time']
        };

        for (const [habit, phrases] of Object.entries(timePatterns)) {
            if (phrases.some(p => lower.includes(p))) {
                habits.push({ type: 'time', label: habit, icon: '⏰' });
            }
        }

        for (const [habit, phrases] of Object.entries(methodPatterns)) {
            if (phrases.some(p => lower.includes(p))) {
                habits.push({ type: 'method', label: habit, icon: '📖' });
            }
        }

        for (const [habit, phrases] of Object.entries(emotionPatterns)) {
            if (phrases.some(p => lower.includes(p))) {
                habits.push({ type: 'emotion', label: habit, icon: '💭' });
            }
        }

        return habits;
    }

    // ---- Text Analysis ----

    extractTopics(text) {
        const lower = text.toLowerCase();
        const found = new Set();

        for (const [keyword, topics] of Object.entries(KEYWORD_TOPIC_MAP)) {
            const regex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
            if (regex.test(lower)) {
                topics.forEach(t => found.add(t));
            }
        }

        return Array.from(found);
    }

    extractKeywords(text) {
        const lower = text.toLowerCase();
        const words = lower.split(/\s+/).filter(w => w.length > 3);
        const stopWords = new Set([
            'this', 'that', 'with', 'from', 'have', 'been', 'were', 'they',
            'their', 'what', 'when', 'where', 'which', 'while', 'about',
            'would', 'could', 'should', 'there', 'these', 'those', 'then',
            'than', 'them', 'very', 'just', 'also', 'some', 'into',
            'over', 'such', 'after', 'before', 'between', 'under', 'again',
            'further', 'once', 'here', 'does', 'each', 'every', 'both',
            'through', 'during', 'until', 'because', 'being', 'having',
            'doing', 'will', 'like', 'know', 'think', 'make', 'take',
            'come', 'well', 'back', 'only', 'long', 'much', 'still',
            'really', 'studied', 'today', 'understand', 'understanding',
            'realized', 'learned', 'learning', 'chapter'
        ]);

        const freq = {};
        words.forEach(w => {
            const clean = w.replace(/[^a-z]/g, '');
            if (clean.length > 3 && !stopWords.has(clean)) {
                freq[clean] = (freq[clean] || 0) + 1;
            }
        });

        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([word, count]) => ({ word, count }));
    }

    analyzeSentiment(text) {
        const lower = text.toLowerCase();
        let confusion = 0;
        let insight = 0;
        let contradiction = 0;

        ANALYSIS_PROMPTS.confusion_indicators.forEach(ind => {
            if (lower.includes(ind)) confusion++;
        });

        ANALYSIS_PROMPTS.insight_indicators.forEach(ind => {
            if (lower.includes(ind)) insight++;
        });

        ANALYSIS_PROMPTS.contradiction_indicators.forEach(ind => {
            if (lower.includes(ind)) contradiction++;
        });

        return { confusion, insight, contradiction };
    }

    classifyThinking(text) {
        const lower = text.toLowerCase();
        const types = [];

        const deepCount = ANALYSIS_PROMPTS.deep_thinking_indicators.filter(
            ind => lower.includes(ind)
        ).length;

        if (deepCount >= 3) types.push('analytical');
        if (ANALYSIS_PROMPTS.confusion_indicators.some(ind => lower.includes(ind))) types.push('questioning');
        if (ANALYSIS_PROMPTS.insight_indicators.some(ind => lower.includes(ind))) types.push('insightful');
        if (ANALYSIS_PROMPTS.contradiction_indicators.some(ind => lower.includes(ind))) types.push('self-correcting');

        if (types.length === 0) types.push('descriptive');

        return types;
    }

    // ---- Pattern Detection ----

    getConceptClusters() {
        const coOccurrence = {};

        this.thoughts.forEach(thought => {
            const topics = thought.topics || [];
            for (let i = 0; i < topics.length; i++) {
                for (let j = i + 1; j < topics.length; j++) {
                    const key = [topics[i], topics[j]].sort().join('↔');
                    coOccurrence[key] = (coOccurrence[key] || 0) + 1;
                }
            }
        });

        return Object.entries(coOccurrence)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([pair, count]) => {
                const [a, b] = pair.split('↔');
                return { topicA: a, topicB: b, count };
            });
    }

    getTopicFrequency() {
        const freq = {};
        this.thoughts.forEach(thought => {
            (thought.topics || []).forEach(topic => {
                freq[topic] = (freq[topic] || 0) + 1;
            });
        });
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .map(([topic, count]) => ({ topic, count }));
    }

    getRecurringThemes() {
        const freq = this.getTopicFrequency();
        return freq.filter(f => f.count >= 2).slice(0, 10);
    }

    getTrendsByDate(days = 7) {
        const now = Date.now();
        const msPerDay = 86400000;
        const trends = {};

        for (let i = days - 1; i >= 0; i--) {
            const dayStart = now - (i * msPerDay);
            const dayEnd = dayStart + msPerDay;
            const dateKey = new Date(dayStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

            const dayThoughts = this.thoughts.filter(
                t => t.timestamp >= dayStart && t.timestamp < dayEnd
            );

            const subjects = {};
            dayThoughts.forEach(t => {
                subjects[t.subject] = (subjects[t.subject] || 0) + 1;
            });

            trends[dateKey] = subjects;
        }

        return trends;
    }

    findContradictions() {
        const contradictions = [];

        const topicThoughts = {};
        this.thoughts.forEach(thought => {
            (thought.topics || []).forEach(topic => {
                if (!topicThoughts[topic]) topicThoughts[topic] = [];
                topicThoughts[topic].push(thought);
            });
        });

        for (const [topic, thoughts] of Object.entries(topicThoughts)) {
            if (thoughts.length < 2) continue;

            for (let i = 0; i < thoughts.length; i++) {
                for (let j = i + 1; j < thoughts.length; j++) {
                    const a = thoughts[i];
                    const b = thoughts[j];

                    const confDiff = Math.abs(a.confidence - b.confidence);
                    const aHasInsight = a.sentiment?.insight > 0;
                    const bHasConfusion = b.sentiment?.confusion > 0;
                    const aHasConfusion = a.sentiment?.confusion > 0;
                    const bHasInsight = b.sentiment?.insight > 0;
                    const hasContradictionWords = a.sentiment?.contradiction > 0 || b.sentiment?.contradiction > 0;

                    if ((confDiff >= 3) || (aHasInsight && bHasConfusion) || (aHasConfusion && bHasInsight) || hasContradictionWords) {
                        const severity = confDiff >= 4 || hasContradictionWords ? 'high' :
                            confDiff >= 3 ? 'medium' : 'low';

                        const key = [a.id, b.id].sort().join('-');
                        if (!contradictions.find(c => c.key === key)) {
                            contradictions.push({
                                key, topic,
                                thoughtA: a, thoughtB: b,
                                severity,
                                reason: hasContradictionWords ? 'Conflicting statements detected' :
                                    confDiff >= 3 ? 'Significant confidence shift on same topic' :
                                        'Mixed understanding signals'
                            });
                        }
                    }
                }
            }
        }

        const severityOrder = { high: 0, medium: 1, low: 2 };
        return contradictions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }

    // ==================================================================
    // CONTRADICTION ENGINE — Behavioral Pattern Analysis
    // Reads across ALL dumps to find what the student's data contradicts
    // ==================================================================

    getContradictionInsights() {
        const insights = [];
        if (this.thoughts.length < 2) return insights;

        // 1. FALSE CONFIDENCE — Topics they said they "got" but kept struggling with
        this._findFalseConfidence(insights);

        // 2. COMFORT ZONE LOOP — Topics they keep revisiting vs topics they avoid
        this._findComfortZoneLoop(insights);

        // 3. FOCUS TIME MISMATCH — When they study best vs when they actually study
        this._findFocusTimeMismatch(insights);

        // 4. DECLINING ENGAGEMENT — Topics where depth is dropping over time
        this._findDecliningEngagement(insights);

        // 5. EMOTIONAL PATTERNS — Stress/burnout signals that repeat
        this._findEmotionalPatterns(insights);

        // 6. METHOD CONTRADICTION — Using passive methods on topics they struggle with
        this._findMethodContradiction(insights);

        // 7. ONE-AND-DONE — Topics touched once and abandoned
        this._findOneAndDone(insights);

        // 8. TEXT CONTRADICTIONS — Direct statement conflicts
        this._findTextContradictions(insights);

        // Sort: critical first, then by specificity
        const typeOrder = { critical: 0, warning: 1, insight: 2, info: 3 };
        return insights.sort((a, b) => (typeOrder[a.type] || 3) - (typeOrder[b.type] || 3));
    }

    // ---- Insight 1: FALSE CONFIDENCE ----
    // "You said you understood Thermodynamics on Mar 5, but you've been confused about it 3 more times since."
    _findFalseConfidence(insights) {
        const topicHistory = {};

        // Build chronological history per topic
        const sorted = [...this.thoughts].sort((a, b) => a.timestamp - b.timestamp);
        sorted.forEach(thought => {
            (thought.topics || []).forEach(topic => {
                if (!topicHistory[topic]) topicHistory[topic] = [];
                topicHistory[topic].push({
                    confidence: thought.confidence,
                    confusion: thought.sentiment?.confusion || 0,
                    insight: thought.sentiment?.insight || 0,
                    date: thought.timestamp,
                    dayKey: thought.dayKey,
                    text: thought.text.substring(0, 80)
                });
            });
        });

        for (const [topic, history] of Object.entries(topicHistory)) {
            if (history.length < 2) continue;

            // Find cases where an early entry had high confidence, but later entries show confusion
            for (let i = 0; i < history.length - 1; i++) {
                const early = history[i];
                if (early.confidence < 4) continue; // needs high confidence initially

                const laterStruggles = history.slice(i + 1).filter(h => h.confusion > 0 || h.confidence <= 2);
                if (laterStruggles.length >= 1) {
                    const earlyDate = new Date(early.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    insights.push({
                        type: 'critical',
                        icon: '🎭',
                        title: `"I get ${topic}" — but do you?`,
                        body: `You felt confident about ${topic} on ${earlyDate}, but showed signs of confusion ${laterStruggles.length} time${laterStruggles.length > 1 ? 's' : ''} after that. Real understanding doesn't keep breaking down.`,
                        evidence: `Confidence on ${earlyDate}: ${early.confidence}/5 → Later confusion signals: ${laterStruggles.length}`,
                        topic
                    });
                    break; // one insight per topic
                }
            }
        }
    }

    // ---- Insight 2: COMFORT ZONE LOOP ----
    // "You've dumped about Kinematics 8 times but never touched Magnetism."
    _findComfortZoneLoop(insights) {
        const topicFreq = {};
        this.thoughts.forEach(t => {
            (t.topics || []).forEach(topic => {
                topicFreq[topic] = (topicFreq[topic] || 0) + 1;
            });
        });

        const sorted = Object.entries(topicFreq).sort((a, b) => b[1] - a[1]);
        if (sorted.length < 3) return;

        const top3 = sorted.slice(0, 3);
        const totalDumps = this.thoughts.length;
        const topFocusPercent = Math.round(((top3.reduce((s, [, c]) => s + c, 0)) / Math.max(1, Object.values(topicFreq).reduce((s, c) => s + c, 0))) * 100);

        if (topFocusPercent > 60 && sorted.length >= 5) {
            const avoided = sorted.slice(-3).map(([t]) => t).join(', ');
            insights.push({
                type: 'warning',
                icon: '🔁',
                title: 'Comfort zone on repeat',
                body: `${topFocusPercent}% of your thinking revolves around ${top3.map(([t]) => t).join(', ')}. Meanwhile, ${avoided} barely get attention. You're circling what's familiar, not what needs work.`,
                evidence: `Top topics: ${top3.map(([t, c]) => `${t} (${c}x)`).join(', ')}`,
                topic: null
            });
        }
    }

    // ---- Insight 3: FOCUS TIME MISMATCH ----
    // "Your sharpest dumps happen at 10 PM but you most often study at 3 PM"
    _findFocusTimeMismatch(insights) {
        if (this.thoughts.length < 5) return;

        const hourFocus = {};
        const hourCount = {};

        this.thoughts.forEach(t => {
            const hour = new Date(t.timestamp).getHours();
            const focusScore = t.focusQuality?.score || 50;
            hourFocus[hour] = (hourFocus[hour] || 0) + focusScore;
            hourCount[hour] = (hourCount[hour] || 0) + 1;
        });

        // Average focus per hour
        const hourAvgFocus = {};
        for (const [h, total] of Object.entries(hourFocus)) {
            hourAvgFocus[h] = Math.round(total / hourCount[h]);
        }

        // Most frequent study hour
        const mostFreqHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0];
        // Highest focus hour  
        const bestFocusHour = Object.entries(hourAvgFocus).sort((a, b) => b[1] - a[1])[0];

        if (mostFreqHour && bestFocusHour && mostFreqHour[0] !== bestFocusHour[0]) {
            const freqH = parseInt(mostFreqHour[0]);
            const bestH = parseInt(bestFocusHour[0]);
            const formatHour = h => {
                const ampm = h >= 12 ? 'PM' : 'AM';
                return `${h % 12 || 12} ${ampm}`;
            };

            if (Math.abs(hourAvgFocus[bestH] - hourAvgFocus[freqH]) > 10) {
                insights.push({
                    type: 'warning',
                    icon: '⏰',
                    title: 'You study at the wrong time',
                    body: `You most often dump around ${formatHour(freqH)}, but your sharpest thinking happens around ${formatHour(bestH)} (focus: ${hourAvgFocus[bestH]}/100 vs ${hourAvgFocus[freqH]}/100). You're wasting your peak hours.`,
                    evidence: `Most frequent: ${formatHour(freqH)} (${mostFreqHour[1]} dumps) · Best focus: ${formatHour(bestH)} (avg ${hourAvgFocus[bestH]}/100)`,
                    topic: null
                });
            }
        }
    }

    // ---- Insight 4: DECLINING ENGAGEMENT ----
    // "Your Physics dumps are getting shorter. 180 words → 60 words over 5 sessions."
    _findDecliningEngagement(insights) {
        const subjectHistory = {};

        const sorted = [...this.thoughts].sort((a, b) => a.timestamp - b.timestamp);
        sorted.forEach(t => {
            if (!subjectHistory[t.subject]) subjectHistory[t.subject] = [];
            subjectHistory[t.subject].push({
                wordCount: t.wordCount,
                date: t.timestamp,
                focusScore: t.focusQuality?.score || 50
            });
        });

        for (const [subject, history] of Object.entries(subjectHistory)) {
            if (history.length < 3) continue;

            const firstHalf = history.slice(0, Math.ceil(history.length / 2));
            const secondHalf = history.slice(Math.ceil(history.length / 2));

            const avgFirst = Math.round(firstHalf.reduce((s, h) => s + h.wordCount, 0) / firstHalf.length);
            const avgSecond = Math.round(secondHalf.reduce((s, h) => s + h.wordCount, 0) / secondHalf.length);

            if (avgFirst > 60 && avgSecond < avgFirst * 0.5) {
                const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
                insights.push({
                    type: 'warning',
                    icon: '📉',
                    title: `${subjectName} is losing you`,
                    body: `Your ${subjectName} dumps went from avg ${avgFirst} words down to ${avgSecond}. You're either losing interest or avoiding depth. Either way, it's showing.`,
                    evidence: `First ${firstHalf.length} dumps: ~${avgFirst} words → Last ${secondHalf.length} dumps: ~${avgSecond} words`,
                    topic: null
                });
            }
        }
    }

    // ---- Insight 5: EMOTIONAL PATTERNS ----
    // "You've mentioned being stressed in 4 of your last 7 dumps."
    _findEmotionalPatterns(insights) {
        const recentCount = Math.min(this.thoughts.length, 10);
        const recent = this.thoughts.slice(0, recentCount);

        let stressCount = 0;
        let burnoutCount = 0;
        let lowFocusStreak = 0;

        recent.forEach(t => {
            const habits = t.habits || [];
            if (habits.some(h => h.label === 'pressure/stress')) stressCount++;
            if (habits.some(h => h.label === 'burnt out')) burnoutCount++;
            if ((t.focusQuality?.score || 50) < 35) lowFocusStreak++;
        });

        if (stressCount >= 3) {
            insights.push({
                type: 'critical',
                icon: '🫠',
                title: "You're running on stress, not strategy",
                body: `${stressCount} of your last ${recentCount} dumps mention stress or pressure. Anxiety doesn't equal productivity. If every session feels like a fire drill, the system is broken, not you.`,
                evidence: `Stress detected in ${stressCount}/${recentCount} recent dumps`,
                topic: null
            });
        }

        if (burnoutCount >= 2) {
            insights.push({
                type: 'critical',
                icon: '🔥',
                title: 'Burnout is not a badge of honour',
                body: `You've mentioned exhaustion or burnout in ${burnoutCount} recent dumps. Diminishing returns are real. A rest day might add more to your prep than another 5-hour grind.`,
                evidence: `Burnout signals: ${burnoutCount}/${recentCount} dumps`,
                topic: null
            });
        }

        if (lowFocusStreak >= 4) {
            insights.push({
                type: 'warning',
                icon: '😶‍🌫️',
                title: 'Your focus has been consistently low',
                body: `${lowFocusStreak} of your last ${recentCount} sessions had focus scores below 35/100. Sitting at your desk isn't the same as studying. Something's off — sleep, environment, or motivation.`,
                evidence: `Low focus (<35): ${lowFocusStreak}/${recentCount} recent sessions`,
                topic: null
            });
        }
    }

    // ---- Insight 6: METHOD CONTRADICTION ----
    // "You keep passively reading topics you're confused about. Try active recall."
    _findMethodContradiction(insights) {
        let passiveOnHardTopics = 0;
        const examples = [];

        this.thoughts.forEach(t => {
            const habits = t.habits || [];
            const isPassive = habits.some(h => h.label === 'passive reading');
            const isConfused = (t.sentiment?.confusion || 0) > 0 || t.confidence <= 2;

            if (isPassive && isConfused) {
                passiveOnHardTopics++;
                if (examples.length < 2) {
                    examples.push((t.topics || [])[0] || t.subject);
                }
            }
        });

        if (passiveOnHardTopics >= 2) {
            insights.push({
                type: 'insight',
                icon: '📖',
                title: "You're reading, not learning",
                body: `In ${passiveOnHardTopics} dump${passiveOnHardTopics > 1 ? 's' : ''}, you mentioned passive reading on topics you're struggling with${examples.length > 0 ? ` (${examples.join(', ')})` : ''}. Reading the same notes twice doesn't fix confusion. Try solving problems or explaining it out loud.`,
                evidence: `Passive + confused: ${passiveOnHardTopics} sessions`,
                topic: null
            });
        }
    }

    // ---- Insight 7: ONE-AND-DONE ----
    // "You studied Optics once (Mar 3) and never came back."
    _findOneAndDone(insights) {
        if (this.thoughts.length < 5) return; // Need enough data

        const topicDates = {};
        this.thoughts.forEach(t => {
            (t.topics || []).forEach(topic => {
                if (!topicDates[topic]) topicDates[topic] = new Set();
                topicDates[topic].add(t.dayKey);
            });
        });

        const daySpan = this._getDaySpan();
        if (daySpan < 3) return; // Need a few days of data

        const abandoned = [];
        for (const [topic, days] of Object.entries(topicDates)) {
            if (days.size === 1) {
                const dayStr = [...days][0];
                const dayDate = new Date(dayStr);
                const daysSince = Math.floor((Date.now() - dayDate.getTime()) / 86400000);
                if (daysSince >= 3) {
                    abandoned.push({ topic, date: dayStr, daysSince });
                }
            }
        }

        if (abandoned.length >= 3) {
            const topExamples = abandoned.slice(0, 4).map(a => a.topic).join(', ');
            insights.push({
                type: 'insight',
                icon: '👻',
                title: `${abandoned.length} topics touched once and ghosted`,
                body: `${topExamples} — you studied each exactly once and never returned. If they matter for your exam, one look isn't enough. If they don't, stop worrying about them.`,
                evidence: `Single-day topics: ${abandoned.length} (of ${Object.keys(topicDates).length} total)`,
                topic: null
            });
        }
    }

    // ---- Insight 8: TEXT CONTRADICTIONS ----
    // Direct statement conflicts across dumps
    _findTextContradictions(insights) {
        const contradictions = this.findContradictions();
        if (contradictions.length === 0) return;

        contradictions.slice(0, 3).forEach(c => {
            const dateA = new Date(c.thoughtA.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            const dateB = new Date(c.thoughtB.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

            insights.push({
                type: 'info',
                icon: '⚡',
                title: `Conflicting signals on ${c.topic}`,
                body: `Your dumps from ${dateA} and ${dateB} say different things about ${c.topic}. One shows understanding, the other confusion. Which version is true right now?`,
                evidence: c.reason,
                topic: c.topic,
                quotes: {
                    a: { text: c.thoughtA.text.substring(0, 100), date: dateA, confidence: c.thoughtA.confidence },
                    b: { text: c.thoughtB.text.substring(0, 100), date: dateB, confidence: c.thoughtB.confidence }
                }
            });
        });
    }

    // Utility: how many days of data we have
    _getDaySpan() {
        if (this.thoughts.length < 2) return 0;
        const sorted = [...this.thoughts].sort((a, b) => a.timestamp - b.timestamp);
        return Math.floor((sorted[sorted.length - 1].timestamp - sorted[0].timestamp) / 86400000) + 1;
    }

    // ---- Blind Spot Analysis ----

    getBlindSpots(exam) {
        const syllabus = EXAM_SYLLABI[exam];
        if (!syllabus) return { covered: [], weak: [], critical: [] };

        const examThoughts = this.thoughts.filter(t => t.exam === exam || !t.exam);
        const topicMentions = {};

        examThoughts.forEach(thought => {
            (thought.topics || []).forEach(topic => {
                topicMentions[topic] = (topicMentions[topic] || 0) + 1;
            });
        });

        const covered = [];
        const weak = [];
        const critical = [];

        for (const [subject, data] of Object.entries(syllabus.subjects)) {
            data.topics.forEach(topic => {
                const count = topicMentions[topic] || 0;
                const entry = { topic, subject, count, icon: data.icon };

                if (count >= 3) covered.push(entry);
                else if (count >= 1) weak.push(entry);
                else critical.push(entry);
            });
        }

        return { covered, weak, critical };
    }

    getHeatmapData(exam) {
        const syllabus = EXAM_SYLLABI[exam];
        if (!syllabus) return {};

        const topicMentions = {};
        this.thoughts.forEach(thought => {
            (thought.topics || []).forEach(topic => {
                topicMentions[topic] = (topicMentions[topic] || 0) + 1;
            });
        });

        const result = {};
        for (const [subject, data] of Object.entries(syllabus.subjects)) {
            result[subject] = {
                icon: data.icon,
                topics: data.topics.map(topic => ({
                    name: topic,
                    mentions: topicMentions[topic] || 0,
                    heatLevel: this.getHeatLevel(topicMentions[topic] || 0)
                }))
            };
        }

        return result;
    }

    getHeatLevel(mentions) {
        if (mentions === 0) return 0;
        if (mentions === 1) return 1;
        if (mentions <= 3) return 2;
        if (mentions <= 6) return 3;
        return 4;
    }

    // ---- Insights & Stats ----

    getThinkingScore() {
        if (this.thoughts.length === 0) return { total: 0, depth: 0, breadth: 0, consistency: 0, critical: 0 };

        const avgWords = this.thoughts.reduce((sum, t) => sum + t.wordCount, 0) / this.thoughts.length;
        const depth = Math.min(100, (avgWords / 150) * 100);

        const uniqueTopics = new Set();
        this.thoughts.forEach(t => (t.topics || []).forEach(topic => uniqueTopics.add(topic)));
        const breadth = Math.min(100, (uniqueTopics.size / 20) * 100);

        const now = Date.now();
        const msPerDay = 86400000;
        let daysWithDumps = 0;
        for (let i = 0; i < 7; i++) {
            const dayStart = now - (i * msPerDay);
            const dayEnd = dayStart + msPerDay;
            if (this.thoughts.some(t => t.timestamp >= dayStart && t.timestamp < dayEnd)) {
                daysWithDumps++;
            }
        }
        const consistency = (daysWithDumps / 7) * 100;

        const criticalCount = this.thoughts.filter(t =>
            (t.thinkingType || []).some(type => ['analytical', 'self-correcting', 'questioning'].includes(type))
        ).length;
        const critical = Math.min(100, (criticalCount / Math.max(1, this.thoughts.length)) * 100);

        const total = Math.round((depth * 0.25 + breadth * 0.25 + consistency * 0.25 + critical * 0.25));

        return {
            total: Math.min(100, total),
            depth: Math.round(depth),
            breadth: Math.round(breadth),
            consistency: Math.round(consistency),
            critical: Math.round(critical)
        };
    }

    getActivityData(weeks = 4) {
        const now = Date.now();
        const msPerDay = 86400000;
        const cells = [];

        for (let i = weeks * 7 - 1; i >= 0; i--) {
            const dayStart = now - (i * msPerDay);
            const dayEnd = dayStart + msPerDay;
            const count = this.thoughts.filter(
                t => t.timestamp >= dayStart && t.timestamp < dayEnd
            ).length;

            cells.push({
                date: new Date(dayStart).toLocaleDateString(),
                count,
                level: count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4
            });
        }

        return cells;
    }

    getBestThinkingTime() {
        if (this.thoughts.length < 3) return null;

        const hourCounts = {};
        this.thoughts.forEach(t => {
            const hour = new Date(t.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const bestHour = Object.entries(hourCounts)
            .sort((a, b) => b[1] - a[1])[0];

        if (!bestHour) return null;

        const hour = parseInt(bestHour[0]);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:00 ${ampm}`;
    }

    getSubjectDistribution() {
        const dist = {};
        this.thoughts.forEach(t => {
            dist[t.subject] = (dist[t.subject] || 0) + 1;
        });

        const total = this.thoughts.length || 1;
        return Object.entries(dist).map(([subject, count]) => ({
            subject,
            count,
            percent: Math.round((count / total) * 100)
        })).sort((a, b) => b.count - a.count);
    }

    getStreak() {
        if (this.thoughts.length === 0) return 0;

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const msPerDay = 86400000;
        let streak = 0;

        const todayStart = now.getTime();
        const todayEnd = todayStart + msPerDay;
        const hasToday = this.thoughts.some(t => t.timestamp >= todayStart && t.timestamp < todayEnd);

        if (!hasToday) {
            const yesterdayStart = todayStart - msPerDay;
            const hasYesterday = this.thoughts.some(t => t.timestamp >= yesterdayStart && t.timestamp < todayStart);
            if (!hasYesterday) return 0;
        }

        for (let i = 0; i < 365; i++) {
            const dayStart = todayStart - (i * msPerDay);
            const dayEnd = dayStart + msPerDay;
            const hasDump = this.thoughts.some(t => t.timestamp >= dayStart && t.timestamp < dayEnd);
            if (hasDump) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return streak;
    }

    getDumpStats() {
        const totalDumps = this.thoughts.length;
        const totalWords = this.thoughts.reduce((sum, t) => sum + t.wordCount, 0);
        const avgConfidence = totalDumps > 0
            ? (this.thoughts.reduce((sum, t) => sum + t.confidence, 0) / totalDumps).toFixed(1)
            : '–';

        return { totalDumps, totalWords, avgConfidence };
    }

    // Quick analysis shown after a dump — now with auto-extracted data
    getQuickInsights(thought) {
        const insights = [];

        // Auto-detected subject
        insights.push({
            label: 'Subject Detected',
            value: thought.subject.charAt(0).toUpperCase() + thought.subject.slice(1),
            icon: EXAM_SYLLABI[thought.exam]?.subjects[thought.subject]?.icon || '📚'
        });

        // Topics detected
        if (thought.topics.length > 0) {
            insights.push({
                label: 'Topics Found',
                value: thought.topics.slice(0, 5).join(', '),
                icon: '📌'
            });
        }

        // Auto-detected confidence
        const confLabels = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' };
        const confEmojis = { 1: '😰', 2: '🤔', 3: '🤷', 4: '😊', 5: '💪' };
        insights.push({
            label: 'Confidence Level',
            value: `${confEmojis[thought.confidence]} ${confLabels[thought.confidence]}`,
            icon: '🎯'
        });

        // Focus quality
        if (thought.focusQuality) {
            insights.push({
                label: 'Focus Quality',
                value: `${thought.focusQuality.label} (${thought.focusQuality.score}/100)`,
                icon: '🔍'
            });
        }

        // Habits detected
        if (thought.habits && thought.habits.length > 0) {
            insights.push({
                label: 'Habits Spotted',
                value: thought.habits.map(h => `${h.icon} ${h.label}`).join(', '),
                icon: '🔄'
            });
        }

        // Thinking style
        if (thought.thinkingType.length > 0) {
            insights.push({
                label: 'Thinking Style',
                value: thought.thinkingType.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', '),
                icon: '🧠'
            });
        }

        // Confusion/insight
        if (thought.sentiment.confusion > 0) {
            insights.push({
                label: 'Confusion Detected',
                value: `${thought.sentiment.confusion} signal(s) — revisit these areas`,
                icon: '🤔'
            });
        }

        if (thought.sentiment.insight > 0) {
            insights.push({
                label: 'Breakthrough Moments',
                value: `${thought.sentiment.insight} insight(s) found! 🎉`,
                icon: '💡'
            });
        }

        return insights;
    }

    // ==================================================================
    // WEEKLY HONEST REVIEW — blunt 7-day retrospective
    // ==================================================================

    generateWeeklyReview() {
        const now = Date.now();
        const msPerDay = 86400000;
        const weekAgo = now - (7 * msPerDay);

        const weekThoughts = this.thoughts.filter(t => t.timestamp >= weekAgo);
        const prevWeekThoughts = this.thoughts.filter(
            t => t.timestamp >= weekAgo - (7 * msPerDay) && t.timestamp < weekAgo
        );

        // The review object
        const review = {
            period: this._getWeekPeriodString(),
            hasData: weekThoughts.length > 0,
            stats: {},
            verdict: '',
            activeVsPassive: {},
            topicCoverage: [],
            focusReport: {},
            callouts: [],
            actionItem: ''
        };

        if (!review.hasData) {
            review.verdict = "You didn't write a single brain dump this week. Zero. That's not a gap — that's a decision.";
            review.callouts.push({
                type: 'critical',
                icon: '🚫',
                text: "No dumps this week. If you're studying without reflecting, you're memorizing without understanding. Start dumping, even 2 minutes after each session."
            });
            review.actionItem = "Write at least ONE brain dump tomorrow after studying. Just 3 sentences. That's the floor.";
            return review;
        }

        // ---- STATS ----
        const totalDumps = weekThoughts.length;
        const totalWords = weekThoughts.reduce((s, t) => s + t.wordCount, 0);
        const avgWords = Math.round(totalWords / totalDumps);
        const uniqueTopics = new Set();
        weekThoughts.forEach(t => (t.topics || []).forEach(topic => uniqueTopics.add(topic)));

        // Days active
        const activeDays = new Set(weekThoughts.map(t => t.dayKey)).size;

        // Avg confidence
        const avgConf = (weekThoughts.reduce((s, t) => s + t.confidence, 0) / totalDumps).toFixed(1);

        // Avg focus
        const avgFocus = Math.round(
            weekThoughts.reduce((s, t) => s + (t.focusQuality?.score || 50), 0) / totalDumps
        );

        // Comparison with previous week
        const prevDumps = prevWeekThoughts.length;
        const dumpDelta = totalDumps - prevDumps;

        review.stats = {
            totalDumps,
            totalWords,
            avgWords,
            uniqueTopics: uniqueTopics.size,
            activeDays,
            avgConfidence: parseFloat(avgConf),
            avgFocus,
            dumpDelta,
            prevDumps
        };

        // ---- ACTIVE vs PASSIVE ----
        let activeCount = 0;
        let passiveCount = 0;
        let mixedCount = 0;
        const activeMethods = ['active recall', 'problem solving', 'note making', 'revision'];
        const passiveMethods = ['passive reading', 'video learning'];

        weekThoughts.forEach(t => {
            const habits = (t.habits || []).map(h => h.label);
            const hasActive = habits.some(h => activeMethods.includes(h));
            const hasPassive = habits.some(h => passiveMethods.includes(h));

            if (hasActive && !hasPassive) activeCount++;
            else if (hasPassive && !hasActive) passiveCount++;
            else if (hasActive && hasPassive) mixedCount++;
            // If no method detected, we count it neutral
        });

        const methodDetected = activeCount + passiveCount + mixedCount;
        review.activeVsPassive = {
            active: activeCount,
            passive: passiveCount,
            mixed: mixedCount,
            undetected: totalDumps - methodDetected,
            activePercent: methodDetected > 0 ? Math.round((activeCount / methodDetected) * 100) : 0,
            passivePercent: methodDetected > 0 ? Math.round((passiveCount / methodDetected) * 100) : 0
        };

        // ---- TOPIC COVERAGE ----
        const topicFreq = {};
        weekThoughts.forEach(t => {
            (t.topics || []).forEach(topic => {
                topicFreq[topic] = (topicFreq[topic] || 0) + 1;
            });
        });
        review.topicCoverage = Object.entries(topicFreq)
            .sort((a, b) => b[1] - a[1])
            .map(([topic, count]) => ({ topic, count }));

        // ---- FOCUS REPORT ----
        const highFocus = weekThoughts.filter(t => (t.focusQuality?.score || 50) >= 65).length;
        const lowFocus = weekThoughts.filter(t => (t.focusQuality?.score || 50) < 35).length;
        const midFocus = totalDumps - highFocus - lowFocus;

        review.focusReport = {
            high: highFocus,
            mid: midFocus,
            low: lowFocus,
            avgScore: avgFocus,
            highPercent: Math.round((highFocus / totalDumps) * 100),
            lowPercent: Math.round((lowFocus / totalDumps) * 100)
        };

        // ---- THE VERDICT ---- (one-line summary)
        review.verdict = this._generateVerdict(review);

        // ---- CALLOUTS ---- (blunt observations)
        this._generateCallouts(review, weekThoughts, prevWeekThoughts);

        // ---- ACTION ITEM ----
        review.actionItem = this._generateActionItem(review);

        return review;
    }

    _getWeekPeriodString() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        const fmt = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return `${fmt(weekAgo)} — ${fmt(now)}`;
    }

    _generateVerdict(review) {
        const s = review.stats;
        const ap = review.activeVsPassive;
        const f = review.focusReport;

        if (s.activeDays <= 2) {
            return `${s.activeDays} active days out of 7. That's not a study week — that's a study weekend. Consistency beats intensity.`;
        }
        if (ap.passivePercent > 60) {
            return `Most of your week was passive study. You watched and read, but how much did you actually retain? Passive feels productive. It usually isn't.`;
        }
        if (f.lowPercent > 50) {
            return `Over half your sessions had low focus. You showed up, but your brain didn't. Fix the environment before you fix the syllabus.`;
        }
        if (s.avgConfidence >= 4 && f.avgScore >= 60 && s.activeDays >= 5) {
            return `Solid week. ${s.activeDays} days active, decent focus, and your confidence is holding. Now push into harder topics — comfort is where progress dies.`;
        }
        if (s.avgConfidence <= 2) {
            return `Your confidence stayed low all week. That either means you're tackling hard material (good) or you're stuck in a loop without progress (not good). Be honest about which one it is.`;
        }
        if (s.dumpDelta < 0) {
            return `You dumped ${Math.abs(s.dumpDelta)} fewer times than last week. The trend line is going down. Momentum is fragile — don't let it slip.`;
        }
        return `${s.totalDumps} dumps across ${s.activeDays} days. Average depth: ${s.avgWords} words. You showed up. The question is whether you showed up with intention.`;
    }

    _generateCallouts(review, weekThoughts, prevWeekThoughts) {
        const callouts = review.callouts;
        const s = review.stats;
        const ap = review.activeVsPassive;
        const f = review.focusReport;

        // 1. AVOIDANCE: Skipped days pattern
        if (s.activeDays <= 3) {
            const missingDays = 7 - s.activeDays;
            callouts.push({
                type: 'critical',
                icon: '🫥',
                text: `You skipped ${missingDays} days this week. Skipping one day is rest. Skipping ${missingDays} is avoidance. Even a 5-minute dump keeps the chain alive.`
            });
        }

        // 2. PASSIVE DOMINANCE
        if (ap.passive > ap.active && ap.passive >= 2) {
            callouts.push({
                type: 'warning',
                icon: '📺',
                text: `${ap.passive} of your sessions were passive (reading notes, watching videos) vs ${ap.active} active (problem solving, recall). Passive study has maybe 20% the retention of active practice. Flip that ratio.`
            });
        }

        // 3. SHALLOW DUMPS — short word counts suggesting surface-level engagement
        const shallowDumps = weekThoughts.filter(t => t.wordCount < 40).length;
        if (shallowDumps >= 3) {
            callouts.push({
                type: 'warning',
                icon: '🥱',
                text: `${shallowDumps} of your ${s.totalDumps} dumps were under 40 words. That's a check-in, not a brain dump. If you can't write 3 sentences about what you studied, did you actually study it?`
            });
        }

        // 4. STRESS/BURNOUT PATTERN
        let stressCount = 0;
        let burnoutCount = 0;
        weekThoughts.forEach(t => {
            const habits = (t.habits || []).map(h => h.label);
            if (habits.includes('pressure/stress')) stressCount++;
            if (habits.includes('burnt out')) burnoutCount++;
        });

        if (stressCount >= 3) {
            callouts.push({
                type: 'critical',
                icon: '😤',
                text: `Stress showed up in ${stressCount} of ${s.totalDumps} sessions this week. That's not a productive stress — that's a pattern. Step back and ask: am I studying smart, or just studying scared?`
            });
        }

        if (burnoutCount >= 2) {
            callouts.push({
                type: 'critical',
                icon: '🔥',
                text: `Burnout signals in ${burnoutCount} dumps. Your brain is telling you something. Take a real break — not a "break" where you scroll your phone for 10 minutes. A day off. Seriously.`
            });
        }

        // 5. MOCK TEST AVOIDANCE
        const mockMentions = weekThoughts.filter(t => {
            const lower = t.text.toLowerCase();
            return lower.includes('mock test') || lower.includes('practice test') || lower.includes('test series') || lower.includes('full test');
        }).length;

        const prevMockMentions = prevWeekThoughts.filter(t => {
            const lower = t.text.toLowerCase();
            return lower.includes('mock test') || lower.includes('practice test') || lower.includes('test series') || lower.includes('full test');
        }).length;

        if (mockMentions === 0 && s.totalDumps >= 3) {
            const weeksWithout = prevMockMentions === 0 ? '2 weeks' : 'this week';
            callouts.push({
                type: 'warning',
                icon: '📋',
                text: `Zero mock test mentions ${weeksWithout}. ${prevMockMentions === 0 ? 'This is avoidance, not strategy.' : "Mock tests are uncomfortable. That's exactly why you need them."} You can't improve your exam game without playing the game.`
            });
        }

        // 6. SAME TOPICS ON REPEAT
        if (review.topicCoverage.length >= 2) {
            const topTopics = review.topicCoverage.slice(0, 2);
            const topPercent = Math.round((topTopics.reduce((s, t) => s + t.count, 0) /
                review.topicCoverage.reduce((s, t) => s + t.count, 0)) * 100);

            if (topPercent > 70 && review.topicCoverage.length >= 4) {
                callouts.push({
                    type: 'insight',
                    icon: '🔁',
                    text: `${topPercent}% of your week was spent on ${topTopics.map(t => t.topic).join(' and ')}. Are these your weak areas or your comfort zone? If you already understand them, move on. Your exam won't only test what you're comfortable with.`
                });
            }
        }

        // 7. DECLINING WORD COUNT (less depth over the week)
        if (weekThoughts.length >= 4) {
            const sorted = [...weekThoughts].sort((a, b) => a.timestamp - b.timestamp);
            const firstHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
            const secondHalf = sorted.slice(Math.ceil(sorted.length / 2));
            const avgFirst = Math.round(firstHalf.reduce((s, t) => s + t.wordCount, 0) / firstHalf.length);
            const avgSecond = Math.round(secondHalf.reduce((s, t) => s + t.wordCount, 0) / secondHalf.length);

            if (avgFirst > 50 && avgSecond < avgFirst * 0.6) {
                callouts.push({
                    type: 'warning',
                    icon: '📉',
                    text: `Your dumps started the week at ~${avgFirst} words and dropped to ~${avgSecond} words. You lost steam. Was it fatigue, boredom, or something else? Name the cause so you can fix it next week.`
                });
            }
        }

        // 8. FOCUS INCONSISTENCY
        if (f.high > 0 && f.low > 0 && f.low >= f.high) {
            callouts.push({
                type: 'insight',
                icon: '🎯',
                text: `You had ${f.high} high-focus sessions and ${f.low} low-focus ones. You're capable of deep focus — you proved it. The question is: what was different on the good days? Sleep? Time of day? Environment? Find that pattern and replicate it.`
            });
        }

        // 9. LATE NIGHT PATTERN
        const lateNightDumps = weekThoughts.filter(t => {
            const hour = new Date(t.timestamp).getHours();
            return hour >= 23 || hour <= 4;
        }).length;

        if (lateNightDumps >= 3) {
            callouts.push({
                type: 'warning',
                icon: '🌙',
                text: `${lateNightDumps} dumps between 11 PM and 4 AM. Late-night study is rarely productive — your recall and reasoning drop by 20-40% after midnight. Try shifting to mornings for one week and compare.`
            });
        }

        // 10. POSITIVE — Give credit when earned
        if (s.activeDays >= 6 && ap.activePercent >= 50 && f.avgScore >= 55) {
            callouts.push({
                type: 'positive',
                icon: '💪',
                text: `Genuinely good week. ${s.activeDays} days active, majority active study, and decent focus. This is what consistency looks like. Don't celebrate by taking a week off — keep the machine running.`
            });
        }

        review.callouts = callouts;
    }

    _generateActionItem(review) {
        const ap = review.activeVsPassive;
        const s = review.stats;
        const f = review.focusReport;

        if (s.activeDays <= 3) {
            return "This week: Dump every single day. Even if it's 3 sentences. The goal isn't depth — it's continuity.";
        }
        if (ap.passivePercent > 50) {
            return "This week: For every chapter you read, solve at least 5 problems from it. No exceptions. Active practice > passive consumption.";
        }
        if (f.lowPercent > 40) {
            return "This week: Before each session, remove your phone from the room. Study in 25-minute blocks. Track whether focus improves.";
        }
        if (s.avgConfidence <= 2.5) {
            return "This week: Pick your weakest topic and spend 3 focused sessions on it. Write down what confuses you BEFORE watching any explanation. Then compare after.";
        }
        if (s.uniqueTopics <= 2 && s.totalDumps >= 3) {
            return "This week: Touch at least 4 different topics. You're drilling deep on one area while other syllabus sections rot. Balance matters.";
        }
        return "This week: Do one full-length mock test. No partial attempts. Time yourself properly. Then dump your thoughts about where you struggled.";
    }
}
