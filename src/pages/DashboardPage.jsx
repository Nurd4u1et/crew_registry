import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState, ErrorMessage, Loader } from "../components/StatusMessages";
import { DEPARTMENTS, MODULES, RANKS, STATUSES } from "../constants";
import useAllCrew from "../hooks/useAllCrew";
import useDocumentTitle from "../hooks/useDocumentTitle";

function countBy(list, field, order) {
  const counts = Object.fromEntries(order.map((value) => [value, 0]));
  list.forEach((item) => {
    counts[item[field]] = (counts[item[field]] ?? 0) + 1;
  });
  return order.map((value) => ({ label: value, count: counts[value] }));
}

function Breakdown({ title, rows, total, field, department }) {
  return (
    <section className="panel" aria-label={title}>
      <h2>{title}</h2>
      <ul className="bars">
        {rows.map((row) => {
          const share = total > 0 ? (row.count / total) * 100 : 0;
          const params = new URLSearchParams({ [field]: row.label });
          if (department) params.set("department", department);

          return (
            <li key={row.label}>
              <Link to={`/crew?${params.toString()}`} className="bar-row">
                <span className="bar-label">{row.label}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${share}%` }} />
                </span>
                <span className="bar-count">{row.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function DashboardPage() {
  useDocumentTitle("Dashboard");

  const { phase, crew, error, reload } = useAllCrew();
  const [searchParams, setSearchParams] = useSearchParams();
  const department = searchParams.get("department") ?? "";

  function changeDepartment(value) {
    setSearchParams(value ? { department: value } : {});
  }

  // Everything below is calculated from the API data and the selected department.
  const view = useMemo(() => {
    const list = department ? crew.filter((member) => member.department === department) : crew;
    const total = list.length;
    const totalMissions = list.reduce((sum, member) => sum + member.missions, 0);
    const senior = list.filter((member) => member.rank === "Officer" || member.rank === "Commander").length;

    return {
      total,
      onDuty: list.filter((member) => member.status === "On duty").length,
      totalMissions,
      averageMissions: total > 0 ? totalMissions / total : 0,
      seniorShare: total > 0 ? Math.round((senior / total) * 100) : 0,
      byStatus: countBy(list, "status", STATUSES),
      byRank: countBy(list, "rank", RANKS),
      byModule: countBy(list, "module", MODULES),
      topMissions: [...list].sort((a, b) => b.missions - a.missions).slice(0, 5),
    };
  }, [crew, department]);

  let content;
  if (phase === "error") {
    content = <ErrorMessage message={error} onRetry={reload} />;
  } else if (phase === "loading") {
    content = <Loader label="Counting the crew…" />;
  } else if (view.total === 0) {
    content = (
      <EmptyState
        title="No one in this department"
        text="Pick another department to see statistics."
        actionLabel="Show all departments"
        onAction={() => changeDepartment("")}
      />
    );
  } else {
    content = (
      <>
        <dl className="stats">
          <div className="stat">
            <dt>Crew members</dt>
            <dd>{view.total}</dd>
          </div>
          <div className="stat">
            <dt>On duty now</dt>
            <dd>{view.onDuty}</dd>
          </div>
          <div className="stat">
            <dt>Missions flown</dt>
            <dd>{view.totalMissions}</dd>
          </div>
          <div className="stat">
            <dt>Missions per person</dt>
            <dd>{view.averageMissions.toFixed(1)}</dd>
          </div>
          <div className="stat">
            <dt>Officers and commanders</dt>
            <dd>{view.seniorShare}%</dd>
          </div>
        </dl>

        <div className="breakdowns">
          <Breakdown title="By status" rows={view.byStatus} total={view.total} field="status" department={department} />
          <Breakdown title="By rank" rows={view.byRank} total={view.total} field="rank" department={department} />
          <Breakdown title="By station module" rows={view.byModule} total={view.total} field="module" department={department} />
        </div>

        <section className="panel" aria-label="Most experienced">
          <h2>Most missions flown</h2>
          <ol className="top-list">
            {view.topMissions.map((member) => (
              <li key={member.id}>
                <Link to={`/crew/${member.id}`}>{member.name}</Link>
                <span className="muted">
                  {member.rank}, {member.department}
                </span>
                <strong>{member.missions}</strong>
              </li>
            ))}
          </ol>
          <p>
            <Link to={department ? `/crew?department=${encodeURIComponent(department)}` : "/crew"}>
              See the full roster
            </Link>
          </p>
        </section>
      </>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Dashboard</h1>
        <label className="field field-inline">
          <span>Department</span>
          <select value={department} onChange={(event) => changeDepartment(event.target.value)}>
            <option value="">All departments</option>
            {DEPARTMENTS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      {content}
    </div>
  );
}

