Biological Age Calculator

### What it does (from the reference images)

A comprehensive tool that calculates a user's **biological age** vs their **chronological age** based on lifestyle, health metrics, and optionally a face photo. Key features from the images:

1. **Input Form** with sections:
  - **Basic Info**: Age/DOB, Gender, Height, Weight (auto-calculates BMI)
  - **Lifestyle Factors**: Exercise frequency, smoking, alcohol, sleep hours, diet quality, stress level, hydration
  - **Advanced Metrics** (optional): Blood pressure, resting heart rate, chronic conditions checkboxes (diabetes, heart disease, family history), mental health indicators
  - **Optional Face Age Analysis**: Upload a photo to get an estimated face age (reuse existing `estimate-face-age` edge function)
2. **Results Display** (inspired by image 1 & 3):
  - **Biological Age vs Chronological Age** comparison with large numbers
  - **Age Difference** indicator (e.g., "3.0 years younger" in green, or "X years older" in red)
  - **Visual comparison slider/bar** showing chronological age, face age, and holistic bio age on a range
  - **Motivational banner** ("Great job! Your biological age is younger...")
  - **Processing animation** with steps: "Analyzing health data...", "Calculating biological markers...", "Generating report..."
  - **Category breakdown** (reuse radar chart pattern from Health Score)
  - **Personalized recommendations** to lower biological age

### Implementation

**1. New Edge Function: `supabase/functions/calculate-biological-age/index.ts**`

- Accepts: age, gender, height, weight, exercise, smoking, alcohol, sleep, diet, stress, hydration, blood_pressure, resting_heart_rate, chronic_conditions, optional face_age
- Uses the Gemini API (gemini-2.5-flash) I gave you to calculate biological age with a detailed prompt
- Returns: `biological_age`, `chronological_age`, `age_difference`, `face_age` (if provided), `summary`, `category_scores`, `recommendations`, `comparison_bar_data`
- Add to `config.toml` with `verify_jwt = false`

**2. New Page: `src/pages/BiologicalAgeCalculator.tsx**`

- Multi-section form with collapsible "Advanced Metrics" section
- Auto-fill age/gender from user profile (existing pattern)
- Auto-calculate BMI from height + weight
- Optional face photo upload section (reuse compress + base64 pattern from AiFaceAge)
- Animated processing stepper on submit (4 steps with icons, like image 3)
- Results section with:
  - Two side-by-side cards: "Chronological Age" and "Biological Age"
  - Age difference display with arrow icon and color coding
  - Visual range bar showing all three ages (chronological, face, biological)
  - Motivational banner (green if younger, amber if older)
  - Radar chart for category breakdown
  - Recommendation cards

**3. Route & Navigation**

- Add lazy import + route at `/biological-age-calculator` in `App.tsx`
- Add to Header nav arrays with `Brain` icon and title "Biological Age"

### Files


| File                                                   | Change                  |
| ------------------------------------------------------ | ----------------------- |
| `supabase/functions/calculate-biological-age/index.ts` | New edge function       |
| `supabase/config.toml`                                 | Add function config     |
| `src/pages/BiologicalAgeCalculator.tsx`                | New page component      |
| `src/App.tsx`                                          | Add lazy import + route |
| `src/components/Header.tsx`                            | Add to nav menus        |
