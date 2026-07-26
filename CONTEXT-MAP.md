# Context Map

## Contexts

- [Brand](./apps/brand/CONTEXT.md) — commercial face of the Hezaerd practice (company)
- [Portfolio](./apps/portfolio/CONTEXT.md) — person site / maker archive for Hezaerd the individual
- [Portal](./apps/portal/CONTEXT.md) — signed-in dual-role workspace (Operator practice + Client collaboration)

## Relationships

- **Brand ↔ Portfolio**: Work collections are **disjoint**. Brand shows company/client work; Portfolio shows personal craft, studies, experiments, and day-to-day maker work. A piece lives in one place only (no dual listing for now).
- **Brand → Portfolio**: Brand may link to Portfolio as “the person / maker archive,” not as the home of company Work.
- **Portfolio → Brand**: Portfolio may point back for hiring / engagement with the practice.
- **Portal ↔ Brand / Portfolio**: Portal is the authenticated dual-role workspace. It may link out to Brand or Portfolio; it does not host their public content.
- **Content ownership**: Each context owns its own content locally. There is no shared work/projects content package — collections do not cross, so locality beats a shared module.
