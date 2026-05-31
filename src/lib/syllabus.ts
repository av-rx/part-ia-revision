// Single source of truth for the Cambridge Computer Science Part IA syllabus,
// the 2026 exam timetable, and how each module maps to a paper.
//
// Confirmed against:
//   - https://www.cl.cam.ac.uk/teaching/2526/part1a.html
//   - https://www.cl.cam.ac.uk/teaching/exams/exam-structure.pdf
//
// Module slugs match folder names under src/content/notes/<slug>/
// Topic slugs match the synced markdown filenames (no .md, no leading number).

export type Paper = 'paper-1' | 'paper-2' | 'paper-3' | 'maths-1' | 'maths-2';

export interface PaperMeta {
  id: Paper;
  number: string;             // e.g. "1", "2", "3", "Maths 1"
  title: string;
  date: string;               // ISO yyyy-mm-dd
  startTime: string;          // 24h HH:MM
  durationHours: number;
  venue: string;
  sections: PaperSection[];
  rubric: string;             // human-readable instructions
}

export interface PaperSection {
  letter: string;             // 'A'..'E'
  module: ModuleSlug;
  questions: number;          // total Qs in this section
  attempt: number;            // how many to attempt
}

export type ModuleSlug =
  | 'foundations-of-computer-science'
  | 'object-oriented-programming'
  | 'introduction-to-probability'
  | 'algorithms-1'
  | 'algorithms-2'
  | 'digital-electronics'
  | 'operating-systems'
  | 'software-security-engineering'
  | 'discrete-maths'
  | 'databases'
  | 'introduction-to-graphics'
  | 'interaction-design'
  | 'machine-learning-real-world-data'
  | 'nst-mathematics-a';

export interface ModuleMeta {
  slug: ModuleSlug;
  vaultName: string;          // exact folder name in the Obsidian vault
  title: string;              // display title
  short: string;              // ≤ 18 char display
  paper: Paper;
  lecturer: string;
  hours: number;
  term: 'Michaelmas' | 'Lent' | 'Easter' | 'Multi-term';
  blurb: string;              // one-line description
  topics: TopicMeta[];
  /** Authored gap-fill content not in the user's vault */
  supplements?: string[];
}

export interface TopicMeta {
  slug: string;               // url-safe; no leading number
  vaultBasename: string;      // exact filename in vault, e.g. "1 - Sorting"
  title: string;              // human title shown in nav
  order: number;
  nonExaminable?: boolean;    // true if this topic is explicitly out of scope for the Tripos
}

const T = (order: number, vaultBasename: string, title: string, slug?: string): TopicMeta => ({
  order,
  vaultBasename,
  title,
  slug: slug ?? slugify(title),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const MODULES: Record<ModuleSlug, ModuleMeta> = {
  'foundations-of-computer-science': {
    slug: 'foundations-of-computer-science',
    vaultName: 'Foundations of Computer Science',
    title: 'Foundations of Computer Science',
    short: 'FoCS',
    paper: 'paper-1',
    lecturer: 'Dr Jon Ludlam',
    hours: 12,
    term: 'Michaelmas',
    blurb: 'Functional programming in OCaml: recursion, lists, trees, lazy evaluation, currying.',
    topics: [
      T(1, '1 - Introduction to Programming', 'Introduction to Programming'),
      T(2, '2 - Recursion and Efficiency', 'Recursion and Efficiency'),
      T(3, '3 - Lists and Polymorphism', 'Lists and Polymorphism'),
      T(4, '4 - More Lists and Making Change', 'More Lists and Making Change'),
      T(5, '5 - Sorting', 'Sorting'),
      T(6, '6 - Datatypes and Trees', 'Datatypes and Trees'),
      T(7, '7 - Dictionaries and Functional Arrays', 'Dictionaries and Functional Arrays'),
      T(8, '8 - Currying', 'Currying'),
      T(9, '9 - Sequences, or Lazy Lists', 'Sequences and Lazy Lists', 'sequences-and-lazy-lists'),
      T(10, '10 - Queues and Search Strategies', 'Queues and Search Strategies'),
      T(11, '11 - Procedural Programming', 'Procedural Programming'),
    ],
  },

  'object-oriented-programming': {
    slug: 'object-oriented-programming',
    vaultName: 'Object-Oriented Programming',
    title: 'Object-Oriented Programming',
    short: 'OOP',
    paper: 'paper-1',
    lecturer: 'Dr Robert Harle',
    hours: 10,
    term: 'Michaelmas',
    blurb: 'OOP fundamentals through Java: classes, inheritance, polymorphism, generics, lambdas.',
    topics: [
      T(1, 'Notes/1 - Motivations, Languages, OOP Intro', 'Motivations, Languages, OOP Intro'),
      T(2, 'Notes/2 - Intro to Java', 'Introduction to Java'),
      T(3, 'Notes/3 - Class Design and Encapsulation', 'Class Design and Encapsulation'),
      T(4, 'Notes/4 - Memory, Pointers, References', 'Memory, Pointers, References'),
      T(5, 'Notes/5 - Inheritance', 'Inheritance'),
      T(6, 'Notes/6 - Polymorphism, Multiple Inheritance, Coupling', 'Polymorphism, Multiple Inheritance, Coupling'),
      T(7, 'Notes/7 - Object Life Cycle, Garbage Collection, Copying', 'Object Life Cycle, Garbage Collection, Copying'),
      T(8, 'Notes/8 - Collections, Comparisons', 'Collections and Comparisons'),
      T(9, 'Notes/9 - Generics', 'Generics'),
      T(10, 'Notes/10 - Coupling, Errors and Exceptions', 'Coupling, Errors and Exceptions'),
      T(11, 'Notes/11 - Design Patterns', 'Design Patterns'),
      T(12, 'Notes/12 - Lambdas, Method References, Streams', 'Lambdas, Method References, Streams'),
    ],
  },

  'introduction-to-probability': {
    slug: 'introduction-to-probability',
    vaultName: 'Introduction to Probability',
    title: 'Introduction to Probability',
    short: 'Probability',
    paper: 'paper-1',
    lecturer: 'Prof Mateja Jamnik',
    hours: 12,
    term: 'Easter',
    blurb: 'Probability foundations: events, conditional probability, Bayes, expectation, variance, distributions.',
    topics: [
      T(1, "1 - Conditional Probabilities and Bayes' Theorem", "Conditional Probabilities and Bayes' Theorem"),
      T(2, '2 - Random Variables, Probability Mass Function, Expectation', 'Random Variables, PMF, Expectation'),
      T(3, '3 - Expectation Properties, Variance, Discrete Distributions', 'Expectation Properties, Variance, Discrete Distributions'),
      T(4, '4 - More Discrete Distributions - Poisson, Geometric, Negative Binomial, Hypergeometric', 'More Discrete Distributions', 'more-discrete-distributions'),
      T(5, '5 - Continuous Random Variables', 'Continuous Random Variables'),
      T(6, '6 - Marginals and Joint Distributions', 'Marginals and Joint Distributions'),
      T(7, '7 - Independence, Covariance and Correlation', 'Independence, Covariance and Correlation'),
      T(8, '8 - Basic Inequalities and Law of Large Numbers', 'Basic Inequalities and Law of Large Numbers'),
      T(9, '9 - Central Limit Theorem', 'Central Limit Theorem'),
      T(10, '10 - Estimators (Part 1)', 'Estimators (Part 1)'),
      T(11, '11 - Estimators (Part 2)', 'Estimators (Part 2)'),
      T(12, '12 - Online Algorithms', 'Online Algorithms'),
    ],
  },

  'algorithms-1': {
    slug: 'algorithms-1',
    vaultName: 'Algorithms 1',
    title: 'Algorithms 1',
    short: 'Algorithms 1',
    paper: 'paper-1',
    lecturer: 'Dr John Fawcett',
    hours: 12,
    term: 'Lent',
    blurb: 'Sorting, divide-and-conquer, dynamic programming, fundamental data structures.',
    topics: [
      T(1, '1 - Sorting', 'Sorting'),
      T(2, '2 - Strategies for Algorithm Design', 'Strategies for Algorithm Design'),
      T(3, '3 - Data Structures', 'Data Structures'),
    ],
  },

  'algorithms-2': {
    slug: 'algorithms-2',
    vaultName: 'Algorithms 2',
    title: 'Algorithms 2',
    short: 'Algorithms 2',
    paper: 'paper-1',
    lecturer: 'Dr John Fawcett',
    hours: 12,
    term: 'Lent',
    blurb: 'Graph algorithms, advanced data structures, geometric algorithms.',
    topics: [
      T(1, '1 - Graphs and Path-Finding Algorithms', 'Graphs and Path-Finding Algorithms'),
      T(2, '2 - Graphs and Subgraphs', 'Graphs and Subgraphs'),
      T(3, '3 - Advanced Data Structures', 'Advanced Data Structures'),
      { ...T(4, '4 - Geometric Algorithms', 'Geometric Algorithms'), nonExaminable: true },
    ],
  },

  'digital-electronics': {
    slug: 'digital-electronics',
    vaultName: 'Digital Electronics',
    title: 'Digital Electronics',
    short: 'Digital Elec.',
    paper: 'paper-2',
    lecturer: 'Dr Ian Wassell',
    hours: 12,
    term: 'Michaelmas',
    blurb: 'Logic gates, Boolean algebra, combinational/sequential circuits, processor architecture.',
    topics: [
      T(1, '1 - Logic Gates and Boolean Algebra', 'Logic Gates and Boolean Algebra'),
      T(2, '2 - Logic Minimisation', 'Logic Minimisation'),
      T(3, '3 - Binary Adders', 'Binary Adders'),
      T(4, '4 - Multilevel Logic and Hazards', 'Multilevel Logic and Hazards'),
      T(5, '5 - Beyond Simple Logic Gates', 'Beyond Simple Logic Gates'),
      T(6, '6 - Latches and Flip-Flops', 'Latches and Flip-Flops'),
      T(7, '7 - Flip-Flop Applications and Timing Considerations', 'Flip-Flop Applications and Timing'),
      T(8, '8 - Synchronous State Machines 1', 'Synchronous State Machines 1'),
      T(9, '9 - Synchronous State Machines 2', 'Synchronous State Machines 2'),
      T(10, '10 - Further Considerations', 'Further Considerations'),
      T(11, '11 - Underlying Concepts', 'Underlying Concepts'),
      T(12, '12 - Transistors and Gates', 'Transistors and Gates'),
      T(13, '13 - Introduction to Processor Architecture', 'Introduction to Processor Architecture'),
    ],
  },

  'operating-systems': {
    slug: 'operating-systems',
    vaultName: 'Operating Systems',
    title: 'Operating Systems',
    short: 'OS',
    paper: 'paper-2',
    lecturer: 'Dr Martin Kleppmann',
    hours: 12,
    term: 'Lent',
    blurb: 'Processes, scheduling, memory, virtual memory, I/O, file systems, UNIX.',
    topics: [
      T(1, '1 - Introduction', 'Introduction'),
      T(2, '2 - Protection', 'Protection'),
      T(3, '3 - Processes', 'Processes'),
      T(4, '4 - Scheduling', 'Scheduling'),
      T(5, '5 - Scheduling Algorithms', 'Scheduling Algorithms'),
      T(6, '6 - Memory Management', 'Memory Management'),
      T(7, '7 - Paging', 'Paging'),
      T(8, '8 - Virtual Memory', 'Virtual Memory'),
      T(9, '9 - IO Systems', 'IO Systems'),
      T(10, '10 - Storage and File Management', 'Storage and File Management'),
      T(11, '11 - Case Study I - UNIX (Linux)', 'Case Study: UNIX/Linux I', 'case-study-unix-linux-i'),
      T(12, '12 - Case Study II - UNIX (Linux)', 'Case Study: UNIX/Linux II', 'case-study-unix-linux-ii'),
    ],
  },

  'software-security-engineering': {
    slug: 'software-security-engineering',
    vaultName: 'Software and Security Engineering',
    title: 'Software and Security Engineering',
    short: 'Sw/Security',
    paper: 'paper-2',
    lecturer: 'Dr Robert Harle',
    hours: 6,
    term: 'Easter',
    blurb: 'Engineering rigour, requirements, testing, security principles, ethics.',
    topics: [
      T(1, '1 - Engineering Mindset and The Cost of Failure', 'Engineering Mindset and the Cost of Failure'),
      T(2, '2 - Requirements and Specifications', 'Requirements and Specifications'),
      T(3, '3 - Engineering Process', 'Engineering Process'),
      T(4, '4 - Quality Assurance and Reliable Delivery', 'Quality Assurance and Reliable Delivery'),
      T(5, '5 - Software Evolution', 'Software Evolution'),
      T(6, '6 - Software Engineering in the AI Era', 'Software Engineering in the AI Era'),
    ],
    supplements: [
      'testing-strategies',
      'security-principles',
      'common-vulnerabilities',
      'design-for-failure',
      'ethics-and-professionalism',
    ],
  },

  'discrete-maths': {
    slug: 'discrete-maths',
    vaultName: 'Discrete Maths',
    title: 'Discrete Mathematics',
    short: 'Discrete Maths',
    paper: 'paper-2',
    lecturer: 'Prof Marcelo Fiore, Dr Jon Sterling',
    hours: 48,
    term: 'Multi-term',
    blurb: 'Proofs, numbers, sets, functions, relations, regular languages, finite automata.',
    topics: [
      T(1, '1 - Proofs', 'Proofs'),
      T(2, '2 - Numbers', 'Numbers'),
      T(3, '3 - Sets', 'Sets'),
      T(4, '4 - Regular Languages and Finite Automata', 'Regular Languages and Finite Automata'),
    ],
  },

  'databases': {
    slug: 'databases',
    vaultName: 'Databases',
    title: 'Databases',
    short: 'Databases',
    paper: 'paper-3',
    lecturer: 'Dr David Greaves',
    hours: 12,
    term: 'Michaelmas',
    blurb: 'Relational model, ER diagrams, SQL, transactions, document & graph databases.',
    topics: [
      T(1, '1 - What is a DBMS', 'What is a DBMS'),
      T(2, '2 - Conceptual Modelling with ER Diagrams', 'Conceptual Modelling with ER Diagrams'),
      T(3, '3 - The Relational Database', 'The Relational Database'),
      T(4, '4 - Implementing an E-R Model Relationally', 'Implementing an ER Model Relationally'),
      T(5, '5 - Transactions, Reliability, Throughput, and Consistency', 'Transactions, Reliability, Throughput, Consistency'),
      T(6, '6 - Semi-Structured Document Databases', 'Semi-Structured Document Databases'),
      T(7, '7 - Further SQL', 'Further SQL'),
      T(8, '8 - Graph-Oriented Databases', 'Graph-Oriented Databases'),
    ],
  },

  'introduction-to-graphics': {
    slug: 'introduction-to-graphics',
    vaultName: 'Introduction to Graphics',
    title: 'Introduction to Graphics',
    short: 'Graphics',
    paper: 'paper-3',
    lecturer: 'Dr Rafal Mantiuk',
    hours: 8,
    term: 'Michaelmas',
    blurb: 'Rendering, the graphics pipeline, rasterisation, hardware/OpenGL, human vision.',
    topics: [
      T(1, '1 - Background', 'Background'),
      T(2, '2 - Rendering', 'Rendering'),
      T(3, '3 - Graphics Pipeline', 'Graphics Pipeline'),
      T(4, '4 - Rasterisation', 'Rasterisation'),
      T(5, '5 - Graphics Hardware and OpenGL', 'Graphics Hardware and OpenGL'),
      T(6, '6 - Human Vision, Colour, and Tone Mapping', 'Human Vision, Colour, and Tone Mapping'),
    ],
  },

  'interaction-design': {
    slug: 'interaction-design',
    vaultName: 'Interaction Design',
    title: 'Interaction Design',
    short: 'IxD',
    paper: 'paper-3',
    lecturer: 'Prof Hatice Gunes',
    hours: 16,
    term: 'Easter',
    blurb: 'User-centred design, research, requirements, prototyping, evaluation.',
    topics: [
      T(1, '1 - Introduction to Interaction Design, User-Centred Design Approach, User Research - Methods', 'Intro to IxD, UCD, User Research Methods'),
      T(2, '2 - User Research - Data Analysis, Keeping the User in Mind', 'User Research Data Analysis, Keeping the User in Mind'),
      T(3, '3 - Requirements Analysis and Development, Exploring the Design Space', 'Requirements Analysis and Design Space'),
      T(4, '4 - Cognitive Aspects for Design, Interactive Aspects for Design', 'Cognitive and Interactive Aspects for Design', 'cognitive-and-interactive-aspects-for-design'),
      T(5, '5 - Designing Content, Tools for Interaction Design', 'Designing Content and Tools for IxD', 'designing-content-and-tools-for-ixd'),
      T(6, '6 - Practical Methods for Evaluating Designs', 'Practical Methods for Evaluating Designs'),
    ],
    supplements: [
      'prototyping-low-and-high-fidelity',
      'heuristic-evaluation',
      'usability-testing',
      'accessibility-and-inclusive-design',
      'cognitive-walkthroughs',
    ],
  },

  'machine-learning-real-world-data': {
    slug: 'machine-learning-real-world-data',
    vaultName: 'Machine Learning and Real-World Data',
    title: 'Machine Learning and Real-World Data',
    short: 'ML & RWD',
    paper: 'paper-3',
    lecturer: 'Prof Simone Teufel, Prof Andreas Vlachos',
    hours: 16,
    term: 'Lent',
    blurb: 'Sentiment classification, hidden Markov models, social network analysis.',
    topics: [
      // Topic structure mirrors the vault subfolders rather than numbered topics.
      T(1, 'Sentiment Classification', 'Sentiment Classification'),
      T(2, 'Hidden Markov Models and Clustering', 'Hidden Markov Models & Clustering'),
      T(3, 'Social Networks', 'Social Networks'),
    ],
  },

  'nst-mathematics-a': {
    slug: 'nst-mathematics-a',
    vaultName: 'NST Mathematics A',
    title: 'NST Mathematics A',
    short: 'NST Maths A',
    paper: 'maths-1',
    lecturer: 'NST Maths team',
    hours: 72,
    term: 'Multi-term',
    blurb: 'Mathematical Methods I, II, III: vectors, complex numbers, calculus, ODEs, multivariable, Fourier, matrices.',
    topics: [
      T(1, 'Mathematical Methods I/1 - Vectors', 'MM I: Vectors'),
      T(2, 'Mathematical Methods I/2 - Complex Numbers', 'MM I: Complex Numbers'),
      T(3, 'Mathematical Methods I/3 - Hyperbolic Functions', 'MM I: Hyperbolic Functions'),
      T(4, 'Mathematical Methods I/4 - Differentiation', 'MM I: Differentiation'),
      T(5, 'Mathematical Methods I/5 - Integration', 'MM I: Integration'),
      T(6, 'Mathematical Methods I/6 - Taylor Series', 'MM I: Taylor Series'),
      T(7, 'Mathematical Methods I/7 - Elementary Probability', 'MM I: Elementary Probability'),
      T(8, 'Mathematical Methods II/1 - Ordinary Differential Equations', 'MM II: ODEs'),
      T(9, 'Mathematical Methods II/2 - Multivariable Calculus', 'MM II: Multivariable Calculus'),
      T(10, 'Mathematical Methods II/3 - Integration of Functions with Multiple Variables', 'MM II: Multiple Integration'),
      T(11, 'Mathematical Methods III/Matrices', 'MM III: Matrices'),
      T(12, 'Mathematical Methods III/Eigenvalues and Eigenvectors', 'MM III: Eigenvalues and Eigenvectors'),
      T(13, 'Mathematical Methods III/Fourier Series', 'MM III: Fourier Series'),
    ],
  },
};

// Module list in display order (per Part IA hub).
export const MODULE_ORDER: ModuleSlug[] = [
  'foundations-of-computer-science',
  'object-oriented-programming',
  'introduction-to-probability',
  'algorithms-1',
  'algorithms-2',
  'digital-electronics',
  'operating-systems',
  'software-security-engineering',
  'discrete-maths',
  'databases',
  'introduction-to-graphics',
  'interaction-design',
  'machine-learning-real-world-data',
  'nst-mathematics-a',
];

// Cambridge Part IA Exam Timetable 2026.
// CS dates from the official exam-structure PDF (9, 10, 12 June).
// Maths dates from the user's vault timetable (15, 17 June).
export const PAPERS: Record<Paper, PaperMeta> = {
  'paper-1': {
    id: 'paper-1',
    number: 'Paper 1',
    title: 'Computer Science Paper 1',
    date: '2026-06-09',
    startTime: '14:00',
    durationHours: 3,
    venue: 'Guildhall',
    rubric: 'Attempt one question from each of Sections A, B, C, D and E (5 questions in total). 20 marks per question.',
    sections: [
      { letter: 'A', module: 'foundations-of-computer-science', questions: 2, attempt: 1 },
      { letter: 'B', module: 'object-oriented-programming', questions: 2, attempt: 1 },
      { letter: 'C', module: 'introduction-to-probability', questions: 2, attempt: 1 },
      { letter: 'D', module: 'algorithms-1', questions: 2, attempt: 1 },
      { letter: 'E', module: 'algorithms-2', questions: 2, attempt: 1 },
    ],
  },
  'paper-2': {
    id: 'paper-2',
    number: 'Paper 2',
    title: 'Computer Science Paper 2',
    date: '2026-06-10',
    startTime: '14:00',
    durationHours: 3,
    venue: 'Sports Hall, Cambridge Sports Centre',
    rubric: 'Attempt one question from Sections A, B and C, plus two questions from Section D (5 in total).',
    sections: [
      { letter: 'A', module: 'digital-electronics', questions: 2, attempt: 1 },
      { letter: 'B', module: 'operating-systems', questions: 2, attempt: 1 },
      { letter: 'C', module: 'software-security-engineering', questions: 1, attempt: 1 },
      { letter: 'D', module: 'discrete-maths', questions: 4, attempt: 2 },
    ],
  },
  'paper-3': {
    id: 'paper-3',
    number: 'Paper 3',
    title: 'Computer Science Paper 3',
    date: '2026-06-12',
    startTime: '14:00',
    durationHours: 3,
    venue: 'Sports Hall, Cambridge Sports Centre',
    rubric: 'Attempt one question from Sections A, B and C, plus two questions from Section D (5 in total).',
    sections: [
      { letter: 'A', module: 'databases', questions: 2, attempt: 1 },
      { letter: 'B', module: 'introduction-to-graphics', questions: 2, attempt: 1 },
      { letter: 'C', module: 'interaction-design', questions: 2, attempt: 1 },
      { letter: 'D', module: 'machine-learning-real-world-data', questions: 3, attempt: 2 },
    ],
  },
  'maths-1': {
    id: 'maths-1',
    number: 'NST Maths Paper 1',
    title: 'Mathematics (Written Paper 1)',
    date: '2026-06-15',
    startTime: '09:00',
    durationHours: 3,
    venue: 'Sports Hall, Cambridge Sports Centre',
    rubric: 'Mathematical Methods I and II.',
    sections: [
      { letter: 'A', module: 'nst-mathematics-a', questions: 0, attempt: 0 },
    ],
  },
  'maths-2': {
    id: 'maths-2',
    number: 'NST Maths Paper 2',
    title: 'Mathematics (Written Paper 2)',
    date: '2026-06-17',
    startTime: '09:00',
    durationHours: 3,
    venue: 'Sports Hall, Cambridge Sports Centre',
    rubric: 'Mathematical Methods I, II, and III (incl. Fourier Series).',
    sections: [
      { letter: 'A', module: 'nst-mathematics-a', questions: 0, attempt: 0 },
    ],
  },
};

export const PAPER_ORDER: Paper[] = ['paper-1', 'paper-2', 'paper-3', 'maths-1', 'maths-2'];

export function moduleByVaultName(vaultName: string): ModuleMeta | undefined {
  return Object.values(MODULES).find((m) => m.vaultName === vaultName);
}

export function topicHref(module: ModuleSlug, topicSlug: string): string {
  return `/modules/${module}/${topicSlug}`;
}

export function moduleHref(module: ModuleSlug): string {
  return `/modules/${module}`;
}

export function paperHref(p: Paper): string {
  return `/papers/${p}`;
}

export function getAllTopics(): Array<{ module: ModuleMeta; topic: TopicMeta }> {
  const out: Array<{ module: ModuleMeta; topic: TopicMeta }> = [];
  for (const slug of MODULE_ORDER) {
    const m = MODULES[slug];
    for (const topic of m.topics) out.push({ module: m, topic });
  }
  return out;
}

export function modulesForPaper(p: Paper): ModuleMeta[] {
  const seen = new Set<ModuleSlug>();
  const out: ModuleMeta[] = [];
  for (const sec of PAPERS[p].sections) {
    if (!seen.has(sec.module)) {
      seen.add(sec.module);
      out.push(MODULES[sec.module]);
    }
  }
  return out;
}
