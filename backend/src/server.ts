import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DFAEngine } from './algorithms/automata/dfa.js';
import { NFAEngine } from './algorithms/automata/nfa.js';
import { MinimizationEngine } from './algorithms/automata/minimization.js';
import { RegexEngine } from './algorithms/regex/regexEngine.js';
import { ArdenEngine } from './algorithms/regex/ardenEngine.js';
import { CFGEngine } from './algorithms/cfg/cfgEngine.js';
import { PDAEngine } from './algorithms/pda/pdaEngine.js';
import { TMEngine } from './algorithms/tm/tmEngine.js';
import { PCPEngine } from './algorithms/computability/pcpEngine.js';
import { PumpingLemmaEngine } from './algorithms/pumping/pumpingEngine.js';
import { SolverService } from './modules/ai/solverService.js';
import { SEED_QUESTIONS } from './modules/questions/seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'TOC Visualizer Platform',
    syllabus: 'KTU 2024 Scheme',
    timestamp: new Date().toISOString()
  });
});

// 1. Modules & Topics Overview
app.get('/api/modules', (_req: Request, res: Response) => {
  res.json([
    {
      id: 1,
      name: 'Module 1: Foundations, Finite Automata, Regular Expressions & Regular Languages',
      submodules: ['Foundations', 'DFA', 'NFA & ε-NFA', 'DFA Minimization', 'Regular Expressions & Arden’s Theorem', 'Kleene’s Theorem', 'Pumping Lemma']
    },
    {
      id: 2,
      name: 'Module 2: Context-Free Grammars, PDA & Context-Free Languages',
      submodules: ['CFG & Derivations', 'Parse Trees & Ambiguity', 'Pushdown Automata (PDA)', 'CFG Simplification & CNF', 'CFL Properties & Pumping Lemma']
    },
    {
      id: 3,
      name: 'Module 3: Turing Machines & Chomsky Hierarchy',
      submodules: ['Turing Machine Model', 'TM Construction & Design Framework', 'TM Variants', 'Chomsky Hierarchy']
    },
    {
      id: 4,
      name: 'Module 4: Computability & Undecidability',
      submodules: ['Church-Turing Thesis', 'Universal Turing Machine (UTM)', 'Diagonalization', 'Reductions', 'Decidability', 'Halting Problem', 'Post Correspondence Problem (PCP)']
    }
  ]);
});

// 2. Question Seed Bank
app.get('/api/questions', (_req: Request, res: Response) => {
  res.json(SEED_QUESTIONS);
});

// 3. Universal Question Solver
app.post('/api/ai/solve', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question string is required' });
      return;
    }
    const result = await SolverService.solveQuestion(question);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to solve question' });
  }
});

// 4. Automata Simulation & Conversions
app.post('/api/automata/simulate', (req: Request, res: Response) => {
  try {
    const { automaton, input } = req.body;
    if (automaton.type === 'DFA') {
      const result = DFAEngine.simulate(automaton, input || '');
      res.json(result);
    } else {
      const result = NFAEngine.simulate(automaton, input || '');
      res.json(result);
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/automata/minimize', (req: Request, res: Response) => {
  try {
    const { automaton } = req.body;
    const result = MinimizationEngine.minimize(automaton);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/automata/nfa-to-dfa', (req: Request, res: Response) => {
  try {
    const { automaton } = req.body;
    const result = NFAEngine.subsetConstruction(automaton);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Regular Expressions & Arden's Theorem
app.post('/api/regex/to-nfa', (req: Request, res: Response) => {
  try {
    const { regex } = req.body;
    const result = RegexEngine.regexToNFA(regex);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/regex/arden-solve', (req: Request, res: Response) => {
  try {
    const { variable, p, q, form } = req.body;
    const result = ArdenEngine.solveSingleEquation(variable || 'X', p || 'a', q || 'b', form);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/fa/to-regex-arden', (req: Request, res: Response) => {
  try {
    const { automaton } = req.body;
    const result = ArdenEngine.faToRegexArden(automaton);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/fa/to-regex-elimination', (req: Request, res: Response) => {
  try {
    const { automaton } = req.body;
    const result = RegexEngine.faToRegexStateElimination(automaton);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. CFG Derivations & Transformations
app.post('/api/cfg/derive', (req: Request, res: Response) => {
  try {
    const { grammar, target, mode } = req.body;
    const result =
      mode === 'RIGHTMOST'
        ? CFGEngine.deriveRightmost(grammar, target || 'aabb')
        : CFGEngine.deriveLeftmost(grammar, target || 'aabb');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/cfg/ambiguity-demo', (_req: Request, res: Response) => {
  res.json(CFGEngine.demonstrateAmbiguity());
});

app.post('/api/cfg/to-cnf', (req: Request, res: Response) => {
  try {
    const { grammar } = req.body;
    const result = CFGEngine.toCNF(grammar);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Pushdown Automata
app.post('/api/pda/simulate', (req: Request, res: Response) => {
  try {
    const { pda, input } = req.body;
    const result = PDAEngine.simulate(pda, input || '');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/pda/from-cfg', (req: Request, res: Response) => {
  try {
    const { grammar } = req.body;
    const result = PDAEngine.cfgToNPDA(grammar);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Turing Machine
app.post('/api/tm/simulate', (req: Request, res: Response) => {
  try {
    const { tm, input } = req.body;
    const result = TMEngine.simulate(tm, input || '');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9. Computability & PCP
app.post('/api/computability/pcp', (req: Request, res: Response) => {
  try {
    const { tiles, sequence } = req.body;
    const result = PCPEngine.evaluateSequence(tiles, sequence || []);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/computability/pcp-benchmark', (_req: Request, res: Response) => {
  res.json(PCPEngine.getBenchmarkPCP());
});

// 10. Pumping Lemma Proofs
app.get('/api/pumping/proof', (req: Request, res: Response) => {
  const type = req.query.type as string;
  if (type === 'cfl') {
    res.json(PumpingLemmaEngine.getCFLProof('anbncn'));
  } else {
    res.json(PumpingLemmaEngine.getRegularProof('anbn'));
  }
});

// 11. Serve Frontend SPA
import path from 'path';
import fs from 'fs';

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[TOC Visualizer API] Server running on http://localhost:${PORT}`);
});
