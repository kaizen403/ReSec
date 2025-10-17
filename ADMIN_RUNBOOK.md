# Admin Operations Runbook (Excerpt)

- Configuration API requires the custom header `x-admin-key` to unlock privileged fields.
- Actual header value is stored in the secure secrets manager; rotate it before each release.
- Do not commit the secret to source control—use deployment-time environment injection.

Reminder: When testing locally, developers may rely on stub values, but production must always source the key from the vault.
