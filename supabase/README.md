# Supabase setup

Run `schema.sql` in the Supabase SQL editor for the project backing this app.

The app stores one shared row in `public.app_state`. The table is added to the
Supabase realtime publication so browser sessions can receive updates without a
manual refresh.

All devices must open the same deployed app using the same Supabase project. If
the environment variables below are missing, the app falls back to browser
`localStorage`, which saves only on the current device.

The app expects these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service role key is only used by the Next.js API route on the server. Do not expose it in client-side code.
