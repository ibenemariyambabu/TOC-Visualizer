import { ReactNode } from 'react';

export interface VisualizerPlugin {
  id: string;
  name: string;
  category: 'AUTOMATA' | 'REGULAR' | 'CFL' | 'TURING' | 'COMPUTABILITY';
  description: string;
  supportedInputTypes: string[];
  hasMemory: boolean;
  memoryType?: 'STACK' | 'TAPE' | 'TREE' | 'PARTITIONS';
  supportsNondeterminism: boolean;
  supportsComputationTree: boolean;
}

export class VisualizerRegistry {
  private static plugins: Map<string, VisualizerPlugin> = new Map([
    [
      'DFA',
      {
        id: 'DFA',
        name: 'Deterministic Finite Automaton',
        category: 'AUTOMATA',
        description: 'Single deterministic transition per state-symbol pair with left-to-right processing',
        supportedInputTypes: ['TOKEN_SEQUENCE', 'BINARY', 'ALPHANUMERIC'],
        hasMemory: false,
        supportsNondeterminism: false,
        supportsComputationTree: false
      }
    ],
    [
      'NFA',
      {
        id: 'NFA',
        name: 'Nondeterministic Finite Automaton',
        category: 'AUTOMATA',
        description: 'Multi-branch simultaneous state execution with dead branch pruning',
        supportedInputTypes: ['TOKEN_SEQUENCE', 'BINARY', 'ALPHANUMERIC'],
        hasMemory: false,
        supportsNondeterminism: true,
        supportsComputationTree: true
      }
    ],
    [
      'ENFA',
      {
        id: 'ENFA',
        name: 'Epsilon-NFA (ε-NFA)',
        category: 'AUTOMATA',
        description: 'Finite automaton permitting spontaneous state changes without input consumption',
        supportedInputTypes: ['TOKEN_SEQUENCE', 'BINARY', 'ALPHANUMERIC'],
        hasMemory: false,
        supportsNondeterminism: true,
        supportsComputationTree: true
      }
    ],
    [
      'PDA',
      {
        id: 'PDA',
        name: 'Pushdown Automaton (PDA/DPDA/NPDA)',
        category: 'CFL',
        description: 'Finite control augmented with a LIFO stack memory for counting and matching',
        supportedInputTypes: ['TOKEN_SEQUENCE', 'PARENTHESES', 'PALINDROMES'],
        hasMemory: true,
        memoryType: 'STACK',
        supportsNondeterminism: true,
        supportsComputationTree: true
      }
    ],
    [
      'TM',
      {
        id: 'TM',
        name: 'Turing Machine',
        category: 'TURING',
        description: 'Infinite discrete tape memory with read/write bidirectional head movement',
        supportedInputTypes: ['TOKEN_SEQUENCE', 'BINARY', 'UNARY'],
        hasMemory: true,
        memoryType: 'TAPE',
        supportsNondeterminism: false,
        supportsComputationTree: false
      }
    ],
    [
      'SUBSET',
      {
        id: 'SUBSET',
        name: 'Subset Construction (NFA → DFA)',
        category: 'AUTOMATA',
        description: 'Power-set state discovery generating equivalent deterministic DFA',
        supportedInputTypes: ['NFA_MODEL'],
        hasMemory: false,
        supportsNondeterminism: false,
        supportsComputationTree: false
      }
    ],
    [
      'MINIMIZATION',
      {
        id: 'MINIMIZATION',
        name: 'DFA State Minimization',
        category: 'AUTOMATA',
        description: 'Hopcroft partition refinement merging indistinguishable state equivalence classes',
        supportedInputTypes: ['DFA_MODEL'],
        hasMemory: true,
        memoryType: 'PARTITIONS',
        supportsNondeterminism: false,
        supportsComputationTree: false
      }
    ]
  ]);

  static getPlugin(id: string): VisualizerPlugin | undefined {
    return this.plugins.get(id.toUpperCase());
  }

  static getAllPlugins(): VisualizerPlugin[] {
    return Array.from(this.plugins.values());
  }

  static registerPlugin(plugin: VisualizerPlugin): void {
    this.plugins.set(plugin.id.toUpperCase(), plugin);
  }
}
