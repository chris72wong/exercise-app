# Supabase setup

Run `schema.sql` in the Supabase SQL editor for the project backing this app.

The app expects these environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service role key is only used by the Next.js API route on the server. Do not expose it in client-side code.
