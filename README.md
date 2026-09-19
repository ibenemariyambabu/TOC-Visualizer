# TOC Visualizer — Interactive Theory of Computation Learning & Problem-Solving Platform
> **KTU 2024 Scheme Syllabus Compliant — An Interactive Problem-Solving Laboratory**

---

## 🌟 Overview

**TOC Visualizer** is a production-quality, interactive full-stack learning platform designed specifically for students and educators studying **Theory of Computation (TOC)** according to the **APJ Abdul Kalam Technological University (KTU) 2024 Scheme**.

Rather than presenting static notes or black-box answers, TOC Visualizer implements an **Interactive Problem-Solving Laboratory** where:
- Every concept is taught through **visual interactive state machines, parse trees, stack animations, and tape heads**.
- Every step features a dedicated **"WHY?"** button explaining the mathematical and engineering rationale.
- Every state machine includes a **"What are we remembering?"** state meaning tracker.
- Common exam traps and **memory tricks** are highlighted at every stage.
- Answers are formatted specifically for **KTU University Exams (2 marks, 5 marks, 10 marks, 15 marks)** with marking schemes and formal 5-tuples/7-tuples.

---

## 📚 4-Module Syllabus Coverage (KTU 2024 Scheme)

### Module 1: Foundations, Finite Automata, Regular Expressions & Regular Languages
- **Foundations**: Alphabets ($\Sigma$), strings ($w$), languages ($L$), power of alphabet ($\Sigma^*, \Sigma^+$), empty string ($\varepsilon$), empty language ($\emptyset$).
- **Interactive Mechanical Models**:
  - *On/Off Switch Automaton*: 2-state toggle machine.
  - *Coffee Vending Machine*: Exact state machine tracking coin balances ($₹0 \to ₹10 \to ₹20 \to ₹30 \to \text{Coffee}$).
- **Deterministic Finite Automata (DFA)**:
  - 5-tuple formal definition: $M = (Q, \Sigma, \delta, q_0, F)$.
  - Interactive transition diagram with draggable state nodes.
  - Interactive tape runner with consumed vs remaining string simulation.
  - Automatic trap state completion and complementation ($F' = Q \setminus F$).
- **Nondeterministic Finite Automata (NFA & $\varepsilon$-NFA)**:
  - $\varepsilon$-closure computation.
  - Subset construction algorithm converting $\varepsilon\text{-NFA} \to \text{NFA} \to \text{DFA}$ with live partition tables.
- **DFA Minimization**:
  - Hopcroft-style partition refinement ($P_0 \to P_1 \to \dots$).
  - Detailed split explanations highlighting distinguishing input symbols.
- **Regular Expressions & Arden's Theorem**:
  - Direct single equation solver: $X = Q + XP \implies X = QP^*$ and $X = PX + Q \implies X = P^*Q$.
  - Uniqueness condition checking ($\varepsilon \notin P$).
  - Full system of equations formulation from incoming transitions: $R_i = \sum R_j \cdot a_{ji} + (\text{if } q_i = q_0 \text{ then } \varepsilon \text{ else } \emptyset)$.
  - Algebraic substitution visualization without hiding intermediate steps.
  - Automated regex validation against test strings.
- **State Elimination Method**:
  - Generalized Transition Graph (GTG) visualizer.
  - State removal with loop bypass formula: $R_{ij}^{(\text{new})} = R_{ij}^{(\text{old})} + R_{ik} \cdot (R_{kk})^* \cdot R_{kj}$.
  - Comparison table: **Arden's Theorem vs. State Elimination**.
- **Kleene's Theorem**:
  - Interactive **Equivalence Triangle**: $\text{Regular Expression} \iff \text{Finite Automaton} \iff \text{Regular Language}$.
  - Thompson's Construction ($\text{Regex} \to \varepsilon\text{-NFA}$) with operator fragment visualization (Union, Concatenation, Kleene Star).
- **Pumping Lemma for Regular Languages**:
  - Interactive adversary game decomposing $w = xyz$ under $|xy| \le p$ and $|y| \ge 1$.
  - Pumping with $i \in \{0, 1, 2, 3\}$ to derive contradictions on languages like $a^n b^n$, $w w^R$, and $0^{n^2}$.

---

### Module 2: Context-Free Grammars, PDA & Context-Free Languages
- **CFG & Derivations**: 4-tuple $G = (V, T, P, S)$, Leftmost Derivations (LMD) and Rightmost Derivations (RMD).
- **Parse Trees & Ambiguity Visualizer**:
  - Dual parse tree visualizer demonstrating structural ambiguity for $E \to E + E \mid E \times E \mid \text{id}$ on string `id + id * id`.
  - Disambiguation guides (precedence and associativity rules).
- **Pushdown Automata (PDA)**:
  - 7-tuple $M = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$.
  - Acceptance by final state vs empty stack.
  - Interactive visual stack with real-time push/pop animations alongside tape head.
  - Deterministic conversion of $\text{CFG} \to \text{NPDA}$.
- **CFG Simplification & Chomsky Normal Form (CNF)**:
  - Removal of $\varepsilon$-productions (nullable non-terminals).
  - Removal of Unit productions ($A \to B$).
  - Removal of Useless symbols (unreachable & non-generating).
  - Transformation to CNF: $A \to BC$ or $A \to a$.
- **Pumping Lemma for CFLs**:
  - Decomposition $w = uvxyz$ with $|vxy| \le p$ and $|vy| \ge 1$.
  - Pumping with $i \in \{0, 2\}$ for $a^n b^n c^n$.

---

### Module 3: Turing Machines & Chomsky Hierarchy
- **Standard Turing Machine**:
  - 7-tuple $M = (Q, \Sigma, \Gamma, \delta, q_0, B, F)$.
  - Infinite bidirectional tape visualizer with read-write head.
  - Built-in machine presets: $L = \{a^n b^n c^n \mid n \ge 1\}$, Palindrome checker $w w^R$, and Binary Incrementer.
  - Step logs, instantaneous descriptions (IDs), and loop limiter ($2000$ steps).
- **Turing Machine Design Framework**:
  - Formal 4-step engineering process: Tape Representation $\to$ Head Movement Strategy $\to$ Transition Table $\to$ Trace.
- **Chomsky Hierarchy Interactive Radar**:
  - Type 3 (Regular) $\subset$ Type 2 (Context-Free) $\subset$ Type 1 (Context-Sensitive) $\subset$ Type 0 (Recursively Enumerable).

---

### Module 4: Computability & Undecidability
- **Church-Turing Thesis**: Intuitive algorithmic computability equivalent to Turing computability.
- **Universal Turing Machine (UTM)**: Visual encoding $\langle M, w \rangle$ simulation.
- **Halting Problem ($H_{\text{TM}}$)**: Complete visual diagonalization contradiction proof ($D(\langle D \rangle)$ halts $\iff$ loops).
- **Post Correspondence Problem (PCP)**:
  - Interactive Domino Tile Matcher ($[\text{Top} / \text{Bottom}]$).
  - Real-time string comparison for arbitrary user-selected sequences.
  - Preset for KTU benchmark matching instances.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (tested and verified on Node.js v24.19.0 LTS).
- **npm** v9+.

### Installation

```bash
# Clone the repository
git clone https://github.com/username/toc-visualizer.git
cd toc-visualizer

# Install dependencies for both backend and frontend
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Running Locally

#### Development Mode
Run backend and frontend dev servers concurrently:
```bash
# Terminal 1: Backend API (port 5000)
cd backend
npm run dev

# Terminal 2: Frontend Vite Server (port 5173)
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

#### Production Mode
Build both applications and run the unified server:
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build

# Start production server (serves both API and SPA on port 5000)
npm run start
```
Open your browser at `http://localhost:5000`.

---

## 🧪 Testing

The platform includes an extensive suite of automated unit tests covering all deterministic algorithms:

```bash
cd backend
npm test
```

### Test Suite Summary
- **DFA Simulator**: Validates language acceptance, string parsing, and trap state transitions.
- **NFA Subset Construction**: Converts $\varepsilon$-NFA to DFA and verifies language equivalence.
- **Hopcroft Minimization**: Reduces redundant states and records partition refinement splits.
- **Arden's Theorem Single Equation**: Verifies $X = aX + b \implies X = a^*b$ and uniqueness checks.
- **Arden's Theorem System Solver**: Formulates equations from incoming transitions, solves system algebraically, and validates against test strings.
- **Thompson's Construction**: Generates $\varepsilon$-NFA fragments for union, concatenation, and star.
- **State Elimination**: Evaluates $R_{ij} = R_{ik}(R_{kk})^*R_{kj}$ path combinations.
- **CFG Derivations**: Leftmost and Rightmost derivations for $a^n b^n$.
- **Pushdown Automaton**: Stack push/pop mechanics for $a^n b^n$.
- **Turing Machine**: Bidirectional tape head execution for $a^n b^n c^n$.
- **Post Correspondence Problem**: Exact top/bottom string matching for tile sequences.
- **Pumping Lemma Engine**: Proof decomposition and contradiction checking.

---

## 🏆 Key Features

| Feature | Description |
|---|---|
| **Universal Question Solver** | Paste any KTU exam question; automatically categorizes module, problem type, generates visual model, step explanation, and formatted KTU answers (2, 5, 10 marks). |
| **Regex Conversion Lab** | Direct comparison between **Arden's Theorem** and **State Elimination**, plus Thompson's $\text{Regex} \to \text{NFA}$ and Kleene's Equivalence Triangle. |
| **"WHY?" Explanations** | Every step in every algorithm features pedagogical explanations answering why this step was taken. |
| **State Memory Tracker** | Answers "What are we remembering in this state?" for every state in every automaton. |
| **Common Mistakes & Memory Aids** | Alerts students to common exam errors (e.g. applying $X = PX + Q$ as $QP^*$) and provides memorable mnemonics. |
| **Timed KTU Exam Simulator** | Real exam conditions with score tracking, review solutions, and "My Weak Areas" diagnostic analytics. |
| **My TOC Notebook** | Save solved problems, add personal annotations, and export study summaries. |
| **Command Palette (`Ctrl+K`)** | Instant keyboard-driven navigation across all labs, algorithms, and question types. |

---

## 📜 License
MIT License. Built for students, educators, and TOC enthusiasts.
