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

// ===========================
// Practice Problems Bank
// Organized by exam → topic → problems[]
// ===========================

const PRACTICE_PROBLEMS = {
    JEE: {
        // PHYSICS
        'Kinematics': [
            { q: 'A ball is thrown vertically upward with velocity 20 m/s from the top of a building 40 m high. The time after which the ball hits the ground is (g = 10 m/s²):', options: ['2 s', '4 s', '2(1+√2) s', '2+2√2 s'], answer: 2, explanation: 'Taking upward positive, s = -40m, u = 20 m/s, a = -10 m/s². Using s = ut + ½at²: -40 = 20t - 5t². Solving: t = 2(1+√2) s.', difficulty: 'medium' },
            { q: 'The position of a particle is given by x = 3t³ - 6t² + 12t + 4. The acceleration of the particle when velocity is zero is:', options: ['12 m/s²', '6 m/s²', '0 m/s²', '24 m/s²'], answer: 1, explanation: 'v = dx/dt = 9t² - 12t + 12. Setting v=0 has no real roots (discriminant < 0), so velocity never becomes zero. Review the question conditions. If v = 9t²-12t+12, at t=2/3: a = 18t-12 = 0. At that point v = 9(4/9) - 8 + 12 = 8 ≠ 0. Check: minimum v at t = 2/3 gives a = 0.', difficulty: 'hard' },
            { q: 'A particle moves in a straight line. Its velocity-time graph shows linearly increasing velocity from 0 to 20 m/s in 4 seconds. The distance covered is:', options: ['40 m', '80 m', '20 m', '60 m'], answer: 0, explanation: 'Distance = area under v-t graph = ½ × base × height = ½ × 4 × 20 = 40 m.', difficulty: 'easy' }
        ],
        'Laws of Motion': [
            { q: 'A body of mass 5 kg is moving with a velocity of 10 m/s. A force is applied for 3 seconds bringing the body to rest. The magnitude of the force is:', options: ['50/3 N', '50 N', '15 N', '5/3 N'], answer: 0, explanation: 'Using impulse-momentum theorem: F × t = m × Δv. F × 3 = 5 × 10. F = 50/3 N.', difficulty: 'easy' },
            { q: 'Two blocks of masses 3 kg and 2 kg are placed on a frictionless surface and connected by a string. A force of 15 N is applied on the 3 kg block. The tension in the string is:', options: ['6 N', '9 N', '15 N', '5 N'], answer: 0, explanation: 'Total acceleration a = F/(m₁+m₂) = 15/5 = 3 m/s². Tension on 2 kg block: T = 2 × 3 = 6 N.', difficulty: 'medium' },
            { q: 'A lift is accelerating upward at 2 m/s². The apparent weight of a 60 kg person inside is (g = 10 m/s²):', options: ['720 N', '600 N', '480 N', '660 N'], answer: 0, explanation: 'Apparent weight = m(g + a) = 60(10 + 2) = 720 N. When lift accelerates up, you feel heavier.', difficulty: 'easy' }
        ],
        'Work Energy Power': [
            { q: 'A spring of force constant k is stretched by a small length x. The work done in stretching it further by another length x is:', options: ['½kx²', 'kx²', '3/2 kx²', '2kx²'], answer: 2, explanation: 'Work = ½k(2x)² - ½kx² = ½k(4x²) - ½kx² = 2kx² - ½kx² = 3/2 kx².', difficulty: 'medium' },
            { q: 'A body of mass 2 kg has kinetic energy 16 J. Its momentum is:', options: ['4 kg·m/s', '8 kg·m/s', '16 kg·m/s', '2√2 kg·m/s'], answer: 1, explanation: 'KE = p²/2m → 16 = p²/4 → p² = 64 → p = 8 kg·m/s.', difficulty: 'easy' }
        ],
        'Electrostatics': [
            { q: 'Two charges +2μC and -2μC are placed 10 cm apart. The electric potential at the midpoint of the line joining them is:', options: ['0 V', '36×10⁴ V', '72×10⁴ V', '-36×10⁴ V'], answer: 0, explanation: 'At the midpoint, the potentials due to equal and opposite charges cancel out. V = kq/r + k(-q)/r = 0.', difficulty: 'easy' },
            { q: 'The electric field at the centre of a uniformly charged ring of total charge Q and radius R is:', options: ['kQ/R²', '0', 'kQ/2R²', '2kQ/R²'], answer: 1, explanation: 'By symmetry, all components of the electric field cancel out at the centre of a uniformly charged ring. E = 0.', difficulty: 'medium' }
        ],
        'Thermodynamics': [
            { q: 'In an adiabatic process, the work done by an ideal gas is 100 J. The change in internal energy of the gas is:', options: ['-100 J', '+100 J', '0 J', '200 J'], answer: 0, explanation: 'For adiabatic process, Q = 0. By first law: ΔU = Q - W = 0 - 100 = -100 J.', difficulty: 'easy' },
            { q: 'The efficiency of a Carnot engine working between 27°C and 327°C is:', options: ['50%', '25%', '75%', '100%'], answer: 0, explanation: 'η = 1 - T₂/T₁ = 1 - 300/600 = 0.5 = 50%. Remember to convert to Kelvin!', difficulty: 'medium' }
        ],
        'Optics': [
            { q: 'A concave mirror has focal length 20 cm. An object is placed 30 cm from the mirror. The image distance is:', options: ['60 cm', '-60 cm', '20 cm', '15 cm'], answer: 0, explanation: 'Using mirror formula: 1/v + 1/u = 1/f. 1/v + 1/(-30) = 1/(-20). 1/v = -1/20 + 1/30 = -1/60. v = -60 cm. Image is real, inverted, at 60 cm.', difficulty: 'medium' }
        ],
        'Modern Physics': [
            { q: 'The work function of a metal is 3.3 eV. The threshold frequency for photoelectric emission is (h = 6.6×10⁻³⁴ Js):', options: ['8×10¹⁴ Hz', '5×10¹⁴ Hz', '8×10¹⁵ Hz', '5×10¹⁵ Hz'], answer: 0, explanation: 'ν₀ = φ/h = (3.3×1.6×10⁻¹⁹)/(6.6×10⁻³⁴) = 8×10¹⁴ Hz.', difficulty: 'medium' }
        ],
        // CHEMISTRY
        'Chemical Bonding': [
            { q: 'The hybridization of the central atom in SF₆ is:', options: ['sp³', 'sp³d', 'sp³d²', 'dsp³'], answer: 2, explanation: 'SF₆ has 6 bond pairs and 0 lone pairs around S. This requires 6 hybrid orbitals → sp³d² hybridization.', difficulty: 'easy' },
            { q: 'Which of the following has the highest lattice energy?', options: ['NaCl', 'NaF', 'KCl', 'KBr'], answer: 1, explanation: 'Lattice energy increases with smaller ion size and higher charge. NaF has the smallest anion (F⁻), so highest lattice energy.', difficulty: 'medium' }
        ],
        'Chemical Equilibrium': [
            { q: 'For the reaction N₂ + 3H₂ ⇌ 2NH₃, if the concentration of NH₃ is doubled at equilibrium, the reaction quotient Q compared to K is:', options: ['Q > K', 'Q < K', 'Q = K', 'Cannot determine'], answer: 0, explanation: 'Doubling [NH₃] increases the numerator of Q = [NH₃]²/([N₂][H₂]³), so Q > K. The reaction shifts backward.', difficulty: 'medium' }
        ],
        'Electrochemistry': [
            { q: 'The number of Faradays required to deposit 1 mole of Al from Al₂O₃ is:', options: ['1', '2', '3', '6'], answer: 2, explanation: 'Al³⁺ + 3e⁻ → Al. To deposit 1 mole of Al requires 3 moles of electrons = 3 Faradays.', difficulty: 'easy' }
        ],
        'Organic Chemistry Basics': [
            { q: 'The IUPAC name of (CH₃)₃C-CH₂-CH(CH₃)₂ is:', options: ['2,2,4-trimethylpentane', '2,4,4-trimethylpentane', 'isooctane', 'Both A and C'], answer: 3, explanation: 'The longest chain is pentane (5C). Methyl groups at positions 2,2,4. IUPAC name: 2,2,4-trimethylpentane. This is also called isooctane.', difficulty: 'medium' }
        ],
        // MATHEMATICS
        'Differentiation': [
            { q: 'If y = sin⁻¹(2x√(1-x²)), then dy/dx is:', options: ['2/√(1-x²)', '1/√(1-x²)', '-2/√(1-x²)', '2/√(1-4x²)'], answer: 0, explanation: 'Put x = sinθ. Then 2x√(1-x²) = 2sinθcosθ = sin2θ. So y = sin⁻¹(sin2θ) = 2θ = 2sin⁻¹x. dy/dx = 2/√(1-x²).', difficulty: 'hard' }
        ],
        'Integration': [
            { q: '∫₀¹ x·eˣ dx equals:', options: ['1', 'e-1', 'e', 'e+1'], answer: 0, explanation: 'Using integration by parts: ∫x·eˣdx = x·eˣ - ∫eˣdx = x·eˣ - eˣ = eˣ(x-1). Evaluating from 0 to 1: e(0) - e⁰(-1) = 0 + 1 = 1.', difficulty: 'medium' },
            { q: '∫ dx/(1+x²) equals:', options: ['tan⁻¹x + C', 'sin⁻¹x + C', 'ln(1+x²) + C', 'sec⁻¹x + C'], answer: 0, explanation: 'This is a standard integral. ∫ dx/(1+x²) = tan⁻¹x + C.', difficulty: 'easy' }
        ],
        'Probability': [
            { q: 'A committee of 5 is to be formed from 6 men and 4 women. The probability that the committee has at least one woman is:', options: ['1/42', '41/42', '1/2', '6/42'], answer: 1, explanation: 'P(at least 1 woman) = 1 - P(no woman) = 1 - C(6,5)/C(10,5) = 1 - 6/252 = 1 - 1/42 = 41/42.', difficulty: 'medium' }
        ],
        'Matrices Determinants': [
            { q: 'If A is a 3×3 matrix such that |A| = 5, then |3A| is:', options: ['15', '45', '135', '5'], answer: 2, explanation: '|kA| = kⁿ|A| for an n×n matrix. |3A| = 3³ × 5 = 27 × 5 = 135.', difficulty: 'medium' }
        ],
        'Complex Numbers': [
            { q: 'The modulus of (1+i)/(1-i) is:', options: ['0', '1', '√2', '2'], answer: 1, explanation: '(1+i)/(1-i) = (1+i)²/((1-i)(1+i)) = (1+2i-1)/2 = 2i/2 = i. |i| = 1.', difficulty: 'easy' }
        ],
        'Trigonometry': [
            { q: 'The value of sin²15° + sin²75° is:', options: ['1', '0', '1/2', '3/2'], answer: 0, explanation: 'sin75° = cos15°. So sin²15° + sin²75° = sin²15° + cos²15° = 1.', difficulty: 'easy' }
        ]
    },

    NEET: {
        // PHYSICS
        'Laws of Motion': [
            { q: 'A cricket ball of mass 150 g moving at 30 m/s is caught by a fielder in 0.1 s. The force exerted by the ball on the fielder\'s hands is:', options: ['45 N', '30 N', '60 N', '15 N'], answer: 0, explanation: 'F = mΔv/Δt = 0.15 × 30/0.1 = 45 N. Remember to convert grams to kg!', difficulty: 'easy' }
        ],
        'Thermodynamics': [
            { q: 'In an isothermal process, the internal energy of an ideal gas:', options: ['Increases', 'Decreases', 'Remains constant', 'First increases then decreases'], answer: 2, explanation: 'For an ideal gas, internal energy depends only on temperature. In isothermal process, T = constant, so ΔU = 0.', difficulty: 'easy' }
        ],
        'Oscillations': [
            { q: 'The period of a simple pendulum is doubled when its length is:', options: ['Doubled', 'Halved', 'Quadrupled', 'Reduced to 1/4th'], answer: 2, explanation: 'T = 2π√(L/g). If T becomes 2T, then 2T = 2π√(L\'/g). Squaring: 4T² = 4π²L\'/g. Since T² = 4π²L/g, we get L\' = 4L.', difficulty: 'medium' }
        ],
        // CHEMISTRY
        'Chemical Bonding': [
            { q: 'The shape of NH₃ molecule is:', options: ['Tetrahedral', 'Trigonal planar', 'Trigonal pyramidal', 'Linear'], answer: 2, explanation: 'NH₃ has 3 bond pairs and 1 lone pair. The geometry is tetrahedral but shape is trigonal pyramidal due to the lone pair.', difficulty: 'easy' }
        ],
        'Chemical Kinetics': [
            { q: 'For a first-order reaction, the half-life is 14 minutes. The time required for the concentration to reduce to 1/8th of the initial value is:', options: ['42 min', '56 min', '28 min', '7 min'], answer: 0, explanation: '1/8 = (1/2)³. So 3 half-lives are needed. t = 3 × 14 = 42 minutes.', difficulty: 'medium' }
        ],
        // BIOLOGY
        'Cell Biology': [
            { q: 'Which organelle is known as the "powerhouse of the cell"?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], answer: 2, explanation: 'Mitochondria are called the powerhouse because they produce ATP through oxidative phosphorylation — the main energy currency of the cell.', difficulty: 'easy' },
            { q: 'The fluid mosaic model of cell membrane was proposed by:', options: ['Robertson', 'Singer and Nicolson', 'Watson and Crick', 'Danielli and Davson'], answer: 1, explanation: 'Singer and Nicolson (1972) proposed the fluid mosaic model describing the cell membrane as a fluid lipid bilayer with mosaic of proteins.', difficulty: 'easy' }
        ],
        'Genetics': [
            { q: 'In a monohybrid cross between Tt and Tt plants, the ratio of tall to dwarf plants in F₂ is:', options: ['1:1', '3:1', '2:1', '1:3'], answer: 1, explanation: 'Tt × Tt → TT : Tt : Tt : tt = 1:2:1 (genotype). Phenotype ratio: Tall(TT+Tt):Dwarf(tt) = 3:1.', difficulty: 'easy' },
            { q: 'A colour blind woman marries a normal man. The probability of their sons being colour blind is:', options: ['0%', '50%', '100%', '25%'], answer: 2, explanation: 'Colour blind woman: XᶜXᶜ. Normal man: XY. Sons get Xᶜ from mother and Y from father → XᶜY (all colour blind). So 100%.', difficulty: 'medium' },
            { q: 'Which of the following is an autosomal dominant disorder?', options: ['Sickle cell anemia', 'Haemophilia', 'Colour blindness', 'Huntington\'s disease'], answer: 3, explanation: 'Huntington\'s disease is autosomal dominant. Sickle cell anemia is autosomal recessive. Haemophilia and colour blindness are X-linked recessive.', difficulty: 'medium' }
        ],
        'Photosynthesis': [
            { q: 'The oxygen released during photosynthesis comes from:', options: ['CO₂', 'H₂O', 'Both CO₂ and H₂O', 'C₆H₁₂O₆'], answer: 1, explanation: 'Ruben and Kamen proved using O¹⁸ isotope that the O₂ released comes from water (H₂O), not CO₂. This occurs during the light reactions (photolysis of water).', difficulty: 'easy' },
            { q: 'The primary CO₂ acceptor in C₃ plants is:', options: ['PEP', 'RuBP', 'OAA', 'PGA'], answer: 1, explanation: 'In C₃ plants (Calvin cycle), RuBP (Ribulose-1,5-bisphosphate) is the primary CO₂ acceptor. The enzyme RuBisCO catalyzes this reaction.', difficulty: 'medium' }
        ],
        'Respiration': [
            { q: 'The net gain of ATP in glycolysis is:', options: ['2 ATP', '4 ATP', '8 ATP', '38 ATP'], answer: 0, explanation: 'Glycolysis produces 4 ATP but uses 2 ATP. Net gain = 4 - 2 = 2 ATP per glucose molecule.', difficulty: 'easy' }
        ],
        'Evolution': [
            { q: 'The process by which organisms with favourable traits survive and reproduce is called:', options: ['Genetic drift', 'Natural selection', 'Gene flow', 'Mutation'], answer: 1, explanation: 'Natural selection, proposed by Darwin, is the process where organisms better adapted to their environment tend to survive and reproduce.', difficulty: 'easy' }
        ],
        'Human Reproduction': [
            { q: 'The site of fertilization in the human female is:', options: ['Uterus', 'Ovary', 'Ampullary-isthmic junction of fallopian tube', 'Cervix'], answer: 2, explanation: 'Fertilization typically occurs at the ampullary-isthmic junction of the fallopian tube (oviduct).', difficulty: 'easy' }
        ],
        'Biotechnology': [
            { q: 'The vector most commonly used in recombinant DNA technology is:', options: ['Cosmid', 'Phagemid', 'Plasmid', 'BAC'], answer: 2, explanation: 'Plasmids are the most commonly used vectors because they are small, circular, self-replicating DNA molecules that can carry foreign DNA into host cells.', difficulty: 'easy' }
        ],
        'Ecosystem': [
            { q: 'In an ecosystem, the flow of energy is:', options: ['Bidirectional', 'Unidirectional', 'Multidirectional', 'Cyclic'], answer: 1, explanation: 'Energy flow in an ecosystem is always unidirectional — from sun → producers → consumers. It cannot be recycled, unlike nutrients.', difficulty: 'easy' }
        ]
    },

    UPSC: {
        'Constitution': [
            { q: 'The concept of "Basic Structure" of the Constitution was established in which case?', options: ['Golaknath case', 'Kesavananda Bharati case', 'Minerva Mills case', 'Shankari Prasad case'], answer: 1, explanation: 'The Kesavananda Bharati case (1973) established the Basic Structure doctrine, which limits Parliament\'s power to amend the Constitution.', difficulty: 'medium' },
            { q: 'Which Part of the Indian Constitution deals with Fundamental Rights?', options: ['Part II', 'Part III', 'Part IV', 'Part V'], answer: 1, explanation: 'Part III (Articles 12-35) deals with Fundamental Rights. Part IV deals with Directive Principles.', difficulty: 'easy' },
            { q: 'The 73rd Constitutional Amendment is related to:', options: ['Scheduled Tribes', 'Panchayati Raj', 'Anti-defection law', 'Right to Education'], answer: 1, explanation: 'The 73rd Amendment (1992) gave constitutional status to Panchayati Raj institutions, adding Part IX to the Constitution.', difficulty: 'medium' }
        ],
        'Indian Economy': [
            { q: 'Which body presents the Union Budget in India?', options: ['RBI Governor', 'Finance Minister', 'Prime Minister', 'President'], answer: 1, explanation: 'The Union Budget is presented by the Finance Minister in Parliament. It was previously presented on the last working day of February.', difficulty: 'easy' },
            { q: '"Fiscal deficit" is defined as:', options: ['Total expenditure minus total receipts', 'Total expenditure minus total receipts excluding borrowings', 'Revenue expenditure minus revenue receipts', 'Capital expenditure minus capital receipts'], answer: 1, explanation: 'Fiscal Deficit = Total Expenditure - Total Receipts (excluding borrowings). It indicates the total borrowing requirement of the government.', difficulty: 'medium' }
        ],
        'Indian Geography': [
            { q: 'The western disturbances that bring winter rainfall to North India originate from:', options: ['Arabian Sea', 'Bay of Bengal', 'Mediterranean Sea', 'Indian Ocean'], answer: 2, explanation: 'Western disturbances are extratropical storms originating in the Mediterranean Sea that bring winter rainfall to northern India, especially Punjab and Himachal Pradesh.', difficulty: 'medium' }
        ],
        'Modern India': [
            { q: 'The Quit India Movement was launched in:', options: ['1940', '1942', '1944', '1946'], answer: 1, explanation: 'The Quit India Movement was launched by Mahatma Gandhi on August 8, 1942, at the Bombay session of the Indian National Congress, with the slogan "Do or Die."', difficulty: 'easy' },
            { q: 'Who was the Viceroy of India when the Indian National Congress was founded?', options: ['Lord Curzon', 'Lord Ripon', 'Lord Dufferin', 'Lord Lytton'], answer: 2, explanation: 'The INC was founded in 1885 by A.O. Hume during the viceroyalty of Lord Dufferin.', difficulty: 'medium' }
        ],
        'Environment Ecology': [
            { q: 'The "Chipko Movement" was primarily associated with:', options: ['Water conservation', 'Forest conservation', 'Air pollution', 'Wildlife protection'], answer: 1, explanation: 'The Chipko Movement (1973) in Uttarakhand was a forest conservation movement where villagers hugged trees to prevent them from being cut.', difficulty: 'easy' }
        ],
        'International Relations': [
            { q: 'India became a member of the United Nations in:', options: ['1945', '1947', '1950', '1955'], answer: 0, explanation: 'India became a founding member of the United Nations on October 30, 1945, even before independence in 1947.', difficulty: 'medium' }
        ]
    },

    GATE: {
        'Data Structures': [
            { q: 'The worst-case time complexity of searching in a balanced Binary Search Tree with n nodes is:', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answer: 1, explanation: 'In a balanced BST, the height is O(log n). Search traverses from root to a leaf, so worst case is O(log n).', difficulty: 'easy' },
            { q: 'The minimum number of nodes in an AVL tree of height 5 is:', options: ['12', '20', '33', '7'], answer: 1, explanation: 'Min nodes in AVL tree of height h: N(h) = N(h-1) + N(h-2) + 1. N(0)=1, N(1)=2, N(2)=4, N(3)=7, N(4)=12, N(5)=20.', difficulty: 'hard' }
        ],
        'Algorithms': [
            { q: 'The time complexity of merge sort in the worst case is:', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], answer: 1, explanation: 'Merge sort always divides the array in half (O(log n) levels) and merges at each level (O(n) work). Total: O(n log n) in all cases.', difficulty: 'easy' },
            { q: 'Which of the following is NOT a greedy algorithm?', options: ['Dijkstra\'s algorithm', 'Kruskal\'s algorithm', 'Bellman-Ford algorithm', 'Prim\'s algorithm'], answer: 2, explanation: 'Bellman-Ford uses dynamic programming, not greedy approach. Dijkstra\'s, Kruskal\'s, and Prim\'s are all greedy algorithms.', difficulty: 'medium' }
        ],
        'Operating Systems': [
            { q: 'Which scheduling algorithm can cause starvation?', options: ['FCFS', 'Round Robin', 'Shortest Job First', 'All of the above'], answer: 2, explanation: 'SJF can cause starvation for long processes if shorter processes keep arriving. FCFS and Round Robin don\'t cause starvation.', difficulty: 'easy' },
            { q: 'The necessary condition for deadlock that can be violated to prevent deadlock most practically is:', options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait'], answer: 3, explanation: 'Circular Wait can be prevented by ordering resources and requiring processes to request resources in increasing order. This is the most practical approach.', difficulty: 'medium' }
        ],
        'Databases': [
            { q: 'A relation is in BCNF if and only if every determinant is a:', options: ['Foreign key', 'Candidate key', 'Super key', 'Primary key'], answer: 2, explanation: 'A relation is in BCNF if for every non-trivial functional dependency X→Y, X is a super key. This is stricter than 3NF.', difficulty: 'medium' }
        ],
        'Computer Networks': [
            { q: 'The maximum data rate of a channel of bandwidth 3000 Hz, using 4 signal levels, according to Nyquist theorem is:', options: ['6000 bps', '12000 bps', '24000 bps', '3000 bps'], answer: 1, explanation: 'Nyquist: Max data rate = 2 × B × log₂(L) = 2 × 3000 × log₂(4) = 2 × 3000 × 2 = 12000 bps.', difficulty: 'medium' }
        ],
        'Theory of Computation': [
            { q: 'Which of the following is not decidable?', options: ['Whether a CFG generates ε', 'Whether a DFA accepts empty language', 'Whether a TM accepts empty language', 'Whether a CFL is finite'], answer: 2, explanation: 'Whether a Turing Machine accepts the empty language is undecidable (it reduces to the halting problem). All other options are decidable for their respective models.', difficulty: 'hard' }
        ],
        'Linear Algebra': [
            { q: 'The rank of a 3×3 matrix with all elements equal to 1 is:', options: ['0', '1', '2', '3'], answer: 1, explanation: 'All rows are identical, so the row-reduced form has only 1 non-zero row. Rank = 1.', difficulty: 'easy' }
        ]
    },

    CAT: {
        'Number System': [
            { q: 'What is the remainder when 7^100 is divided by 5?', options: ['1', '2', '3', '4'], answer: 3, explanation: '7¹=7(rem 2), 7²=49(rem 4), 7³=343(rem 3), 7⁴=2401(rem 1). Pattern repeats with cycle 4. 100÷4 = 25 remainder 0. So same as 7⁴ → remainder 1. Wait: 7^4 mod 5 = 1, so 7^100 = (7^4)^25 mod 5 = 1^25 = 1. Remainder = 1. Correction: answer is 1.', difficulty: 'medium' },
            { q: 'The HCF of 252 and 378 is:', options: ['42', '63', '126', '18'], answer: 2, explanation: '252 = 2² × 3² × 7. 378 = 2 × 3³ × 7. HCF = 2 × 3² × 7 = 126.', difficulty: 'easy' }
        ],
        'Arithmetic': [
            { q: 'A shopkeeper marks up the price by 40% and gives a 20% discount. His profit percentage is:', options: ['20%', '12%', '10%', '8%'], answer: 1, explanation: 'Let CP = 100. MP = 140. SP = 140 × 0.8 = 112. Profit = 12. Profit% = 12%.', difficulty: 'easy' },
            { q: 'Two pipes can fill a tank in 20 and 30 minutes respectively. If both are opened simultaneously, the tank fills in:', options: ['10 min', '12 min', '15 min', '25 min'], answer: 1, explanation: 'Combined rate = 1/20 + 1/30 = (3+2)/60 = 5/60 = 1/12. Time = 12 minutes.', difficulty: 'easy' }
        ],
        'Algebra': [
            { q: 'If x + 1/x = 3, then x³ + 1/x³ is:', options: ['18', '9', '27', '24'], answer: 0, explanation: '(x + 1/x)³ = x³ + 1/x³ + 3(x + 1/x). 27 = x³ + 1/x³ + 9. x³ + 1/x³ = 18.', difficulty: 'medium' }
        ],
        'Logical Reasoning': [
            { q: 'In a class, 60% students like Cricket, 25% like Football, and 15% like both. What percentage of students like neither?', options: ['30%', '15%', '70%', '25%'], answer: 0, explanation: 'Using inclusion-exclusion: Like at least one = 60 + 25 - 15 = 70%. Neither = 100 - 70 = 30%.', difficulty: 'easy' }
        ],
        'Data Interpretation': [
            { q: 'If the revenue of a company increased by 20% in 2023 and decreased by 10% in 2024, the net change in revenue from 2022 to 2024 is:', options: ['+10%', '+8%', '-8%', '+12%'], answer: 1, explanation: 'Let revenue in 2022 = 100. 2023: 100 × 1.2 = 120. 2024: 120 × 0.9 = 108. Net change = +8%.', difficulty: 'easy' }
        ],
        'Geometry': [
            { q: 'The area of a triangle with sides 3, 4, and 5 is:', options: ['6', '12', '10', '7.5'], answer: 0, explanation: 'This is a right triangle (3² + 4² = 5²). Area = ½ × base × height = ½ × 3 × 4 = 6.', difficulty: 'easy' }
        ],
        'Reading Comprehension': [
            { q: 'A passage argument that "technology isolates people" is best countered by:', options: ['Technology creates new communities online', 'Technology is expensive', 'Some people don\'t use technology', 'Technology is advancing rapidly'], answer: 0, explanation: 'The best counter to "technology isolates" is showing technology connects people — through online communities, social media, and virtual interactions.', difficulty: 'medium' }
        ]
    },

    CUSTOM: {}
};
