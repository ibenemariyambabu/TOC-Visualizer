import React from 'react';
import { RealAppProps, RealAppScenarioConfig } from './types';
import { DFATrafficController } from './scenarios/DFATrafficController';
import { NFACyberDetector } from './scenarios/NFACyberDetector';
import { EpsilonNFAWorkflow } from './scenarios/EpsilonNFAWorkflow';
import { NFAToDFAFactory } from './scenarios/NFAToDFAFactory';
import { DFAMinimizationOptimizer } from './scenarios/DFAMinimizationOptimizer';
import { RegexSearchEngine } from './scenarios/RegexSearchEngine';
import { ArdenWorkbench } from './scenarios/ArdenWorkbench';
import { CFGCompilerLab } from './scenarios/CFGCompilerLab';
import { CFGAmbiguityLab } from './scenarios/CFGAmbiguityLab';
import { PDAStackWarehouse } from './scenarios/PDAStackWarehouse';
import { TMProcessor } from './scenarios/TMProcessor';
import { ComputabilityChamber } from './scenarios/ComputabilityChamber';
import { GeneralComputationalLab } from './scenarios/GeneralComputationalLab';

export interface ScenarioDefinition {
  id: string;
  name: string;
  metaphor: string;
  description: string;
  renderer: React.FC<RealAppProps>;
  defaultSkin: string;
}

/**
 * Registry of domain-specific Real Application Mode scenarios.
 * Strictly adheres to #42: Application Registry architecture.
 */
class ApplicationRegistry {
  private registry: Map<string, ScenarioDefinition> = new Map();
  private fallback: ScenarioDefinition;

  constructor() {
    this.fallback = {
      id: 'general_computational_lab',
      name: 'General Computational Lab',
      metaphor: 'Universal Abstract Machine Workstation',
      description: 'Unified computational apparatus rendering state changes, transition matrices and input trace.',
      renderer: GeneralComputationalLab,
      defaultSkin: 'computational_lab',
    };

    this.registerDefaults();
  }

  private registerDefaults() {
    this.register('dfa', {
      id: 'dfa_traffic_control',
      name: 'Industrial Traffic Control System',
      metaphor: 'Autonomous Intersection Signal Controller',
      description: 'Physical state relays control multi-lane traffic signals driven by optical vehicle sensor events.',
      renderer: DFATrafficController,
      defaultSkin: 'control_room',
    });

    this.register('nfa', {
      id: 'nfa_cyber_detector',
      name: 'SOC Cyber Threat Detection Grid',
      metaphor: 'Concurrent Security Event Intrusion Detector',
      description: 'Multi-branch speculative analysis tracks concurrent packet signatures and unauthorized privilege escalation.',
      renderer: NFACyberDetector,
      defaultSkin: 'cyber_monitor',
    });

    this.register('epsilon_nfa', {
      id: 'epsilon_nfa_workflow',
      name: 'Workflow Automation & Event Dispatcher',
      metaphor: 'Asynchronous Microservice Event Pipeline',
      description: 'Zero-cost internal epsilon steps model instantaneous automatic dispatches between pipeline nodes.',
      renderer: EpsilonNFAWorkflow,
      defaultSkin: 'computational_lab',
    });

    this.register('nfa_to_dfa', {
      id: 'nfa_to_dfa_factory',
      name: 'Subset Determinization Machine Factory',
      metaphor: 'High-Throughput State Synthesizer',
      description: 'Assembles composite powerset states into deterministic modular units in a conversion chamber.',
      renderer: NFAToDFAFactory,
      defaultSkin: 'machine_factory',
    });

    this.register('dfa_minimization', {
      id: 'dfa_minimization_optimizer',
      name: 'Hardware Circuit & State Optimization Unit',
      metaphor: 'Silicon Gate & Register Partition Compressor',
      description: 'Eliminates unreachable states and coalesces equivalent partitions into minimum circuit footprint.',
      renderer: DFAMinimizationOptimizer,
      defaultSkin: 'matrix_machine',
    });

    this.register('regex', {
      id: 'regex_search_engine',
      name: 'High-Speed Pattern Match Engine',
      metaphor: 'Optical Lexical Stream Scanner',
      description: 'Linear-time token scanner evaluating regular expressions over live document streams.',
      renderer: RegexSearchEngine,
      defaultSkin: 'compiler_lab',
    });

    this.register('arden', {
      id: 'arden_workbench',
      name: 'Automaton Analysis Workstation',
      metaphor: 'Linear Regular Expression Equation Solver',
      description: 'Performs formal algebraic transformations and Arden theorem reductions on state equations.',
      renderer: ArdenWorkbench,
      defaultSkin: 'computational_lab',
    });

    this.register('cfg', {
      id: 'cfg_compiler_lab',
      name: 'Compiler Frontend Parser Lab',
      metaphor: 'Syntactic Analyzer & AST Generator',
      description: 'Transforms token streams into hierarchical parse trees via context-free grammar production rules.',
      renderer: CFGCompilerLab,
      defaultSkin: 'compiler_lab',
    });

    this.register('cfg_ambiguity', {
      id: 'cfg_ambiguity_lab',
      name: 'Competing Parser Lab',
      metaphor: 'Dual-Path Syntactic Ambiguity Resolver',
      description: 'Simultaneously animates diverging parse trees on identical terminal sequences to detect grammatical ambiguity.',
      renderer: CFGAmbiguityLab,
      defaultSkin: 'compiler_lab',
    });

    this.register('pda', {
      id: 'pda_stack_warehouse',
      name: 'Automated Gantry Warehouse & Silo System',
      metaphor: 'LIFO Cargo Crane & Pushdown Stack',
      description: 'Gantry hoist pushes and pops cargo crates in synchronization with Instantaneous Descriptions (q, w, α).',
      renderer: PDAStackWarehouse,
      defaultSkin: 'machine_factory',
    });

    this.register('tm', {
      id: 'tm_processor',
      name: 'Turing Machine Computational Processor',
      metaphor: 'Micro-Architectural CPU & Magnetic Tape Bus',
      description: 'Magnetic head performs atomic READ -> WRITE -> MOVE -> STATE cycles over infinite linear tape.',
      renderer: TMProcessor,
      defaultSkin: 'control_room',
    });

    this.register('computability', {
      id: 'computability_chamber',
      name: 'Theoretical Computability Chamber',
      metaphor: 'Church-Turing Boundary & Reduction Oracle',
      description: 'Evaluates diagonal proofs, mapping reductions, and undecidability barriers without fake physical physics.',
      renderer: ComputabilityChamber,
      defaultSkin: 'minimal_math',
    });

    this.register('foundations', {
      id: 'foundations_lab',
      name: 'Input Communication Lab',
      metaphor: 'Digital Symbol Buffer & Language Checker',
      description: 'Animates symbols entering transmission buffers, string concatenation, alphabet checks, and language membership.',
      renderer: GeneralComputationalLab,
      defaultSkin: 'computational_lab',
    });

    this.register('npda', {
      id: 'npda_parallel_lab',
      name: 'Parallel Computation Laboratory',
      metaphor: 'Multi-Branch Non-Deterministic Stack Evaluator',
      description: 'Simultaneously traces concurrent non-deterministic computation paths with active, dead, and accepted branches.',
      renderer: NFACyberDetector,
      defaultSkin: 'cyber_monitor',
    });
  }

  public register(problemKey: string, scenario: ScenarioDefinition) {
    this.registry.set(problemKey.toLowerCase().trim(), scenario);
  }

  /**
   * Resolves problem type to the appropriate scenario definition.
   * If not found, falls back safely to GeneralComputationalLab (#43).
   */
  public resolve(problemType?: string, machineType?: string): ScenarioDefinition {
    const rawKey = (problemType || machineType || '').toLowerCase();

    // Direct match
    if (this.registry.has(rawKey)) {
      return this.registry.get(rawKey)!;
    }

    // Heuristic normalization
    if (rawKey.includes('foundat') || rawKey.includes('symbol') || rawKey.includes('alphabet') || rawKey.includes('string')) {
      return this.registry.get('foundations')!;
    }
    if (rawKey.includes('dfa') && rawKey.includes('min')) {
      return this.registry.get('dfa_minimization')!;
    }
    if (rawKey.includes('nfa') && rawKey.includes('dfa')) {
      return this.registry.get('nfa_to_dfa')!;
    }
    if (rawKey.includes('eps') || rawKey.includes('ε')) {
      return this.registry.get('epsilon_nfa')!;
    }
    if (rawKey.includes('dfa')) {
      return this.registry.get('dfa')!;
    }
    if (rawKey.includes('npda')) {
      return this.registry.get('npda')!;
    }
    if (rawKey.includes('nfa')) {
      return this.registry.get('nfa')!;
    }
    if (rawKey.includes('regex') || rawKey.includes('regular_expression')) {
      return this.registry.get('regex')!;
    }
    if (rawKey.includes('arden')) {
      return this.registry.get('arden')!;
    }
    if (rawKey.includes('ambigu')) {
      return this.registry.get('cfg_ambiguity')!;
    }
    if (rawKey.includes('cfg') || rawKey.includes('grammar')) {
      return this.registry.get('cfg')!;
    }
    if (rawKey.includes('pda') || rawKey.includes('dpda')) {
      return this.registry.get('pda')!;
    }
    if (rawKey.includes('tm') || rawKey.includes('turing')) {
      return this.registry.get('tm')!;
    }
    if (rawKey.includes('computab') || rawKey.includes('decid') || rawKey.includes('halt') || rawKey.includes('post')) {
      return this.registry.get('computability')!;
    }

    return this.fallback;
  }

  public getAllScenarios(): ScenarioDefinition[] {
    return Array.from(this.registry.values());
  }
}

export const applicationRegistry = new ApplicationRegistry();
