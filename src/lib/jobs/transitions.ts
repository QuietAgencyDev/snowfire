export const JOB_STATUSES = [
  "UNASSIGNED",
  "ASSIGNED",
  "EN_ROUTE",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const ALLOWED_TRANSITIONS: Record<JobStatus, readonly JobStatus[]> = {
  UNASSIGNED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["EN_ROUTE", "UNASSIGNED", "CANCELLED"],
  EN_ROUTE: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "FAILED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: [],
};

export function isJobStatus(value: string): value is JobStatus {
  return (JOB_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function crewCanOpenJob(assignedCrewId: string | null, crewId: string): boolean {
  return Boolean(assignedCrewId && assignedCrewId === crewId);
}

export function photoGate(
  from: JobStatus,
  to: JobStatus,
  input: {
    beforeCount: number;
    afterCount: number;
    beforeRequired: boolean;
    afterRequired: boolean;
  },
): string | null {
  if (to === "IN_PROGRESS" && input.beforeRequired && input.beforeCount < 1) {
    return "Take a BEFORE photo first.";
  }

  if (to === "COMPLETED" && input.afterRequired && input.afterCount < 1) {
    return "Take an AFTER photo first.";
  }

  return null;
}

export function timestampFieldFor(to: JobStatus): "arrival_time" | "start_time" | "completion_time" | null {
  if (to === "ARRIVED") {
    return "arrival_time";
  }

  if (to === "IN_PROGRESS") {
    return "start_time";
  }

  if (to === "COMPLETED") {
    return "completion_time";
  }

  return null;
}

export function jobStatusLabel(status: JobStatus): string {
  switch (status) {
    case "UNASSIGNED":
      return "Unassigned";
    case "ASSIGNED":
      return "Assigned";
    case "EN_ROUTE":
      return "En route";
    case "ARRIVED":
      return "Arrived";
    case "IN_PROGRESS":
      return "In progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "FAILED":
      return "Failed";
  }
}

export function nextCrewAction(status: JobStatus): { to: JobStatus; label: string } | null {
  switch (status) {
    case "ASSIGNED":
      return { to: "EN_ROUTE", label: "En route" };
    case "EN_ROUTE":
      return { to: "ARRIVED", label: "Arrived" };
    case "ARRIVED":
      return { to: "IN_PROGRESS", label: "Start work" };
    case "IN_PROGRESS":
      return { to: "COMPLETED", label: "Complete job" };
    default:
      return null;
  }
}
