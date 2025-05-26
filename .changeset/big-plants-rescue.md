---
"@monorise/react": patch
"@monorise/core": patch
---

code refactor:

- refactor lastKey in core/data to receive and return as string, so users no need to wrap fromLastKeyQuery or toLastKeyResponse again
- delete local mutual entities in deleteEntity function
- add & expose helper function of getting requestKey, so users no need check back source code for create/edit/delete entity/mutual functions
- added StandardErrorCode enum to organize all StandardError.code in framework
