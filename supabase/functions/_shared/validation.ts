import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Shared date validation schemas
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, "Invalid date");

export const birthDateSchema = dateSchema
  .refine((date) => {
    const d = new Date(date);
    const now = new Date();
    return d < now && d.getFullYear() > 1900;
  }, "Birth date must be between 1900 and today");

export const futureDateSchema = dateSchema
  .refine((date) => {
    const d = new Date(date);
    const now = new Date();
    return d >= now;
  }, "Date must be in the future");

// Enum validations
export const genderEnum = z.enum(["male", "female", "other"], {
  errorMap: () => ({ message: "Gender must be one of: male, female, other" })
});

export const smokingHabitsEnum = z.enum(["never", "former", "light", "heavy"], {
  errorMap: () => ({ message: "Smoking habits must be one of: never, former, light, heavy" })
});

export const exerciseFrequencyEnum = z.enum(["none", "light", "moderate", "intense"], {
  errorMap: () => ({ message: "Exercise frequency must be one of: none, light, moderate, intense" })
});

export const alcoholConsumptionEnum = z.enum(["none", "light", "moderate", "heavy"], {
  errorMap: () => ({ message: "Alcohol consumption must be one of: none, light, moderate, heavy" })
});

export const dietQualityEnum = z.enum(["poor", "fair", "good", "excellent"], {
  errorMap: () => ({ message: "Diet quality must be one of: poor, fair, good, excellent" })
});

export const stressLevelEnum = z.enum(["low", "moderate", "high"], {
  errorMap: () => ({ message: "Stress level must be one of: low, moderate, high" })
});

export const sleepQualityEnum = z.enum(["poor", "fair", "good", "excellent"], {
  errorMap: () => ({ message: "Sleep quality must be one of: poor, fair, good, excellent" })
});

export const calculationMethodEnum = z.enum(["LMP", "Conception"], {
  errorMap: () => ({ message: "Calculation method must be either 'LMP' or 'Conception'" })
});

// Numeric validations with ranges
export const ageSchema = z.number()
  .int("Age must be a whole number")
  .min(0, "Age cannot be negative")
  .max(120, "Age must be 120 or less");

export const bmiSchema = z.number()
  .min(10, "BMI must be at least 10")
  .max(100, "BMI must be 100 or less");

export const percentageSchema = z.number()
  .min(0, "Percentage must be at least 0")
  .max(100, "Percentage must be 100 or less");

export const moneySchema = z.number()
  .min(0, "Amount cannot be negative");

// String length validations
export const shortStringSchema = z.string()
  .trim()
  .min(1, "Field cannot be empty")
  .max(100, "Must be 100 characters or less");

export const mediumStringSchema = z.string()
  .trim()
  .min(1, "Field cannot be empty")
  .max(500, "Must be 500 characters or less");

export const longStringSchema = z.string()
  .trim()
  .min(1, "Field cannot be empty")
  .max(10000, "Must be 10,000 characters or less");

export const urlSchema = z.string()
  .url("Must be a valid URL")
  .max(2000, "URL must be 2000 characters or less");

// Generic validation wrapper with detailed error messages
export function validateInput<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: string[]; fieldErrors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(e => {
    const field = e.path.length > 0 ? `${e.path.join('.')}` : 'input';
    return `${field}: ${e.message}`;
  });
  
  const fieldErrors: Record<string, string> = {};
  result.error.errors.forEach(e => {
    const field = e.path.length > 0 ? e.path.join('.') : 'input';
    fieldErrors[field] = e.message;
  });
  
  return {
    success: false,
    errors,
    fieldErrors
  };
}

// Helper to create consistent error responses
export function createValidationErrorResponse(errors: string[], fieldErrors: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: "Validation failed",
      details: errors,
      field_errors: fieldErrors
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" }
    }
  );
}
