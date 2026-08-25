import { useEffect, useState } from 'react';
import * as lib from './lib/criterios.js';
import Panel from './components/Panel.jsx';
import Editor from './components/Editor.jsx';

const KEY = 'diban.criterios.v1';

function cargar() {
  try {
    const evs = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(evs) ? evs : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [evs, setEvs] = useState(cargar);
  const [vista, setVista] = useState('panel');
  const [actual, setActual] = useState(null);
  const [paso, setPaso] = useState(0);
  const [comp, setComp] = useState('PG');

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(evs)); } catch { /* storage unavailable */ }
  }, [evs]);

  const ev = evs.find((e) => e.id === actual) || null;

  const mut = (fn) => {
    setEvs((prev) => prev.map((e) => {
      if (e.id !== actual) return e;
      const copia = JSON.parse(JSON.stringify(e));
      fn(copia);
      copia.actualizado = new Date().toISOString();
      return copia;
    }));
  };

  const nueva = () => {
    const e = lib.nuevaEvaluacion();
    setEvs((prev) => [e, ...prev]);
    setActual(e.id);
    setPaso(0);
    setComp('PG');
    setVista('editor');
  };

  const abrir = (id) => {
    setActual(id);
    setPaso(0);
    setComp('PG');
    setVista('editor');
  };

  const irPanel = () => setVista('panel');

  const borrar = (id) => setEvs((prev) => prev.filter((e) => e.id !== id));

  const descargarUno = (e) => lib.descargar(lib.xlsxEvaluacion(e), 'DIBAN_' + (e.expediente || e.id).replace(/[^\w-]+/g, '_') + '.xlsx');
  const descargarConsolidado = () => {
    if (!evs.length) return;
    lib.descargar(lib.xlsxConsolidado(evs), 'DIBAN_Consolidado_BD.xlsx');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header className="app-header">
        <div className="wrap">
          <div className="brand">
            <span className="brand-name">DIBAN</span>
            <span className="brand-rule" />
            <span className="brand-sub">Criterios Excepcionales Art. 14.2</span>
          </div>
          <div style={{ flex: 1 }} />
          <button type="button" className="btn" onClick={irPanel}>Panel</button>
          <button type="button" className="btn btn-primary" onClick={nueva}>+ Nueva evaluación</button>
        </div>
      </header>

      {vista === 'panel' && (
        <Panel
          lib={lib}
          evs={evs}
          onAbrir={abrir}
          onBorrar={borrar}
          onDescargarUno={descargarUno}
          onDescargarConsolidado={descargarConsolidado}
        />
      )}

      {vista === 'editor' && ev && (
        <Editor
          lib={lib}
          ev={ev}
          paso={paso}
          comp={comp}
          mostrarAvisos
          umbralEditable
          setPaso={setPaso}
          setComp={setComp}
          mut={mut}
          irPanel={irPanel}
          descargarEste={() => descargarUno(ev)}
        />
      )}
    </div>
  );
}
