# README and open-source license plan

## Goal

Prepare the repository for public reading by adding a clear README for **Pause Réflexe** and an open-source license.

## License choice

Use the MIT License.

Reasoning:
- permissive and familiar for browser extensions;
- allows reuse, modification and distribution with minimal friction;
- keeps the project easy to fork or adapt;
- does not impose copyleft constraints that would be disproportionate for this MVP.

## README scope

The README should explain:
1. what Pause Réflexe is;
2. the target habit-change niche;
3. what it does and deliberately does not promise;
4. core features;
5. local development commands;
6. manual loading in Chrome;
7. current limitations and roadmap;
8. license.

## Files

- `README.md`
- `LICENSE`
- `package.json` license metadata

## Verification

Run:

```bash
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npm run test:run && npm run validate:manifest
```

Then commit documentation separately before implementation work on the next feature.
