const BASE_URL = "https://api.hevyapp.com/v1";

function apiKey() {
  const key = process.env.HEVY_API_KEY;
  if (!key) throw new Error("HEVY_API_KEY is not set");
  return key;
}

async function hevyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "api-key": apiKey(),
      "accept": "application/json",
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Hevy API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export interface Exercise {
  index: number;
  title: string;
  notes: string;
  exercise_template_id: string;
  supersets_id: number | null;
  sets: Set[];
}

export interface Set {
  index: number;
  set_type: string;
  weight_kg: number | null;
  reps: number | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  rpe: number | null;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  updated_at: string;
  created_at: string;
  exercises: Exercise[];
}

export interface WorkoutsResponse {
  page: number;
  page_count: number;
  workouts: Workout[];
}

export interface Routine {
  id: string;
  title: string;
  folder_id: number | null;
  notes: string;
  updated_at: string;
  created_at: string;
  exercises: Exercise[];
}

export interface RoutinesResponse {
  page: number;
  page_count: number;
  routines: Routine[];
}

export interface RoutineFolder {
  id: number;
  index: number;
  title: string;
  updated_at: string;
  created_at: string;
}

export interface RoutineFoldersResponse {
  page: number;
  page_count: number;
  routine_folders: RoutineFolder[];
}

export interface Account {
  id: string;
  email: string;
  username: string;
}

export interface ExerciseTemplate {
  id: string;
  title: string;
  type: string;
  primary_muscle_group: string;
  secondary_muscle_groups: string[];
  equipment: string;
  is_custom: boolean;
}

export interface ExerciseTemplatesResponse {
  page: number;
  page_count: number;
  exercise_templates: ExerciseTemplate[];
}

export const hevy = {
  getWorkouts: (page = 1, pageSize = 10) =>
    hevyFetch<WorkoutsResponse>(`/workouts?page=${page}&pageSize=${pageSize}`),

  getAllWorkouts: async (): Promise<Workout[]> => {
    const PAGE_SIZE = 10;
    const first = await hevyFetch<WorkoutsResponse>(`/workouts?page=1&pageSize=${PAGE_SIZE}`);
    const remaining = first.page_count > 1
      ? await Promise.all(
          Array.from({ length: first.page_count - 1 }, (_, i) =>
            hevyFetch<WorkoutsResponse>(`/workouts?page=${i + 2}&pageSize=${PAGE_SIZE}`)
          )
        )
      : [];
    return [first, ...remaining].flatMap((r) => r.workouts);
  },

  getWorkoutCount: () =>
    hevyFetch<{ workout_count: number }>("/workouts/count"),

  getRoutines: (page = 1, pageSize = 10) =>
    hevyFetch<RoutinesResponse>(`/routines?page=${page}&pageSize=${pageSize}`),

  getAllRoutines: async (): Promise<Routine[]> => {
    const PAGE_SIZE = 10;
    const first = await hevyFetch<RoutinesResponse>(`/routines?page=1&pageSize=${PAGE_SIZE}`);
    const remaining = first.page_count > 1
      ? await Promise.all(
          Array.from({ length: first.page_count - 1 }, (_, i) =>
            hevyFetch<RoutinesResponse>(`/routines?page=${i + 2}&pageSize=${PAGE_SIZE}`)
          )
        )
      : [];
    return [first, ...remaining].flatMap((r) => r.routines);
  },

  getRoutineFolders: async (): Promise<RoutineFolder[]> => {
    const PAGE_SIZE = 10;
    const first = await hevyFetch<RoutineFoldersResponse>(`/routine_folders?page=1&pageSize=${PAGE_SIZE}`);
    const remaining = first.page_count > 1
      ? await Promise.all(
          Array.from({ length: first.page_count - 1 }, (_, i) =>
            hevyFetch<RoutineFoldersResponse>(`/routine_folders?page=${i + 2}&pageSize=${PAGE_SIZE}`)
          )
        )
      : [];
    return [first, ...remaining].flatMap((r) => r.routine_folders);
  },

  getAccount: () =>
    hevyFetch<Account>("/account"),

  createRoutine: (payload: {
    routine: {
      title: string;
      folder_id?: number | null;
      notes?: string;
      exercises: {
        exercise_template_id: string;
        superset_id?: number | null;
        notes?: string;
        sets: {
          type: string;
          weight_kg?: number | null;
          reps?: number | null;
          distance_meters?: null;
          duration_seconds?: null;
          custom_metric?: null;
        }[];
      }[];
    };
  }) =>
    hevyFetch<{ routine: Routine }>("/routines", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAllExerciseTemplates: async (): Promise<ExerciseTemplate[]> => {
    const PAGE_SIZE = 10;
    const first = await hevyFetch<ExerciseTemplatesResponse>(`/exercise_templates?page=1&pageSize=${PAGE_SIZE}`);
    const remaining = first.page_count > 1
      ? await Promise.all(
          Array.from({ length: first.page_count - 1 }, (_, i) =>
            hevyFetch<ExerciseTemplatesResponse>(`/exercise_templates?page=${i + 2}&pageSize=${PAGE_SIZE}`)
          )
        )
      : [];
    return [first, ...remaining].flatMap((r) => r.exercise_templates);
  },
};
