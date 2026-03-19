// ===========================
// ThoughtStack — Exam Syllabus Data & Keyword Maps
// ===========================

const EXAM_SYLLABI = {
    JEE: {
        name: 'JEE (Mains + Advanced)',
        subjects: {
            physics: {
                icon: '⚡',
                topics: [
                    'Mechanics', 'Kinematics', 'Laws of Motion', 'Work Energy Power',
                    'Rotational Motion', 'Gravitation', 'Oscillations', 'Waves',
                    'Thermodynamics', 'Heat Transfer', 'Kinetic Theory',
                    'Electrostatics', 'Current Electricity', 'Magnetism',
                    'Electromagnetic Induction', 'AC Circuits', 'Electromagnetic Waves',
                    'Optics', 'Wave Optics', 'Modern Physics', 'Semiconductors',
                    'Atomic Structure', 'Nuclear Physics', 'Fluid Mechanics'
                ]
            },
            chemistry: {
                icon: '🧪',
                topics: [
                    'Atomic Structure', 'Chemical Bonding', 'States of Matter',
                    'Thermodynamics', 'Chemical Equilibrium', 'Ionic Equilibrium',
                    'Redox Reactions', 'Electrochemistry', 'Chemical Kinetics',
                    'Surface Chemistry', 'Periodic Table', 'Coordination Compounds',
                    's-Block Elements', 'p-Block Elements', 'd-Block Elements',
                    'Organic Chemistry Basics', 'Hydrocarbons', 'Haloalkanes',
                    'Alcohols Phenols Ethers', 'Aldehydes Ketones', 'Carboxylic Acids',
                    'Amines', 'Biomolecules', 'Polymers'
                ]
            },
            mathematics: {
                icon: '📐',
                topics: [
                    'Sets Relations Functions', 'Complex Numbers',
                    'Quadratic Equations', 'Sequences Series', 'Permutations Combinations',
                    'Binomial Theorem', 'Matrices Determinants', 'Limits Continuity',
                    'Differentiation', 'Integration', 'Differential Equations',
                    'Coordinate Geometry', 'Straight Lines', 'Circles',
                    'Conic Sections', 'Vectors', '3D Geometry',
                    'Probability', 'Statistics', 'Trigonometry',
                    'Mathematical Reasoning', 'Properties of Triangles'
                ]
            }
        }
    },
    NEET: {
        name: 'NEET',
        subjects: {
            physics: {
                icon: '⚡',
                topics: [
                    'Physical World', 'Units Measurements', 'Motion in Straight Line',
                    'Motion in Plane', 'Laws of Motion', 'Work Energy Power',
                    'System of Particles', 'Gravitation', 'Mechanical Properties',
                    'Thermal Properties', 'Thermodynamics', 'Kinetic Theory',
                    'Oscillations', 'Waves', 'Ray Optics', 'Wave Optics',
                    'Electric Charges', 'Electrostatic Potential', 'Current Electricity',
                    'Moving Charges Magnetism', 'Electromagnetic Induction',
                    'Alternating Current', 'Electromagnetic Waves',
                    'Dual Nature of Matter', 'Atoms', 'Nuclei', 'Semiconductors'
                ]
            },
            chemistry: {
                icon: '🧪',
                topics: [
                    'Some Basic Concepts', 'Atomic Structure', 'Classification of Elements',
                    'Chemical Bonding', 'States of Matter', 'Thermodynamics',
                    'Equilibrium', 'Redox Reactions', 'Hydrogen',
                    'p-Block Elements', 's-Block Elements', 'd-Block Elements',
                    'Coordination Compounds', 'Organic Chemistry',
                    'Hydrocarbons', 'Environmental Chemistry',
                    'Solid State', 'Solutions', 'Electrochemistry',
                    'Chemical Kinetics', 'Surface Chemistry',
                    'Haloalkanes Haloarenes', 'Alcohols Phenols',
                    'Aldehydes Ketones', 'Amines', 'Biomolecules'
                ]
            },
            biology: {
                icon: '🧬',
                topics: [
                    'The Living World', 'Biological Classification', 'Plant Kingdom',
                    'Animal Kingdom', 'Morphology of Flowering Plants',
                    'Anatomy of Flowering Plants', 'Cell Biology',
                    'Cell Division', 'Biomolecules', 'Transport in Plants',
                    'Mineral Nutrition', 'Photosynthesis', 'Respiration',
                    'Plant Growth', 'Digestion Absorption', 'Breathing',
                    'Body Fluids Circulation', 'Excretory Products',
                    'Locomotion Movement', 'Neural Control', 'Chemical Coordination',
                    'Reproduction in Organisms', 'Human Reproduction',
                    'Reproductive Health', 'Genetics', 'Molecular Basis of Inheritance',
                    'Evolution', 'Human Health Disease', 'Biotechnology',
                    'Organisms Populations', 'Ecosystem', 'Biodiversity'
                ]
            }
        }
    },
    UPSC: {
        name: 'UPSC CSE',
        subjects: {
            general: {
                icon: '📚',
                topics: [
                    'Indian History', 'Ancient India', 'Medieval India',
                    'Modern India', 'Indian National Movement', 'World History',
                    'Indian Geography', 'World Geography', 'Physical Geography',
                    'Indian Polity', 'Constitution', 'Governance',
                    'Indian Economy', 'Economic Development', 'Planning',
                    'Environment Ecology', 'Biodiversity', 'Climate Change',
                    'General Science', 'Current Affairs', 'International Relations',
                    'Art Culture', 'Society', 'Ethics Integrity',
                    'Disaster Management', 'Internal Security',
                    'Social Justice', 'Technology'
                ]
            }
        }
    },
    GATE: {
        name: 'GATE',
        subjects: {
            general: {
                icon: '⚙️',
                topics: [
                    'Engineering Mathematics', 'Linear Algebra', 'Calculus',
                    'Differential Equations', 'Complex Analysis', 'Probability',
                    'Numerical Methods', 'Digital Logic', 'Computer Organization',
                    'Data Structures', 'Algorithms', 'Theory of Computation',
                    'Compiler Design', 'Operating Systems', 'Databases',
                    'Computer Networks', 'Software Engineering',
                    'Discrete Mathematics', 'Graph Theory'
                ]
            }
        }
    },
    CAT: {
        name: 'CAT',
        subjects: {
            general: {
                icon: '📊',
                topics: [
                    'Quantitative Aptitude', 'Number System', 'Arithmetic',
                    'Algebra', 'Geometry', 'Mensuration', 'Trigonometry',
                    'Data Interpretation', 'Logical Reasoning', 'Puzzles',
                    'Seating Arrangement', 'Syllogisms', 'Blood Relations',
                    'Verbal Ability', 'Reading Comprehension', 'Para Jumbles',
                    'Sentence Correction', 'Critical Reasoning',
                    'Data Sufficiency', 'Set Theory'
                ]
            }
        }
    },
    CUSTOM: {
        name: 'Custom',
        subjects: {
            general: {
                icon: '✏️',
                topics: []
            }
        }
    }
};

// Keyword -> topic mapping for intelligent text analysis
const KEYWORD_TOPIC_MAP = {
    // Physics
    'velocity': ['Kinematics', 'Motion in Straight Line'],
    'acceleration': ['Kinematics', 'Motion in Straight Line', 'Laws of Motion'],
    'displacement': ['Kinematics', 'Motion in Straight Line'],
    'projectile': ['Kinematics', 'Motion in Plane'],
    'newton': ['Laws of Motion'],
    'friction': ['Laws of Motion'],
    'momentum': ['Laws of Motion', 'System of Particles'],
    'impulse': ['Laws of Motion'],
    'kinetic energy': ['Work Energy Power'],
    'potential energy': ['Work Energy Power'],
    'work done': ['Work Energy Power'],
    'power': ['Work Energy Power', 'AC Circuits'],
    'torque': ['Rotational Motion', 'System of Particles'],
    'angular momentum': ['Rotational Motion'],
    'moment of inertia': ['Rotational Motion'],
    'gravity': ['Gravitation'],
    'orbital': ['Gravitation', 'Atomic Structure'],
    'escape velocity': ['Gravitation'],
    'shm': ['Oscillations'],
    'simple harmonic': ['Oscillations'],
    'pendulum': ['Oscillations'],
    'spring': ['Oscillations'],
    'wave': ['Waves', 'Electromagnetic Waves', 'Wave Optics'],
    'frequency': ['Waves', 'Oscillations', 'AC Circuits'],
    'amplitude': ['Waves', 'Oscillations'],
    'sound': ['Waves'],
    'doppler': ['Waves'],
    'temperature': ['Thermodynamics', 'Thermal Properties', 'Heat Transfer'],
    'entropy': ['Thermodynamics'],
    'enthalpy': ['Thermodynamics'],
    'carnot': ['Thermodynamics'],
    'heat engine': ['Thermodynamics'],
    'conduction': ['Heat Transfer', 'Thermal Properties'],
    'convection': ['Heat Transfer', 'Thermal Properties'],
    'radiation': ['Heat Transfer', 'Electromagnetic Waves', 'Nuclear Physics'],
    'coulomb': ['Electrostatics', 'Electric Charges'],
    'electric field': ['Electrostatics', 'Electric Charges'],
    'gauss': ['Electrostatics'],
    'capacitor': ['Electrostatics', 'Electrostatic Potential'],
    'potential': ['Electrostatics', 'Electrostatic Potential'],
    'ohm': ['Current Electricity'],
    'resistance': ['Current Electricity'],
    'circuit': ['Current Electricity', 'AC Circuits'],
    'kirchhoff': ['Current Electricity'],
    'magnetic field': ['Magnetism', 'Moving Charges Magnetism'],
    'biot savart': ['Magnetism', 'Moving Charges Magnetism'],
    'ampere': ['Magnetism', 'Moving Charges Magnetism'],
    'faraday': ['Electromagnetic Induction', 'Electrochemistry'],
    'inductor': ['Electromagnetic Induction'],
    'inductance': ['Electromagnetic Induction'],
    'transformer': ['AC Circuits', 'Alternating Current'],
    'lens': ['Optics', 'Ray Optics'],
    'mirror': ['Optics', 'Ray Optics'],
    'refraction': ['Optics', 'Ray Optics'],
    'diffraction': ['Wave Optics'],
    'interference': ['Wave Optics'],
    'photoelectric': ['Modern Physics', 'Dual Nature of Matter'],
    'quantum': ['Modern Physics', 'Atomic Structure'],
    'bohr': ['Atomic Structure', 'Atoms'],
    'nucleus': ['Nuclear Physics', 'Nuclei'],
    'radioactive': ['Nuclear Physics', 'Nuclei'],
    'fission': ['Nuclear Physics', 'Nuclei'],
    'fusion': ['Nuclear Physics', 'Nuclei'],
    'diode': ['Semiconductors'],
    'transistor': ['Semiconductors'],
    'semiconductor': ['Semiconductors'],
    'bernoulli': ['Fluid Mechanics'],
    'viscosity': ['Fluid Mechanics', 'Mechanical Properties'],
    'buoyancy': ['Fluid Mechanics'],
    'pressure': ['Fluid Mechanics', 'Mechanical Properties', 'States of Matter'],
    
    // Chemistry
    'electron configuration': ['Atomic Structure'],
    'quantum number': ['Atomic Structure'],
    'orbital diagram': ['Atomic Structure'],
    'hybridization': ['Chemical Bonding'],
    'covalent': ['Chemical Bonding'],
    'ionic bond': ['Chemical Bonding'],
    'vsepr': ['Chemical Bonding'],
    'ideal gas': ['States of Matter', 'Kinetic Theory'],
    'van der waals': ['States of Matter'],
    'equilibrium constant': ['Chemical Equilibrium', 'Equilibrium'],
    'le chatelier': ['Chemical Equilibrium', 'Equilibrium'],
    'ph': ['Ionic Equilibrium', 'Equilibrium'],
    'buffer': ['Ionic Equilibrium', 'Equilibrium'],
    'oxidation': ['Redox Reactions'],
    'reduction': ['Redox Reactions'],
    'galvanic': ['Electrochemistry'],
    'electrolysis': ['Electrochemistry'],
    'nernst': ['Electrochemistry'],
    'rate': ['Chemical Kinetics'],
    'order of reaction': ['Chemical Kinetics'],
    'catalyst': ['Chemical Kinetics', 'Surface Chemistry'],
    'adsorption': ['Surface Chemistry'],
    'colloid': ['Surface Chemistry'],
    'periodic': ['Periodic Table', 'Classification of Elements'],
    'ionization energy': ['Periodic Table', 'Classification of Elements'],
    'electronegativity': ['Chemical Bonding', 'Periodic Table'],
    'coordination': ['Coordination Compounds'],
    'ligand': ['Coordination Compounds'],
    'isomer': ['Coordination Compounds', 'Organic Chemistry Basics'],
    'alkane': ['Hydrocarbons'],
    'alkene': ['Hydrocarbons'],
    'alkyne': ['Hydrocarbons'],
    'aromatic': ['Hydrocarbons'],
    'benzene': ['Hydrocarbons'],
    'halogen': ['Haloalkanes', 'Haloalkanes Haloarenes'],
    'alcohol': ['Alcohols Phenols Ethers', 'Alcohols Phenols'],
    'phenol': ['Alcohols Phenols Ethers', 'Alcohols Phenols'],
    'ether': ['Alcohols Phenols Ethers'],
    'aldehyde': ['Aldehydes Ketones'],
    'ketone': ['Aldehydes Ketones'],
    'carboxylic': ['Carboxylic Acids'],
    'amine': ['Amines'],
    'amino acid': ['Biomolecules'],
    'protein': ['Biomolecules'],
    'carbohydrate': ['Biomolecules'],
    'dna': ['Biomolecules', 'Molecular Basis of Inheritance'],
    'rna': ['Biomolecules', 'Molecular Basis of Inheritance'],
    'polymer': ['Polymers'],
    
    // Mathematics
    'set': ['Sets Relations Functions', 'Set Theory'],
    'function': ['Sets Relations Functions'],
    'complex number': ['Complex Numbers'],
    'quadratic': ['Quadratic Equations'],
    'arithmetic progression': ['Sequences Series'],
    'geometric progression': ['Sequences Series'],
    'permutation': ['Permutations Combinations'],
    'combination': ['Permutations Combinations'],
    'binomial': ['Binomial Theorem'],
    'matrix': ['Matrices Determinants'],
    'determinant': ['Matrices Determinants'],
    'limit': ['Limits Continuity'],
    'continuity': ['Limits Continuity'],
    'derivative': ['Differentiation'],
    'differentiation': ['Differentiation'],
    'integration': ['Integration'],
    'integral': ['Integration'],
    'differential equation': ['Differential Equations'],
    'coordinate': ['Coordinate Geometry'],
    'slope': ['Straight Lines', 'Coordinate Geometry'],
    'circle': ['Circles'],
    'parabola': ['Conic Sections'],
    'ellipse': ['Conic Sections'],
    'hyperbola': ['Conic Sections'],
    'vector': ['Vectors'],
    'dot product': ['Vectors'],
    'cross product': ['Vectors'],
    'probability': ['Probability'],
    'bayes': ['Probability'],
    'mean': ['Statistics'],
    'variance': ['Statistics'],
    'standard deviation': ['Statistics'],
    'trigonometry': ['Trigonometry'],
    'sine': ['Trigonometry'],
    'cosine': ['Trigonometry'],
    'tangent': ['Trigonometry'],
    
    // Biology
    'cell': ['Cell Biology'],
    'mitosis': ['Cell Division'],
    'meiosis': ['Cell Division'],
    'photosynthesis': ['Photosynthesis'],
    'chlorophyll': ['Photosynthesis'],
    'respiration': ['Respiration', 'Breathing'],
    'krebs cycle': ['Respiration'],
    'glycolysis': ['Respiration'],
    'gene': ['Genetics'],
    'mendel': ['Genetics'],
    'allele': ['Genetics'],
    'dominant': ['Genetics'],
    'recessive': ['Genetics'],
    'mutation': ['Genetics', 'Molecular Basis of Inheritance'],
    'evolution': ['Evolution'],
    'darwin': ['Evolution'],
    'natural selection': ['Evolution'],
    'ecosystem': ['Ecosystem'],
    'food chain': ['Ecosystem'],
    'biodiversity': ['Biodiversity'],
    'biotechnology': ['Biotechnology'],
    'pcr': ['Biotechnology'],
    'cloning': ['Biotechnology'],
    'vaccine': ['Human Health Disease'],
    'immunity': ['Human Health Disease'],
    'hormone': ['Chemical Coordination'],
    'neuron': ['Neural Control'],
    'synapse': ['Neural Control'],
    'digestion': ['Digestion Absorption'],
    'enzyme': ['Digestion Absorption', 'Biomolecules'],
    'kidney': ['Excretory Products'],
    'heart': ['Body Fluids Circulation'],
    'blood': ['Body Fluids Circulation'],
    
    // UPSC
    'constitution': ['Constitution', 'Indian Polity'],
    'fundamental rights': ['Constitution', 'Indian Polity'],
    'parliament': ['Indian Polity', 'Governance'],
    'supreme court': ['Indian Polity'],
    'gdp': ['Indian Economy'],
    'inflation': ['Indian Economy', 'Economic Development'],
    'fiscal policy': ['Indian Economy'],
    'monetary policy': ['Indian Economy'],
    'mughal': ['Medieval India'],
    'british': ['Modern India'],
    'independence': ['Indian National Movement'],
    'gandhi': ['Indian National Movement'],
    'monsoon': ['Indian Geography'],
    'river': ['Indian Geography', 'Physical Geography'],
    'climate': ['Climate Change', 'Physical Geography'],
    'ozone': ['Environment Ecology'],
    'deforestation': ['Environment Ecology', 'Biodiversity'],
    'pollution': ['Environment Ecology', 'Environmental Chemistry'],
    'election': ['Indian Polity', 'Governance'],
    'foreign policy': ['International Relations'],
    'united nations': ['International Relations'],
    'disaster': ['Disaster Management'],
    'terrorism': ['Internal Security'],
    'cyber security': ['Internal Security', 'Technology']
};

// Confidence labels
const CONFIDENCE_LABELS = {
    1: '😰 Very Low',
    2: '🤔 Low',
    3: '🤷 Moderate',
    4: '😊 High',
    5: '💪 Very High'
};

// Subject colors for charts
const SUBJECT_COLORS = {
    physics: '#6C5CE7',
    chemistry: '#00CEC9',
    mathematics: '#fd79a8',
    biology: '#00b894',
    general: '#fdcb6e'
};

// Thinking analysis prompts
const ANALYSIS_PROMPTS = {
    contradiction_indicators: [
        'but', 'however', 'although', 'contrary', 'opposite', 'wrong',
        'actually', 'not true', 'mistake', 'confused', 'contradiction',
        'doesn\'t make sense', 'wait', 'on second thought', 'i was wrong',
        'changed my mind', 'earlier i thought', 'now i think',
        'conflicting', 'paradox', 'inconsistent'
    ],
    confusion_indicators: [
        'confused', 'don\'t understand', 'unclear', 'makes no sense',
        'why does', 'how does', 'what if', 'not sure', 'doubt',
        'struggling', 'difficult', 'hard to grasp', 'tricky',
        'can\'t figure', 'stuck', 'need help', 'lost'
    ],
    insight_indicators: [
        'realized', 'understood', 'clicked', 'eureka', 'aha',
        'makes sense now', 'connected', 'pattern', 'finally',
        'interesting', 'discovered', 'figured out', 'key insight',
        'breakthrough', 'now i see', 'the trick is'
    ],
    deep_thinking_indicators: [
        'because', 'therefore', 'implies', 'leads to', 'consequence',
        'if then', 'relates to', 'analogous', 'similar to',
        'differs from', 'in contrast', 'compared to', 'root cause',
        'underlying', 'fundamental', 'principle', 'framework'
    ]
};
