# TOC Algorithms & Mathematical Specifications

This document specifies the exact formal algorithms, theorems, and mathematical transformations implemented in the TOC Visualizer suite.

---

## 1. Arden's Theorem

### Statement
Let $P$ and $Q$ be two regular expressions over an alphabet $\Sigma$.
If $\varepsilon \notin P$ (i.e. $P$ does not contain the null string $\varepsilon$), then the equation:
$$X = Q + XP$$
has a unique solution given by:
$$X = QP^*$$

Similarly, for the left-recursive formulation:
$$X = PX + Q$$
the unique solution is:
$$X = P^*Q$$

### Proof of Uniqueness (Intuition)
Substituting $X = Q + XP$ into itself:
$$X = Q + (Q + XP)P = Q + QP + XP^2$$
Repeating $k$ times:
$$X = Q( \varepsilon + P + P^2 + \dots + P^k) + XP^{k+1}$$
In the limit as $k \to \infty$, since $\varepsilon \notin P$, $XP^{k+1}$ contributes only strings of length $\ge k+1$. Therefore:
$$X = Q P^*$$
If $\varepsilon \in P$, then $X = Q P^* + R$ for any language $R \subseteq P^*$, so the solution is no longer unique.

### Application to Finite Automata ($\text{FA} \to \text{RE}$)
1. For every state $q_i \in Q$, write an equation based on its **incoming transitions**:
   $$R_i = \sum_{q_j \xrightarrow{a} q_i} R_j \cdot a + (\varepsilon \text{ if } q_i = q_0 \text{ else } \emptyset)$$
2. Solve the resulting system of simultaneous linear equations by substitution and repeated application of Arden's theorem.
3. The regular expression accepted by the automaton is:
   $$L(M) = \sum_{q_f \in F} R_f$$

---

## 2. State Elimination Method ($\text{FA} \to \text{RE}$)

### Concept
Converts a DFA or NFA into a **Generalized Transition Graph (GTG)** where edge labels are arbitrary regular expressions.

### Elimination Formula
When state $q_k$ is eliminated, the transition regex $R_{ij}^{(\text{new})}$ between every predecessor state $q_i$ and successor state $q_j$ is updated as:
$$R_{ij}^{(\text{new})} = R_{ij}^{(\text{old})} + R_{ik} \cdot (R_{kk})^* \cdot R_{kj}$$
where:
- $R_{ik}$: Path from $q_i$ to $q_k$.
- $R_{kk}$: Self-loop on $q_k$ (or $\varepsilon$ if no self-loop).
- $R_{kj}$: Path from $q_k$ to $q_j$.
- $R_{ij}^{(\text{old})}$: Direct transition from $q_i$ to $q_j$ (or $\emptyset$ if none).

---

## 3. Thompson's Construction ($\text{RE} \to \varepsilon\text{-NFA}$)

Builds an equivalent $\varepsilon$-NFA compositionally from a regular expression AST:
1. **Base Symbol $a$**:
   $$q_{\text{start}} \xrightarrow{a} q_{\text{accept}}$$
2. **Union $R_1 + R_2$**:
   New start state branches to $R_1$ and $R_2$ via $\varepsilon$-transitions; both accept states connect to a new final state via $\varepsilon$.
3. **Concatenation $R_1 R_2$**:
   Accept state of $R_1$ merges/connects via $\varepsilon$ to start state of $R_2$.
4. **Kleene Star $R^*$**:
   New start state connects via $\varepsilon$ to $R$'s start state and new accept state. $R$'s accept state loops back to $R$'s start state and to new accept state via $\varepsilon$.

---

## 4. Subset Construction ($\text{NFA} \to \text{DFA}$)

1. For any set of states $S \subseteq Q_{\text{NFA}}$, compute its $\varepsilon$-closure:
   $$\varepsilon\text{-closure}(S) = \{ q' \in Q \mid \exists \text{ path from some } q \in S \text{ to } q' \text{ using only } \varepsilon \}$$
2. Set $q_0^{(\text{DFA})} = \varepsilon\text{-closure}(\{q_0\})$.
3. For each unmarked DFA state $U \subseteq Q_{\text{NFA}}$ and input symbol $a \in \Sigma$:
   $$\delta_{\text{DFA}}(U, a) = \varepsilon\text{-closure}\left( \bigcup_{q \in U} \delta_{\text{NFA}}(q, a) \right)$$
4. A DFA state $U$ is accepting if $U \cap F_{\text{NFA}} \neq \emptyset$.

---

## 5. Hopcroft-Style DFA Minimization

1. Partition states into 2 sets:
   $$P_0 = \{ F, Q \setminus F \}$$
2. For each partition $C \in P_k$ and input $a \in \Sigma$, check if states in $C$ transition to different partitions in $P_k$:
   - If $\delta(p, a) \in C_1$ and $\delta(q, a) \in C_2$ with $C_1 \neq C_2$, split $C$.
3. Repeat step 2 until $P_{k+1} = P_k$.
4. Merge equivalent states into single representative states.

---

## 6. Context-Free Grammars & Normal Forms

### Chomsky Normal Form (CNF)
A CFG is in CNF if all productions are of the form:
$$A \to BC \quad \text{or} \quad A \to a$$
(and $S \to \varepsilon$ if $\varepsilon \in L(G)$, with $S$ not appearing on any right-hand side).

**Transformation Pipeline**:
1. Eliminate $\varepsilon$-productions: identify nullable non-terminals and generate combinations.
2. Eliminate Unit productions: replace $A \to B$ with all productions of $B$.
3. Eliminate Useless symbols: eliminate non-generating variables, then eliminate unreachable variables.
4. Convert remaining productions to strictly binary variables or single terminals.

---

## 7. Pushdown Automata Simulation

A PDA configuration is an Instantaneous Description:
$$(q, w, \gamma)$$
where:
- $q \in Q$ is the current state.
- $w \in \Sigma^*$ is the remaining unread input string.
- $\gamma \in \Gamma^*$ is the current stack content (with the top on the left).

Transition function:
$$\delta(q, a, X) \ni (p, \alpha)$$
pops $X$ and pushes $\alpha$ onto the stack while moving to state $p$.

---

## 8. Turing Machine Simulation

A Turing Machine Instantaneous Description is:
$$u \, q \, v$$
where:
- $q \in Q$ is current state.
- $u \in \Gamma^*$ is the tape content to the left of the head.
- $v \in \Gamma^*$ is the tape content starting from current head position.

Transition:
$$\delta(q, X) = (p, Y, D), \quad D \in \{L, R\}$$
replaces symbol $X$ with $Y$, transitions from $q$ to $p$, and moves head in direction $D$.
