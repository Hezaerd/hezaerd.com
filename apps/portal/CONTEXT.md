# Portal

Authenticated dual-role workspace: Operators run the freelance practice; Clients collaborate on their engagement. Not a public marketing site.

## Language

**Portal**:
The signed-in app at `/`. Role determines the home shell (Operator vs Client). Unauthenticated visitors see a login prompt.
_Avoid_: Landing page, marketing homepage, Brand, Portfolio, public brochure

**Operator**:
Hezaerd (or staff) using Portal to pilot the practice and client work.
_Avoid_: Admin (unless a literal permission name), you, freelancer-as-UI-label

**Client**:
An individual or local business collaborating with the practice through Portal. v1: one login seat per Client Workspace (no teammate invites / roles yet).
_Avoid_: Customer, buyer, account (for the person/org); multi-seat org UX in v1

**Operator Home**:
The Operator shell landing: a practice cockpit (business snapshot) with Client list below for hard-switching into a Client Workspace. Distinct chrome from Client Workspace — hard switch, not an overlay.
_Avoid_: Admin dashboard, CRM as product name, mixing Operator chrome into Client UI; making Operator Home Needs-Attention-only (that pattern is Client Home)

**Client Workspace**:
The collaboration shell bound to one Client. Holds all of that Client’s work with the practice as areas inside one home. Same Area chrome for Client and Operator-switched-in (Operators additionally get Workspace Switcher); Operators reach it by leaving Operator Home.
_Avoid_: One shell per engagement/project, Project app, portal-within-portal, overlay mode

**Core**:
Always-on Client Workspace nav: Home, Invoices, Files. Not toggled per Client.
_Avoid_: Optional modules, add-ons (for these three)

**Feature**:
An Operator-toggled Client Workspace area beyond Core. Client-facing labels: Insights (analytics), Website (CMS). Enabled/disabled per Client from the Client record to match what that Client bought. On enable: one dismissible Needs Attention for the Client (“Website is ready…”), then silent.
_Avoid_: Showing disabled Features in Client nav; hard-coding every Client to the full set; exposing “CMS” / “Analytics” as Client nav labels; persistent unlock banners

**Feature unlock**:
The one-time Needs Attention created when an Operator enables a Feature for a Client. Dismissed after view/dismiss; does not recur.
_Avoid_: Permanent badge on the nav item; email-only notification as the sole cue

**Area**:
A top-level Client Workspace nav destination. Labels: Home, Invoices, Files, Insights, Website.
_Avoid_: Modules, tabs-as-product-name, dashboard widgets-as-nav

**Client Home**:
The Client Workspace landing Area. Surfaces only Needs Attention items (unpaid invoice, file request, publish-ready draft, Feature unlock, etc.). When none: a calm “all caught up” state — not a status board or launchpad.
_Avoid_: Snapshot metric cards as the default Home; decorative dashboards; forcing a click through Home to reach work

**Needs Attention**:
An actionable item on Client Home that expects a Client (or Operator-in-workspace) response. Tapping it goes straight to the relevant Area/detail. Includes unpaid Invoices, File requests, publish-ready Website drafts, Feature unlocks, and similar.
_Avoid_: FYI-only widgets, vanity metrics, news feeds; Insights metrics as Needs Attention by default

**Practice Cockpit**:
The top of Operator Home. Four tiles: open invoice total, paid this month, Clients with something waiting on them, active Clients count. Client list sits below for hard-switch.
_Avoid_: Recreating Client Home here; unbounded widget grids; sales-pipeline tiles until Portal owns sales

**Workspace Switcher**:
Operator-only control in Client Workspace chrome. Shows current Client, lists other Clients, and “Back to Operator Home.” Hidden from Clients.
_Avoid_: Burying exit only in the account menu; requiring a round-trip through Operator Home to jump Client → Client

**Shell chrome**:
Both Operator Home and Client Workspace use a left sidebar for primary nav and a top bar for context/account. Client Workspace top bar also hosts Workspace Switcher for Operators. Mobile: collapsible sidebar. Density: Client Workspace stays calm/sparse; Operator shell may use denser tables and controls (same tokens, different information density).
_Avoid_: Top-only nav; different nav patterns per role; putting Workspace Switcher in the Client-visible sidebar; packing Client Areas like a SaaS admin console

**Operator nav**:
Operator sidebar: Home · Clients · Invoices · Settings. Per-Client Files, Insights, Website, and Feature toggles are reached via Clients → that Client (and/or inside their Client Workspace) — not as global Operator Areas.
_Avoid_: Global Operator nav for Insights/Website/Files; duplicating Client Workspace Areas in Operator chrome

**Client record**:
Operator-only page for one Client: identity, Feature toggles (Insights / Website), light meta, and primary CTA **Open workspace**. Not a second copy of the Client Workspace.
_Avoid_: Mini-workspace; full dossier in Operator chrome; acting on invoices/files primarily from this page

**Files**:
Client Workspace Area: shared folder (open upload + list) plus Operator-created File requests.
_Avoid_: Requests-only (no dump); folder-only with no requests; treating Files as email attachments

**File request**:
A named ask from Operator to Client for specific assets (“Logo SVG”). Appears as Needs Attention on Client Home until fulfilled.
_Avoid_: Vague “please upload stuff”; using chat/email as the system of record for asset asks

**Invoice**:
A payment request to a Client. In the Client Workspace Invoices Area, unpaid ones lead (Pay CTA); paid history is secondary. Open Invoices appear as Needs Attention on Client Home.
_Avoid_: Bill, payment request (as UI label); ledger-first Client UI; statement-only path to Pay

**Website**:
Client Workspace Feature Area for updating the Client’s site without Operator intervention. Guided fields only (not a page builder): Operator-defined editable spots, with Preview and Publish.
_Avoid_: CMS as Client label; visual/click-the-page editor as default; free-form page list that can break layout

**Editable field**:
A single Operator-defined spot on the Client’s site the Client may change in Website (e.g. hours, hero blurb, menu PDF).
_Avoid_: Block, section, widget (unless those become real model terms later)

**Publish**:
Client action in Website that makes draft Editable field changes live on their site. Preview comes before Publish.
_Avoid_: Deploy, ship, push (as Client-facing labels)

**Insights**:
Client Workspace Feature Area: three plain truths (visitors for the period, top pages/actions, one takeaway). Not a mini analytics suite. Does not create Needs Attention by default.
_Avoid_: GA-style chart walls; single opaque health score as the only view; Analytics as Client nav label

**Takeaway**:
The single plain-language sentence on Insights explaining what the numbers suggest the Client might do or notice.
_Avoid_: Insight (ambiguous with the Area name); recommendation engine; AI summary as a required label

**Message**:
A lightweight Client → Operator note from Client Workspace (persistent “Message Hezaerd”). Not a helpdesk. Surfaces for the Operator as something waiting on them (Practice Cockpit / work cues).
_Avoid_: Ticket, support center, mailto-only as the sole path; full chat product

**Brand** / **Portfolio**:
Separate public contexts. Portal may link to them; it does not host their content.
_Avoid_: Treating Portal as a second marketing homepage
