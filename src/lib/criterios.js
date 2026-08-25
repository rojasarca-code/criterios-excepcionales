// Motor de cálculo y generador XLSX para la Matriz de Criterios Excepcionales Art. 14.2 (D.S. 017-2022-SA)
// Réplica fiel de las fórmulas de la matriz original.

export const COMPS = [
  { k: 'PG', abbr: 'PG', name: 'Paquete Globular', full: 'PAQUETE GLOBULAR (PG) — componente de referencia del D.S.' },
  { k: 'PFC', abbr: 'PFC', name: 'Plasma Fresco Congelado', full: 'PLASMA FRESCO CONGELADO (PFC)' },
  { k: 'PLQ', abbr: 'PLQ', name: 'Plaquetas', full: 'PLAQUETAS (PLQ)' },
  { k: 'CRIO', abbr: 'CRIO', name: 'Crioprecipitado', full: 'CRIOPRECIPITADO (CRIO)' },
];

export const COND_PREVIAS = [
  'Cumple las condiciones técnicas de Banco Tipo II (infraestructura, aféresis, documentos de gestión, bioseguridad).',
  'Cuenta con cartera de servicios que requiere hemocomponentes y aféresis terapéutica.',
  'Presenta información oficial de al menos 2 años (idealmente 3) para sustentar los criterios excepcionales.',
  'Acredita disponibilidad de personal, equipamiento, donantes y presupuesto.',
];

export const P3_PREGUNTAS = [
  '¿Existe proveedor con capacidad real demostrada?',
  '¿Puede entregar el componente las 24 horas, los 7 días?',
  '¿El transporte y la cadena de frío están validados?',
  '¿La ruta opera de forma estable durante todo el año?',
  '¿Existe alternativa ante contingencia?',
];

export const P4_PREGUNTAS = [
  '¿Existen enfermedades o eventos de alta necesidad transfusional para este componente?',
  '¿La IPRESS tiene servicios de alta demanda de este componente (cartera formalmente aprobada)?',
  '¿La demanda de este componente está aumentando (serie de 2-3 años)?',
  '¿Existen eventos recurrentes o estacionales que exijan este componente?',
  '¿La red existente PUEDE cubrir la demanda específica de este componente?',
];

export const AVISOS = [
  'El Paso 3 (Acceso) usa como regla operativa que basta 1 respuesta «No» entre las 5 preguntas para considerar evidenciado el riesgo de acceso. El informe original no fija ese número; el umbral es ajustable. Revisa si tu criterio técnico exige más de una falla.',
  'El Paso 4 (Perfil epidemiológico) NO tiene, en el informe original, una fórmula de corte explícita. Esta matriz usa una regla operativa propia: CUMPLE si Q1=«Sí» y Q5=«No» para ese hemocomponente. Es una interpretación, no una regla del informe.',
  'Los Pasos 2, 3 y 4 se evalúan por hemocomponente. En el Paso 2 el resultado OFICIAL se basa en Paquete Globular (define el umbral de 2,500 unidades/año del D.S. N.° 017-2022-SA); los demás son evidencia complementaria. En los Pasos 3 y 4 el resultado OFICIAL es CUMPLE si CUALQUIER componente evidencia el criterio.',
  'Que la resolución sea «FAVORABLE» significa que los criterios excepcionales sustentan continuar el trámite; no equivale a autorización automática ni reemplaza la verificación de infraestructura, personal, equipamiento, bioseguridad y demás requisitos de un Banco Tipo II (Paso 1).',
];

export const INSTITUCIONES = ['MINSA', 'EsSalud', 'Sanidad FF.AA. / PNP', 'Privado', 'Otro'];

export function nuevaEvaluacion() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const mk = () => ({});
  const ev = {
    id: 'EXP-' + Date.now().toString(36).toUpperCase(),
    creado: hoy.toISOString(),
    actualizado: hoy.toISOString(),
    ipress: '', renipress: '', region: '', institucion: '',
    evaluador: '', cargo: '', expediente: '',
    fecha: hoy.toISOString().slice(0, 10),
    paso1: ['', '', '', ''],
    anios: [String(y - 2), String(y - 1), String(y)],
    paso2: mk(), paso3: mk(), paso4: mk(),
    umbral: 1,
  };
  for (const c of COMPS) {
    ev.paso2[c.k] = [0, 1, 2].map(() => ({ t: '', na: '', of: '' }));
    ev.paso3[c.k] = ['', '', '', '', ''];
    ev.paso4[c.k] = ['', '', '', '', ''];
  }
  return ev;
}

const num = (v) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v));

export function fila2(r) {
  const t = num(r.t), na = num(r.na), of = num(r.of);
  const demanda = t === null || na === null ? null : t + na;
  const brecha = demanda === null || demanda === 0 || of === null ? null : ((demanda - of) / demanda) * 100;
  return { t, na, of, demanda, brecha };
}

export function paso1Resultado(p1) {
  if (p1.some((v) => v === '')) return 'REQUIERE INFORMACIÓN';
  if (p1.some((v) => v === 'No')) return 'NO CORRESPONDE';
  return 'CUMPLE';
}

export function paso2Componente(rows) {
  const f = rows.map(fila2);
  const rec = f[2];
  const q1 = rec.na === null ? '' : rec.na > 0 ? 'Sí' : 'No';
  const q2 = rec.of === null || rec.demanda === null ? '' : rec.of < rec.demanda ? 'Sí' : 'No';
  const completos = f.every((x) => x.of !== null && x.demanda !== null);
  const q3 = !completos ? '' : f.filter((x) => x.of < x.demanda).length >= 2 ? 'Sí' : 'No';
  let res;
  if (f.some((x) => x.t === null)) res = 'REQUIERE INFORMACIÓN';
  else res = q1 === 'Sí' && q2 === 'Sí' && q3 === 'Sí' ? 'CUMPLE' : 'NO CUMPLE';
  return { q1, q2, q3, res, filas: f };
}

export function paso3Componente(ans, umbral) {
  if (ans.some((v) => v === '')) return 'REQUIERE INFORMACIÓN';
  return ans.filter((v) => v === 'No').length >= umbral ? 'CUMPLE' : 'NO CUMPLE';
}

export function paso4Componente(ans) {
  if (ans.some((v) => v === '')) return 'REQUIERE INFORMACIÓN';
  return ans[0] === 'Sí' && ans[4] === 'No' ? 'CUMPLE' : 'NO CUMPLE';
}

const oficialCualquiera = (list) =>
  list.includes('CUMPLE') ? 'CUMPLE' : list.includes('REQUIERE INFORMACIÓN') ? 'REQUIERE INFORMACIÓN' : 'NO CUMPLE';

export function evaluar(ev) {
  const p1 = paso1Resultado(ev.paso1);
  const p2 = {}; const p3 = {}; const p4 = {};
  for (const c of COMPS) {
    p2[c.k] = paso2Componente(ev.paso2[c.k]);
    p3[c.k] = paso3Componente(ev.paso3[c.k], ev.umbral);
    p4[c.k] = paso4Componente(ev.paso4[c.k]);
  }
  const p2of = p2.PG.res;
  const p3of = oficialCualquiera(COMPS.map((c) => p3[c.k]));
  const p4of = oficialCualquiera(COMPS.map((c) => p4[c.k]));
  let final;
  if (p1 !== 'CUMPLE') final = 'NO CORRESPONDE — falla condiciones previas (Paso 1)';
  else if ([p2of, p3of, p4of].includes('REQUIERE INFORMACIÓN')) final = 'SOLICITAR INFORMACIÓN';
  else final = p2of === 'CUMPLE' && (p3of === 'CUMPLE' || p4of === 'CUMPLE') ? 'FAVORABLE' : 'DESFAVORABLE';
  return { p1, p2, p3, p4, p2of, p3of, p4of, final };
}

export function progreso(ev) {
  let total = 0, hechos = 0;
  total += 4; hechos += ev.paso1.filter((v) => v !== '').length;
  for (const c of COMPS) {
    total += 9; hechos += ev.paso2[c.k].reduce((a, r) => a + ['t', 'na', 'of'].filter((k) => r[k] !== '').length, 0);
    total += 5; hechos += ev.paso3[c.k].filter((v) => v !== '').length;
    total += 5; hechos += ev.paso4[c.k].filter((v) => v !== '').length;
  }
  return Math.round((hechos / total) * 100);
}

/* ═══════════════ XLSX ═══════════════ */

const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

function zipBlob(files) {
  const enc = new TextEncoder();
  const parts = []; const central = []; let offset = 0;
  for (const f of files) {
    const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    const nameB = enc.encode(f.name); const crc = crc32(data);
    const lh = new Uint8Array(30 + nameB.length); const dv = new DataView(lh.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, 0, true);
    dv.setUint32(14, crc, true); dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true);
    dv.setUint16(26, nameB.length, true); lh.set(nameB, 30);
    parts.push(lh, data);
    const cd = new Uint8Array(46 + nameB.length); const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameB.length, true); cv.setUint32(42, offset, true); cd.set(nameB, 46);
    central.push(cd);
    offset += lh.length + data.length;
  }
  const cdSize = central.reduce((a, c) => a + c.length, 0);
  const eo = new Uint8Array(22); const ev = new DataView(eo.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, central.length, true); ev.setUint16(10, central.length, true);
  ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
  return new Blob([...parts, ...central, eo], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function colLetter(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; } return s; }

// cell helpers -------------------------------------------------
const S = { plain: 0, title: 1, head: 2, bold: 3, input: 4, box: 5, result: 6, note: 7, wrap: 8, pct: 9, band: 10 };
const txt = (v, s = 0) => ({ t: 's', v, s });
const nmb = (v, s = 0) => ({ t: 'n', v, s });
const fml = (f, v, s = 0) => ({ f, v, s });
const blank = (s = 0) => ({ s });

function rowXml(rowNum, cells, ht) {
  let x = `<row r="${rowNum}"${ht ? ` ht="${ht}" customHeight="1"` : ''}>`;
  cells.forEach((c, i) => {
    if (!c) return;
    const ref = colLetter(i + 1) + rowNum;
    const s = c.s ? ` s="${c.s}"` : '';
    if (c.f !== undefined) {
      const isNum = typeof c.v === 'number';
      x += `<c r="${ref}"${s}${isNum ? '' : ' t="str"'}><f>${esc(c.f)}</f><v>${isNum ? c.v : esc(c.v ?? '')}</v></c>`;
    } else if (c.t === 's') {
      if (c.v === '' || c.v === null || c.v === undefined) x += `<c r="${ref}"${s}/>`;
      else x += `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(c.v)}</t></is></c>`;
    } else if (c.t === 'n' && c.v !== null && c.v !== undefined && c.v !== '') {
      x += `<c r="${ref}"${s}><v>${c.v}</v></c>`;
    } else x += `<c r="${ref}"${s}/>`;
  });
  return x + '</row>';
}

function sheetXml({ rows, cols = [], merges = [], validations = [] }) {
  const colsXml = cols.length
    ? '<cols>' + cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols>'
    : '';
  const body = rows.map((r) => (r ? rowXml(r.n, r.c, r.ht) : '')).join('');
  const mg = merges.length ? `<mergeCells count="${merges.length}">` + merges.map((m) => `<mergeCell ref="${m}"/>`).join('') + '</mergeCells>' : '';
  const dv = validations.length
    ? `<dataValidations count="${validations.length}">` + validations.map((v) =>
        `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="${v.sqref}"><formula1>"${v.list}"</formula1></dataValidation>`).join('') + '</dataValidations>'
    : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr/><sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/>${colsXml}<sheetData>${body}</sheetData>${mg}${dv}<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/></worksheet>`;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="7">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="14"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><sz val="11"/><color rgb="FF1F4E79"/><name val="Calibri"/></font>
<font><i/><sz val="9"/><color rgb="FF605D5D"/><name val="Calibri"/></font>
<font><b/><sz val="12"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
</fonts>
<fills count="6">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFEC3013"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFD7D3D3"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CC"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFEAE9E9"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFBAB6B6"/></left><right style="thin"><color rgb="FFBAB6B6"/></right><top style="thin"><color rgb="FFBAB6B6"/></top><bottom style="thin"><color rgb="FFBAB6B6"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="11">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="1" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="5" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="6" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

const SHEET_NAMES = ['Instrucciones', 'Resumen', '1_CondicionesPrevias', '2_DemandaPoblacional', '3_AccesoGeografico', '4_PerfilEpidemiologico', 'BD_Plana'];

function buildWorkbook(sheets) {
  const files = [
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${SHEET_NAMES.map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><calcPr fullCalcOnLoad="1"/></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: 'xl/styles.xml', data: STYLES },
  ];
  sheets.forEach((s, i) => files.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: s }));
  return zipBlob(files);
}

const SI = 'Sí,No';
const BLOCK_COLS = { PG: 2, PFC: 7, PLQ: 12, CRIO: 17 }; // 1-based first col of each block (B, G, L, Q)

function hojaInstrucciones() {
  const rows = []; let n = 1;
  const push = (cells, ht) => rows.push({ n: n++, c: cells, ht });
  push([txt('MATRIZ DE EVALUACIÓN — CRITERIOS EXCEPCIONALES ART. 14.2 (D.S. N° 017-2022-SA)', S.title), blank(S.title), blank(S.title), blank(S.title), blank(S.title)], 30);
  push([]);
  push([txt('Qué es esta matriz', S.bold)]);
  push([txt('Formaliza los 3 criterios excepcionales para Bancos de Sangre Tipo II (demanda poblacional, acceso geográfico/continuidad y perfil epidemiológico). Solo se ingresan datos en las celdas amarillas; el resultado por paso y la resolución final se calculan solos.', S.wrap)], 46);
  push([]);
  push([txt('Cómo usarla', S.bold)]);
  push([txt('1. Completa «Resumen» con los datos del expediente (IPRESS, evaluador, fecha).', S.wrap)]);
  push([txt('2. Completa las celdas amarillas de las hojas 1 a 4, en cualquier orden.', S.wrap)]);
  push([txt('3. La hoja «Resumen» arroja automáticamente el resultado de cada paso y la resolución final.', S.wrap)]);
  push([txt('4. Verde = CUMPLE/FAVORABLE · Rojo = NO CUMPLE/DESFAVORABLE/NO CORRESPONDE · Amarillo = falta información.', S.wrap)]);
  push([txt('5. La hoja «BD_Plana» contiene la misma información en una sola fila, lista para cargar a base de datos.', S.wrap)]);
  push([]);
  push([txt('Advertencias importantes', S.bold)]);
  for (const a of AVISOS) push([txt('⚠️ ' + a, S.note)], 42);
  return sheetXml({ rows, cols: [110], merges: rows.filter((r) => r.c.length > 1).map((r) => `A${r.n}:E${r.n}`) });
}

function hojaResumen(ev) {
  const R = evaluar(ev);
  const rows = []; let n = 1;
  const push = (cells, ht) => rows.push({ n: n++, c: cells, ht });
  push([txt('RESUMEN DE EVALUACIÓN — CASO', S.title), blank(S.title), blank(S.title)], 30);
  push([]);
  const id = [
    ['IPRESS evaluada:', ev.ipress], ['Código RENIPRESS:', ev.renipress], ['Región / DIRESA:', ev.region],
    ['Institución:', ev.institucion], ['Evaluador(a):', ev.evaluador], ['Cargo / firma:', ev.cargo],
    ['Fecha de evaluación:', ev.fecha], ['N° de expediente / referencia:', ev.expediente],
  ];
  for (const [l, v] of id) push([txt(l, S.bold), txt(v, S.input)]);
  push([]);
  push([txt('RESULTADO POR PASO', S.bold)]);
  push([txt('Paso', S.head), txt('Resultado', S.head), txt('Detalle / nota', S.head)]);
  const rowP1 = n;
  push([txt('Paso 1 — Condiciones previas (Banco Tipo II)', S.box), fml(`IF(COUNTBLANK('1_CondicionesPrevias'!C4:C7)>0,"REQUIERE INFORMACIÓN",IF(COUNTIF('1_CondicionesPrevias'!C4:C7,"No")>0,"NO CORRESPONDE","CUMPLE"))`, R.p1, S.result), txt('Si no cumple, no corresponde evaluar los criterios excepcionales.', S.box)], 32);
  const rowP2 = n;
  push([txt('Paso 2 — Demanda poblacional', S.box), fml(`'2_DemandaPoblacional'!E19`, R.p2of, S.result), txt('Oficial = resultado del componente Paquete Globular (criterio de referencia del D.S.).', S.box)], 32);
  const rowP3 = n;
  push([txt('Paso 3 — Acceso geográfico y continuidad', S.box), fml(`'3_AccesoGeografico'!E14`, R.p3of, S.result), txt('Oficial = CUMPLE si algún hemocomponente evidencia riesgo de acceso.', S.box)], 32);
  const rowP4 = n;
  push([txt('Paso 4 — Perfil epidemiológico', S.box), fml(`'4_PerfilEpidemiologico'!E12`, R.p4of, S.result), txt('⚠️ Oficial = CUMPLE si algún hemocomponente cumple. Regla operativa propia — validar.', S.box)], 32);
  push([]);
  push([txt('RESOLUCIÓN FINAL (Paso 5 — Regla de decisión del informe)', S.bold)]);
  const f = `IF(B${rowP1}<>"CUMPLE","NO CORRESPONDE — falla condiciones previas (Paso 1)",IF(OR(B${rowP2}="REQUIERE INFORMACIÓN",B${rowP3}="REQUIERE INFORMACIÓN",B${rowP4}="REQUIERE INFORMACIÓN"),"SOLICITAR INFORMACIÓN",IF(AND(B${rowP2}="CUMPLE",OR(B${rowP3}="CUMPLE",B${rowP4}="CUMPLE")),"FAVORABLE","DESFAVORABLE")))`;
  const rowFinal = n;
  push([fml(f, R.final, S.band), blank(S.band), blank(S.band)], 34);
  push([]);
  push([txt('Nota: «FAVORABLE» significa que los criterios excepcionales sustentan continuar el trámite. No equivale a autorización automática; sigue condicionado al cumplimiento íntegro del Paso 1.', S.note)], 34);
  return sheetXml({ rows, cols: [46, 30, 62], merges: ['A1:C1', `A${rowFinal}:C${rowFinal}`, `A${n - 1}:C${n - 1}`] });
}

function hojaPaso1(ev) {
  const rows = [];
  rows.push({ n: 1, c: [txt('PASO 1 — CONDICIONES PREVIAS (Banco Tipo II)', S.title), blank(S.title), blank(S.title)], ht: 30 });
  rows.push({ n: 3, c: [txt('N°', S.head), txt('Condición', S.head), txt('Cumple (Sí/No)', S.head)] });
  COND_PREVIAS.forEach((c, i) => rows.push({ n: 4 + i, c: [nmb(i + 1, S.box), txt(c, S.box), txt(ev.paso1[i], S.input)], ht: 30 }));
  rows.push({ n: 9, c: [txt('RESULTADO PASO 1', S.bold)] });
  rows.push({ n: 10, c: [blank(), blank(), fml('IF(COUNTBLANK(C4:C7)>0,"REQUIERE INFORMACIÓN",IF(COUNTIF(C4:C7,"No")>0,"NO CORRESPONDE","CUMPLE"))', paso1Resultado(ev.paso1), S.band)], ht: 30 });
  return sheetXml({ rows, cols: [6, 78, 22], merges: ['A1:C1', 'A9:B9'], validations: [{ sqref: 'C4:C7', list: SI }] });
}

function hojaPaso2(ev) {
  const rows = [];
  const wide = 21;
  const titleRow = [txt('PASO 2 — FICHA DE DEMANDA POBLACIONAL, POR HEMOCOMPONENTE', S.title)];
  for (let i = 1; i < wide; i++) titleRow.push(blank(S.title));
  rows.push({ n: 1, c: titleRow, ht: 30 });
  rows.push({ n: 3, c: [txt('⚠️ Desagregación por hemocomponente: construcción propia. El RESULTADO OFICIAL del Paso 2 se basa en Paquete Globular, porque el D.S. N.° 017-2022-SA define el umbral de 2,500 unidades/año en paquetes globulares. Plasma, Plaquetas y Crioprecipitado son evidencia complementaria.', S.note)], ht: 30 });

  const r5 = new Array(wide).fill(null); r5[0] = blank();
  COMPS.forEach((c) => { const s = BLOCK_COLS[c.k] - 1; r5[s] = txt(c.full, S.head); for (let i = 1; i < 5; i++) r5[s + i] = blank(S.head); });
  rows.push({ n: 5, c: r5, ht: 20 });

  const heads = ['Unid.\ntransfundidas', 'Solicitudes\nno atendidas', 'Oferta\nefectiva', 'Demanda\nvalidada', 'Brecha\n%'];
  const r6 = new Array(wide).fill(null); r6[0] = txt('Año', S.head);
  COMPS.forEach((c) => { const s = BLOCK_COLS[c.k] - 1; heads.forEach((h, i) => (r6[s + i] = txt(h, S.head))); });
  rows.push({ n: 6, c: r6, ht: 32 });

  for (let y = 0; y < 3; y++) {
    const rn = 7 + y;
    const rr = new Array(wide).fill(null);
    rr[0] = txt(ev.anios[y], S.input);
    COMPS.forEach((c) => {
      const s = BLOCK_COLS[c.k] - 1; const L = colLetter(s + 1), M = colLetter(s + 2), N = colLetter(s + 3), O = colLetter(s + 4);
      const f = fila2(ev.paso2[c.k][y]);
      rr[s] = nmb(f.t, S.input); rr[s + 1] = nmb(f.na, S.input); rr[s + 2] = nmb(f.of, S.input);
      rr[s + 3] = fml(`IF(OR(${L}${rn}="",${M}${rn}=""),"",${L}${rn}+${M}${rn})`, f.demanda === null ? '' : f.demanda, S.box);
      rr[s + 4] = fml(`IF(OR(${O}${rn}="",${O}${rn}=0,${N}${rn}=""),"",(${O}${rn}-${N}${rn})/${O}${rn}*100)`, f.brecha === null ? '' : Math.round(f.brecha * 100) / 100, S.pct);
    });
    rows.push({ n: rn, c: rr, ht: 20 });
  }
  rows.push({ n: 10, c: [txt('Completa los 3 años (la fila más reciente es la fila 9) para cada hemocomponente. Las solicitudes no atendidas deben ser clínicamente pertinentes, sin duplicados ni cancelaciones por cambio de conducta clínica (informe, punto 6.1).', S.note)], ht: 28 });
  rows.push({ n: 12, c: [txt('PREGUNTAS Y RESULTADO POR HEMOCOMPONENTE (según Paso 2 del informe)', S.bold)] });
  rows.push({ n: 13, c: [txt('Componente', S.head), txt('¿Existe demanda no atendida?\n(año más reciente)', S.head), txt('¿Oferta < demanda?\n(año más reciente)', S.head), txt('¿Brecha se repite\n≥2 de 3 años?', S.head), txt('Resultado\ncomponente', S.head)], ht: 40 });
  const R = evaluar(ev);
  COMPS.forEach((c, i) => {
    const rn = 14 + i; const s = BLOCK_COLS[c.k] - 1;
    const A = colLetter(s + 1), NA = colLetter(s + 2), OF = colLetter(s + 3), DE = colLetter(s + 4);
    const r = R.p2[c.k];
    rows.push({ n: rn, c: [
      txt(c.abbr, S.box),
      fml(`IF(${NA}9="","",IF(${NA}9>0,"Sí","No"))`, r.q1, S.result),
      fml(`IF(OR(${OF}9="",${DE}9=""),"",IF(${OF}9<${DE}9,"Sí","No"))`, r.q2, S.result),
      fml(`IF(OR(COUNTBLANK(${OF}7:${OF}9)>0,COUNTBLANK(${DE}7:${DE}9)>0),"",IF(SUMPRODUCT((${OF}7:${OF}9<${DE}7:${DE}9)*1)>=2,"Sí","No"))`, r.q3, S.result),
      fml(`IF(COUNTBLANK(${A}7:${A}9)>0,"REQUIERE INFORMACIÓN",IF(AND(B${rn}="Sí",C${rn}="Sí",D${rn}="Sí"),"CUMPLE","NO CUMPLE"))`, r.res, S.result),
    ], ht: 26 });
  });
  rows.push({ n: 19, c: [txt('RESULTADO PASO 2 — OFICIAL (= componente Paquete Globular)', S.bold), blank(S.bold), blank(S.bold), blank(S.bold), fml('E14', R.p2of, S.band)], ht: 30 });
  const cols = new Array(wide).fill(14); cols[0] = 12;
  return sheetXml({ rows, cols, merges: ['A1:U1', 'A3:U3', 'A10:U10', 'A12:U12', 'A19:D19', ...COMPS.map((c) => `${colLetter(BLOCK_COLS[c.k])}5:${colLetter(BLOCK_COLS[c.k] + 4)}5`)] });
}

function hojaPreguntas(ev, paso) {
  const p = paso === 3
    ? { title: 'PASO 3 — FICHA DE ACCESO GEOGRÁFICO Y CONTINUIDAD, POR HEMOCOMPONENTE', qs: P3_PREGUNTAS, q0: 6, res: 12, of: 14, note: 16 }
    : { title: 'PASO 4 — FICHA DE PERFIL EPIDEMIOLÓGICO, POR HEMOCOMPONENTE', qs: P4_PREGUNTAS, q0: 4, res: 10, of: 12, note: 14 };
  const R = evaluar(ev);
  const rows = [];
  rows.push({ n: 1, c: [txt(p.title, S.title), blank(S.title), blank(S.title), blank(S.title), blank(S.title), blank(S.title)], ht: 30 });
  if (paso === 3) rows.push({ n: 3, c: [blank(), blank(), blank(), blank(), blank(), blank(), blank(), txt('Umbral (N° mínimo de «No» por componente para CUMPLE):', S.bold), nmb(ev.umbral, S.input)], ht: 32 });
  const hr = p.q0 - 1;
  rows.push({ n: hr, c: [txt('N°', S.head), txt('Pregunta', S.head), ...COMPS.map((c) => txt(c.abbr, S.head))] });
  p.qs.forEach((q, i) => {
    const rn = p.q0 + i;
    rows.push({ n: rn, c: [nmb(i + 1, S.box), txt(q, S.box), ...COMPS.map((c) => txt(ev['paso' + paso][c.k][i], S.input))], ht: 28 });
  });
  const a = p.q0, b = p.q0 + 4;
  rows.push({ n: p.res, c: [txt('RESULTADO POR COMPONENTE', S.bold), blank(S.bold), ...COMPS.map((c) => {
    const col = colLetter(3 + COMPS.indexOf(c));
    const f = paso === 3
      ? `IF(COUNTBLANK(${col}${a}:${col}${b})>0,"REQUIERE INFORMACIÓN",IF(COUNTIF(${col}${a}:${col}${b},"No")>=$I$3,"CUMPLE","NO CUMPLE"))`
      : `IF(COUNTBLANK(${col}${a}:${col}${b})>0,"REQUIERE INFORMACIÓN",IF(AND(${col}${a}="Sí",${col}${b}="No"),"CUMPLE","NO CUMPLE"))`;
    return fml(f, R['paso' + paso] ? '' : '', S.result);
  })], ht: 36 });
  // fill cached values
  const resRow = rows[rows.length - 1];
  COMPS.forEach((c, i) => { resRow.c[2 + i].v = (paso === 3 ? R.p3 : R.p4)[c.k]; });
  const ofFml = `IF(COUNTIF(C${p.res}:F${p.res},"CUMPLE")>0,"CUMPLE",IF(COUNTIF(C${p.res}:F${p.res},"REQUIERE INFORMACIÓN")>0,"REQUIERE INFORMACIÓN","NO CUMPLE"))`;
  rows.push({ n: p.of, c: [txt(paso === 3 ? 'RESULTADO PASO 3 — OFICIAL (CUMPLE si algún hemocomponente evidencia riesgo de acceso)' : 'RESULTADO PASO 4 — OFICIAL (CUMPLE si algún hemocomponente cumple)', S.bold), blank(S.bold), blank(S.bold), blank(S.bold), fml(ofFml, paso === 3 ? R.p3of : R.p4of, S.band), blank(S.band)], ht: 30 });
  rows.push({ n: p.note, c: [txt('⚠️ ' + (paso === 3 ? AVISOS[0] : AVISOS[1]), S.note)], ht: 42 });
  return sheetXml({
    rows, cols: [6, 56, 14, 14, 14, 14, 3, 44, 10],
    merges: ['A1:F1', `A${p.res}:B${p.res}`, `A${p.of}:D${p.of}`, `E${p.of}:F${p.of}`, `A${p.note}:F${p.note}`],
    validations: [{ sqref: `C${a}:F${b}`, list: SI }],
  });
}

export function filaPlana(ev) {
  const R = evaluar(ev);
  const o = {
    id_expediente: ev.id, fecha_registro: ev.creado, ipress: ev.ipress, codigo_renipress: ev.renipress,
    region_diresa: ev.region, institucion: ev.institucion, evaluador: ev.evaluador, cargo_evaluador: ev.cargo,
    n_expediente: ev.expediente, fecha_evaluacion: ev.fecha,
  };
  ev.paso1.forEach((v, i) => (o['p1_cond' + (i + 1)] = v));
  o.p1_resultado = R.p1;
  ev.anios.forEach((y, i) => (o['anio' + (i + 1)] = y));
  for (const c of COMPS) {
    const r = R.p2[c.k];
    r.filas.forEach((f, i) => {
      const px = `p2_${c.k}_a${i + 1}_`;
      o[px + 'transfundidas'] = f.t; o[px + 'no_atendidas'] = f.na; o[px + 'oferta'] = f.of;
      o[px + 'demanda'] = f.demanda; o[px + 'brecha_pct'] = f.brecha === null ? null : Math.round(f.brecha * 100) / 100;
    });
    o[`p2_${c.k}_q1`] = r.q1; o[`p2_${c.k}_q2`] = r.q2; o[`p2_${c.k}_q3`] = r.q3; o[`p2_${c.k}_resultado`] = r.res;
  }
  o.p2_oficial = R.p2of;
  o.p3_umbral = ev.umbral;
  for (const c of COMPS) { ev.paso3[c.k].forEach((v, i) => (o[`p3_${c.k}_q${i + 1}`] = v)); o[`p3_${c.k}_resultado`] = R.p3[c.k]; }
  o.p3_oficial = R.p3of;
  for (const c of COMPS) { ev.paso4[c.k].forEach((v, i) => (o[`p4_${c.k}_q${i + 1}`] = v)); o[`p4_${c.k}_resultado`] = R.p4[c.k]; }
  o.p4_oficial = R.p4of;
  o.resolucion_final = R.final;
  return o;
}

function hojaPlana(evs) {
  const filas = evs.map(filaPlana);
  const keys = Object.keys(filas[0]);
  const rows = [{ n: 1, c: keys.map((k) => txt(k, S.head)) }];
  filas.forEach((f, i) => rows.push({
    n: 2 + i,
    c: keys.map((k) => (typeof f[k] === 'number' ? nmb(f[k], S.box) : txt(f[k] === null || f[k] === undefined ? '' : String(f[k]), S.box))),
  }));
  return sheetXml({ rows, cols: keys.map(() => 20) });
}

export function xlsxEvaluacion(ev) {
  return buildWorkbook([
    hojaInstrucciones(), hojaResumen(ev), hojaPaso1(ev), hojaPaso2(ev),
    hojaPreguntas(ev, 3), hojaPreguntas(ev, 4), hojaPlana([ev]),
  ]);
}

export function xlsxConsolidado(evs) {
  const files = [
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="BD_Plana" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: 'xl/styles.xml', data: STYLES },
    { name: 'xl/worksheets/sheet1.xml', data: hojaPlana(evs) },
  ];
  return zipBlob(files);
}

export function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
