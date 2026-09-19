import { VisualEventType, VisualEvent } from './types.js';

export interface VisualEventMetadata {
  type: VisualEventType;
  label: string;
  category: 'STATE' | 'INPUT' | 'STACK' | 'TAPE' | 'BRANCH' | 'PARTITION' | 'OUTCOME';
  color: string;
  iconName: string;
  describe: (event: VisualEvent) => string;
}

export class VisualEventRegistry {
  private static registry: Map<VisualEventType, VisualEventMetadata> = new Map([
    [
      'STATE_CHANGE',
      {
        type: 'STATE_CHANGE',
        label: 'State Transition',
        category: 'STATE',
        color: '#818CF8',
        iconName: 'ArrowRightCircle',
        describe: (e) => `State moved from ${e.payload.from} to ${e.payload.to}`
      }
    ],
    [
      'INPUT_READ',
      {
        type: 'INPUT_READ',
        label: 'Input Read',
        category: 'INPUT',
        color: '#38BDF8',
        iconName: 'Eye',
        describe: (e) => `Scanned input symbol '${e.payload.symbol}' at position ${e.payload.index}`
      }
    ],
    [
      'INPUT_CONSUMED',
      {
        type: 'INPUT_CONSUMED',
        label: 'Input Consumed',
        category: 'INPUT',
        color: '#60A5FA',
        iconName: 'CheckCircle',
        describe: (e) => `Consumed symbol '${e.payload.symbol}'`
      }
    ],
    [
      'TRANSITION_APPLIED',
      {
        type: 'TRANSITION_APPLIED',
        label: 'Rule Fired',
        category: 'STATE',
        color: '#A855F7',
        iconName: 'Zap',
        describe: (e) => `Applied transition rule: ${e.mathematicalOperation}`
      }
    ],
    [
      'STACK_PUSH',
      {
        type: 'STACK_PUSH',
        label: 'Stack Push',
        category: 'STACK',
        color: '#34D399',
        iconName: 'ArrowUpCircle',
        describe: (e) => `Pushed symbol(s) '${e.payload.pushed}' onto stack`
      }
    ],
    [
      'STACK_POP',
      {
        type: 'STACK_POP',
        label: 'Stack Pop',
        category: 'STACK',
        color: '#F87171',
        iconName: 'ArrowDownCircle',
        describe: (e) => `Popped top symbol '${e.payload.popped}' from stack`
      }
    ],
    [
      'STACK_REPLACE',
      {
        type: 'STACK_REPLACE',
        label: 'Stack Replacement',
        category: 'STACK',
        color: '#FBBF24',
        iconName: 'RefreshCw',
        describe: (e) => `Replaced top symbol '${e.payload.popped}' with '${e.payload.pushed}'`
      }
    ],
    [
      'TAPE_READ',
      {
        type: 'TAPE_READ',
        label: 'Tape Read',
        category: 'TAPE',
        color: '#38BDF8',
        iconName: 'Eye',
        describe: (e) => `Read '${e.payload.symbol}' under head at cell ${e.payload.head}`
      }
    ],
    [
      'TAPE_WRITE',
      {
        type: 'TAPE_WRITE',
        label: 'Tape Write',
        category: 'TAPE',
        color: '#FB923C',
        iconName: 'Edit3',
        describe: (e) => `Overwrote cell ${e.payload.head} with '${e.payload.symbol}'`
      }
    ],
    [
      'TAPE_MOVE',
      {
        type: 'TAPE_MOVE',
        label: 'Head Movement',
        category: 'TAPE',
        color: '#A78BFA',
        iconName: 'Move',
        describe: (e) => `Shifted tape head ${e.payload.direction === 'R' ? 'Right (+1)' : e.payload.direction === 'L' ? 'Left (-1)' : 'Stay'}`
      }
    ],
    [
      'EPSILON_MOVE',
      {
        type: 'EPSILON_MOVE',
        label: 'Epsilon (ε) Move',
        category: 'STATE',
        color: '#C084FC',
        iconName: 'Sparkles',
        describe: (e) => `Spontaneous state transition without consuming input (ε)`
      }
    ],
    [
      'ACCEPT',
      {
        type: 'ACCEPT',
        label: 'Accepted',
        category: 'OUTCOME',
        color: '#10B981',
        iconName: 'CheckCheck',
        describe: (e) => `Computation accepted: ${e.description}`
      }
    ],
    [
      'REJECT',
      {
        type: 'REJECT',
        label: 'Rejected',
        category: 'OUTCOME',
        color: '#EF4444',
        iconName: 'XCircle',
        describe: (e) => `Computation rejected: ${e.description}`
      }
    ],
    [
      'BRANCH_CREATED',
      {
        type: 'BRANCH_CREATED',
        label: 'Branch Fork',
        category: 'BRANCH',
        color: '#818CF8',
        iconName: 'GitBranch',
        describe: (e) => `Nondeterministic branch created (${e.payload.count} paths)`
      }
    ],
    [
      'PARTITION_SPLIT',
      {
        type: 'PARTITION_SPLIT',
        label: 'Partition Refined',
        category: 'PARTITION',
        color: '#EC4899',
        iconName: 'Scissors',
        describe: (e) => `Split group into distinguishable equivalence classes: ${e.description}`
      }
    ]
  ]);

  static getMetadata(type: VisualEventType): VisualEventMetadata | undefined {
    return this.registry.get(type);
  }

  static validateEvent(event: VisualEvent): boolean {
    // Section 40: Every visual event must have a valid source and mathematical operation
    return Boolean(
      event &&
      event.type &&
      event.mathematicalOperation &&
      this.registry.has(event.type)
    );
  }
}
