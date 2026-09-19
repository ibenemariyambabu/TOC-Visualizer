import React, { useState } from 'react';
import { Power, Coffee, Coins, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';

export const FoundationsLab: React.FC = () => {
  // 1. On/Off Switch State
  const [switchState, setSwitchState] = useState<'OFF' | 'ON'>('OFF');
  const [switchHistory, setSwitchHistory] = useState<string[]>(['OFF']);

  const handleToggleSwitch = () => {
    const next = switchState === 'OFF' ? 'ON' : 'OFF';
    setSwitchState(next);
    setSwitchHistory((prev) => [...prev, next]);
  };

  // 2. Coffee Vending Machine State
  const [vendingAmount, setVendingAmount] = useState<number>(0);
  const [dispensed, setDispensed] = useState(false);
  const [vendingHistory, setVendingHistory] = useState<{ amount: number; action: string }[]>([
    { amount: 0, action: 'Initial state: ₹0' }
  ]);

  const handleInsert10 = () => {
    if (dispensed) return;
    const newAmount = vendingAmount + 10;
    setVendingAmount(newAmount);

    if (newAmount >= 30) {
      setDispensed(true);
      setVendingHistory((prev) => [
        ...prev,
        { amount: newAmount, action: `Inserted ₹10 -> Total: ₹${newAmount}. Coffee Ready!` }
      ]);
    } else {
      setVendingHistory((prev) => [
        ...prev,
        { amount: newAmount, action: `Inserted ₹10 -> Total: ₹${newAmount}` }
      ]);
    }
  };

  const handleResetVending = () => {
    setVendingAmount(0);
    setDispensed(false);
    setVendingHistory([{ amount: 0, action: 'Reset to ₹0' }]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Module 1.1: Foundations Lab</h2>
        <p className="text-xs text-slate-400 mt-1">
          Interactive real-life models of discrete state machines: On/Off Switch & Coffee Vending Machine
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model 1: On/Off Switch */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 block">
                Simplest 2-State Automaton
              </span>
              <h3 className="text-sm font-bold text-slate-100">Interactive On/Off Switch</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold">
              States: 2
            </span>
          </div>

          <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-850 flex flex-col items-center justify-center gap-4">
            <button
              onClick={handleToggleSwitch}
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all shadow-xl active:scale-95 ${
                switchState === 'ON'
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-emerald-500/25 scale-105'
                  : 'bg-slate-800 border-2 border-slate-700 text-slate-400'
              }`}
            >
              <Power className={`h-8 w-8 ${switchState === 'ON' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="font-mono font-bold text-xs">{switchState}</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">Click switch to trigger transition event</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-xs font-mono text-slate-400">
            <span className="text-indigo-400 block font-bold mb-1">Formal 5-Tuple Definition:</span>
            M = (&#123;OFF, ON&#125;, &#123;push&#125;, δ, OFF, &#123;ON&#125;)<br />
            δ(OFF, push) = ON, δ(ON, push) = OFF
          </div>
        </div>

        {/* Model 2: Coffee Vending Machine */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                Sequential State Accumulator
              </span>
              <h3 className="text-sm font-bold text-slate-100">Coffee Vending Machine (Target: ₹30)</h3>
            </div>

            <button
              onClick={handleResetVending}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
              title="Reset Vending Machine"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Vending Machine States Flow: ₹0 -> ₹10 -> ₹20 -> ₹30 -> Coffee */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-3">
            {[0, 10, 20, 30].map((amt) => {
              const isCurrent = vendingAmount === amt;
              const isPassed = vendingAmount > amt;

              return (
                <div key={amt} className="flex items-center gap-1">
                  <div
                    className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-mono font-bold border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/20 scale-105'
                        : isPassed
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-slate-950 border-slate-850 text-slate-600'
                    }`}
                  >
                    <span className="text-xs">₹{amt}</span>
                    {amt === 30 && <Coffee className="h-3.5 w-3.5 mt-0.5 text-amber-400" />}
                  </div>
                  {amt < 30 && <ArrowRight className="h-3 w-3 text-slate-700 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Interaction & Dispense */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Current Balance</span>
              <span className="text-lg font-mono font-bold text-amber-300">₹{vendingAmount}</span>
            </div>

            {dispensed ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs animate-bounce">
                <Coffee className="h-4 w-4" />
                <span>Coffee Dispensed!</span>
              </div>
            ) : (
              <button
                onClick={handleInsert10}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/30 transition-all active:scale-95"
              >
                <Coins className="h-4 w-4" />
                <span>Insert ₹10 Coin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
