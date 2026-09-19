# Architecture Documentation — TOC Visualizer

## 1. High-Level System Architecture

TOC Visualizer is organized as a decoupled, full-stack TypeScript application consisting of:
1. **Core Deterministic Algorithms Layer (`backend/src/algorithms/` & `frontend/src/algorithms/`)**:
   - Zero-mocking, 100% mathematically sound algorithms.
   - Dual-deployable: algorithms run both server-side for REST API endpoints and client-side in the browser for ultra-responsive, offline-capable visualizations.
2. **Interactive Visualizer Components (`frontend/src/visualizers/`)**:
   - Draggable SVG graph visualizer (`AutomataGraphView`).
   - Tape string runner with instantaneous description (`TapeStringSimulator`).
   - Arden's Theorem equation visualizer (`ArdenVisualizer`).
   - State Elimination timeline & GTG visualizer (`StateEliminationVisualizer`).
   - Dual parse tree and ambiguity inspector (`ParseTreeView`).
   - Animated LIFO stack view (`PDAStackView`).
   - Bidirectional Turing Machine infinite tape (`TMTapeView`).
   - Pumping Lemma adversarial game view (`PumpingLemmaView`).
   - Post Correspondence Problem domino matcher (`PCPTileView`).
3. **Lab Feature Modules (`frontend/src/features/labs/`)**:
   - Foundations Lab (On/Off Switch, Coffee Vending Machine).
   - Automata Lab (DFA/NFA simulation, subset construction, Hopcroft minimization).
   - Regex Conversion Lab (Thompson $\text{Regex} \to \text{NFA}$, Arden's Theorem $\text{FA} \to \text{RE}$, State Elimination, Kleene's Theorem).
   - Context-Free Grammar Lab (LMD/RMD, Ambiguity, CNF).
   - Pushdown Automata Lab.
   - Turing Machine Lab.
   - Computability & Undecidability Lab.
4. **Pedagogical & Exam Services (`features/solver/`, `features/practice/`, `features/notebook/`)**:
   - Universal Question Solver with KTU 2/5/10/15 marks answer generator.
   - Timed KTU Exam simulator with score tracking and mistake analysis.
   - My TOC Lab notebook for saving problems and revision notes.

---

## 2. Deterministic Algorithm Design

### Mathematical Integrity & Invariants
All automata algorithms uphold strict formal definitions:
- **DFA Simulator**: Evaluates deterministically on $\delta(q, a)$. If transition is missing, directs to trap state ($q_{\text{trap}}$).
- **Subset Construction**: Computes $\varepsilon$-closure of states using BFS. Powersets are named descriptively (e.g. `[q0, q1]`) and mapped to canonical DFA state IDs.
- **Hopcroft Minimization**: Starts with 2 partitions: $P_0 = \{F, Q \setminus F\}$. Repeatedly refines partitions based on transition behavior across alphabet $\Sigma$ until no partition splits.
- **Arden's Theorem Engine**:
  - Automatically derives state equations from incoming transitions:
    $$R_i = \sum_{j} R_j \cdot a_{ji} + (\text{if } q_i = q_0 \text{ then } \varepsilon \text{ else } \emptyset)$$
  - Validates uniqueness criterion: checks that recursive coefficient $P$ does not contain $\varepsilon$ ($P \cap \{\varepsilon\} = \emptyset$).
  - Solves $X = PX + Q \implies X = P^*Q$ or $X = XP + Q \implies X = QP^*$.
  - Propagates substitutions across all states and unions expressions for accept states.
- **State Elimination Engine**:
  - Constructs Generalized Transition Graph (GTG).
  - Eliminates state $q_k$ using the universal bypass formula:
    $$R_{ij}^{(\text{new})} = R_{ij}^{(\text{old})} + R_{ik} \cdot (R_{kk})^* \cdot R_{kj}$$
- **PDA Stack Simulation**:
  - Instantaneous Description $(q, w, \gamma)$ tracked at every transition.
  - Stack replacement correctly processes string expansions (e.g. replace $Z_0$ with $aZ_0$ or pop with $\varepsilon$).
- **Turing Machine Tape Simulation**:
  - Dynamically expanding bidirectional array with blank symbols $B$.
  - Tracks head index, step count, and instantaneous descriptions $u q v$.
  - 2,000-step loop ceiling to safeguard against infinite loops while identifying non-halting behavior.

---

## 3. Data Contracts & Visualizer API

Every visualizer adheres to standard unified control interfaces:
```typescript
interface VisualizerControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5x, 1x, 2x
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
}
```

Every algorithmic step emitted contains:
- `stepNumber`: 1-indexed execution index.
- `title`: Short descriptive label.
- `whatChanged`: Concrete state change description.
- `why`: Pedagogical rationale ("WHY was this step taken?").
- `currentEquation` / `sententialForm` / `headPosition`: Domain-specific state.

---

## 4. Universal Question Solver Architecture

When a user inputs a natural language or exam question:
1. **Classifier**: Regex and keyword matching parses topic, subtopic, and problem category (e.g., Substring matching, Modulo arithmetic, Arden equation, Ambiguity proof).
2. **Model Synthesizer**: Connects to the appropriate deterministic algorithm engine to generate valid formal models and step-by-step traces.
3. **KTU Exam Answer Generator**: Generates formatted answers structured for:
   - **2 Marks**: Concise formal definition, 5-tuple / 7-tuple, and key mathematical equation.
   - **5 Marks**: Logic explanation, transition diagram/table, and sample string verification.
   - **10 Marks**: Complete derivation, state justification, full 5-tuple, and common pitfalls warning.
