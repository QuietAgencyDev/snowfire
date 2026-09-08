export type IceLevel = "low" | "watch" | "high" | "severe";
export type StormJobPriority = "NORMAL" | "HIGH" | "URGENT";

export function stormJobPriority(level: IceLevel | null | undefined): StormJobPriority {
  if (level === "severe") {
    return "URGENT";
  }

  if (level === "high") {
    return "HIGH";
  }

  return "NORMAL";
}

export function stormWatchScore(input: {
  iceScore: number;
  next48hSnowCm: number;
  hasOpenJob: boolean;
  hasPin: boolean;
}): number {
  if (!input.hasPin) {
    return input.hasOpenJob ? -50 : 0;
  }

  let score = input.iceScore;
  score += input.next48hSnowCm >= 10 ? 10 : input.next48hSnowCm >= 5 ? 5 : 0;

  if (input.hasOpenJob) {
    score -= 80;
  }

  return score;
}
