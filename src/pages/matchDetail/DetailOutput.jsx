export default function DetailOutput({ field, value, id, label }) {
  const common = { id, 'aria-label': label, value };
  return <p {...common}>{value}</p>;
}