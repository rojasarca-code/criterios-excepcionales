import { chipClass } from '../lib/ui.js';

export default function Panel({ lib, evs, onAbrir, onBorrar, onDescargarConsolidado, onDescargarUno }) {
  const { evaluar, progreso } = lib;
  const evals = evs.map((e) => ({ e, R: evaluar(e) }));

  const conteo = { FAVORABLE: 0, DESFAVORABLE: 0, 'SOLICITAR INFORMACIÓN': 0, 'NO CORRESPONDE': 0 };
  for (const { R } of evals) {
    const k = R.final.startsWith('NO CORRESPONDE') ? 'NO CORRESPONDE' : R.final;
    if (conteo[k] !== undefined) conteo[k]++;
  }
  const tiles = [
    { label: 'Expedientes', n: evs.length },
    { label: 'Favorable', n: conteo.FAVORABLE },
    { label: 'Desfavorable', n: conteo.DESFAVORABLE },
    { label: 'Solicitar información', n: conteo['SOLICITAR INFORMACIÓN'] },
    { label: 'No corresponde', n: conteo['NO CORRESPONDE'] },
  ];

  return (
    <main className="wrap" style={{ paddingTop: 28, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', marginBottom: 6 }}>Panel de expedientes</h1>
      <p style={{ marginBottom: 24, maxWidth: '70ch', color: 'var(--color-neutral-700)', textWrap: 'pretty' }}>
        Evaluación de los tres criterios excepcionales para Bancos de Sangre Tipo II (D.S. N.° 017-2022-SA).
        Los datos se guardan en este dispositivo; cada expediente se descarga en el formato Excel de la matriz
        más una hoja plana para carga en base de datos.
      </p>

      <div className="tiles">
        {tiles.map((t) => (
          <div className="tile" key={t.label}>
            <div className="tile-label">{t.label}</div>
            <div className="tile-value">{t.n}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, flex: 1 }}>Expedientes registrados</h2>
        <button type="button" className="btn" onClick={onDescargarConsolidado} disabled={!evs.length}>
          Descargar consolidado BD (.xlsx)
        </button>
      </div>

      {evs.length === 0 && (
        <div className="empty-state">
          <p style={{ marginBottom: 6, fontWeight: 600 }}>Aún no hay expedientes.</p>
          <p style={{ margin: 0, color: 'var(--color-neutral-700)' }}>Usa «+ Nueva evaluación» para registrar el primer caso.</p>
        </div>
      )}

      {evs.length > 0 && (
        <div className="table-wrap">
          <div>
            <div className="table-head">
              <div>IPRESS</div><div>Región / expediente</div><div>Fecha</div><div>Avance</div><div>Resolución</div><div>Acciones</div>
            </div>
            {evals.map(({ e, R }) => {
              const av = progreso(e);
              return (
                <div className="table-row" key={e.id}>
                  <div>
                    <div className="cell-strong">{e.ipress || 'Sin IPRESS'}</div>
                    <div className="cell-muted">{e.renipress ? 'RENIPRESS ' + e.renipress : '—'}</div>
                  </div>
                  <div style={{ fontSize: 13 }}>
                    <div>{e.region || '—'}</div>
                    <div style={{ color: 'var(--color-neutral-700)' }}>{e.expediente || e.id}</div>
                  </div>
                  <div style={{ fontSize: 13 }}>{e.fecha}</div>
                  <div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: av + '%' }} />
                    </div>
                    <div className="progress-label">{av}%</div>
                  </div>
                  <div><span className={chipClass(R.final)}>{R.final}</span></div>
                  <div className="row-actions">
                    <button type="button" className="btn btn-sm btn-solid" onClick={() => onAbrir(e.id)}>Abrir</button>
                    <button type="button" className="btn btn-sm" onClick={() => onDescargarUno(e)}>Excel</button>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => onBorrar(e.id)}>Borrar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
