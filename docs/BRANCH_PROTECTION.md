# Branch Protection

Status: repository setting contract.

Configure the protected release branches `main` and `master` with:

- require pull request before merging,
- require at least one approval,
- require Code Owners review,
- dismiss stale approvals when new commits are pushed,
- require status checks to pass,
- require branches to be up to date before merge,
- require conversation resolution,
- block force pushes,
- block deletion.

Required status checks:

- `secret-scan`
- `codeql`
- `validate`
- `backend-integration`
- `maestro-critical-ios`
- `maestro-critical-android`
- `design-system-ios`
- `design-system-android`

The nightly scheduled suite is a release-readiness signal and should block release promotion when it
fails, even if it is not configured as a per-PR required check.
