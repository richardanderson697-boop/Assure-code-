export interface OrchestrationStrategy {
  triggerImpactAnalysis(eventId: string, summary: string): Promise<void>;
}