/**
 * Question Library Storage Service
 * Manages user-saved questions, custom benchmarks, and parameter snapshots.
 * Storage-provider independent (Requirement 39).
 */

export interface SavedQuestion {
  id: string;
  module: string;
  question: string;
  alphabet: string[];
  parameters: Record<string, any>;
  problemType?: string;
  testString?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'toc_saved_questions_library_v1';

// Seed default questions
const DEFAULT_SAVED: SavedQuestion[] = [
  {
    id: 'seed-1',
    module: 'Automata',
    question: 'Construct a DFA over {0,1} accepting binary strings divisible by 3',
    alphabet: ['0', '1'],
    parameters: { modulus: 3 },
    problemType: 'Binary Divisibility',
    testString: '110',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-2',
    module: 'Automata',
    question: 'Construct a DFA over {0,1} accepting binary strings divisible by 5',
    alphabet: ['0', '1'],
    parameters: { modulus: 5 },
    problemType: 'Binary Divisibility',
    testString: '1010',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-3',
    module: 'Automata',
    question: 'Construct a DFA over {0,1} for strings ending in 101',
    alphabet: ['0', '1'],
    parameters: { suffix: '101' },
    problemType: 'Suffix Matching',
    testString: '0101',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-4',
    module: 'Automata',
    question: 'Construct a DFA over {a,b,c} for strings containing substring ab',
    alphabet: ['a', 'b', 'c'],
    parameters: { substring: 'ab' },
    problemType: 'Substring Matching',
    testString: 'cabac',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-5',
    module: 'PDA',
    question: 'Construct a PDA for L = { 0^n 1^n | n >= 1 }',
    alphabet: ['0', '1'],
    parameters: {},
    problemType: 'Equal Exponents',
    testString: '0011',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-6',
    module: 'TM',
    question: 'Construct a Turing Machine for L = { 0^n 1^n | n >= 1 }',
    alphabet: ['0', '1'],
    parameters: {},
    problemType: 'Turing Recognition',
    testString: '0011',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-7',
    module: 'Regex',
    question: 'Convert (0+1)*01 to equivalent ε-NFA using Thompson construction',
    alphabet: ['0', '1'],
    parameters: { regex: '(0|1)*01' },
    problemType: 'Thompson ε-NFA',
    testString: '0101',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class QuestionLibraryStore {
  private static memoryStore: SavedQuestion[] | null = null;

  static getAll(): SavedQuestion[] {
    if (this.memoryStore) return this.memoryStore;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.memoryStore = JSON.parse(stored);
          return this.memoryStore!;
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using fallback memory store.', e);
    }

    this.memoryStore = [...DEFAULT_SAVED];
    this.persist();
    return this.memoryStore;
  }

  static getByModule(moduleName: string): SavedQuestion[] {
    const all = this.getAll();
    return all.filter(
      (q) => q.module.toLowerCase() === moduleName.toLowerCase() || moduleName.toLowerCase() === 'all'
    );
  }

  static save(
    item: Omit<SavedQuestion, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): SavedQuestion {
    const all = this.getAll();
    const now = new Date().toISOString();

    if (item.id) {
      const existingIdx = all.findIndex((q) => q.id === item.id);
      if (existingIdx !== -1) {
        const updated: SavedQuestion = {
          ...all[existingIdx],
          ...item,
          updatedAt: now
        };
        all[existingIdx] = updated;
        this.memoryStore = all;
        this.persist();
        return updated;
      }
    }

    const newQuestion: SavedQuestion = {
      ...item,
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    all.unshift(newQuestion);
    this.memoryStore = all;
    this.persist();
    return newQuestion;
  }

  static duplicate(id: string): SavedQuestion | null {
    const all = this.getAll();
    const target = all.find((q) => q.id === id);
    if (!target) return null;

    const copy = {
      ...target,
      question: `${target.question} (Copy)`
    };
    delete (copy as any).id;
    return this.save(copy);
  }

  static delete(id: string): boolean {
    let all = this.getAll();
    const initialLen = all.length;
    all = all.filter((q) => q.id !== id);
    if (all.length !== initialLen) {
      this.memoryStore = all;
      this.persist();
      return true;
    }
    return false;
  }

  private static persist() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && this.memoryStore) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryStore));
      }
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
  }
}
