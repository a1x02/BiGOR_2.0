"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface FormulaRendererProps {
  formula: string;
  className?: string;
}

export const FormulaRenderer = ({
  formula,
  className,
}: FormulaRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      katex.render(formula, containerRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (error) {
      console.error("Error rendering formula:", error);
      containerRef.current.textContent = formula;
    }
  }, [formula]);

  return <div ref={containerRef} className={className} />;
};
