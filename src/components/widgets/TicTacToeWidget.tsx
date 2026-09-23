import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Users, Bot, Trophy, Sparkles, Scale, RefreshCw } from 'lucide-react';
import { TttCell, TttScore, TttDifficulty } from '../../types';
import { playMechanicalClick, playWinFanfare, playChime } from '../../utils/audio';

interface TicTacToeWidgetProps {
  onWinQuest: () => void;
  onPlayerMove?: () => void;
}

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],             // Diagonals
];

export const TicTacToeWidget: React.FC<TicTacToeWidgetProps> = ({ onWinQuest, onPlayerMove }) => {
  const [board, setBoard] = useState<TttCell[]>(Array(9).fill(null));
  const [isAiMode, setIsAiMode] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState<TttDifficulty>('balanced');
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [scores, setScores] = useState<TttScore>({ x: 0, o: 0, ties: 0, streak: 0 });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'tie'>('playing');
  const [aiComment, setAiComment] = useState<string>('Balanced match: Fair & Fun! ⚖️');

  const checkWinner = (cells: TttCell[]): { winner: 'X' | 'O'; combo: number[] } | null => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return { winner: cells[a] as 'X' | 'O', combo };
      }
    }
    return null;
  };

  /**
   * Balanced AI logic:
   * 1. Makes it easy for the human player to win by frequently leaving open paths for 3-in-a-row.
   * 2. Takes its own winning shots when available to keep wins balanced between Player and AI.
   * 3. Adapts dynamically to match flow: if player has a win streak, AI sharpens up to secure a win;
   *    if AI just won or is ahead, AI relaxes so player wins easily!
   */
  const getBestAiMove = (currentBoard: TttCell[]): { move: number; comment: string } => {
    // 1. Immediate AI winning moves (AI can get 3-in-a-row)
    const aiWinningMoves: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const test = [...currentBoard];
        test[i] = 'O';
        if (checkWinner(test)) aiWinningMoves.push(i);
      }
    }

    // 2. Immediate Player winning moves (Player can get 3-in-a-row on next turn)
    const playerWinningMoves: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const test = [...currentBoard];
        test[i] = 'X';
        if (checkWinner(test)) playerWinningMoves.push(i);
      }
    }

    // Available board spots
    const available = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((v): v is number => v !== null);

    if (available.length === 0) return { move: -1, comment: '' };

    // --- PRO / CHALLENGER MODE ---
    if (aiDifficulty === 'pro') {
      if (aiWinningMoves.length > 0) return { move: aiWinningMoves[0], comment: 'AI found the winning move! 🤖' };
      if (playerWinningMoves.length > 0) return { move: playerWinningMoves[0], comment: 'AI blocked your line! 🛡️' };
      if (!currentBoard[4] && Math.random() > 0.1) return { move: 4, comment: 'AI takes center! 🎯' };
      const corners = [0, 2, 6, 8].filter((idx) => !currentBoard[idx]);
      if (corners.length > 0) return { move: corners[Math.floor(Math.random() * corners.length)], comment: 'AI took a corner 📐' };
      return { move: available[Math.floor(Math.random() * available.length)], comment: 'AI played a move 🎲' };
    }

    // --- CHILL MODE (Super easy for player to win) ---
    if (aiDifficulty === 'chill') {
      if (aiWinningMoves.length > 0 && Math.random() < 0.35) {
        return { move: aiWinningMoves[0], comment: 'AI took a sneaky win! 🤖' };
      }
      if (playerWinningMoves.length > 0 && Math.random() < 0.2) {
        return { move: playerWinningMoves[0], comment: 'AI stumbled into a block! 🛡️' };
      }
      const openNonBlocks = available.filter((idx) => !playerWinningMoves.includes(idx));
      const pool = openNonBlocks.length > 0 ? openNonBlocks : available;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return {
        move: pick,
        comment: playerWinningMoves.length > 0 ? 'AI left an open winning spot! ✨' : 'AI plays casually 🍃',
      };
    }

    // --- BALANCED MODE (Default: Easy for player to win + balanced win for AI) ---
    const playerIsAhead = scores.streak >= 2 || scores.x > scores.o + 1;
    const aiNeedsScore = scores.o < scores.x || scores.streak >= 1;

    // A. AI WIN OPPORTUNITY
    // If AI has a direct winning move, take it to ensure AI also gets balanced wins
    if (aiWinningMoves.length > 0) {
      const takeWinChance = aiNeedsScore ? 0.90 : 0.72;
      if (Math.random() < takeWinChance) {
        return {
          move: aiWinningMoves[0],
          comment: 'AI connects 3-in-a-row! ⚡🤖',
        };
      }
    }

    // B. PLAYER WIN OPPORTUNITY: MAKE IT EASY FOR PLAYER TO WIN!
    if (playerWinningMoves.length > 0) {
      // If player has 2-in-a-row, AI intentionally does NOT block most of the time!
      // This leaves an open winning spot for the player to score an effortless victory.
      let blockChance = 0.30; // 70% chance AI leaves the path open!
      if (playerIsAhead) {
        // Player is on a streak; AI defends slightly more to keep win distribution balanced
        blockChance = 0.55;
      } else if (scores.streak === 0 || scores.o >= scores.x) {
        // AI just won or is leading; AI generously lets player win (85% easy win rate)
        blockChance = 0.15;
      }

      if (Math.random() < blockChance) {
        return {
          move: playerWinningMoves[0],
          comment: 'AI blocked the line! 🛡️',
        };
      } else {
        // Purposely leave the winning line open!
        const nonBlocking = available.filter((idx) => !playerWinningMoves.includes(idx));
        const pick = nonBlocking.length > 0
          ? nonBlocking[Math.floor(Math.random() * nonBlocking.length)]
          : available[Math.floor(Math.random() * available.length)];
        return {
          move: pick,
          comment: 'AI left an open path! Your turn to win! 🌟',
        };
      }
    }

    // C. AI SETS UP A THREAT (giving AI legitimate win chances for a balanced rivalry)
    const aiThreatMoves = available.filter((idx) => {
      const test = [...currentBoard];
      test[idx] = 'O';
      return WINNING_COMBOS.some((combo) => {
        const [a, b, c] = combo;
        const vals = [test[a], test[b], test[c]];
        return vals.filter((v) => v === 'O').length === 2 && vals.filter((v) => v === null).length === 1;
      });
    });

    if (aiThreatMoves.length > 0 && Math.random() < (aiNeedsScore ? 0.65 : 0.40)) {
      const threatMove = aiThreatMoves[Math.floor(Math.random() * aiThreatMoves.length)];
      return {
        move: threatMove,
        comment: 'AI sets up a line! 🎯',
      };
    }

    // D. CASUAL MOVES (avoid locking center every time, allowing player creative openings)
    if (!currentBoard[4] && Math.random() < 0.35) {
      return { move: 4, comment: 'AI took the center' };
    }

    const randomPick = available[Math.floor(Math.random() * available.length)];
    return {
      move: randomPick,
      comment: 'AI made its move 🎲',
    };
  };

  const handleCellClick = (index: number) => {
    if (board[index] || gameStatus !== 'playing') return;

    onPlayerMove?.();

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    playMechanicalClick('key', 0.08);
    playChime(currentPlayer === 'X' ? 440 : 520, 'triangle', 0.08, 0.08);

    const winResult = checkWinner(newBoard);
    if (winResult) {
      finishGame(newBoard, winResult.winner, winResult.combo);
      return;
    }

    if (newBoard.every((cell) => cell !== null)) {
      finishTie(newBoard);
      return;
    }

    setBoard(newBoard);

    if (isAiMode) {
      setCurrentPlayer('O');
      setAiComment('AI is thinking...');

      setTimeout(() => {
        const { move: aiMove, comment } = getBestAiMove(newBoard);
        if (aiMove !== -1) {
          const aiBoard = [...newBoard];
          aiBoard[aiMove] = 'O';
          playMechanicalClick('subtle', 0.07);
          playChime(330, 'sawtooth', 0.08, 0.06);

          if (comment) {
            setAiComment(comment);
          }

          const aiWin = checkWinner(aiBoard);
          if (aiWin) {
            finishGame(aiBoard, 'O', aiWin.combo);
          } else if (aiBoard.every((c) => c !== null)) {
            finishTie(aiBoard);
          } else {
            setBoard(aiBoard);
            setCurrentPlayer('X');
          }
        }
      }, 320);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const finishGame = (finalBoard: TttCell[], winner: 'X' | 'O', combo: number[]) => {
    setBoard(finalBoard);
    setWinningLine(combo);
    setGameStatus('won');

    if (winner === 'X' || !isAiMode) {
      setScores((prev) => ({
        ...prev,
        x: prev.x + (winner === 'X' ? 1 : 0),
        o: prev.o + (winner === 'O' ? 1 : 0),
        streak: winner === 'X' ? prev.streak + 1 : 0,
      }));
      setAiComment(
        winner === 'X'
          ? 'AI: "Nice win! Balanced game, rematch?" 🎉'
          : 'Player O wins!'
      );
      playWinFanfare();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#86efac', '#7dd3fc', '#fde047', '#ff9e80'],
      });
      onWinQuest();
    } else {
      setScores((prev) => ({
        ...prev,
        o: prev.o + 1,
        streak: 0,
      }));
      setAiComment(isAiMode ? 'AI: "I got one! Balanced rivalry!" 🤖' : 'Player O wins!');
      playChime(220, 'sawtooth', 0.3, 0.1);
    }
  };

  const finishTie = (finalBoard: TttCell[]) => {
    setBoard(finalBoard);
    setGameStatus('tie');
    setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
    setAiComment('AI: "Close draw! Let\'s break the tie!" 🤝');
    playChime(300, 'sine', 0.2, 0.08);
    onWinQuest();
  };

  const resetRound = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinningLine(null);
    setGameStatus('playing');
    setAiComment(
      aiDifficulty === 'balanced'
        ? 'Balanced match: Fair & Fun! ⚖️'
        : aiDifficulty === 'chill'
        ? 'Chill match: Easy wins! 🍃'
        : 'Challenger mode active! ⚔️'
    );
    playMechanicalClick('toggle', 0.08);
  };

  const resetAllScores = () => {
    playMechanicalClick('switch', 0.08);
    setScores({ x: 0, o: 0, ties: 0, streak: 0 });
    resetRound();
  };

  const cycleDifficulty = () => {
    playMechanicalClick('toggle', 0.08);
    setAiDifficulty((prev) => {
      if (prev === 'balanced') return 'chill';
      if (prev === 'chill') return 'pro';
      return 'balanced';
    });
    resetRound();
  };

  return (
    <div className="w-64 bg-slate-900/95 border-2 border-[#ff9e80] rounded-2xl p-3 shadow-2xl flex flex-col gap-2 backdrop-blur-md select-none">
      {/* Header & Mode Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[#ff9e80] font-pixel text-base font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            PIXEL TIC-TAC-TOE
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsAiMode(!isAiMode);
              resetRound();
            }}
            className="px-2 py-1 text-[10px] font-pixel rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 active:scale-95 transition flex items-center gap-1 cursor-pointer touch-manipulation min-h-[30px]"
            title="Toggle 1P vs AI or 2-Player Pass & Play"
          >
            {isAiMode ? <Bot className="w-3 h-3" /> : <Users className="w-3 h-3" />}
            <span>{isAiMode ? '1P AI' : '2-Player'}</span>
          </button>
          <button
            onClick={resetAllScores}
            className="text-[10px] font-mono text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 active:scale-95 cursor-pointer touch-manipulation min-w-[30px] min-h-[30px] flex items-center justify-center border border-slate-800"
            title="Reset All Scores"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Balance / Mode Switcher Bar */}
      {isAiMode && (
        <div className="flex items-center justify-between px-2 py-1 bg-slate-950/80 rounded-lg border border-slate-800/90 text-[10px] font-pixel">
          <div className="flex items-center gap-1 text-slate-400">
            <Scale className="w-3 h-3 text-amber-300" />
            <span className="text-[9px]">BALANCE:</span>
          </div>
          <button
            onClick={cycleDifficulty}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer active:scale-95 touch-manipulation ${
              aiDifficulty === 'balanced'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-sm'
                : aiDifficulty === 'chill'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30'
            }`}
            title="Click to cycle AI mode: Balanced (Easy + Fair) / Chill (Super Easy) / Challenger"
          >
            {aiDifficulty === 'balanced' && '⚖️ Balanced (Easy & Fair)'}
            {aiDifficulty === 'chill' && '🍃 Chill (Super Easy)'}
            {aiDifficulty === 'pro' && '⚔️ Challenger (Hard)'}
          </button>
        </div>
      )}

      {/* AI Speech / Reaction Status */}
      {isAiMode && (
        <div className="text-[10px] font-pixel text-center px-2 py-1 bg-slate-950/60 rounded-md border border-slate-800/60 text-amber-200/90 truncate min-h-[24px] flex items-center justify-center">
          <span className="truncate">{aiComment}</span>
        </div>
      )}

      {/* Scoreboard */}
      <div className="grid grid-cols-4 gap-1 text-center bg-slate-950/80 p-1.5 rounded-lg border border-slate-800/80 font-pixel text-xs">
        <div className={`p-1 rounded ${scores.x > scores.o ? 'bg-emerald-950/40 border border-emerald-500/30' : ''}`}>
          <span className="text-[10px] text-emerald-400 block font-bold">X (YOU)</span>
          <span className="text-sm font-bold text-white">{scores.x}</span>
        </div>
        <div className="p-1 rounded">
          <span className="text-[10px] text-slate-400 block font-bold">DRAWS</span>
          <span className="text-sm font-bold text-slate-300">{scores.ties}</span>
        </div>
        <div className={`p-1 rounded ${scores.o > scores.x ? 'bg-[#ff9e80]/20 border border-[#ff9e80]/30' : ''}`}>
          <span className="text-[10px] text-[#ff9e80] block font-bold">{isAiMode ? 'O (AI)' : 'O (P2)'}</span>
          <span className="text-sm font-bold text-white">{scores.o}</span>
        </div>
        <div className="p-1 rounded">
          <span className="text-[10px] text-amber-300 block font-bold flex items-center justify-center gap-0.5">
            <Trophy className="w-2.5 h-2.5" /> STREAK
          </span>
          <span className="text-sm font-bold text-amber-300">{scores.streak}</span>
        </div>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          const isClickable = !cell && gameStatus === 'playing' && (currentPlayer === 'X' || !isAiMode);

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={!!cell || gameStatus !== 'playing' || (isAiMode && currentPlayer === 'O')}
              className={`h-14 rounded-lg text-2xl font-pixel font-bold flex items-center justify-center transition active:scale-95 ${
                cell === 'X'
                  ? 'bg-slate-800/90 text-emerald-400 shadow-inner'
                  : cell === 'O'
                  ? 'bg-slate-800/90 text-[#ff9e80] shadow-inner'
                  : isClickable
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 cursor-pointer hover:border hover:border-emerald-500/40'
                  : 'bg-slate-800/50 text-slate-600 cursor-default'
              } ${isWinningCell ? 'bg-[#ff9e80]/30 ring-2 ring-[#ff9e80] animate-pulse scale-[1.02]' : ''}`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[11px] font-pixel text-emerald-400 tracking-wider truncate font-bold flex items-center gap-1">
          {gameStatus === 'won'
            ? winningLine && board[winningLine[0]] === 'X'
              ? 'VICTORY! 🎉'
              : isAiMode
              ? 'AI WON! 🤖'
              : 'O WON! 🌟'
            : gameStatus === 'tie'
            ? "IT'S A DRAW! 🤝"
            : currentPlayer === 'X'
            ? 'YOUR TURN (X)'
            : isAiMode
            ? 'AI THINKING...'
            : "PLAYER O'S TURN"}
        </span>

        <button
          onClick={resetRound}
          className="px-2.5 py-1 bg-[#ff9e80] hover:bg-amber-400 text-slate-950 font-pixel font-bold text-xs rounded-md shadow-md active:scale-95 transition flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          REMATCH
        </button>
      </div>
    </div>
  );
};
