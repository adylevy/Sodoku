"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  generateSudoku,
  type Difficulty,
  type NumberRange,
} from "../utils/sudokuGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer } from "lucide-react";
import styles from "./Sudoku.module.css";

const Sudoku: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [numberRange, setNumberRange] = useState<NumberRange>("adults");
  const [selectedNumberRange, setSelectedNumberRange] =
    useState<NumberRange>("adults");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState<string>("");
  const [inputSeed, setInputSeed] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const seedFromUrl = urlParams.get("seed");
    if (seedFromUrl) {
      setInputSeed(seedFromUrl);
      const [storedNumberRange] = seedFromUrl.split("-");
      setSelectedNumberRange(storedNumberRange as NumberRange);
      setNumberRange(storedNumberRange as NumberRange);
      generateNewGame(seedFromUrl);
    } else {
      generateNewGame();
    }
  }, []);

  const generateNewGame = (customSeed?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { board: newBoard, seed: newSeed } = generateSudoku(
        difficulty,
        selectedNumberRange,
        customSeed
      );
      setBoard(newBoard);
      setInitialBoard(newBoard.map((row) => [...row]));
      setNumberRange(selectedNumberRange);
      setSeed(newSeed);
      updateUrl(newSeed);
    } catch (err) {
      setError("Failed to generate Sudoku. Please try again.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUrl = (newSeed: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("seed", newSeed);
    window.history.pushState({}, "", url);
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    const maxNumber = numberRange === "kids" ? 6 : 9;
    const newValue = value === "" ? 0 : Number.parseInt(value, 10);
    if (isNaN(newValue) || newValue < 0 || newValue > maxNumber) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = newValue;
    setBoard(newBoard);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [storedNumberRange] = inputSeed.split("-");
    setSelectedNumberRange(storedNumberRange as NumberRange);
    setNumberRange(storedNumberRange as NumberRange);
    generateNewGame(inputSeed);
  };

  return (
    <div className={`${styles.sudokuContainer} printable-content`}>
      <h1 className="text-2xl font-bold mb-4">Sudoku Generator</h1>
      <div className="flex gap-4 mb-4">
        <Select
          value={difficulty}
          onValueChange={(value: Difficulty) => setDifficulty(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="veryEasy">Very Easy</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={selectedNumberRange}
          onValueChange={(value: NumberRange) => setSelectedNumberRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select number range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kids">Kids (1-6)</SelectItem>
            <SelectItem value="adults">Adults (1-9)</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => generateNewGame()} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!isLoading && !error && (
        <>
          <div
            className={`${styles.board} ${styles[numberRange]} printable-board`}
          >
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.row}>
                {row.map((cell, colIndex) => (
                  <Input
                    key={`${rowIndex}-${colIndex}`}
                    type="number"
                    min="1"
                    max={numberRange === "kids" ? "6" : "9"}
                    value={cell === 0 ? "" : cell}
                    onChange={(e) =>
                      handleInputChange(rowIndex, colIndex, e.target.value)
                    }
                    className={`${styles.cell} ${
                      initialBoard[rowIndex][colIndex] !== 0
                        ? styles.initial
                        : ""
                    } printable-cell ${
                      initialBoard[rowIndex][colIndex] !== 0
                        ? "printable-cell-initial"
                        : ""
                    }`}
                    readOnly={initialBoard[rowIndex][colIndex] !== 0}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p>Puzzle Seed: {seed}</p>
          </div>
        </>
      )}
      <div className="flex gap-4 mt-4">
        <Button onClick={() => generateNewGame()} disabled={isLoading}>
          New Game
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>
      <form onSubmit={handleSeedSubmit} className="mt-4">
        <Input
          type="text"
          value={inputSeed}
          onChange={(e) => setInputSeed(e.target.value)}
          placeholder="Enter seed"
          className="mr-2"
        />
        <Button type="submit">Load Puzzle</Button>
      </form>
    </div>
  );
};

export default Sudoku;
