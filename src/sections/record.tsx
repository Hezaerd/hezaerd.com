import { education, experience } from "@/data/site";

export function Record() {
  return (
    <section
      id="record"
      aria-label="Record"
      className="mx-auto max-w-6xl space-y-[clamp(3rem,8svh,7rem)] px-5 py-[clamp(5rem,13svh,9rem)] sm:px-8"
    >
      {[
        { label: "Experience", id: "experience", rows: experience },
        { label: "Education", id: "education", rows: education },
      ].map(({ label, id, rows }) => (
        <div key={id}>
          <h2 id={id} className="section-label">
            {label}
          </h2>
          <table aria-labelledby={id} className="mt-5 w-full table-fixed text-left">
            <thead className="text-xs text-muted [&_th]:font-normal">
              <tr className="border-b border-line">
                <th scope="col" className="w-[24%] py-3 pr-2">
                  Period
                </th>
                <th scope="col" className="py-3 pr-2">
                  Title
                </th>
                <th scope="col" className="w-[30%] py-3">
                  Organization
                </th>
              </tr>
            </thead>
            <tbody className="text-[clamp(0.85rem,2.2vw,2rem)] leading-tight">
              {rows.map(({ period, title, org }) => (
                <tr key={org} className="border-b border-line align-top">
                  <td className="py-3.5 pr-2 text-[clamp(0.72rem,1.2vw,0.95rem)] text-muted">{period}</td>
                  <td className="py-3.5 pr-2">{title}</td>
                  <td className="py-3.5">{org}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
