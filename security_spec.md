# Security Spec for MindMaster Logic Arcade

## Data Invariants
1. A user can only edit their own profile.
2. XP and wins are system-validated (ideally via Cloud Functions, but here we'll use strict rules).
3. Multiplayer sessions can only be joined if they are in 'waiting' status.
4. Players can only update the game state of a session they are currently in.

## The Dirty Dozen Payloads (Deny Test)
1. Write to another user's profile.
2. Increment XP by 1,000,000 in one go.
3. Join a session as someone else.
4. Update a finished game session.
5. Create a session with 100 players.
6. Delete the leaderboard.
7. Set username to a 10KB string.
8. Update `createdAt` after creation.
9. Inject non-existent `userId` into session players.
10. Read private emails of other users.
11. Spoof `email_verified` as false.
12. Create a session with an invalid game type.
