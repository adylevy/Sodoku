import { v4 as uuidv4 } from "uuid";

type Difficulty = "veryEasy" | "easy" | "medium" | "hard" | "expert";
type NumberRange = "kids" | "adults";

class Random {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Simple random number generator
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

function isValid(
  board: number[][],
  row: number,
  col: number,
  num: number,
  maxNumber: number
): boolean {
  for (let x = 0; x < maxNumber; x++) {
    if (board[row][x] === num || board[x][col] === num) {
      return false;
    }
  }

  const boxWidth = maxNumber === 6 ? 3 : 3;
  const boxHeight = maxNumber === 6 ? 2 : 3;
  const startRow = Math.floor(row / boxHeight) * boxHeight;
  const startCol = Math.floor(col / boxWidth) * boxWidth;

  for (let i = 0; i < boxHeight; i++) {
    for (let j = 0; j < boxWidth; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

function solveSudoku(board: number[][], maxNumber: number): boolean {
  for (let row = 0; row < maxNumber; row++) {
    for (let col = 0; col < maxNumber; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= maxNumber; num++) {
          if (isValid(board, row, col, num, maxNumber)) {
            board[row][col] = num;
            if (solveSudoku(board, maxNumber)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateRandomSudoku(
  maxNumber: number,
  random: Random
): null | number[][] {
  const board: number[][] = Array(maxNumber)
    .fill(0)
    .map(() => Array(maxNumber).fill(0));
  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  for (let i = 0; i < maxNumber; i++) {
    board[0][i] = numbers[i];
  }

  if (solveSudoku(board, maxNumber)) {
    return board;
  }

  return null;
}

export function generateSudoku(
  difficulty: Difficulty,
  numberRange: NumberRange,
  seed?: string
): { board: number[][]; seed: string } {
  const maxNumber = numberRange === "kids" ? 6 : 9;
  let board: number[][] | null = null;

  const newSeed = seed || `${numberRange}-${uuidv4()}`;
  const [storedNumberRange, uuidPart] = newSeed.split("-");

  if (storedNumberRange !== numberRange) {
    throw new Error(
      "Number range in seed doesn't match the selected number range"
    );
  }

  const random = new Random(hashCode(uuidPart));

  for (let attempt = 0; attempt < 10; attempt++) {
    board = generateRandomSudoku(maxNumber, random);
    if (board) break;
  }

  if (!board) {
    throw new Error("Failed to generate a valid Sudoku puzzle");
  }

  const numToRemove = getDifficultyRemovalCount(difficulty, maxNumber);
  const totalCells = maxNumber * maxNumber;
  const cellsToRemove = new Set<number>();

  while (cellsToRemove.size < numToRemove) {
    const cellIndex = Math.floor(random.next() * totalCells);
    cellsToRemove.add(cellIndex);
  }

  for (const cellIndex of cellsToRemove) {
    const row = Math.floor(cellIndex / maxNumber);
    const col = cellIndex % maxNumber;
    board[row][col] = 0;
  }

  return { board, seed: newSeed };
}

function getDifficultyRemovalCount(
  difficulty: Difficulty,
  maxNumber: number
): number {
  const totalCells = maxNumber * maxNumber;
  const removalPercentage = {
    veryEasy: maxNumber === 6 ? 0.3 : 0.4,
    easy: maxNumber === 6 ? 0.4 : 0.5,
    medium: maxNumber === 6 ? 0.5 : 0.6,
    hard: maxNumber === 6 ? 0.6 : 0.7,
    expert: maxNumber === 6 ? 0.7 : 0.75,
  }[difficulty];

  return Math.floor(totalCells * removalPercentage);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export type { Difficulty, NumberRange };
