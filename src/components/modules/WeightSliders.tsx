"use client";

import React, { useState } from "react";
import { NoticeBox } from "@/components/ui/NoticeBox";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/data-display/ProgressBar";
import { cn } from "@/lib/utils";

interface WeightSlidersProps {
  initialTextWeight?: number;
  initialSkillWeight?: number;
  onSave?: (textWeight: number, skillWeight: number) => void;
  className?: string;
}

export function WeightSliders({
  initialTextWeight = 70,
  initialSkillWeight = 30,
  onSave,
  className,
}: WeightSlidersProps) {
  const [textWeight, setTextWeight] = useState(initialTextWeight);
  const [skillWeight, setSkillWeight] = useState(initialSkillWeight);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const total = textWeight + skillWeight;
  const isBalanced = total === 100;

  const handleTextChange = (val: number, updatePartner = true) => {
    const clamped = Math.max(0, Math.min(100, val || 0));
    setTextWeight(clamped);
    if (updatePartner) {
      setSkillWeight(100 - clamped);
    }
  };

  const handleSkillChange = (val: number, updatePartner = true) => {
    const clamped = Math.max(0, Math.min(100, val || 0));
    setSkillWeight(clamped);
    if (updatePartner) {
      setTextWeight(100 - clamped);
    }
  };

  const handleReset = () => {
    setTextWeight(70);
    setSkillWeight(30);
    flashStatus("Reset to defaults");
  };

  const handleSave = () => {
    onSave?.(textWeight, skillWeight);
    flashStatus("Methodology saved");
  };

  const flashStatus = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => {
      setSaveStatus(null);
    }, 2200);
  };

  return (
    <section
      className={cn(
        "bg-surface-container-lowest rounded-[6px] p-6 shadow-xs border border-outline-variant/30",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm pb-1">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Scoring Methodology Parameters
          </h2>
          <p className="font-body-default text-body-default text-secondary mt-0.5">
            Configure the relative weights between vector semantic text similarity and explicit skill taxonomy coverage.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low text-secondary rounded-[4px] font-code-mono text-[11px] select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span>
            WEIGHT SUM:{" "}
            <span
              className={cn(
                "font-semibold",
                isBalanced ? "text-on-surface" : "text-error"
              )}
            >
              {total}%
            </span>
          </span>
        </div>
      </div>

      {/* Sliders Container */}
      <div className="flex flex-col gap-3 mt-4">
        {/* Parameter 1 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-[6px] bg-surface-container-low/40">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-label-default text-label-default text-on-surface">
                Text Similarity Weight (TF-IDF & Semantic Vector)
              </span>
              <span className="bg-surface-container text-secondary text-[11px] font-code-mono px-1.5 py-0.5 rounded-[3px]">
                VECTOR-EMBED
              </span>
            </div>
            <p className="font-meta-default text-meta-default text-secondary mt-1">
              Calculates cosine similarity between the job description document and parsed resume corpus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-48 hidden sm:block">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={textWeight}
                onChange={(e) =>
                  handleTextChange(parseInt(e.target.value, 10), true)
                }
                className="w-full accent-primary-container cursor-pointer"
              />
            </div>
            <div className="relative w-24">
              <input
                type="number"
                min="0"
                max="100"
                value={textWeight}
                onChange={(e) =>
                  handleTextChange(parseInt(e.target.value, 10), true)
                }
                className="w-full h-8 pl-3 pr-6 rounded-[6px] bg-surface-container-lowest text-on-surface font-body-medium text-body-medium font-semibold focus:outline-none shadow-xs text-right border border-outline-variant/30"
              />
              <span className="absolute right-2.5 top-1.5 font-body-medium text-body-medium text-secondary pointer-events-none">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Parameter 2 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-[6px] bg-surface-container-low/40">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-label-default text-label-default text-on-surface">
                Required Skill Coverage Weight
              </span>
              <span className="bg-surface-container text-secondary text-[11px] font-code-mono px-1.5 py-0.5 rounded-[3px]">
                TAXONOMY-EXACT
              </span>
            </div>
            <p className="font-meta-default text-meta-default text-secondary mt-1">
              Measures verified presence of extracted must-have skills from the confirmed job requirements rubric.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-48 hidden sm:block">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={skillWeight}
                onChange={(e) =>
                  handleSkillChange(parseInt(e.target.value, 10), true)
                }
                className="w-full accent-primary-container cursor-pointer"
              />
            </div>
            <div className="relative w-24">
              <input
                type="number"
                min="0"
                max="100"
                value={skillWeight}
                onChange={(e) =>
                  handleSkillChange(parseInt(e.target.value, 10), true)
                }
                className="w-full h-8 pl-3 pr-6 rounded-[6px] bg-surface-container-lowest text-on-surface font-body-medium text-body-medium font-semibold focus:outline-none shadow-xs text-right border border-outline-variant/30"
              />
              <span className="absolute right-2.5 top-1.5 font-body-medium text-body-medium text-secondary pointer-events-none">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratio Visual Distribution Bar */}
      <div className="mt-4 p-3 bg-surface-container-low/20 rounded-[6px] border border-outline-variant/20">
        <div className="flex items-center justify-between text-meta-default font-meta-default text-secondary mb-1.5 select-none">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span>Semantic Vector Share ({textWeight}%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>Explicit Skill Share ({skillWeight}%)</span>
          </span>
        </div>
        <ProgressBar
          variant="two-tone"
          value={textWeight}
          secondaryValue={skillWeight}
          height="lg"
        />
      </div>

      {/* Notice Box */}
      <NoticeBox className="mt-4">
        <strong className="font-body-medium text-on-surface">
          Important Methodology Notice:
        </strong>{" "}
        Scoring weights are configurable decision-support parameters and do not represent validated measures of candidate hiring success. ResumeIQ does not automate hiring decisions. All decisions remain the sole accountability of human recruiters and certified hiring committees.
      </NoticeBox>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-5 mt-5 border-t border-outline-variant/20">
        <button
          type="button"
          onClick={handleReset}
          className="font-label-default text-label-default text-secondary hover:text-on-surface transition-colors py-1 cursor-pointer"
        >
          Reset to Default (70/30)
        </button>

        <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
          {saveStatus && (
            <span className="font-meta-default text-meta-default text-secondary transition-opacity">
              {saveStatus}
            </span>
          )}
          <Button variant="dark" onClick={handleSave}>
            Save Methodology Settings
          </Button>
        </div>
      </div>
    </section>
  );
}
