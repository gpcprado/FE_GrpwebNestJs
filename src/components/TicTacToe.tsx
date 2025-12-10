// components/TicTacToe.tsx

import React, { useState, useCallback } from 'react';
import { Gamepad2, X, Circle, RotateCcw, Award } from 'lucide-react';

// Define the type for the board array
type SquareValue = 'X' | 'O' | null;
type Board = SquareValue[];

// Helper function to determine the winner (unchanged)
const calculateWinner = (squares: Board): string | null | 'Draw' => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6], // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    if (squares.every(square => square !== null)) return 'Draw';
    return null;
};

// Component for a single square (unchanged)
const Square = ({ value, onClick }: { value: SquareValue; onClick: () => void }) => {
    const colorClass = value === 'X' ? 'text-red-400' : 'text-blue-400';
    return (
        <button
            className={`w-full h-full text-4xl font-extrabold bg-[#0c0a1e] border-4 border-purple-500/50 flex items-center justify-center hover:bg-purple-900/20 transition duration-150 ${value ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={onClick}
            disabled={!!value}
        >
            {value === 'X' ? <X className={`w-8 h-8 ${colorClass}`} /> : value === 'O' ? <Circle className={`w-6 h-6 ${colorClass}`} /> : null}
        </button>
    );
};

interface TicTacToeProps {
    username: string;
}

export const TicTacToe = ({ username }: TicTacToeProps) => {
    const [squares, setSquares] = useState<Board>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);

    const winner = calculateWinner(squares); 
    const status = winner 
        ? (winner === 'Draw' ? 'Game: Draw!' : `Winner: ${winner === 'X' ? username : 'AI'}`)
        : `Next Player: ${isXNext ? username : 'AI'}`;

    const handleClick = useCallback((i: number) => {
        if (winner || squares[i] || !isXNext) { // Added check to prevent clicks during AI thinking
            return;
        }

        const newSquares = squares.slice();
        newSquares[i] = 'X';
        setSquares(newSquares);
        setIsXNext(false);

        // AI move logic (with a slight delay for better UX)
        setTimeout(() => makeAIMove(newSquares), 400);

    }, [squares, winner, username, isXNext]);

    // --- 🤖 SMARTER AI LOGIC ---
    const getBestMove = (currentSquares: Board): number | null => {
        const emptyIndices = currentSquares
            .map((val, index) => (val === null ? index : null))
            .filter(val => val !== null) as number[];
        
        if (emptyIndices.length === 0) return null;

        const AI = 'O';
        const Human = 'X';

        /**
         * Helper to check if a player can win with a specific move
         * @param player 'X' or 'O'
         * @returns The winning index or null
         */
        const findWinningMove = (player: 'X' | 'O'): number | null => {
            for (const index of emptyIndices) {
                const tempSquares = currentSquares.slice();
                tempSquares[index] = player;
                if (calculateWinner(tempSquares) === player) {
                    return index;
                }
            }
            return null;
        };

        // 1. Check if AI can win
        let winningMove = findWinningMove(AI);
        if (winningMove !== null) {
            return winningMove;
        }

        // 2. Check if Human can win (and block them)
        let blockMove = findWinningMove(Human);
        if (blockMove !== null) {
            return blockMove;
        }

        // 3. Prioritize Center (index 4)
        if (emptyIndices.includes(4)) {
            return 4;
        }

        // 4. Prioritize Corners (indices 0, 2, 6, 8)
        const corners = [0, 2, 6, 8].filter(i => emptyIndices.includes(i));
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)]; // Pick a random available corner
        }

        // 5. Take any remaining side (indices 1, 3, 5, 7)
        const sides = [1, 3, 5, 7].filter(i => emptyIndices.includes(i));
        if (sides.length > 0) {
            return sides[Math.floor(Math.random() * sides.length)]; // Pick a random side
        }
        
        // Failsafe: return a random empty spot
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    };
    // --- END SMARTER AI LOGIC ---


    const makeAIMove = (currentSquares: Board) => {
        if (calculateWinner(currentSquares)) return;

        const moveIndex = getBestMove(currentSquares);

        if (moveIndex !== null) {
            const newSquares = currentSquares.slice();
            newSquares[moveIndex] = 'O';
            setSquares(newSquares);
            setIsXNext(true);
        }
    };

    const handleReset = useCallback(() => {
        setSquares(Array(9).fill(null));
        setIsXNext(true);
    }, []);

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="text-xl font-bold text-purple-300 flex items-center">
                <Gamepad2 className="mr-2 h-5 w-5" />
                {status}
            </div>
            
            <div className="grid grid-cols-3 grid-rows-3 w-64 h-64 gap-1 border border-purple-500/50 p-1 rounded-lg shadow-xl">
                {squares.map((value, i) => (
                    <Square key={i} value={value} onClick={() => handleClick(i)} />
                ))}
            </div>

            <button
                onClick={handleReset}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 mt-4"
            >
                <RotateCcw className="h-4 w-4" />
                <span>Reset Game</span>
            </button>
            
            {winner && winner !== 'Draw' && (
                <div className="flex items-center text-green-400 font-bold bg-green-900/20 p-3 rounded-lg">
                    <Award className="h-5 w-5 mr-2" />
                    Congratulations, {winner === 'X' ? username : 'AI'} wins!
                </div>
            )}
        </div>
    );
};