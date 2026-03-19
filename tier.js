// ===========================
// ThoughtStack — Tier System
// ===========================

const TIERS = {
    FREE: 'free',
    PRO: 'pro'
};

const TIER_CONFIG = {
    free: {
        name: 'Free',
        historyDays: 30,
        features: ['brain_dump', 'timeline', 'basic_patterns', 'blind_spots', 'basic_insights'],
        maxContradictionInsights: 2,
        price: 0
    },
    pro: {
        name: 'Pro',
        historyDays: Infinity,
        features: ['brain_dump', 'timeline', 'basic_patterns', 'blind_spots', 'basic_insights',
                   'weekly_review', 'full_contradictions', 'decision_clarifier', 'full_insights'],
        maxContradictionInsights: Infinity,
        price: 99
    }
};

const PRO_FEATURES = {
    weekly_review: {
        name: 'Weekly Honest Review',
        description: 'A blunt 7-day retrospective that separates real study from avoidance',
        icon: '📋'
    },
    full_contradictions: {
        name: 'Full Contradiction Engine',
        description: 'All behavioral insights, not just the top 2',
        icon: '🎭'
    },
    decision_clarifier: {
        name: 'Decision Clarifier',
        description: 'Dump a big decision and get 3 sharp questions to clarify your thinking',
        icon: '🔮'
    },
    full_insights: {
        name: 'Unlimited History & Insights',
        description: 'Access your complete thinking history with no 30-day cutoff',
        icon: '♾️'
    }
};

class TierManager {
    constructor() {
        this.tier = this.loadTier();
    }

    loadTier() {
        return localStorage.getItem('thoughtstack_tier') || TIERS.FREE;
    }

    saveTier(tier) {
        this.tier = tier;
        localStorage.setItem('thoughtstack_tier', tier);
    }

    isPro() {
        return this.tier === TIERS.PRO;
    }

    getTierName() {
        return TIER_CONFIG[this.tier].name;
    }

    getHistoryDays() {
        return TIER_CONFIG[this.tier].historyDays;
    }

    canAccess(feature) {
        return TIER_CONFIG[this.tier].features.includes(feature);
    }

    getMaxContradictionInsights() {
        return TIER_CONFIG[this.tier].maxContradictionInsights;
    }

    // Simulated upgrade — in production this would go through Razorpay
    activatePro() {
        this.saveTier(TIERS.PRO);
        return true;
    }

    deactivatePro() {
        this.saveTier(TIERS.FREE);
    }

    // Filter thoughts by tier history limit
    filterByTier(thoughts) {
        if (this.isPro()) return thoughts;
        const cutoff = Date.now() - (this.getHistoryDays() * 86400000);
        return thoughts.filter(t => t.timestamp >= cutoff);
    }
}

// ===========================
// Decision Clarifier Engine
// ===========================

class DecisionClarifier {

    // Patterns that detect decision types
    static DECISION_PATTERNS = {
        career: ['coaching', 'college', 'branch', 'stream', 'course', 'career', 'job', 'placement', 'iit', 'nit', 'aiims', 'admit', 'join'],
        exam_strategy: ['drop year', 'gap year', 'retake', 'attempt', 'another year', 'give up', 'quit', 'continue', 'switch exam', 'change exam'],
        study_method: ['self study', 'coaching class', 'online class', 'offline', 'study group', 'solo', 'tuition', 'mentor', 'teacher'],
        time_management: ['schedule', 'timetable', 'routine', 'balance', 'sleep', 'health', 'burnout', 'break', 'rest'],
        subject_choice: ['optional', 'elective', 'subject combination', 'which subject', 'drop subject', 'focus on'],
        personal: ['parents', 'family', 'pressure', 'expectation', 'friend', 'relationship', 'move', 'relocate', 'money', 'fees']
    };

    // Question banks per decision type
    static QUESTION_BANKS = {
        career: [
            "If this choice works out perfectly, what does your life look like in 3 years? Be specific — not just 'good'. What city, what role, what daily routine?",
            "Are you choosing this because YOU want it, or because someone else's definition of success includes it? Whose voice is loudest in your head right now?",
            "What's the worst realistic outcome of this choice? Not the catastrophic fantasy — the actual worst case. Can you live with it?",
            "If you remove the fear of disappointing others, does your answer change? Pay attention to that gap.",
            "What information are you missing that would make this decision obvious? Go get that information before deciding."
        ],
        exam_strategy: [
            "Be honest: is taking another attempt a strategic decision based on your preparation gaps, or is it fear of moving on? What specific evidence supports your choice?",
            "If you take another year, what will you do DIFFERENTLY? 'Study harder' is not a plan. Name 3 specific changes.",
            "What's the opportunity cost? One year of your life is not free. What else could you do with that year, and have you genuinely considered it?",
            "Look at your last 3 months of preparation objectively. Is the trend going up, flat, or down? The trend predicts the outcome better than hope does.",
            "If your best friend was in this exact situation, what would you tell them? Now ask yourself why you're not taking your own advice."
        ],
        study_method: [
            "Which method has ACTUALLY produced results for you in the past? Not which one feels productive — which one moved your test scores?",
            "Are you considering switching methods because the current one isn't working, or because it's uncomfortable? Effective study is supposed to be uncomfortable.",
            "What's your biggest bottleneck right now — understanding concepts, solving problems, or managing time? The right method depends on the right diagnosis.",
            "Can you try the new approach for exactly 2 weeks before committing? A small experiment beats a big gamble.",
            "Are you looking for a method, or are you looking for motivation? Those are very different problems with very different solutions."
        ],
        time_management: [
            "Track your actual time for 3 days (not what you plan, what actually happens). Where does the time really go? Numbers don't lie.",
            "What's the ONE thing you do that wastes the most time but feels productive? Social media disguised as 'research'? Reorganizing notes instead of solving problems?",
            "If you could only study for 4 hours tomorrow, which 4 hours would you choose and what would you study? That answer IS your priority list.",
            "Are you optimizing your schedule because you need to, or because planning feels like progress? At some point you have to stop planning and start doing.",
            "What's one thing you can eliminate this week (not add) that would free up 30 minutes daily? Subtraction is more powerful than addition."
        ],
        subject_choice: [
            "Which subject do you consistently score better in when tested cold (without recent revision)? That's a signal about natural aptitude.",
            "Are you choosing based on scoring potential or genuine interest? In a long exam prep, interest sustains effort more than strategy alone.",
            "Talk to 3 people who made the same choice you're considering. What surprised them? What do they wish they'd known?",
            "What does the data say? Look at past year cutoffs, scoring patterns, and effort-to-marks ratio. Let data argue with your gut feeling.",
            "If you could master one subject so deeply that it becomes effortless — which one would change your overall score the most?"
        ],
        personal: [
            "Separate what you can control from what you can't. Which parts of this situation are actually in your hands? Focus there and let go of the rest.",
            "Have you actually told the people involved how you feel, or are you assuming they know? Most pressure is unspoken and most expectations are assumed.",
            "What would 'good enough' look like here? Not perfect, not ideal — just acceptable. Sometimes the best decision is the one that's survivable, not optimal.",
            "Is this decision reversible? If yes, stop agonizing and try something. You can course-correct later. If no, take more time — and that's okay.",
            "Write down the decision you'd make if no one would judge you for it. That's probably the right answer."
        ],
        general: [
            "What are you afraid of? Name it specifically. Vague fear is paralyzing; named fear is manageable.",
            "If you had to decide in the next 60 seconds, what would you choose? Your gut reaction often knows more than your overthinking brain.",
            "What would you advise a stranger in this exact situation? Remove yourself from the emotion and think clearly.",
            "Are you overthinking this because the decision is genuinely complex, or because you're avoiding the discomfort of committing?",
            "What will matter in 5 years? In 10? If the answer is 'not much', you're overweighting this decision. Pick one and move."
        ]
    };

    static clarify(text) {
        const lower = text.toLowerCase();
        
        // Detect decision type
        let detectedTypes = [];
        for (const [type, keywords] of Object.entries(DecisionClarifier.DECISION_PATTERNS)) {
            const matches = keywords.filter(k => lower.includes(k)).length;
            if (matches > 0) {
                detectedTypes.push({ type, matches });
            }
        }

        // Sort by match count, pick top type
        detectedTypes.sort((a, b) => b.matches - a.matches);
        const primaryType = detectedTypes.length > 0 ? detectedTypes[0].type : 'general';
        const secondaryType = detectedTypes.length > 1 ? detectedTypes[1].type : 'general';

        // Pick 3 questions: 2 from primary, 1 from secondary (or general)
        const primaryBank = DecisionClarifier.QUESTION_BANKS[primaryType];
        const secondaryBank = DecisionClarifier.QUESTION_BANKS[secondaryType !== primaryType ? secondaryType : 'general'];

        // Shuffle and pick
        const shuffled1 = [...primaryBank].sort(() => Math.random() - 0.5);
        const shuffled2 = [...secondaryBank].sort(() => Math.random() - 0.5);

        const questions = [
            shuffled1[0],
            shuffled1[1],
            shuffled2[0]
        ];

        // Extract key themes from the text
        const wordCount = text.trim().split(/\s+/).length;
        const hasUrgency = /urgent|asap|tomorrow|deadline|last date|soon|running out/i.test(text);
        const hasConflict = /but|however|on the other hand|confused|torn|dilemma|can't decide/i.test(text);

        return {
            type: primaryType,
            typeName: primaryType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            questions,
            meta: {
                wordCount,
                hasUrgency,
                hasConflict,
                detectedTypes: detectedTypes.map(d => d.type)
            }
        };
    }
}
