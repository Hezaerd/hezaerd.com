# Portal

Authenticated dual-role workspace: Operators run the freelance practice; Clients collaborate on their engagement. Not a public marketing site. One app, two role-bound shells — Operators never use Client Workspace chrome.

## Language

**Portal**:
The signed-in app at `/`. Role determines the home shell (Operator vs Client). Unauthenticated visitors see a login prompt.
_Avoid_: Landing page, marketing homepage, Brand, Portfolio, public brochure; separate Operator and Client apps

**Operator**:
Hezaerd (or staff) using Portal to pilot the practice and client work.
_Avoid_: Admin (unless a literal permission name), you, freelancer-as-UI-label

**Client**:
An individual or local business collaborating with the practice through Portal. v1: one login seat per Client Workspace (no teammate invites / roles yet).
_Avoid_: Customer, buyer, account (for the person/org); multi-seat org UX in v1

**Operator Home**:
The Operator shell landing: Practice Cockpit plus a Client list that opens each Client Desk. Distinct chrome from Client Workspace.
_Avoid_: Admin dashboard, CRM as product name; hard-switching into Client Workspace; mixing Operator chrome into Client UI; making Operator Home Needs-Attention-only (that pattern is Client Home)

**Client Workspace**:
The Client-only collaboration shell bound to one Client. Holds that Client’s work with the practice as Areas. Operators never enter this chrome; Operator `/w/…` URLs redirect to the matching Client Desk.
_Avoid_: Operator-in-workspace; Workspace Switcher; Open workspace; overlay mode; one shell per engagement/project; portal-within-portal; shared Area chrome for Operators

**Client Desk**:
The Operator pilot hub for one Client (`/op/clients/{slug}` and its Desk sections). Dual queues on the landing, plus practice-side Invoices, Files, Website, Insights, and Features. Replaces the old thin Client record.
_Avoid_: Client record; Open workspace; cloning Client Home; acting as the Client (Pay, Publish, fulfill File requests)

**Desk section**:
An Operator-only sub-route under Client Desk for practice-side work on that Client (e.g. Invoices, Files, Website, Insights, Features).
_Avoid_: Calling Desk sections Areas; packing Client-calm density into Desk sections

**Waiting on Client**:
Open work on Client Desk that needs a Client response (unpaid Invoice, outstanding File request, publish-ready Website draft, Feature unlock pending Client view, and similar).
_Avoid_: Needs Attention (Client-only term); mixing into a single unlabeled queue

**Waiting on Operator**:
Open work on Client Desk that needs an Operator response (practice-side follow-ups for that Client).
_Avoid_: Needs Attention; Message / in-app inbox items

**Core**:
Always-on Client Workspace nav: Home, Invoices, Files. Not toggled per Client.
_Avoid_: Optional modules, add-ons (for these three)

**Feature**:
An Operator-toggled Client Workspace Area beyond Core. Client-facing labels: Insights (analytics), Website (CMS). Enabled/disabled per Client from Client Desk to match what that Client bought. On enable: one dismissible Needs Attention for the Client (“Website is ready…”), then silent.
_Avoid_: Showing disabled Features in Client nav; hard-coding every Client to the full set; exposing “CMS” / “Analytics” as Client nav labels; persistent unlock banners

**Feature unlock**:
The one-time Needs Attention created when an Operator enables a Feature for a Client. Dismissed after view/dismiss; does not recur. Also appears as Waiting on Client on Client Desk until the Client has seen it.
_Avoid_: Permanent badge on the nav item; email-only notification as the sole cue

**Area**:
A top-level Client Workspace nav destination. Labels: Home, Invoices, Files, Insights, Website. Client-only vocabulary — not used for Operator Desk sections.
_Avoid_: Modules, tabs-as-product-name, dashboard widgets-as-nav; calling Desk sections Areas

**Client Home**:
The Client Workspace landing Area. Surfaces only Needs Attention items (unpaid invoice, file request, publish-ready draft, Feature unlock, etc.). When none: a calm “all caught up” state — not a status board or launchpad.
_Avoid_: Snapshot metric cards as the default Home; decorative dashboards; forcing a click through Home to reach work; Operator using Client Home as their cockpit

**Needs Attention**:
An actionable item on Client Home that expects a Client response. Tapping it goes straight to the relevant Area/detail. Includes unpaid Invoices, File requests, publish-ready Website drafts, Feature unlocks, and similar.
_Avoid_: FYI-only widgets, vanity metrics, news feeds; Insights metrics as Needs Attention by default; Operator-in-workspace as an actor; using this term on Client Desk (use Waiting on Client / Waiting on Operator)

**Practice Cockpit**:
The top of Operator Home. Four tiles: open invoice total, paid this month, Clients with something waiting on them, active Clients count. Client list below opens Client Desk.
_Avoid_: Recreating Client Home here; unbounded widget grids; sales-pipeline tiles until Portal owns sales; hard-switch into Client Workspace

**Shell chrome**:
Operator shell and Client Workspace each use a left sidebar for primary nav and a top bar for context/account. Mobile: collapsible sidebar. Density: Client Workspace stays calm/sparse; Operator shell (including Client Desk) may use denser tables and controls (same tokens, different information density).
_Avoid_: Top-only nav; Workspace Switcher; Operator chrome inside Client Workspace; packing Client Areas like a SaaS admin console

**Operator nav**:
Operator sidebar: Home · Clients · Invoices · Settings. Per-Client Files, Insights, Website, and Feature toggles live on Client Desk — not as global Operator Areas and not inside Client Workspace.
_Avoid_: Global Operator nav for Insights/Website/Files; duplicating Client Workspace Areas in Operator chrome; Open workspace into Client shell

**Files**:
Shared folder (open upload + list) plus Operator-created File requests. Clients use the Files Area; Operators manage the practice side from the Client Desk Files section.
_Avoid_: Requests-only (no dump); folder-only with no requests; treating Files as email attachments

**File request**:
A named ask from Operator to Client for specific assets (“Logo SVG”). Appears as Needs Attention on Client Home until fulfilled; Waiting on Client on Client Desk. Only the Client fulfills it.
_Avoid_: Vague “please upload stuff”; using chat/email as the system of record for asset asks; Operator fulfilling as the Client

**Invoice**:
A payment request to a Client. Operators create and manage from Client Desk (and the global Operator Invoices ledger). In the Client Workspace Invoices Area, unpaid ones lead (Pay CTA); paid history is secondary. Open Invoices appear as Needs Attention on Client Home and Waiting on Client on Client Desk. Only the Client Pays.
_Avoid_: Bill, payment request (as UI label); ledger-first Client UI; statement-only path to Pay; Operator Paying as the Client

**Website**:
Client Workspace Feature Area for updating the Client’s site without Operator intervention. Guided fields only (not a page builder): Operator-defined Editable fields on Client Desk, with Preview and Publish for the Client.
_Avoid_: CMS as Client label; visual/click-the-page editor as default; free-form page list that can break layout; Operator Publishing as the Client

**Editable field**:
A single Operator-defined spot on the Client’s site the Client may change in Website (e.g. hours, hero blurb, menu PDF).
_Avoid_: Block, section, widget (unless those become real model terms later)

**Publish**:
Client action in Website that makes draft Editable field changes live on their site. Preview comes before Publish.
_Avoid_: Deploy, ship, push (as Client-facing labels); Operator Publishing from Client Desk

**Insights**:
Client Workspace Feature Area: three plain truths (visitors for the period, top pages/actions, one takeaway). Not a mini analytics suite. Does not create Needs Attention by default. Operators can review the same truths from the Client Desk Insights section.
_Avoid_: GA-style chart walls; single opaque health score as the only view; Analytics as Client nav label

**Takeaway**:
The single plain-language sentence on Insights explaining what the numbers suggest the Client might do or notice.
_Avoid_: Insight (ambiguous with the Area name); recommendation engine; AI summary as a required label

**Brand** / **Portfolio**:
Separate public contexts. Portal may link to them; it does not host their content.
_Avoid_: Treating Portal as a second marketing homepage

**Client slug**:
Stable public key for a Client in Portal URLs (`/w/{slug}`, `/op/clients/{slug}`). Unique among Clients.
_Avoid_: Using Convex document IDs in Client-facing URLs; treating display name as the route key

**Client seat**:
The single User login bound to a Client (`users.clientId`). v1: at most one seat per Client; Client may exist before any seat is bound.
_Avoid_: Membership table, teammate invites, WorkOS Organization as the Client identity (for v1)

**Unlinked Client**:
Signed-in User with `role=client` and no `clientId` yet (email has not matched a Client `contactEmail`). Sees a not-linked screen, not Operator Home and not a guessed Workspace.
_Avoid_: Falling back to fixture Clients; treating Unlinked as Operator
