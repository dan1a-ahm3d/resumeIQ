"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeightSliders } from "@/components/modules/WeightSliders";
import { settingsService } from "@/services/settingsService";

export default function SettingsPage() {
  const handleSaveWeights = async (textWeight: number, skillWeight: number) => {
    await settingsService.updateMethodologySettings({
      textSimilarityWeight: textWeight,
      skillCoverageWeight: skillWeight,
    });
  };

  return (
    <div className="max-w-[1240px] w-full mx-auto pb-space-xl space-y-space-lg">
      <PageHeader
        title="Settings & Scoring Methodology"
        description="Configure deterministic algorithm weights, parsing tolerances, and verification rubrics."
      />

      {/* Scoring Configuration & Methodology Section */}
      <WeightSliders onSave={handleSaveWeights} />
    </div>
  );
}
