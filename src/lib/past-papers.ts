// Per-question topic tagging for Cambridge Computer Science Tripos Part IA
// past papers. Manually curated from the PDF papers at
// https://www.cl.cam.ac.uk/teaching/exams/pastpapers/y<YEAR>.html
//
// Each question is associated with one module and the syllabus topic-slugs
// (within that module) that it tests. The 'topics' array uses slugs from
// src/lib/syllabus.ts — keep them in sync.

import type { ModuleSlug } from './syllabus';

export type CSPaper = 1 | 2 | 3;

export interface PastQuestion {
  year: number;
  paper: CSPaper;
  number: number;            // 1..10 typically
  module: ModuleSlug;
  topics: string[];          // topic slugs within the module
  summary: string;           // one-line description for browsing
  url: string;               // direct link to question PDF
}

const Q = (
  year: number,
  paper: CSPaper,
  number: number,
  module: ModuleSlug,
  topics: string[],
  summary: string,
): PastQuestion => ({
  year,
  paper,
  number,
  module,
  topics,
  summary,
  url: `https://www.cl.cam.ac.uk/teaching/exams/pastpapers/y${year}p${paper}q${number}.pdf`,
});

export const PAST_QUESTIONS: PastQuestion[] = [
  // ───── 2025 — Paper 1 ─────
  Q(2025, 1, 1, 'foundations-of-computer-science', ['sorting', 'lists-and-polymorphism'], 'Debug a broken mergesort; check_sorted; checksort harness'),
  Q(2025, 1, 2, 'foundations-of-computer-science', ['datatypes-and-trees', 'recursion-and-efficiency'], 'expr type, Polish notation reduce / reduce_all'),
  Q(2025, 1, 3, 'object-oriented-programming', ['collections-and-comparisons', 'design-patterns'], 'Comparable vs Comparator; AutoUpdatableQueue extending PriorityQueue'),
  Q(2025, 1, 4, 'object-oriented-programming', ['motivations-languages-oop-intro', 'generics', 'polymorphism-multiple-inheritance-coupling'], 'Open-Closed Principle; OOP pillars; wildcard generics typecheck'),
  Q(2025, 1, 5, 'introduction-to-probability', ['random-variables-pmf-expectation', 'expectation-properties-variance-discrete-distributions'], 'Binomial / Poisson / Hypergeometric; Markov, Chebyshev, CLT'),
  Q(2025, 1, 6, 'introduction-to-probability', ['expectation-properties-variance-discrete-distributions', 'conditional-probabilities-and-bayes-theorem'], 'Geometric waiting times; conditional; unbiased estimators; MSE'),
  Q(2025, 1, 7, 'algorithms-1', ['strategies-for-algorithm-design'], 'Master Theorem variants; recurrence relations including non-standard cases'),
  Q(2025, 1, 8, 'algorithms-1', ['data-structures'], 'Hash table chaining + open addressing with quadratic probing; deletion'),
  Q(2025, 1, 9, 'algorithms-2', ['graphs-and-path-finding-algorithms', 'graphs-and-subgraphs'], 'BFS on adjacency matrix; MST max-cost path; connected components; greedy MST'),
  Q(2025, 1, 10, 'algorithms-2', ['advanced-data-structures', 'graphs-and-path-finding-algorithms'], 'Fibonacci heap structure; cyclic vs acyclic lists; alternatives in Dijkstra'),

  // ───── 2024 — Paper 1 ─────
  Q(2024, 1, 1, 'foundations-of-computer-science', ['lists-and-polymorphism', 'recursion-and-efficiency'], 'fold / map / filter; mean and standard deviation on marks lists'),
  Q(2024, 1, 2, 'foundations-of-computer-science', ['recursion-and-efficiency', 'lists-and-polymorphism'], 'is_prime; fold_range / fold; complexity and tail-recursion; all_primes'),
  Q(2024, 1, 3, 'object-oriented-programming', ['class-design-and-encapsulation', 'motivations-languages-oop-intro'], 'Java access modifiers; final/static publics; Python convention compared'),
  Q(2024, 1, 4, 'object-oriented-programming', ['inheritance', 'collections-and-comparisons', 'class-design-and-encapsulation'], 'Student/year subclass design; Comparator; ConcurrentModificationException; redesign'),
  Q(2024, 1, 5, 'introduction-to-probability', ['expectation-properties-variance-discrete-distributions', 'conditional-probabilities-and-bayes-theorem'], 'Broken USB sticks; Binomial→Poisson approximation; geometric until success'),
  Q(2024, 1, 6, 'introduction-to-probability', ['expectation-properties-variance-discrete-distributions', 'random-variables-pmf-expectation'], 'Elephant weights as Normals; Chebyshev; D = M-F distribution; PDF from CDF'),
  Q(2024, 1, 7, 'algorithms-1', ['strategies-for-algorithm-design'], 'Longest descending subsequence — DP optimal substructure analysis and pseudocode'),
  Q(2024, 1, 8, 'algorithms-1', ['data-structures', 'sorting'], 'Running median impossibility; Dutch national flag rainbow sort on linked list'),
  Q(2024, 1, 9, 'algorithms-2', ['graphs-and-path-finding-algorithms'], 'Shortest-path bottlenecks and opportunities; relaxed cost; O(E + V log V) algorithm'),
  Q(2024, 1, 10, 'algorithms-2', ['advanced-data-structures'], 'Hash table with DELETED markers; potential function; amortised O(1) set/delete'),

  // ───── 2024 — Paper 2 ─────
  Q(2024, 2, 1, 'digital-electronics', ['logic-minimisation', 'logic-gates-and-boolean-algebra', 'transistors-and-gates'], 'XOR identity proof; Quine-McCluskey simplification; CMOS transistor circuit analysis'),
  Q(2024, 2, 2, 'digital-electronics', ['synchronous-state-machines-1', 'flip-flop-applications-and-timing', 'latches-and-flip-flops'], '3-bit synchronous counter with mode; Mealy FSM row matching; metastability MTBF'),
  Q(2024, 2, 3, 'operating-systems', ['scheduling', 'scheduling-algorithms', 'processes'], 'Context switch; RR vs CFS scheduling examples; cloud-function predictability'),
  Q(2024, 2, 4, 'operating-systems', ['memory-management', 'paging', 'virtual-memory'], 'Address binding stages; page-replacement OPT/LRU/FIFO trace; Belády; emulating reference/dirty bits'),
  Q(2024, 2, 5, 'software-security-engineering', ['security-principles', 'common-vulnerabilities'], 'EMV transaction protocol; attacks (replay, downgrade); mitigations'),
  Q(2024, 2, 6, 'software-security-engineering', ['requirements-and-specifications', 'design-for-failure', 'testing-strategies'], 'E-bike safety analysis; safety vs security policy; test strategy; methodology'),
  Q(2024, 2, 7, 'discrete-maths', ['numbers', 'sets'], 'Modular inverse symmetry; Euclid gcd(12346,57891); gcd associativity; P(X⊎{0}) bijection'),
  Q(2024, 2, 8, 'discrete-maths', ['sets', 'proofs'], 'Closure operator on relations; big union/intersection; rule induction on strings'),
  Q(2024, 2, 9, 'discrete-maths', ['sets', 'proofs'], 'Sections, retractions; locally subsingleton/singleton; bijection ↔ section + retraction triple'),
  Q(2024, 2, 10, 'discrete-maths', ['regular-languages-and-finite-automata'], 'DFA for sum-of-digits language; partially deterministic NFAs; DFA homomorphisms and products'),

  // ───── 2024 — Paper 3 ─────
  Q(2024, 3, 1, 'databases', ['the-relational-database', 'conceptual-modelling-with-er-diagrams', 'implementing-an-er-model-relationally'], 'Relational algebra union/join cardinality; ER diagram for textbook DB; design extension'),
  Q(2024, 3, 2, 'databases', ['transactions-reliability-throughput-consistency', 'the-relational-database', 'conceptual-modelling-with-er-diagrams'], 'CAP theorem; reflexive vs DB relations; schema decomposition with FDs; is_a hierarchies'),
  Q(2024, 3, 3, 'introduction-to-graphics', ['human-vision-colour-and-tone-mapping'], 'Colour space choice; BT.709 vs BT.2020; metameric match transformation matrix'),
  Q(2024, 3, 4, 'introduction-to-graphics', ['graphics-pipeline', 'graphics-hardware-and-opengl', 'human-vision-colour-and-tone-mapping'], 'AR headset rendering pipeline; bit depth, pixel size, see-through; stereo view matrices'),
  Q(2024, 3, 5, 'interaction-design', ['intro-to-ixd-ucd-user-research-methods', 'user-research-data-analysis-keeping-the-user-in-mind'], 'ChatGPT stakeholders; heuristic evaluation; interview design; analysis'),
  Q(2024, 3, 6, 'interaction-design', ['requirements-analysis-and-design-space', 'intro-to-ixd-ucd-user-research-methods'], 'Financial literacy app: requirements, sketches, personas, Gestalt principles'),
  Q(2024, 3, 7, 'machine-learning-real-world-data', ['sentiment-classification', 'hidden-markov-models-clustering'], 'Naïve Bayes for student level; smoothing; feature relevance; clustering for class formation'),
  Q(2024, 3, 8, 'machine-learning-real-world-data', ['hidden-markov-models-clustering'], 'HMM for snowfall prediction; Viterbi; richer states by season'),
  Q(2024, 3, 9, 'machine-learning-real-world-data', ['sentiment-classification'], 'Naïve Bayes football recruits; bias and fairness; trajectory modelling'),

  // ───── 2023 — Paper 1 ─────
  Q(2023, 1, 1, 'foundations-of-computer-science', ['sorting', 'lists-and-polymorphism'], 'Run-length encoding sort; comparator-driven sort; freq_sort'),
  Q(2023, 1, 2, 'foundations-of-computer-science', ['datatypes-and-trees'], 'Quadtree of points; has_point and has_point_in (rectangle)'),
  Q(2023, 1, 3, 'object-oriented-programming', ['generics', 'polymorphism-multiple-inheritance-coupling', 'design-patterns'], 'Java array covariance; cohesion vs coupling; observer + strategy patterns; UML'),
  Q(2023, 1, 4, 'object-oriented-programming', ['generics', 'inheritance', 'class-design-and-encapsulation'], 'Type erasure; immutability; Liskov-Substitution and Single Responsibility violations'),
  Q(2023, 1, 5, 'introduction-to-probability', ['expectation-properties-variance-discrete-distributions', 'random-variables-pmf-expectation'], 'UEFA pairings expectation; covariance; independence checks; estimation'),
  Q(2023, 1, 6, 'introduction-to-probability', ['random-variables-pmf-expectation', 'expectation-properties-variance-discrete-distributions'], 'Continuous uniform; min of two uniforms; random triangle/circle/rectangle areas and circumferences'),
  Q(2023, 1, 7, 'algorithms-1', ['data-structures'], 'XOR doubly-linked list (DLLx); pseudocode for length, insert, circular extension'),
  Q(2023, 1, 8, 'algorithms-1', ['strategies-for-algorithm-design'], 'Lossless compression bound; Huffman code construction; bit-rate analysis'),
  Q(2023, 1, 9, 'algorithms-2', ['graphs-and-path-finding-algorithms'], 'Bidirectional Dijkstra correctness — counter-examples and reasoning'),
  Q(2023, 1, 10, 'algorithms-2', ['advanced-data-structures'], 'Stack with periodic backup; potential function; amortised analysis'),

  // ───── 2023 — Paper 2 ─────
  Q(2023, 2, 1, 'digital-electronics', ['logic-minimisation', 'multilevel-logic-and-hazards', 'beyond-simple-logic-gates'], 'SOP/POS forms with don\'t cares; Karnaugh map simplification; hazard fix; multiplexers'),
  Q(2023, 2, 2, 'digital-electronics', ['synchronous-state-machines-1', 'synchronous-state-machines-2', 'flip-flop-applications-and-timing'], '6-state synchronous counter and self-start; FSM equivalence reduction; max clock frequency'),
  Q(2023, 2, 3, 'operating-systems', ['paging', 'virtual-memory', 'io-systems'], 'Interrupts vs traps; effective access time with page faults at given rates'),
  Q(2023, 2, 4, 'operating-systems', ['scheduling', 'scheduling-algorithms', 'processes'], 'Context switching; RR vs SJF turnaround; CPU burst prediction mechanism'),
  Q(2023, 2, 5, 'software-security-engineering', ['testing-strategies', 'engineering-mindset-and-the-cost-of-failure'], 'Innovations in dev methodology: HLLs, regression testing, OSS, SaaS'),
  Q(2023, 2, 6, 'software-security-engineering', ['security-principles', 'common-vulnerabilities', 'design-for-failure', 'ethics-and-professionalism'], 'Home-security camera startup: threat model, comms, enrolment, recovery, abuse-resistance'),
  Q(2023, 2, 7, 'discrete-maths', ['numbers', 'sets', 'proofs'], 'gcd properties; A∩B set identities; existence of identity-on-subset function'),
  Q(2023, 2, 8, 'discrete-maths', ['numbers', 'proofs', 'sets'], '(x−1) divides (xⁿ−1); 24 divides expression by induction; ∀∃ ↔ union containment'),
  Q(2023, 2, 9, 'discrete-maths', ['proofs', 'sets'], 'Inductively defined balanced strings; bijection of involution; arity inductive proof'),
  Q(2023, 2, 10, 'discrete-maths', ['regular-languages-and-finite-automata'], 'Inductive language definition; regular expressions; DFA for substring counting (overlap rules)'),

  // ───── 2025 — Paper 2 ─────
  Q(2025, 2, 1, 'digital-electronics', ['logic-gates-and-boolean-algebra', 'beyond-simple-logic-gates', 'multilevel-logic-and-hazards'], 'XOR identities; AND/OR/XOR + multiplexer implementations; static hazard removal'),
  Q(2025, 2, 2, 'digital-electronics', ['synchronous-state-machines-1', 'flip-flop-applications-and-timing', 'latches-and-flip-flops'], 'FSM output sequence; state assignment & D inputs; clock frequency under skew'),
  Q(2025, 2, 3, 'operating-systems', ['protection', 'case-study-unix-linux-i'], 'UNIX access matrix and ACLs; multi-user file permissions; root UID change implications'),
  Q(2025, 2, 4, 'operating-systems', ['paging', 'virtual-memory'], '57-bit virtual addressing; 5-level page tables; TLB effective access time; binary trie alternative'),
  Q(2025, 2, 5, 'software-security-engineering', ['testing-strategies', 'security-principles', 'common-vulnerabilities'], 'Decentralised social media testing; password vs public key auth across servers'),
  Q(2025, 2, 6, 'software-security-engineering', ['testing-strategies', 'ethics-and-professionalism'], 'Behavioural analytics + A/B testing framework architecture; user safety under sensitive content'),
  Q(2025, 2, 7, 'discrete-maths', ['sets', 'numbers', 'proofs'], 'Quantifier exchange over relations; modular arithmetic on primes; |B| vs |N×B| isomorphism'),
  Q(2025, 2, 8, 'discrete-maths', ['numbers', 'proofs'], 'gcd ↔ congruence; Fermat-style equivalence; sum-of-cubes divisibility; smallest superset'),
  Q(2025, 2, 9, 'discrete-maths', ['sets', 'proofs'], 'Injective ⇒ retraction caveats; cardinality and surjections; subset of countable; reflexive relations'),
  Q(2025, 2, 10, 'discrete-maths', ['regular-languages-and-finite-automata', 'sets', 'proofs'], 'Equivalence-closure rules and intersections; cardinality of DFA family; palindromes regularity'),

  // ───── 2025 — Paper 3 ─────
  Q(2025, 3, 1, 'databases', ['the-relational-database', 'further-sql', 'semi-structured-document-databases'], 'X∩(Y∪Z) in SQL; list/set rDBMS schemas; outer join definition under three-valued logic'),
  Q(2025, 3, 2, 'databases', ['conceptual-modelling-with-er-diagrams', 'semi-structured-document-databases', 'graph-oriented-databases'], 'Vineyard ER design; rDBMS variants; graph DB; recipe JSON expansions'),
  Q(2025, 3, 3, 'introduction-to-graphics', ['rendering', 'graphics-pipeline'], 'Pinhole camera; ray-tracing complexity; shadow rays; Phong specular vs diffuse; spectral colour'),
  Q(2025, 3, 4, 'introduction-to-graphics', ['graphics-pipeline', 'graphics-hardware-and-opengl', 'rasterisation'], 'Cylinder transforms; normal under SRT; Z-buffer; vertex attributes/uniforms; barycentric coords'),
  Q(2025, 3, 5, 'interaction-design', ['requirements-analysis-and-design-space', 'intro-to-ixd-ucd-user-research-methods'], 'Career-help app: requirements, screens, info architecture, cognitive walkthrough, redesign'),
  Q(2025, 3, 6, 'interaction-design', ['intro-to-ixd-ucd-user-research-methods', 'user-research-data-analysis-keeping-the-user-in-mind'], 'Microsoft Teams heuristic violations; human attention and memory; uptake research approach'),
  Q(2025, 3, 7, 'machine-learning-real-world-data', ['sentiment-classification'], 'Offensive-message detection: lexicon vs Naïve Bayes; rater reliability; smoothing'),
  Q(2025, 3, 8, 'machine-learning-real-world-data', ['social-networks'], 'Graph centralities (degree, clustering, betweenness); diameter; SCCs; community detection'),
  Q(2025, 3, 9, 'machine-learning-real-world-data', ['hidden-markov-models-clustering'], 'V/C HMM trained from words; transition + emission probs; smoothing for unseen letters'),

  // ───── 2023 — Paper 3 ─────
  Q(2023, 3, 1, 'databases', ['conceptual-modelling-with-er-diagrams', 'further-sql', 'transactions-reliability-throughput-consistency', 'graph-oriented-databases'], 'Vehicle ER design; GROUP BY reduction operator algebra; eventual consistency; one-graph-per-DB'),
  Q(2023, 3, 2, 'databases', ['the-relational-database', 'semi-structured-document-databases'], 'Join associativity and execution plans; candidate vs primary keys; XML structuredness; project equivalents'),
  Q(2023, 3, 3, 'introduction-to-graphics', ['rendering', 'graphics-pipeline'], 'Phong reflection edge cases; ray-traced shadows including soft; shadow-map rasterisation pipeline and artifacts'),
  Q(2023, 3, 4, 'introduction-to-graphics', ['background', 'graphics-hardware-and-opengl', 'human-vision-colour-and-tone-mapping'], 'Java image-storage class with arbitrary strides; region of interest; non-standard primaries to BT.709 conversion'),
  Q(2023, 3, 5, 'interaction-design', ['user-research-data-analysis-keeping-the-user-in-mind', 'intro-to-ixd-ucd-user-research-methods'], 'CamCORS analysis: memory, attention, information architecture, evaluation method choice'),
  Q(2023, 3, 6, 'interaction-design', ['intro-to-ixd-ucd-user-research-methods', 'requirements-analysis-and-design-space'], 'Mindfulness app: research methods, stakeholders, requirements, design principle, prototyping'),
  Q(2023, 3, 7, 'machine-learning-real-world-data', ['sentiment-classification'], 'Annotator agreement: pairwise raw, Cohen\'s Kappa, partial annotations, crowd-sourcing pitfalls'),
  Q(2023, 3, 8, 'machine-learning-real-world-data', ['sentiment-classification', 'social-networks'], 'Naïve Bayes paper-area routing; data shifts (split, merge, new); citation network similarity'),
  Q(2023, 3, 9, 'machine-learning-real-world-data', ['hidden-markov-models-clustering'], 'HMM modelling inflation→interest rates: estimation, decoding (Viterbi), shortcomings'),

  // ───── 2022 — Paper 1 ─────
  Q(2022, 1, 1, 'foundations-of-computer-science', ['lists-and-polymorphism', 'currying', 'procedural-programming'], 'Wordle-like guess game: mapi, lookfor; create_game returning a closure with state'),
  Q(2022, 1, 2, 'foundations-of-computer-science', ['lists-and-polymorphism', 'datatypes-and-trees', 'recursion-and-efficiency'], 'Sets of integers as interval lists: standard form, add, intersection'),
  Q(2022, 1, 3, 'object-oriented-programming', ['class-design-and-encapsulation', 'object-life-cycle-garbage-collection-copying'], 'Immutable classes; AssetLocation with optional immutability anti-pattern; better design'),
  Q(2022, 1, 4, 'object-oriented-programming', ['generics', 'polymorphism-multiple-inheritance-coupling'], 'Java type checking, type erasure, Set generics casts, TreeSet diamond / raw'),
  Q(2022, 1, 5, 'introduction-to-probability', ['expectation-properties-variance-discrete-distributions', 'conditional-probabilities-and-bayes-theorem'], 'Multiple-choice exam: Binomial→Normal approx; conditional; joint distribution from conditionals'),
  Q(2022, 1, 6, 'introduction-to-probability', ['random-variables-pmf-expectation', 'expectation-properties-variance-discrete-distributions'], 'Exponential lifetime; geometric on discrete owners; min of two exponentials; unbiased estimator'),
  Q(2022, 1, 7, 'algorithms-1', ['data-structures'], 'BST invariants BT1 vs BT2; deleteRoot pseudocode preserving BT2 without copy-key'),
  Q(2022, 1, 8, 'algorithms-1', ['sorting', 'strategies-for-algorithm-design'], 'Bottom-up mergesort: pass count, merges per pass; bug analysis with unit tests'),
  Q(2022, 1, 9, 'algorithms-2', ['graphs-and-subgraphs'], 'Bipartite matching for Tripos UA assignments; correctness; running time; term constraint'),
  Q(2022, 1, 10, 'algorithms-2', ['advanced-data-structures', 'strategies-for-algorithm-design'], 'partialsum on balanced BST; successor; potential function; O(m + log n) analysis'),

  // ───── 2022 — Paper 2 ─────
  Q(2022, 2, 1, 'digital-electronics', ['logic-gates-and-boolean-algebra', 'logic-minimisation'], 'Boolean XOR identities; Quine-McCluskey on 4-var function; counting equal-complexity solutions'),
  Q(2022, 2, 2, 'digital-electronics', ['latches-and-flip-flops', 'synchronous-state-machines-1', 'beyond-simple-logic-gates'], 'UV flip-flop; sequence-detection FSM; one-hot encoding; output-glitch fix'),
  Q(2022, 2, 3, 'operating-systems', ['memory-management', 'paging'], 'Segmentation vs paging; 32-bit two-level page tables; 1KB page tradeoffs; software paging via segments'),
  Q(2022, 2, 4, 'operating-systems', ['case-study-unix-linux-i', 'processes', 'scheduling'], 'UNIX file descriptors as capabilities; pipe vs file redirection; idle-process defrag pitfalls'),
  Q(2022, 2, 5, 'software-security-engineering', ['ethics-and-professionalism', 'requirements-and-specifications', 'design-for-failure'], 'Social media safety; VR/AR psychological effects; AR spectacles safety policy and methodology'),
  Q(2022, 2, 6, 'software-security-engineering', ['ethics-and-professionalism', 'common-vulnerabilities'], 'Bookkeeping protections; staff vs firm dishonesty; Post Office Horizon recurrence prevention'),
  Q(2022, 2, 7, 'discrete-maths', ['numbers', 'sets', 'proofs'], 'Modular congruence equivalence; bijection of Z_m by multiplication; Bij({0}∪A) ≅ ({0}∪A)×Bij(A,A)'),
  Q(2022, 2, 8, 'discrete-maths', ['numbers', 'sets', 'proofs'], 'gcd multiplicativity; recurrence-defined Pell-like sequence proof; product universal property'),
  Q(2022, 2, 9, 'discrete-maths', ['sets', 'proofs'], 'Double-negation retraction; if X→((X→R)→R)→R surjects then R singleton; inductively defined relation totality'),
  Q(2022, 2, 10, 'discrete-maths', ['regular-languages-and-finite-automata'], 'DFA construction over Σ={0..5}; 6-state and 7-state DFAs; NFAᵉ subset-construction with reachability'),

  // ───── 2022 — Paper 3 ─────
  Q(2022, 3, 1, 'databases', ['further-sql', 'the-relational-database'], 'IMDb co-actors in romantic comedies; complex three-actor SQL with not-in conditions'),
  Q(2022, 3, 2, 'databases', ['conceptual-modelling-with-er-diagrams', 'the-relational-database', 'further-sql'], 'Tripos supervisions ER comparison; relational implementation; SQL with NULL groups'),
  Q(2022, 3, 3, 'introduction-to-graphics', ['rendering', 'graphics-pipeline'], 'Cone implicit equation; ray-cone intersection; normal at surface; rotation+translation transforms'),
  Q(2022, 3, 4, 'introduction-to-graphics', ['graphics-hardware-and-opengl', 'rasterisation', 'human-vision-colour-and-tone-mapping'], 'OpenGL artifacts (z-fighting, mipmap aliasing); GLSL checkerboard shader; BT.2020 to display conversion'),
  Q(2022, 3, 5, 'interaction-design', ['user-research-data-analysis-keeping-the-user-in-mind', 'intro-to-ixd-ucd-user-research-methods'], 'Sales dashboard: Gestalt principles, Cognitive Walkthrough instruction sheet, mobile redesign'),
  Q(2022, 3, 6, 'interaction-design', ['intro-to-ixd-ucd-user-research-methods', 'requirements-analysis-and-design-space'], 'COVID-19 reporting app: research methods, stakeholders, requirements, usability vs privacy'),
  Q(2022, 3, 7, 'machine-learning-real-world-data', ['sentiment-classification'], 'Fraud detection: TP/FP/FN/TN; precision/recall vs accuracy; sign test design; better metrics'),
  Q(2022, 3, 8, 'machine-learning-real-world-data', ['hidden-markov-models-clustering'], 'COVID-19 positivity HMM; HMM assumptions; Viterbi prediction over 3 weeks; shortcomings'),
  Q(2022, 3, 9, 'machine-learning-real-world-data', ['sentiment-classification'], 'Brand-attack Naive Bayes; expected features and generalization; early-warning evaluation; post-level vs brand-level'),

  // ───── 2021 — Paper 1 (CS+NST) ─────
  Q(2021, 1, 1, 'foundations-of-computer-science', ['sequences-and-lazy-lists', 'datatypes-and-trees', 'recursion-and-efficiency'], 'Lazy sequences merge; equal_seq non-termination example; tree fringes equality'),
  Q(2021, 1, 2, 'foundations-of-computer-science', ['lists-and-polymorphism', 'dictionaries-and-functional-arrays', 'datatypes-and-trees'], 'W×H matrix as: list-of-lists, array-of-arrays, functional-array-of-arrays; complexities'),
  Q(2021, 1, 3, 'object-oriented-programming', ['class-design-and-encapsulation', 'motivations-languages-oop-intro'], 'Java without static fields or inheritance; environment objects to emulate static state'),
  Q(2021, 1, 4, 'object-oriented-programming', ['design-patterns', 'motivations-languages-oop-intro'], 'Reader/Swapper Decorator pattern; Open-Closed; arbitrary character ops; image-decryption extension'),
  Q(2021, 1, 5, 'introduction-to-probability', ['expectation-properties-variance-discrete-distributions', 'random-variables-pmf-expectation'], 'Customer satisfaction Binomial→Normal; joint density (cx) marginals; independence test'),
  Q(2021, 1, 6, 'introduction-to-probability', ['expectation-properties-variance-discrete-distributions', 'random-variables-pmf-expectation'], 'Korfball scoring Binomial; geometric until first miss; sampling without replacement; covariance'),
  Q(2021, 1, 7, 'algorithms-1', ['data-structures', 'sorting'], 'BST-sort; enhanced 2-3-4-sort; comparison with heap/merge/quicksort; space bounds'),
  Q(2021, 1, 8, 'algorithms-1', ['data-structures'], 'E-commerce bestsellers under varied scale; data structure choices; cost analysis at different ratios'),
  Q(2021, 1, 9, 'algorithms-2', ['graphs-and-path-finding-algorithms'], 'Pareto-efficient paths in directed graph; bound on path length; algorithm + correctness'),
  Q(2021, 1, 10, 'algorithms-2', ['graphs-and-subgraphs'], 'Maximum spanning tree O(E + V log V); translation strategy; rigorous correctness proof'),

  // ───── 2021 — Paper 2 ─────
  Q(2021, 2, 1, 'digital-electronics', ['logic-gates-and-boolean-algebra', 'logic-minimisation', 'beyond-simple-logic-gates'], 'Boolean POS proofs; 3-term simplification; K-map POS; NOR-only realisation'),
  Q(2021, 2, 2, 'digital-electronics', ['transistors-and-gates', 'beyond-simple-logic-gates'], 'N-channel MOSFET load-line; rise-time analysis; CMOS gate truth table from layout'),
  Q(2021, 2, 3, 'operating-systems', ['paging', 'virtual-memory', 'storage-and-file-management', 'case-study-unix-linux-i'], 'Page table + TLB sizing; UNIX i-node max file size; directory traversal disk access counts'),
  Q(2021, 2, 4, 'operating-systems', ['scheduling', 'scheduling-algorithms', 'protection'], 'FCFS/SJF/SRTF waiting times; minimum-context-switch analysis; UNIX file permissions, setuid'),
  Q(2021, 2, 5, 'software-security-engineering', ['security-principles', 'ethics-and-professionalism'], 'Insider-threat: multilevel security policy; separation of duty; psychology of error; quick wins'),
  Q(2021, 2, 6, 'software-security-engineering', ['security-principles', 'ethics-and-professionalism', 'common-vulnerabilities'], 'University WiFi monitoring for COVID compliance; performance/security/privacy; alternative strategies'),
  Q(2021, 2, 7, 'discrete-maths', ['numbers', 'proofs'], 'gcd(c,ab)=1 ⇔ both gcd 1; "downward" induction principle; injective/surjective/bijective on [0,1]'),
  Q(2021, 2, 8, 'discrete-maths', ['numbers', 'sets', 'proofs'], 'Bezout-style identity; n^gcd(i,j) ≡ 1; equivalence relation on function space; cardinality of quotient'),
  Q(2021, 2, 9, 'discrete-maths', ['numbers', 'sets', 'proofs'], '4ⁿ+6n−1 ≡ 0 mod 9; reflexive-transitive closure as union; pairwise-disjoint subsets uncountability'),
  Q(2021, 2, 10, 'discrete-maths', ['regular-languages-and-finite-automata'], 'NFAᵉ acceptance examples; subset construction; regex within length bound; binary "increment" language'),

  // ───── 2021 — Paper 3 ─────
  Q(2021, 3, 1, 'databases', ['the-relational-database', 'conceptual-modelling-with-er-diagrams'], 'Library DB consistency; redesign with Copy_Of entity; relational implementations; SQL reproducing original'),
  Q(2021, 3, 2, 'databases', ['the-relational-database', 'further-sql'], 'IMDb critique queries: Stan Lee writer count; co-actor double-counts; Jennifer Lawrence role grouping'),
  Q(2021, 3, 3, 'introduction-to-graphics', ['rasterisation', 'graphics-pipeline'], '2D triangle mesh; barycentric attribute lookup pseudocode; depth-aware version without Z-buffer'),
  Q(2021, 3, 4, 'introduction-to-graphics', ['graphics-pipeline'], 'SARS-CoV-2 scene graph; transformation matrices for spikes; even spherical sampling pseudocode'),
  Q(2021, 3, 5, 'interaction-design', ['requirements-analysis-and-design-space', 'intro-to-ixd-ucd-user-research-methods'], 'New timepiece design: requirements, low-fi alternatives, heuristic evaluation of two prototypes'),
  Q(2021, 3, 6, 'interaction-design', ['intro-to-ixd-ucd-user-research-methods', 'user-research-data-analysis-keeping-the-user-in-mind'], 'Weather app cognitive walkthrough across multiple tasks; redesign; iterative data gathering'),
  Q(2021, 3, 7, 'machine-learning-real-world-data', ['social-networks'], 'Fishing village directed graph centralities; undirected diameter; directed vs undirected betweenness; SCCs'),
  Q(2021, 3, 8, 'machine-learning-real-world-data', ['hidden-markov-models-clustering'], 'Pandemic policy HMM transition table; Viterbi over 6 weeks; modelling limitations'),
  Q(2021, 3, 9, 'machine-learning-real-world-data', ['sentiment-classification'], 'Cyberbullying NB; precision/recall over accuracy; multi-annotator agreement; lexicon for language change'),

  // ───── 2020 — Paper 1 (CS+NST) ─────
  Q(2020, 1, 1, 'foundations-of-computer-science', ['datatypes-and-trees', 'lists-and-polymorphism', 'recursion-and-efficiency', 'sequences-and-lazy-lists'], 'OCaml type design (open vs closed); identify_exn vs identify_opt; mutable vs functional sequence-spotter'),
  Q(2020, 1, 2, 'foundations-of-computer-science', ['lists-and-polymorphism', 'currying', 'recursion-and-efficiency'], 'Simplified Mastermind: feedback function; curried test; generate_lists; valid_lists filter'),
  Q(2020, 1, 3, 'object-oriented-programming', ['inheritance', 'polymorphism-multiple-inheritance-coupling', 'design-patterns'], 'ButtonCanvas via multiple inheritance vs interfaces; UML; default-method impact'),
  Q(2020, 1, 4, 'object-oriented-programming', ['memory-pointers-references', 'generics', 'inheritance'], 'Primitive vs object types; auto-boxing exceptions; pass-by-value guarantees; Mutable/Immutable list hierarchy'),
  Q(2020, 1, 5, 'introduction-to-probability', ['expectation-properties-variance-discrete-distributions', 'random-variables-pmf-expectation'], 'Binomial→Poisson approximation; uniform Yi unbiased estimator for θ²; √T bias analysis'),
  Q(2020, 1, 6, 'introduction-to-probability', ['expectation-properties-variance-discrete-distributions', 'random-variables-pmf-expectation'], 'Poisson/Bernoulli/Binomial PMFs; football modelling choices; joint distribution table; covariance'),
  Q(2020, 1, 7, 'algorithms-1', ['data-structures'], 'Tree traversal representations (pre/in/post); reverse-engineering obfuscated parser; in-order pseudocode'),
  Q(2020, 1, 8, 'algorithms-1', ['sorting'], 'Bubblesort/heapsort/quicksort best/worst inputs; linked-list dedup; Ω lower bound for dedup'),
  Q(2020, 1, 9, 'algorithms-2', ['graphs-and-path-finding-algorithms'], 'DFS reachability; finding an "origin" vertex (one that reaches all others) in O(V+E)'),
  Q(2020, 1, 10, 'algorithms-2', ['advanced-data-structures', 'data-structures'], 'α-balanced BST amortized cost under skewed query workload; weighted-union + path-compression analogy'),

  // ───── 2020 — Paper 2 ─────
  Q(2020, 2, 1, 'digital-electronics', ['logic-gates-and-boolean-algebra', 'logic-minimisation', 'beyond-simple-logic-gates'], 'Boolean simplification; multiplexer implementations; 8-input priority encoder'),
  Q(2020, 2, 2, 'digital-electronics', ['synchronous-state-machines-1', 'latches-and-flip-flops', 'beyond-simple-logic-gates'], 'Mealy/Moore comparison; FSM with Z=A·A_{n-1} or A+A_{n-1}; multiplexer realisation; GLA vs GAL'),
  Q(2020, 2, 3, 'operating-systems', ['paging', 'virtual-memory'], 'Paging hardware/software interplay for isolation; 5-level page table TLB analysis; bandwidth/latency trade'),
  Q(2020, 2, 4, 'operating-systems', ['io-systems', 'processes'], 'Network buffering: single/double/circular; simultaneous read+write; context switch state'),
  Q(2020, 2, 5, 'software-security-engineering', ['security-principles', 'common-vulnerabilities'], 'Brokerage app key recovery; email vs KYC vs SMS 2FA tradeoffs; better recovery design'),
  Q(2020, 2, 6, 'software-security-engineering', ['design-for-failure', 'ethics-and-professionalism'], 'Fault tree analysis; FMEA; Therac-25/Boeing 737 MAX shortcomings; safety assessment alternatives'),
  Q(2020, 2, 7, 'discrete-maths', ['proofs', 'numbers'], 'Boolean implication; CRT for coprime moduli; Fermat\'s Little Theorem; RSA proof n^{ed} ≡ n'),
  Q(2020, 2, 8, 'discrete-maths', ['numbers', 'sets', 'proofs'], 'Euclidean step gcd(a,b)=gcd(a-b,b); gcd(2^{qn+r}-1, 2^n-1) recurrence; surjection N→{0,1}^N impossibility'),
  Q(2020, 2, 9, 'discrete-maths', ['sets', 'proofs'], 'Partition product; monotone function least fixed point on P(U); bijection N ↔ {0,1}*'),
  Q(2020, 2, 10, 'discrete-maths', ['regular-languages-and-finite-automata'], 'DFA recognising binary strings divisible by 8; "never in debt" language regularity; inductive language derivations'),

  // ───── 2020 — Paper 3 ─────
  Q(2020, 3, 1, 'databases', ['the-relational-database', 'further-sql'], 'Many-to-many SQL paths via two relations; SELECT vs SELECT DISTINCT; counting paths through junction'),
  Q(2020, 3, 2, 'databases', ['the-relational-database', 'further-sql'], 'Composite key with C; referential integrity; what query equivalences imply about data'),
  Q(2020, 3, 3, 'introduction-to-graphics', ['human-vision-colour-and-tone-mapping'], 'Scene-referred vs display-referred; HDR encoding; glare simulation; gamma encoding; metamerism test'),
  Q(2020, 3, 4, 'introduction-to-graphics', ['rendering', 'graphics-pipeline'], 'Phong term breakdown; microfacet distributions; mirror-then-plane reflected ray geometry'),
  Q(2020, 3, 5, 'interaction-design', ['intro-to-ixd-ucd-user-research-methods', 'user-research-data-analysis-keeping-the-user-in-mind'], 'CUSTOM stakeholder analysis on Weather App; task analysis limits; finding-vs-statement evaluation'),
  Q(2020, 3, 6, 'interaction-design', ['requirements-analysis-and-design-space', 'intro-to-ixd-ucd-user-research-methods'], 'Weather App tasks; data-collection methods for visually impaired users; six Gestalt principles'),
  Q(2020, 3, 7, 'machine-learning-real-world-data', ['sentiment-classification'], 'Hand-drawn image NB classifier; bag-of-pixels; preprocessing; high-level shape features'),
  Q(2020, 3, 8, 'machine-learning-real-world-data', ['hidden-markov-models-clustering'], 'Crop-cultivation HMM; estimation; assumptions; the three other HMM problems'),
  Q(2020, 3, 9, 'machine-learning-real-world-data', ['social-networks'], '4×4 grid network: shortest paths, diameter, betweenness, bridges/local bridges; realism critique'),

  // ───── 2019 — Paper 1 (CS+NST) ─────
  // Note: 2019 had a "Numerical Analysis" module instead of Probability;
  // its content (Newton-Raphson, eigenvalues, least squares) maps onto NST Maths
  // (Methods I differentiation/Taylor; Methods III matrices). Tagged accordingly.
  Q(2019, 1, 1, 'foundations-of-computer-science', ['datatypes-and-trees', 'recursion-and-efficiency', 'lists-and-polymorphism'], 'Peano / Binary / Church integer representations; toInt and add for each; Church composition'),
  Q(2019, 1, 2, 'foundations-of-computer-science', ['datatypes-and-trees', 'lists-and-polymorphism', 'sequences-and-lazy-lists', 'currying'], 'Nested integer lists: flatten, nested_map, pack_as; lazy nested_zlist conversion'),
  Q(2019, 1, 3, 'object-oriented-programming', ['motivations-languages-oop-intro', 'class-design-and-encapsulation', 'generics'], 'Element class anatomy (super, this, @Override); immutability; FuncList; generic-covariance restriction'),
  Q(2019, 1, 4, 'object-oriented-programming', ['motivations-languages-oop-intro', 'design-patterns', 'polymorphism-multiple-inheritance-coupling'], 'What is an object; OOP for large software; Open-Closed principle; UML for an OCP-compliant design'),
  Q(2019, 1, 5, 'nst-mathematics-a', ['mm-i-differentiation', 'mm-i-taylor-series'], 'Newton–Raphson recursion derivation; quadratic convergence proof; iteration count for x² − 1'),
  Q(2019, 1, 6, 'nst-mathematics-a', ['mm-iii-matrices'], 'Matrix factorisations (LU, QR, Cholesky); least-squares estimation; diagonalisation and eigenvectors'),
  Q(2019, 1, 7, 'algorithms-1', ['strategies-for-algorithm-design'], 'Stamp denominations DP minimum coverage; refuelling-stations DP; greedy proof of optimality'),
  Q(2019, 1, 8, 'algorithms-1', ['data-structures'], 'Inserting 0..n into BST / 2-3-4 / B-tree (t=3) / hash table / binary heap; final structure each'),
  Q(2019, 1, 9, 'algorithms-1', ['data-structures'], 'Random Access Queue; linked list amortised counter-example; circular array implementation with proof'),
  Q(2019, 1, 10, 'algorithms-2', ['graphs-and-subgraphs'], 'Maximum flow on undirected network; valid-flow proof; max-flow = min-cut for undirected case'),

  // ───── 2019 — Paper 2 ─────
  Q(2019, 2, 1, 'digital-electronics', ['logic-gates-and-boolean-algebra', 'logic-minimisation', 'multilevel-logic-and-hazards'], 'POS via distributive law; LU operation table; SOP-form glitches and hazard fix'),
  Q(2019, 2, 2, 'digital-electronics', ['latches-and-flip-flops', 'synchronous-state-machines-1', 'beyond-simple-logic-gates'], 'Sequential vs combinational, sync vs async; mode-controlled 3-bit counter; row-matching FSM minimisation'),
  Q(2019, 2, 3, 'operating-systems', ['processes', 'scheduling', 'scheduling-algorithms'], 'UNIX process state diagram; pre-emptive vs non-preemptive transitions; FCFS waiting time and convoy effect'),
  Q(2019, 2, 4, 'operating-systems', ['protection', 'processes', 'case-study-unix-linux-i'], 'CPU/memory/IO isolation mechanisms; signals/pipes/named pipes IPC; ACL vs capability files'),
  Q(2019, 2, 5, 'software-security-engineering', ['requirements-and-specifications', 'security-principles', 'common-vulnerabilities'], 'PenAMessage audit: error/failure/hazard/risk distinctions; system elements; risk identification approach'),
  Q(2019, 2, 6, 'software-security-engineering', ['testing-strategies', 'design-for-failure'], 'EvaCam dev environment; unit/integration/E2E examples; coverage limits; release process per component'),
  Q(2019, 2, 7, 'discrete-maths', ['numbers', 'proofs'], 'Modular congruence as equivalence relation; extended Euclidean algorithm; Chinese Remainder Theorem'),
  Q(2019, 2, 8, 'discrete-maths', ['numbers', 'sets', 'proofs'], 'Well-founded relations; well-founded order on N×N pairs; subtraction-based GCD reaches (h,h)'),
  Q(2019, 2, 9, 'discrete-maths', ['sets', 'proofs'], 'Injection/surjection/bijection; P(A×B) ≅ A→P(B); currying isomorphism; Cantor: no injection P(X) ↪ X'),
  Q(2019, 2, 10, 'discrete-maths', ['regular-languages-and-finite-automata'], 'Even-#0s DFA + regex; inductive language property proof; intersection DFA combining four properties'),

  // ───── 2019 — Paper 3 ─────
  Q(2019, 3, 1, 'databases', ['the-relational-database', 'further-sql'], 'IMDb DB redundancy; pair-of-genres counting; Bacon-number 2 SQL with and without views'),
  Q(2019, 3, 2, 'databases', ['conceptual-modelling-with-er-diagrams', 'the-relational-database', 'further-sql'], 'Meta-ER DB (storing ER models); cardinalities; relational implementation; SQL meta-query'),
  Q(2019, 3, 3, 'introduction-to-graphics', ['graphics-pipeline'], 'Identify homographic transformations from matrices; chain transforms to reposition and resize a cone'),
  Q(2019, 3, 4, 'introduction-to-graphics', ['human-vision-colour-and-tone-mapping', 'background'], 'RGB/HLS/CIE L*a*b* uses; scene→display two-step rationale; ITU-R 2020 linear to 709 gamma-corrected'),
  Q(2019, 3, 5, 'interaction-design', ['intro-to-ixd-ucd-user-research-methods', 'user-research-data-analysis-keeping-the-user-in-mind'], 'UCD diagram and gaps; heuristic evaluation of clothing site; card-sorting similarity calculation'),
  Q(2019, 3, 6, 'interaction-design', ['intro-to-ixd-ucd-user-research-methods', 'requirements-analysis-and-design-space'], 'Stakeholder + data-gathering choices; Cognitive Walkthrough vs Heuristic Eval; Gestalt principles in real UIs'),
  Q(2019, 3, 7, 'machine-learning-real-world-data', ['sentiment-classification'], 'Two-classifier accuracy + sign test; permutation test from row-swapping; behaviour under ties'),
  Q(2019, 3, 8, 'machine-learning-real-world-data', ['hidden-markov-models-clustering'], 'Mediaeval crops HMM with smoothing; one Viterbi step (δ at t=3); HMM assumptions; smoothing tradeoffs'),
  Q(2019, 3, 9, 'machine-learning-real-world-data', ['sentiment-classification'], 'Types vs tokens; Zipf-style frequency distribution; Heaps\' law; Naive Bayes authorship classifier'),
];

// Indexes for fast lookup.
const byModuleTopic = new Map<string, PastQuestion[]>();
for (const q of PAST_QUESTIONS) {
  for (const t of q.topics) {
    const key = `${q.module}/${t}`;
    const arr = byModuleTopic.get(key) ?? [];
    arr.push(q);
    byModuleTopic.set(key, arr);
  }
  // Also bucket by module-only
  const moduleKey = `${q.module}/_module`;
  const marr = byModuleTopic.get(moduleKey) ?? [];
  marr.push(q);
  byModuleTopic.set(moduleKey, marr);
}

export function questionsForTopic(module: ModuleSlug, topicSlug: string): PastQuestion[] {
  return byModuleTopic.get(`${module}/${topicSlug}`) ?? [];
}

export function questionsForModule(module: ModuleSlug): PastQuestion[] {
  return byModuleTopic.get(`${module}/_module`) ?? [];
}

export function questionId(q: PastQuestion): string {
  return `${q.year}-${q.paper}-${q.number}`;
}

export function allYears(): number[] {
  const s = new Set<number>();
  for (const q of PAST_QUESTIONS) s.add(q.year);
  return Array.from(s).sort((a, b) => b - a);
}

export function yearPaperUrl(year: number, paper: CSPaper): string {
  return `https://www.cl.cam.ac.uk/teaching/exams/pastpapers/y${year}PAPER${paper}.pdf`;
}
