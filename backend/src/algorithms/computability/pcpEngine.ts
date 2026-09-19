import { PCPSimulationResult, PCPTile } from '../../types/index.js';

export class PCPEngine {
  /**
   * Evaluates an ordered sequence of domino tile selections for the Post Correspondence Problem (PCP)
   */
  static evaluateSequence(tiles: PCPTile[], sequence: number[]): PCPSimulationResult {
    let top = '';
    let bottom = '';

    for (const tileId of sequence) {
      const tile = tiles.find((t) => t.id === tileId);
      if (tile) {
        top += tile.top;
        bottom += tile.bottom;
      }
    }

    const isMatch = top.length > 0 && top === bottom;
    let explanation = '';

    if (top.length === 0) {
      explanation = 'Select one or more domino tiles to test a candidate sequence.';
    } else if (isMatch) {
      explanation = `MATCH FOUND! Sequence [${sequence.join(
        ', '
      )}] produces identical top and bottom strings "${top}" (length ${top.length}). This demonstrates a valid solution to this PCP instance.`;
    } else if (top.startsWith(bottom) || bottom.startsWith(top)) {
      explanation = `PARTIAL MATCH: Sequence [${sequence.join(
        ', '
      )}] has matching prefixes. Top: "${top}" (${top.length} chars) vs Bottom: "${bottom}" (${bottom.length} chars). Try adding more tiles!`;
    } else {
      explanation = `MISMATCH DETECTED: Sequence [${sequence.join(
        ', '
      )}] diverged. Top "${top}" does not match Bottom "${bottom}". This branch cannot lead to a solution.`;
    }

    return {
      sequence,
      topString: top,
      bottomString: bottom,
      isMatch,
      explanation
    };
  }

  /**
   * Pre-configured benchmark PCP instances
   */
  static getBenchmarkPCP(): { title: string; tiles: PCPTile[]; solution?: number[] } {
    return {
      title: 'Classic Solvable PCP Instance',
      tiles: [
        { id: 1, top: 'a', bottom: 'ab' },
        { id: 2, top: 'ba', bottom: 'a' },
        { id: 3, top: 'b', bottom: 'bb' }
      ],
      solution: [1, 2] // top: "a" + "ba" = "aba", bottom: "ab" + "a" = "aba"
    };
  }
}
