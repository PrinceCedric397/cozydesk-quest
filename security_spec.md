# Security Specification & Test Suite

## 1. Data Invariants

1. **User Identity & Scope**:
   - Every document under `/users/{userId}` must strictly match the authenticated user `request.auth.uid == userId`.
   - The user's internal `userId` attribute must be immutable and match `request.auth.uid`.
   - `createdAt` must strictly equal `request.time` on creation and remain immutable on update.
   - `updatedAt` must equal `request.time` on every update.
   - No user may read, update, or delete another user's private desk profile.

2. **Community Corkboard Notes**:
   - Anyone authenticated can read notes from `/corkboard_notes/{noteId}`.
   - On note creation, `authorId` must strictly equal `request.auth.uid`.
   - `createdAt` must strictly equal `request.time` on creation and remain immutable.
   - Only the author can update their note text, colors, emoji, or position, or delete the note.
   - Any authenticated user can react to a note, provided only the `reactions` map is modified (`affectedKeys().hasOnly(['reactions'])`).
   - String boundaries: Name max 64 chars, message max 1000 chars, color max 32 chars, fontClass max 32 chars, emoji max 32 chars.
   - Note document IDs must be valid alphanumeric identifier strings conforming to regex `^[a-zA-Z0-9_\-]+$` and `<= 128` chars.

3. **Global Catch-All**:
   - Default deny on any unspecified collections: `match /{document=**} { allow read, write: if false; }`.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1: Unauthenticated User Profile Creation**
   - Attempt to create `/users/target_user_123` with no `request.auth`.
   - Result: `PERMISSION_DENIED`.

2. **Payload 2: User Identity Spoofing**
   - Authenticated as `user_alice_456`, attempt to write to `/users/user_bob_789` or pass `userId: "user_bob_789"`.
   - Result: `PERMISSION_DENIED`.

3. **Payload 3: User Profile Ghost Field Injection**
   - Authenticated as `user_alice_456`, create `/users/user_alice_456` with shadow field `role: "admin"` or `isAdmin: true`.
   - Result: `PERMISSION_DENIED`.

4. **Payload 4: Client Spoofed Future Timestamp on User Creation**
   - Pass `createdAt: "2099-01-01T00:00:00Z"` instead of `request.time`.
   - Result: `PERMISSION_DENIED`.

5. **Payload 5: Immutability Tampering (Changing userId / createdAt)**
   - Attempt to update existing `/users/user_alice_456` changing `userId` or `createdAt`.
   - Result: `PERMISSION_DENIED`.

6. **Payload 6: Unauthenticated Note Creation**
   - Attempt to write to `/corkboard_notes/note_1` without authentication.
   - Result: `PERMISSION_DENIED`.

7. **Payload 7: Corkboard Note Author Spoofing**
   - Authenticated as `user_alice_456`, attempt to create note with `authorId: "user_bob_789"`.
   - Result: `PERMISSION_DENIED`.

8. **Payload 8: Document ID Poisoning**
   - Attempt to create note with ID `../../root/evil` or a 2KB garbage string.
   - Result: `PERMISSION_DENIED`.

9. **Payload 9: Denial of Wallet (100KB Message Payload Injection)**
   - Attempt to create note with `message` string of 100,000 characters (exceeding 1000 char max limit).
   - Result: `PERMISSION_DENIED`.

10. **Payload 10: Non-Author Note Overwrite**
    - Authenticated as `user_bob_789`, attempt to edit the message or delete `/corkboard_notes/alice_note` owned by `user_alice_456`.
    - Result: `PERMISSION_DENIED`.

11. **Payload 11: Reaction Hijack (Modifying Note Content during Reaction)**
    - Non-author attempts to update `/corkboard_notes/alice_note` modifying both `reactions` and `message` ("defaced content").
    - Result: `PERMISSION_DENIED`.

12. **Payload 12: Unauthorized Subcollection or Path Escalation**
    - Attempt to write to `/corkboard_notes/note_1/unauthorized_sub/subdoc` or arbitrary collection `/admin_settings/1`.
    - Result: `PERMISSION_DENIED`.

---

## 3. Test Runner (firestore.rules.test.ts)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gen-lang-client-0096339037',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules - The Dirty Dozen Tests', () => {
  const aliceUid = 'alice_user_123';
  const bobUid = 'bob_user_456';

  test('Payload 1: Unauthenticated write to /users fails', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.doc('users/alice_user_123').set({
      userId: aliceUid,
      displayName: 'Alice',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  test('Payload 2: User identity spoofing fails', async () => {
    const aliceDb = testEnv.authenticatedContext(aliceUid).firestore();
    await assertFails(aliceDb.doc('users/bob_user_456').set({
      userId: bobUid,
      displayName: 'Bob Impersonator',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  test('Payload 3: User profile ghost field injection fails', async () => {
    const aliceDb = testEnv.authenticatedContext(aliceUid).firestore();
    await assertFails(aliceDb.doc(`users/${aliceUid}`).set({
      userId: aliceUid,
      displayName: 'Alice',
      role: 'admin',
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  test('Payload 4: Spoofed client timestamp fails', async () => {
    const aliceDb = testEnv.authenticatedContext(aliceUid).firestore();
    await assertFails(aliceDb.doc(`users/${aliceUid}`).set({
      userId: aliceUid,
      displayName: 'Alice',
      createdAt: new Date('2099-01-01'),
      updatedAt: new Date(),
    }));
  });

  test('Payload 5: Immutability tampering (changing userId) fails', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc(`users/${aliceUid}`).set({
        userId: aliceUid,
        displayName: 'Alice',
      });
    });
    const aliceDb = testEnv.authenticatedContext(aliceUid).firestore();
    await assertFails(aliceDb.doc(`users/${aliceUid}`).update({
      userId: bobUid,
    }));
  });

  test('Payload 6: Unauthenticated note creation fails', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.doc('corkboard_notes/note_1').set({
      authorId: aliceUid,
      name: 'Alice',
      message: 'Hello world',
    }));
  });

  test('Payload 7: Corkboard note author spoofing fails', async () => {
    const aliceDb = testEnv.authenticatedContext(aliceUid).firestore();
    await assertFails(aliceDb.doc('corkboard_notes/note_1').set({
      authorId: bobUid,
      name: 'Alice',
      message: 'Hello world',
    }));
  });

  test('Payload 8: Document ID poisoning fails', async () => {
    const aliceDb = testEnv.authenticatedContext(aliceUid).firestore();
    await assertFails(aliceDb.doc('corkboard_notes/invalid..id$$$').set({
      authorId: aliceUid,
      name: 'Alice',
      message: 'Hello',
    }));
  });

  test('Payload 9: 100KB message payload injection fails', async () => {
    const aliceDb = testEnv.authenticatedContext(aliceUid).firestore();
    await assertFails(aliceDb.doc('corkboard_notes/note_1').set({
      authorId: aliceUid,
      name: 'Alice',
      message: 'A'.repeat(5000),
      color: '#fef08a',
      fontClass: 'font-hand',
      emoji: '☕',
      reactions: { heart: 0, coffee: 0, star: 0, fire: 0 },
    }));
  });

  test('Payload 10: Non-author note overwrite fails', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('corkboard_notes/note_1').set({
        authorId: aliceUid,
        name: 'Alice',
        message: 'Original note',
        color: '#fef08a',
        fontClass: 'font-hand',
        emoji: '☕',
        reactions: { heart: 0, coffee: 0, star: 0, fire: 0 },
      });
    });
    const bobDb = testEnv.authenticatedContext(bobUid).firestore();
    await assertFails(bobDb.doc('corkboard_notes/note_1').update({
      message: 'Hacked by Bob',
    }));
  });

  test('Payload 11: Reaction hijack with content defacement fails', async () => {
    const bobDb = testEnv.authenticatedContext(bobUid).firestore();
    await assertFails(bobDb.doc('corkboard_notes/note_1').update({
      message: 'Defaced message',
      reactions: { heart: 1, coffee: 0, star: 0, fire: 0 },
    }));
  });

  test('Payload 12: Unauthorized path escalation fails', async () => {
    const aliceDb = testEnv.authenticatedContext(aliceUid).firestore();
    await assertFails(aliceDb.doc('admin_settings/config').set({ evil: true }));
  });
});
```
