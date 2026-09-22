import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Users, Bot, Trophy, Sparkles } from 'lucide-react';
import { TttCell, TttScore } from '../../types';
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
  const [isSmartAi, setIsSmartAi] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [scores, setScores] = useState<TttScore>({ x: 0, o: 0, ties: 0, streak: 0 });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'tie'>('playing');

  const checkWinner = (cells: TttCell[]): { winner: 'X' | 'O'; combo: number[] } | null => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return { winner: cells[a] as 'X' | 'O', combo };
      }
    }
    return null;
  };

  const getBestAiMove = (currentBoard: TttCell[]): number => {
    // Check if AI can win in 1 move
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const test = [...currentBoard];
        test[i] = 'O';
        if (checkWinner(test)) return i;
      }
    }
    // Check if player is about to win and block
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const test = [...currentBoard];
        test[i] = 'X';
        if (checkWinner(test)) return i;
      }
    }

    if (isSmartAi) {
      // Prioritize center
      if (!currentBoard[4] && Math.random() > 0.1) return 4;
      // Prioritize corners
      const corners = [0, 2, 6, 8].filter((idx) => !currentBoard[idx]);
      if (corners.length > 0 && Math.random() > 0.2) {
        return corners[Math.floor(Math.random() * corners.length)];
      }
    }

    // Available spots
    const available = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((v): v is number => v !== null);

    return available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : -1;
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
      // AI turn
      setTimeout(() => {
        const aiMove = getBestAiMove(newBoard);
        if (aiMove !== -1) {
          const aiBoard = [...newBoard];
          aiBoard[aiMove] = 'O';
          playMechanicalClick('subtle', 0.07);
          playChime(330, 'sawtooth', 0.08, 0.06);

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
      }, 340);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const finishGame = (finalBoard: TttCell[], winner: 'X' | 'O', combo: number[]) => {
    setBoard(finalBoard);
    setWinningLine(combo);
    setGameStatus('won');

    if (winner === 'X') {
      setScores((prev) => ({
        ...prev,
        x: prev.x + 1,
        streak: prev.streak + 1,
      }));
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
      playChime(220, 'sawtooth', 0.3, 0.1);
    }
  };

  const finishTie = (finalBoard: TttCell[]) => {
    setBoard(finalBoard);
    setGameStatus('tie');
    setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
    playChime(300, 'sine', 0.2, 0.08);
  };

  const resetRound = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinningLine(null);
    setGameStatus('playing');
    playMechanicalClick('toggle', 0.08);
  };

  const resetAllScores = () => {
    playMechanicalClick('switch', 0.08);
    setScores({ x: 0, o: 0, ties: 0, streak: 0 });
    resetRound();
  };

  return (
    <div className="w-64 bg-slate-900/95 border-2 border-[#ff9e80] rounded-2xl p-3 shadow-2xl flex flex-col gap-2 backdrop-blur-md">
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
            className="px-1.5 py-0.5 text-[9px] font-pixel rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 active:scale-95 transition flex items-center gap-1"
            title="Toggle 1P vs AI or 2-Player Pass & Play"
          >
            {isAiMode ? <Bot className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
            <span>{isAiMode ? '1P AI' : '2-Player'}</span>
          </button>
          <button
            onClick={resetAllScores}
            className="text-[9px] font-mono text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 active:scale-95"
            title="Reset All Scores"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-4 gap-1 text-center bg-slate-950/80 p-1.5 rounded-lg border border-slate-800/80 font-pixel text-xs">
        <div>
          <span className="text-[10px] text-emerald-400 block font-bold">X (YOU)</span>
          <span className="text-sm font-bold text-white">{scores.x}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-bold">DRAWS</span>
          <span className="text-sm font-bold text-slate-300">{scores.ties}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#ff9e80] block font-bold">{isAiMode ? 'O (AI)' : 'O (P2)'}</span>
          <span className="text-sm font-bold text-white">{scores.o}</span>
        </div>
        <div>
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
          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`h-14 rounded-lg text-2xl font-pixel font-bold flex items-center justify-center transition active:scale-95 ${
                cell === 'X'
                  ? 'bg-slate-800/90 text-emerald-400 shadow-inner'
                  : cell === 'O'
                  ? 'bg-slate-800/90 text-[#ff9e80] shadow-inner'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400'
              } ${isWinningCell ? 'bg-[#ff9e80]/30 ring-2 ring-[#ff9e80] animate-pulse' : ''}`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[11px] font-pixel text-emerald-400 tracking-wider truncate font-bold">
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
          className="px-2.5 py-1 bg-[#ff9e80] hover:bg-amber-400 text-slate-950 font-pixel font-bold text-xs rounded-md shadow-md active:scale-95 transition"
        >
          REMATCH ⚡
        </button>
      </div>
    </div>
  );
};
