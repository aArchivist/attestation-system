export default function HoursCounter({ confirmed = 0, total = 0, required = 150 }) {
  const progress = Math.min((confirmed / required) * 100, 100);

  return (
    <section className="panel hours-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Навчальне навантаження</p>
          <h3>Підтверджені години для звіту</h3>
        </div>
        <div className="hours-meta">
          <strong>{confirmed} / {required}</strong>
          <span>У кабінеті відображено всього: {total} год</span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
