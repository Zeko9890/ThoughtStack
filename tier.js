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
                   'weekly_review', 'full_contradictions', 'full_insights'],
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

