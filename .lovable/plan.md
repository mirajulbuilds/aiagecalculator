

## Add Daily Scheduled Sitemap Regeneration and GSC Submission

### Overview
Create an automated daily job that regenerates all sitemaps from the database and submits them to Google Search Console without manual intervention.

### Phase 1: Enable pg_cron Extension

Create a database migration to enable the pg_cron extension:

```sql
-- Enable pg_cron for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
```

### Phase 2: Create Combined Edge Function

Create a new edge function `scheduled-sitemap-refresh` that:
1. Regenerates all sitemaps (calls existing sitemap generators)
2. Submits all sitemaps to Google Search Console
3. Logs the results

**File:** `supabase/functions/scheduled-sitemap-refresh/index.ts`

```typescript
// Core logic:
// 1. Call each sitemap generator function
// 2. Collect the sitemap URLs
// 3. Submit all to GSC using the existing submit-sitemap-to-gsc logic
// 4. Log results to gsc_submission_logs table
```

**Update:** `supabase/config.toml`

```toml
[functions.scheduled-sitemap-refresh]
verify_jwt = false  # Allows cron to call it
```

### Phase 3: Schedule the Cron Job

Run SQL (via Lovable Cloud) to create the daily schedule:

```sql
-- Schedule daily sitemap refresh at 2:00 AM UTC
SELECT cron.schedule(
  'daily-sitemap-refresh',
  '0 2 * * *',  -- Every day at 2:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://ryetajignnzczcybyggr.supabase.co/functions/v1/scheduled-sitemap-refresh',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5ZXRhamlnbm56Y3pjeWJ5Z2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzAxODEsImV4cCI6MjA3NTM0NjE4MX0.YTMZ8c-1I3AdiLFCz6dB8WffxNneu6rsp8bgtamhJwI"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

### Phase 4: Add Monitoring (Optional)

Add a view in the admin dashboard to show:
- Last scheduled run time
- Success/failure status
- Next scheduled run

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/scheduled-sitemap-refresh/index.ts` | Create | Combined regenerate + submit function |
| `supabase/config.toml` | Modify | Add function config |
| Database migration | Create | Enable pg_cron and schedule the job |

### Sitemap URLs to Submit Daily

```
https://aiagecalc.com/sitemap-index.xml
https://aiagecalc.com/sitemap-celebrities.xml
https://aiagecalc.com/sitemap-blog.xml
https://aiagecalc.com/sitemap-categories.xml
https://aiagecalc.com/sitemap-static.xml
```

### Expected Behavior

- Every day at 2:00 AM UTC, the cron job triggers
- All 5 sitemaps are regenerated from current database content
- All 5 sitemaps are submitted to Google Search Console
- Results are logged to `gsc_submission_logs` table
- If any sitemap fails, others still proceed

### Verification

After implementation, you can verify by:
1. Checking `gsc_submission_logs` table for daily entries
2. Running `SELECT * FROM cron.job` to see scheduled jobs
3. Viewing the GSC Submission Logs in the admin panel

