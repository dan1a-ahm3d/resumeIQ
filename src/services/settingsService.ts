import { MethodologySettings } from "@/types/settings";
import { MOCK_METHODOLOGY_SETTINGS } from "@/lib/mockData";

export const settingsService = {
  async getMethodologySettings(): Promise<MethodologySettings> {
    // Future FastAPI endpoint: GET /api/v1/settings/methodology
    return MOCK_METHODOLOGY_SETTINGS;
  },

  async updateMethodologySettings(settings: MethodologySettings): Promise<{ success: boolean; settings: MethodologySettings }> {
    // Future FastAPI endpoint: PUT /api/v1/settings/methodology
    return { success: true, settings };
  },

  async resetMethodologySettings(): Promise<MethodologySettings> {
    // Future FastAPI endpoint: POST /api/v1/settings/methodology/reset
    return { textSimilarityWeight: 70, skillCoverageWeight: 30 };
  },
};
