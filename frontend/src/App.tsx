import React, { useState } from 'react';
import { Header } from './components/common/Header.js';
import { Sidebar, NavView } from './components/common/Sidebar.js';
import { CommandPalette } from './components/common/CommandPalette.js';
import { DashboardPage } from './features/dashboard/DashboardPage.js';
import { UniversalSolverPage } from './features/solver/UniversalSolverPage.js';
import { FoundationsLab } from './features/labs/FoundationsLab.js';
import { AutomataLab } from './features/labs/AutomataLab.js';
import { RegexLab } from './features/labs/RegexLab.js';
import { CFGLab } from './features/labs/CFGLab.js';
import { PDALab } from './features/labs/PDALab.js';
import { TMLab } from './features/labs/TMLab.js';
import { ComputabilityLab } from './features/labs/ComputabilityLab.js';
import { ExamModePage } from './features/practice/ExamModePage.js';
import { MyTOCLabPage } from './features/notebook/MyTOCLabPage.js';
import { ComputationalLabPage } from './features/computational_lab/ComputationalLabPage.js';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('computational_lab');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [solverQuery, setSolverQuery] = useState(
    'Design a DFA over {a,b} that accepts all strings containing the substring "ab"'
  );

  const handleSelectQueryFromPalette = (query: string) => {
    setSolverQuery(query);
    setCurrentView('solver');
  };

  const handleSaveToNotebook = (item: any) => {
    const existing = localStorage.getItem('toc_saved_problems');
    let list: any[] = [];
    if (existing) {
      try {
        list = JSON.parse(existing);
      } catch {}
    }
    list.unshift({
      id: Date.now().toString(),
      ...item
    });
    localStorage.setItem('toc_saved_problems', JSON.stringify(list));
  };

  const getModuleTitle = () => {
    switch (currentView) {
      case 'computational_lab':
        return 'TOC Computational Lab — Workstation Online';
      case 'dashboard':
        return 'TOC Problem-Solving Overview';
      case 'solver':
        return 'Universal Problem Solver';
      case 'foundations_lab':
        return 'Module 1.1: Foundations';
      case 'automata_lab':
        return 'Module 1.2: Finite Automata & Minimization';
      case 'regex_lab':
        return "Module 1.3: Regular Expressions, Arden's Theorem & Kleene's Map";
      case 'cfg_lab':
        return 'Module 2.1: Context-Free Grammars & Ambiguity';
      case 'pda_lab':
        return 'Module 2.2: Pushdown Automata';
      case 'tm_lab':
        return 'Module 3: Turing Machines & Chomsky Hierarchy';
      case 'computability_lab':
        return 'Module 4: Computability & Post Correspondence Problem';
      case 'exam_mode':
        return 'KTU Exam Simulator';
      case 'my_lab':
        return 'My TOC Notebook & Lab';
      default:
        return 'Theory of Computation';
    }
  };

  if (currentView === 'computational_lab') {
    return (
      <div className="min-h-screen bg-[#080B10] text-[#E8EDF5] flex flex-col font-sans">
        <ComputationalLabPage
          onNavigateToLegacyView={setCurrentView}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectQuery={handleSelectQueryFromPalette}
          onNavigate={setCurrentView}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        activeModuleTitle={getModuleTitle()}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        <main className="flex-1 bg-slate-950 overflow-y-auto pb-12">

          {currentView === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentView}
              onSelectQuery={handleSelectQueryFromPalette}
            />
          )}

          {currentView === 'solver' && (
            <UniversalSolverPage
              initialQuery={solverQuery}
              onSaveToNotebook={handleSaveToNotebook}
            />
          )}

          {currentView === 'foundations_lab' && <FoundationsLab />}
          {currentView === 'automata_lab' && <AutomataLab />}
          {currentView === 'regex_lab' && <RegexLab />}
          {currentView === 'cfg_lab' && <CFGLab />}
          {currentView === 'pda_lab' && <PDALab />}
          {currentView === 'tm_lab' && <TMLab />}
          {currentView === 'computability_lab' && <ComputabilityLab />}
          {currentView === 'exam_mode' && <ExamModePage />}
          {currentView === 'my_lab' && <MyTOCLabPage />}
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectQuery={handleSelectQueryFromPalette}
        onNavigate={setCurrentView}
      />
    </div>
  );
}

export default App;
