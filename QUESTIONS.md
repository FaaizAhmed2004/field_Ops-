# FieldOps Assessment - Clarification Questions

These are questions a professional engineer would ask before starting development:

## 1. User & Access Control

**Question:** How should multi-tenancy work? Can one admin user manage multiple companies?
- **Assumption Made:** Single-tenant for now. One deployment = one company. This can be extended later.

**Question:** Should clients self-register or be invited by admins?
- **Assumption Made:** Invite-only for security. Admin creates client accounts with a registration link.

**Question:** Can technicians be assigned to multiple jobs simultaneously?
- **Assumption Made:** Yes. A technician can have multiple jobs in progress/assigned status.

---

## 2. Job Workflow & Status

**Question:** What are valid job status transitions? Can a completed job be reopened?
- **Assumption Made:** 
  - States: `Draft` → `Scheduled` → `Assigned` → `In Progress` → `Completed` → `Archived`
  - Completed jobs can be archived but not reopened (create new job instead)
  - Status updates have an audit trail

**Question:** What happens if a technician falls ill or quits mid-job?
- **Assumption Made:** Admin can reassign. Job history is preserved. Previous technician is notified.

**Question:** Should clients be able to reschedule jobs?
- **Assumption Made:** Clients can request reschedule; admin approves/denies.

---

## 3. Notifications

**Question:** What is the priority? Real-time vs. eventual consistency?
- **Assumption Made:** In-app notifications are real-time (via WebSocket or polling). Email is eventual.

**Question:** Should all status changes notify all parties, or selective events?
- **Assumption Made:** Selective. Only meaningful events: job assigned, on the way, arrived, completed.

**Question:** What about duplicate notifications?
- **Assumption Made:** Deduplication per user per event type within 5 minutes.

---

## 4. Data & Privacy

**Question:** How long should audit logs be retained?
- **Assumption Made:** 2 years by default, configurable by admin.

**Question:** Can clients delete their account? What happens to their jobs?
- **Assumption Made:** Soft delete. Jobs are preserved but marked "archived". Can be restored within 30 days.

**Question:** GDPR/data export requirements?
- **Assumption Made:** Basic data export via admin panel (JSON download).

---

## 5. Scalability

**Question:** Expected user count / jobs per year?
- **Assumption Made:** Built for growth to 10k jobs/month. Indexed accordingly.

**Question:** Should this run on a single server or be ready for distributed deployment?
- **Assumption Made:** Single-server MVP. Stateless backend allows horizontal scaling later.

---

## 6. Reporting & Analytics

**Question:** What metrics matter most? Job completion time? Technician utilization?
- **Assumption Made:** Basic metrics: completion rate, avg response time, technician availability.

**Question:** Real-time dashboard or batch reports?
- **Assumption Made:** Dashboards show near-real-time data (5-minute cache).

---

## 7. Integration Points

**Question:** Should invoicing/billing be part of this system?
- **Assumption Made:** Not in MVP. Can add later via webhook to billing system.

**Question:** External calendar sync (Google Calendar, Outlook)?
- **Assumption Made:** Not in MVP. Job dates are in FieldOps only.

---

## 8. Testing & Quality

**Question:** How much test coverage is expected?
- **Assumption Made:** Core API endpoints: 70%+. UI flows: basic happy path tests.

**Question:** Should there be a staging environment?
- **Assumption Made:** Single environment for now. .env controls behavior.

---

## 9. Support & Operations

**Question:** Should admins be able to reset user passwords?
- **Assumption Made:** Yes. Sends temporary password reset email.

**Question:** What happens in case of database corruption?
- **Assumption Made:** Daily backups (manual). Archival strategy documents recovery procedure.

---

## Summary of Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tenancy | Single-tenant | Simpler for MVP, meets requirements |
| Client Access | Invite-only | Security first |
| Auth Method | JWT with refresh tokens | Stateless, scalable |
| Notifications | In-app (polling) + email | Simple, works without external queue |
| Job Reassignment | Allow with audit trail | Real-world necessity |
| Status Flow | Linear with history | Prevents invalid states |
| Data Retention | 2 years audit logs | Legal + operational safety |
| Scaling Strategy | Single server → horizontal | Stateless design enables it |

