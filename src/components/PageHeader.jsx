export default function PageHeader({ title, lead }) {
  return (
    <header className="page-head">
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}
