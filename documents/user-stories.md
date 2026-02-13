# CodeRail Flow – Complete User Stories & Product Flows

This document defines **all user stories and end‑to‑end product flows** required to deliver the full CodeRail Flow product.

It is written to be used directly for:

* backlog creation (Jira / Linear)
* MVP scoping
* acceptance criteria
* engineering execution

---

## 1. Personas

### PM (Primary)

* Owns flows
* Explains system behavior
* Shares artifacts

### Ops / Support

* Runs flows during incidents
* Attaches evidence to tickets

### Compliance / Risk

* Reviews artifacts
* Uses runs as audit evidence

### Engineer / Admin

* One‑time setup
* Maintains UI contracts and auth

### Org Owner

* Billing, retention, access control

---

## 2. Project & Organization Flows

### 2.1 Create Organization

**As an Org Owner**

* I want to create an organization
* So that my team can collaborate

**Flow**

1. Sign up
2. Create organization
3. Choose plan
4. Invite users

**Acceptance**

* Org created
* Owner role assigned

---

### 2.2 Invite Users & Assign Roles

**As an Org Owner**

* I want to invite users with roles

**Roles**

* Owner
* Admin
* PM / Ops
* Compliance
* Viewer

**Acceptance**

* RBAC enforced across product

---

## 3. Project Setup Flows

### 3.1 Create Project

**As a PM or Admin**

* I want to create a project
* So I can define flows for a system

**Flow**

1. Enter project name
2. Set base URL
3. Label environment (dev/stage/prod)

---

### 3.2 Configure Authentication

**As an Admin**

* I want CodeRail to authenticate into my system

**Variants**

* Import session cookies
* Define login flow (username/password)

**Acceptance**

* Secrets encrypted
* Auth reusable across runs

---

## 4. Screen & Element Mapping Flows

### 4.1 Create Screen

**As a PM**

* I want to define a screen
* So flows can navigate predictably

**Flow**

1. Name screen
2. Define URL path

---

### 4.2 Map UI Element (Mapping Mode)

**As a PM**

* I want to map a UI element visually

**Flow**

1. Open Mapping Mode
2. Browser loads screen
3. Hover highlights elements
4. Click element
5. Name element
6. Save

**Acceptance**

* Element stored with locator(s)
* Reliability score shown

---

### 4.3 Edit / Remap Element

**As a PM**

* I want to update a broken element mapping

**Acceptance**

* New locator version stored
* Old runs unaffected

---

## 5. Flow Authoring

### 5.1 Create Flow (Draft)

**As a PM**

* I want to create a new flow

**Flow**

1. Name flow
2. Add description
3. Status = Draft

---

### 5.2 Build Flow Steps

**As a PM**

* I want to define steps in plain language

**Step Types**

* Navigate
* Fill field
* Click
* Wait
* Select row
* Highlight element
* Caption / narration
* Pause

**Acceptance**

* Flow validates before save

---

### 5.3 Define Flow Parameters

**As a PM**

* I want flows to accept inputs

**Examples**

* Card ID
* User ID
* Order ID

---

### 5.4 Version Flow

**As a PM**

* I want to version flows

**Acceptance**

* Immutable historical versions
* New runs use latest active version

---

## 6. Flow Execution

### 6.1 Run Flow

**As a PM / Ops**

* I want to execute a flow

**Flow**

1. Select flow
2. Enter parameters
3. Click Run

---

### 6.2 Monitor Run Progress

**As a PM / Ops**

* I want to see run progress

**States**

* Queued
* Running (step‑by‑step)
* Failed
* Succeeded

---

### 6.3 Handle Run Failure

**As a PM / Ops**

* I want to understand why a run failed

**Acceptance**

* Failed step highlighted
* Error message shown
* Screenshot available

---

## 7. Artifact Generation & Consumption

### 7.1 Generate Artifacts

**System Behavior**

* Generate video
* Generate subtitles
* Generate run report

---

### 7.2 View Artifacts

**As any user with access**

* I want to view artifacts

**Acceptance**

* Secure signed URLs
* Inline preview

---

### 7.3 Share Artifacts

**As a PM / Ops**

* I want to share results

**Methods**

* Download
* Share link
* Attach to Jira

---

## 8. Incident & Evidence Flows

### 8.1 Explain Incident

**As Ops**

* I want to explain a failure visually

**Flow**

1. Run flow with incident ID
2. Share video + subtitles

---

### 8.2 Compliance Review

**As Compliance**

* I want proof of control execution

**Acceptance**

* Artifact immutable
* Audit metadata visible

---

## 9. Governance & Security Flows

### 9.1 Role-Based Access

**As Org Owner**

* I want strict access control

---

### 9.2 Artifact Retention

**As Org Owner**

* I want to define retention policies

---

### 9.3 Redaction Rules

**As Admin**

* I want to mask sensitive fields

---

## 10. Administration & Platform Flows

### 10.1 Usage & Limits

**As Org Owner**

* I want to see usage

---

### 10.2 Billing & Plans

**As Org Owner**

* I want to manage billing

---

## 11. Cross‑Cutting UX Flows

### 11.1 First‑Run Onboarding

* Create org
* Create project
* Map first screen
* Build first flow
* Run flow

---

### 11.2 Empty States

* No project
* No flows
* No runs

---

### 11.3 Error States

* Auth expired
* Locator broken
* Browser blocked

---

## 12. MVP vs v1 Breakdown

### MVP (Must Have)

* Org / Project
* Mapping mode
* Flow builder
* Run execution
* Video + subtitles
* Run history

### v1

* Voice narration
* Redaction rules
* Compliance views
* Usage analytics

### v2

* AI assist (copy only)
* Desktop agent
* Enterprise SSO

---

## 13. Acceptance Criteria (Global)

* PM can explain a real incident end‑to‑end without engineering help
* Runs are deterministic and reproducible
* Artifacts are auditable and immutable
* No DOM or scripting knowledge required for PMs

---

**CodeRail Flow**
Executable workflows. Explainable evidence.
