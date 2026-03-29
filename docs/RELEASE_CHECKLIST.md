# Release Checklist

Use this checklist before each release.

## 1. Code Quality Gates

- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] CI workflow is green on target commit

## 2. Security and Write Controls

- [ ] Write auth variables configured (`WRITE_API_TOKEN`, `WRITE_SCOPE`)
- [ ] Frontend write variables configured (`VITE_WRITE_API_TOKEN`, `VITE_WRITE_SCOPE`)
- [ ] Unauthorized write smoke check fails with 401
- [ ] Wrong-scope write smoke check fails with 403

## 3. Data Integrity

- [ ] Runtime data source confirmed (`DATA_ROOT`)
- [ ] Dist mirroring policy confirmed (`MIRROR_DIST_WRITES`)
- [ ] Concurrent-write verification completed
- [ ] Critical datasets backed up before deployment

## 4. Functional Regression

- [ ] Direct URL open works for all main routes
- [ ] Direct URL open works for all admin editor routes
- [ ] Admin back flow works (editor -> options -> admin -> home)
- [ ] No visible route shake/flicker in repeated back-forward actions

## 5. Deployment and Rollback

- [ ] Deployment target and environment variables verified
- [ ] Rollback command/procedure verified
- [ ] Post-deploy smoke test completed
- [ ] Release note updated with key changes and known risks
