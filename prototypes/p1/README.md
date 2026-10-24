# grove prototype p1 (throwaway)

```
cd prototypes/p1
npm install
OWNER_EMAIL=you@example.com npm start
```

Open http://localhost:5173. The owner signs up with OWNER_EMAIL (no invitation needed; default owner@grove.test), then creates invitation codes under Owner for everyone else.

To let reviewers in from outside, run a free Cloudflare quick tunnel on the same computer: `cloudflared tunnel --url http://localhost:5173`. Its address changes each time the tunnel restarts.

AI features work by copy-paste: grove gives you a prompt, you paste it into your own AI chat (Claude, ChatGPT, Gemini…), and paste the answer back. Optional: start with `ANTHROPIC_API_KEY=...` to let grove send the prompts directly (cut for now from the first build, still in the prototype).

Data lives in `data/`: users.json (accounts, invitations), learners/<id>.json (one file per learner), bank.json (the shared bank and its log), library.json (the shared library). Delete `data/` to start over.
