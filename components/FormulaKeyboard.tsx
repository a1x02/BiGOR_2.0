"use client";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface FormulaKeyboardProps {
  onKeyPress: (key: string) => void;
  className?: string;
}

export const FormulaKeyboard = ({
  onKeyPress,
  className,
}: FormulaKeyboardProps) => {
  const buttons = [
    // Математические операторы
    { label: "+", value: "+" },
    { label: "-", value: "-" },
    { label: "×", value: "\\times" },
    { label: "÷", value: "\\div" },
    { label: "=", value: "=" },
    { label: "≠", value: "\\neq" },
    { label: "≈", value: "\\approx" },
    { label: "≤", value: "\\leq" },
    { label: "≥", value: "\\geq" },
    { label: "±", value: "\\pm" },

    // Дроби и степени
    { label: "x²", value: "^{2}" },
    { label: "x³", value: "^{3}" },
    { label: "xⁿ", value: "^{n}" },
    { label: "√", value: "\\sqrt{}" },
    { label: "∛", value: "\\sqrt[3]{}" },
    { label: "∜", value: "\\sqrt[4]{}" },
    { label: "⅟x", value: "\\frac{1}{}" },

    // Греческие буквы
    { label: "α", value: "\\alpha" },
    { label: "β", value: "\\beta" },
    { label: "γ", value: "\\gamma" },
    { label: "π", value: "\\pi" },
    { label: "θ", value: "\\theta" },
    { label: "φ", value: "\\phi" },
    { label: "ω", value: "\\omega" },

    // Другие математические символы
    { label: "∞", value: "\\infty" },
    { label: "∑", value: "\\sum" },
    { label: "∏", value: "\\prod" },
    { label: "∫", value: "\\int" },
    { label: "∂", value: "\\partial" },
    { label: "∇", value: "\\nabla" },

    // Скобки
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "[", value: "[" },
    { label: "]", value: "]" },
    { label: "{", value: "{" },
    { label: "}", value: "}" },

    // Другие символы
    { label: "°", value: "^{\\circ}" },
    { label: "′", value: "'" },
    { label: "″", value: "''" },
    { label: "‰", value: "\\permil" },
    { label: "∠", value: "\\angle" },
    { label: "⊥", value: "\\perp" },
    { label: "∥", value: "\\parallel" },
    { label: "∝", value: "\\propto" },
    { label: "∅", value: "\\emptyset" },
    { label: "∈", value: "\\in" },
    { label: "∉", value: "\\notin" },
    { label: "⊂", value: "\\subset" },
    { label: "⊃", value: "\\supset" },
    { label: "∪", value: "\\cup" },
    { label: "∩", value: "\\cap" },
  ];

  return (
    <div className={cn("grid grid-cols-10 gap-1 p-2", className)}>
      {buttons.map((button) => (
        <Button
          key={button.label}
          variant="outline"
          size="sm"
          onClick={() => onKeyPress(button.value)}
          className="h-8 text-sm"
        >
          {button.label}
        </Button>
      ))}
    </div>
  );
};
