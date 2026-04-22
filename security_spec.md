# Security Specification - Employees & Project Assignments

## Data Invariants
1. A employee record must be nested under the user's specific path (`/users/{userId}/employees/{employeeId}`).
2. Only the owner of the user path can read/write their employees.
3. Employee IDs must be valid and strings must have size limits.
4. Projects now contain `assignedEmployeeIds`, which must be a list of strings if present.

## The Dirty Dozen Payloads (Rejection Tests)

### Employees Collection
1. **Unauthorized Read**: Attempt to read `/users/victim_id/employees/emp1` as `attacker_id`.
2. **Identity Spoofing**: Attempt to create `/users/user1/employees/emp1` with `request.auth.uid` being `user2`.
3. **ID Poisoning**: Attempt to create an employee with an ID that is 2KB of junk characters.
4. **Large Payload**: Attempt to save an employee with a `role` string larger than 500 characters.
5. **Invalid Types**: Attempt to save an employee where `role` is a boolean instead of a string.
6. **Bypassing Structure**: Attempt to update an employee's `id` field (immutability test).

### Project Assignments
7. **Cross-User Project Access**: User A attempts to list User B's projects.
8. **Invalid Assignment Type**: Attempt to update `assignedEmployeeIds` to a single string instead of an array.
9. **Large Assignment List**: Attempt to update `assignedEmployeeIds` with 10,000 IDs (exhaustion attack).
10. **Malicious ID in Assignment**: Attempt to put a 1MB string inside the `assignedEmployeeIds` array.
11. **Orphaned Selection**: Attempt to create a project referencing a clientId that doesn't exist (relational check - optional but good).
12. **Immutable Swap**: Attempt to change the `ownerId` of a project during update.

## Test Runner (Draft Logic)
The implementation should ensure that `allow list` and `allow get` strictly check `isOwner(userId)`, and `isValidEmployee(incoming())` is used during writes.
