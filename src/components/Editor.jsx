import { chipClass, bannerClass } from '../lib/ui.js';

const TABS_META = [
  { kicker: 'Datos', label: 'Identificación' },
  { kicker: 'Paso 1', label: 'Condiciones previas' },
  { kicker: 'Paso 2', label: 'Demanda poblacional' },
  { kicker: 'Paso 3', label: 'Acceso geográfico' },
  { kicker: 'Paso 4', label: 'Perfil epidemiológico' },
  { kicker: 'Paso 5', label: 'Resolución' },
];

function Toggle({ active, onClick, children }) {
  return (
    <button type="button" className={'toggle' + (active ? ' active' : '')} onClick={onClick}>
      {children}
    </button>
  );
}

function QRow({ n, texto, valor, onSi, onNo }) {
  return (
    <div className="qrow">
      <span className="qnum">{n}</span>
      <p className="qtext">{texto}</p>
      <div className="toggle-group">
        <Toggle active={valor === 'Sí'} onClick={onSi}>Sí</Toggle>
        <Toggle active={valor === 'No'} onClick={onNo}>No</Toggle>
      </div>
    </div>
  );
}

export default function Editor({
  lib, ev, paso, comp, mostrarAvisos, umbralEditable,
  setPaso, setComp, mut, irPanel, descargarEste,
}) {
  const { COMPS, evaluar, progreso, fila2, AVISOS, P3_PREGUNTAS, P4_PREGUNTAS, COND_PREVIAS, INSTITUCIONES } = lib;
  const R = evaluar(ev);
  const avance = progreso(ev);

  const campo = (label, key, tipo, ph, list) => ({
    label, tipo: tipo || 'text', ph: ph || '', list: list || '',
    value: ev[key] || '',
    onChange: (e) => { const v = e.target.value; mut((c) => { c[key] = v; }); },
  });
  const campos = [
    campo('IPRESS evaluada', 'ipress', 'text', 'Nombre del establecimiento'),
    campo('Código RENIPRESS', 'renipress', 'text', '00000000'),
    campo('Región / DIRESA', 'region', 'text', 'Ej. Loreto'),
    campo('Institución', 'institucion', 'text', 'MINSA / EsSalud / privado', 'dl-inst'),
    campo('Evaluador(a)', 'evaluador', 'text', 'Nombres y apellidos'),
    campo('Cargo / firma', 'cargo', 'text', 'Cargo del evaluador'),
    campo('Fecha de evaluación', 'fecha', 'date'),
    campo('N° de expediente / referencia', 'expediente', 'text', 'Ej. EXP-2026-0142'),
  ];

  const pasoComp = paso >= 2 && paso <= 4;
  const estadoPorComp = (k) => (paso === 2 ? R.p2[k].res : paso === 3 ? R.p3[k] : R.p4[k]);
  const compName = COMPS.find((c) => c.k === comp)?.name;

  return (
    <main className="wrap with-bottom-bar">
      <div className="editor-head">
        <div className="editor-head-row">
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="editor-kicker">Expediente {ev.expediente || ev.id}</div>
            <h1 style={{ fontSize: 'clamp(24px,4vw,34px)', marginTop: 2 }}>{ev.ipress || 'Nueva evaluación'}</h1>
          </div>
          <div>
            <div className="editor-kicker" style={{ marginBottom: 4 }}>Resolución final</div>
            <span className={chipClass(R.final)}>{R.final}</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        {TABS_META.map((t, i) => (
          <button key={t.label} type="button" className={'tab' + (i === paso ? ' active' : '')} onClick={() => setPaso(i)}>
            <span className="tab-kicker">{t.kicker}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
        <div className="tab-spacer" />
      </div>

      {paso === 0 && (
        <section className="section">
          <h2 className="section-title">Identificación del expediente</h2>
          <p className="section-sub">Estos campos encabezan la hoja «Resumen» del Excel y las primeras columnas de la hoja plana.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '18px 22px', maxWidth: 1000 }}>
            {campos.map((c) => (
              <label className="field" key={c.label}>
                <span className="field-label">{c.label}</span>
                <input type={c.tipo} value={c.value} onChange={c.onChange} placeholder={c.ph} list={c.list} className="input" />
              </label>
            ))}
          </div>
          <datalist id="dl-inst">
            {INSTITUCIONES.map((i) => <option value={i} key={i} />)}
          </datalist>
        </section>
      )}

      {paso === 1 && (
        <section className="section">
          <h2 className="section-title">Paso 1 — Condiciones previas</h2>
          <p className="section-sub">Si alguna condición no se cumple, no corresponde evaluar los criterios excepcionales.</p>
          <div className="qlist">
            {COND_PREVIAS.map((texto, i) => (
              <QRow
                key={i}
                n={i + 1}
                texto={texto}
                valor={ev.paso1[i]}
                onSi={() => mut((c) => { c.paso1[i] = c.paso1[i] === 'Sí' ? '' : 'Sí'; })}
                onNo={() => mut((c) => { c.paso1[i] = c.paso1[i] === 'No' ? '' : 'No'; })}
              />
            ))}
          </div>
          <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <span className="field-label">Resultado Paso 1</span>
            <span className={chipClass(R.p1)}>{R.p1}</span>
          </div>
        </section>
      )}

      {pasoComp && (
        <section className="section">
          <h2 className="section-title">
            {paso === 2 ? 'Paso 2 — Demanda poblacional · ' : paso === 3 ? 'Paso 3 — Acceso geográfico y continuidad · ' : 'Paso 4 — Perfil epidemiológico · '}
            {compName}
          </h2>
          <p className="section-sub">
            {paso === 2
              ? 'Serie de tres años por hemocomponente. La demanda validada y la brecha se calculan solas. El resultado oficial del paso se toma del Paquete Globular, componente de referencia del D.S. N.° 017-2022-SA.'
              : paso === 3
                ? 'Cinco preguntas por hemocomponente. Cada respuesta «No» evidencia una falla de acceso; el umbral define cuántas se necesitan para concluir CUMPLE.'
                : 'Cinco preguntas por hemocomponente. Regla operativa: CUMPLE si la pregunta 1 es «Sí» y la pregunta 5 es «No».'}
          </p>

          <div className="comp-tabs">
            {COMPS.map((c) => {
              const estado = estadoPorComp(c.k);
              return (
                <button key={c.k} type="button" className={'comp-tab' + (c.k === comp ? ' active' : '')} onClick={() => setComp(c.k)}>
                  <span className="comp-tab-abbr">{c.abbr}</span>
                  <span className="comp-tab-estado">{estado === 'REQUIERE INFORMACIÓN' ? 'Pendiente' : estado}</span>
                </button>
              );
            })}
            <div className="tab-spacer" />
          </div>

          {paso === 2 && (() => {
            const setN = (y, k) => (e) => { const v = e.target.value.replace(/[^0-9.]/g, ''); mut((c) => { c.paso2[comp][y][k] = v; }); };
            const r = R.p2[comp];
            return (
              <>
                <div className="p2-table">
                  <div>
                    <div className="p2-head">
                      <div>Año</div><div>Unid. transfundidas</div><div>Solicitudes no atendidas</div><div>Oferta efectiva</div><div>Demanda validada</div><div>Brecha %</div>
                    </div>
                    {[0, 1, 2].map((y) => {
                      const f = fila2(ev.paso2[comp][y]);
                      return (
                        <div className="p2-row" key={y}>
                          <input
                            value={ev.anios[y]}
                            onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 4); mut((c) => { c.anios[y] = v; }); }}
                            inputMode="numeric"
                            className="input"
                          />
                          <input value={ev.paso2[comp][y].t} onChange={setN(y, 't')} inputMode="numeric" placeholder="—" className="input input-soft" />
                          <input value={ev.paso2[comp][y].na} onChange={setN(y, 'na')} inputMode="numeric" placeholder="—" className="input input-soft" />
                          <input value={ev.paso2[comp][y].of} onChange={setN(y, 'of')} inputMode="numeric" placeholder="—" className="input input-soft" />
                          <div className="p2-static">{f.demanda === null ? '—' : f.demanda.toLocaleString('es-PE')}</div>
                          <div className="p2-brecha">{f.brecha === null ? '—' : f.brecha.toFixed(1) + '%'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="tiles" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', marginBottom: 20 }}>
                  <div className="tile"><div className="tile-label" style={{ minHeight: 44 }}>¿Existe demanda no atendida? (año más reciente)</div><div className="tile-value" style={{ fontSize: 24 }}>{r.q1 || '—'}</div></div>
                  <div className="tile"><div className="tile-label" style={{ minHeight: 44 }}>¿Oferta &lt; demanda? (año más reciente)</div><div className="tile-value" style={{ fontSize: 24 }}>{r.q2 || '—'}</div></div>
                  <div className="tile"><div className="tile-label" style={{ minHeight: 44 }}>¿La brecha se repite ≥2 de 3 años?</div><div className="tile-value" style={{ fontSize: 24 }}>{r.q3 || '—'}</div></div>
                </div>
                <p className="p2-note">Las solicitudes no atendidas deben ser clínicamente pertinentes, sin duplicados ni cancelaciones por cambio de conducta clínica (informe, punto 6.1). La fila más reciente es la que define las dos primeras preguntas.</p>

                <div className="result-row">
                  <div>
                    <div className="result-label">Resultado del componente</div>
                    <span className={chipClass(r.res)}>{r.res}</span>
                  </div>
                  <div>
                    <div className="result-label">Resultado oficial Paso 2 (Paquete Globular)</div>
                    <span className={chipClass(R.p2of)}>{R.p2of}</span>
                  </div>
                </div>
                {mostrarAvisos && <p className="aviso">⚠️ {AVISOS[2]}</p>}
              </>
            );
          })()}

          {(paso === 3 || paso === 4) && (() => {
            const qs = paso === 3 ? P3_PREGUNTAS : P4_PREGUNTAS;
            const key = paso === 3 ? 'paso3' : 'paso4';
            const resC = paso === 3 ? R.p3[comp] : R.p4[comp];
            const resOficial = paso === 3 ? R.p3of : R.p4of;
            return (
              <>
                {paso === 3 && (
                  <div className="umbral-bar">
                    <span className="umbral-label">Umbral: N° mínimo de respuestas «No» por componente para concluir CUMPLE</span>
                    <div className="umbral-opts">
                      {umbralEditable && [1, 2, 3, 4, 5].map((n) => (
                        <Toggle key={n} active={ev.umbral === n} onClick={() => mut((c) => { c.umbral = n; })}>
                          <span className="umbral-opt">{n}</span>
                        </Toggle>
                      ))}
                    </div>
                  </div>
                )}
                <div className="qlist">
                  {qs.map((texto, i) => (
                    <QRow
                      key={i}
                      n={i + 1}
                      texto={texto}
                      valor={ev[key][comp][i]}
                      onSi={() => mut((c) => { c[key][comp][i] = c[key][comp][i] === 'Sí' ? '' : 'Sí'; })}
                      onNo={() => mut((c) => { c[key][comp][i] = c[key][comp][i] === 'No' ? '' : 'No'; })}
                    />
                  ))}
                </div>
                <div className="result-row">
                  <div>
                    <div className="result-label">Resultado del componente</div>
                    <span className={chipClass(resC)}>{resC}</span>
                  </div>
                  <div>
                    <div className="result-label">Resultado oficial {paso === 3 ? 'Paso 3' : 'Paso 4'} (cualquier componente)</div>
                    <span className={chipClass(resOficial)}>{resOficial}</span>
                  </div>
                </div>
                {mostrarAvisos && <p className="aviso">⚠️ {paso === 3 ? AVISOS[0] : AVISOS[1]}</p>}
              </>
            );
          })()}
        </section>
      )}

      {paso === 5 && (() => {
        const resumenPasos = [
          { titulo: 'Paso 1 — Condiciones previas (Banco Tipo II)', nota: 'Si no cumple, no corresponde evaluar los criterios excepcionales.', res: R.p1 },
          { titulo: 'Paso 2 — Demanda poblacional', nota: 'Oficial = resultado del componente Paquete Globular.', res: R.p2of },
          { titulo: 'Paso 3 — Acceso geográfico y continuidad', nota: 'Oficial = CUMPLE si algún hemocomponente evidencia riesgo de acceso.', res: R.p3of },
          { titulo: 'Paso 4 — Perfil epidemiológico', nota: 'Oficial = CUMPLE si algún hemocomponente cumple. Regla operativa propia — validar.', res: R.p4of },
        ];
        return (
          <section className="section">
            <h2 className="section-title" style={{ marginBottom: 22 }}>Paso 5 — Resolución</h2>
            <div className="summary-list">
              {resumenPasos.map((p) => (
                <div className="summary-row" key={p.titulo}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div className="summary-title">{p.titulo}</div>
                    <div className="summary-note">{p.nota}</div>
                  </div>
                  <span className={chipClass(p.res)}>{p.res}</span>
                </div>
              ))}
            </div>
            <div className={bannerClass(R.final)}>
              <div className="banner-kicker">Resolución final</div>
              <div className="banner-value">{R.final}</div>
            </div>
            <p className="final-note">«FAVORABLE» significa que los criterios excepcionales sustentan continuar el trámite. No equivale a autorización automática; sigue condicionado al cumplimiento íntegro del Paso 1 y a la verificación de infraestructura, personal, equipamiento y bioseguridad.</p>
            <div className="final-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={descargarEste}>Descargar Excel del expediente</button>
              <button type="button" className="btn btn-lg" onClick={irPanel}>Volver al panel</button>
            </div>
          </section>
        );
      })()}

      <div className="bottom-bar">
        <div className="wrap">
          <div className="bottom-progress">
            <div className="editor-kicker">Avance {avance}%</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: avance + '%' }} />
            </div>
          </div>
          <button type="button" className="btn" onClick={() => setPaso(Math.max(0, paso - 1))}>Anterior</button>
          <button type="button" className="btn btn-solid" onClick={() => setPaso(Math.min(5, paso + 1))}>Siguiente</button>
          <button type="button" className="btn btn-primary" onClick={descargarEste}>Excel</button>
        </div>
      </div>
    </main>
  );
}
