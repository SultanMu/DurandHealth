import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['patient', 'hr', 'corporate', 'admin']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

// Health Assessment schema
export const healthAssessmentSchema = z.object({
  id: z.number(),
  userId: z.number(),
  height: z.number(),
  weight: z.number(),
  bloodPressureSystolic: z.number(),
  bloodPressureDiastolic: z.number(),
  heartRate: z.number(),
  smokingStatus: z.string(),
  exerciseFrequency: z.string(),
  dietQuality: z.string(),
  stressLevel: z.number().min(1).max(10),
  sleepHours: z.number(),
  chronicConditions: z.array(z.string()),
  medications: z.array(z.string()),
  allergies: z.array(z.string()),
  emergencyContact: z.record(z.string()),
  createdAt: z.string(),
});

export type HealthAssessment = z.infer<typeof healthAssessmentSchema>;

// Insert schemas for forms
export const userInsertSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const healthAssessmentInsertSchema = healthAssessmentSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type UserInsert = z.infer<typeof userInsertSchema>;
export type HealthAssessmentInsert = z.infer<typeof healthAssessmentInsertSchema>;