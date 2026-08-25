# Criterios Excepcionales Art. 14.2 — DIBAN

Aplicativo web para evaluar los tres criterios excepcionales que sustentan la habilitación
de Bancos de Sangre Tipo II (D.S. N.° 017-2022-SA): demanda poblacional, acceso geográfico
y continuidad, y perfil epidemiológico.

- Los expedientes se guardan en el dispositivo (`localStorage`), sin backend.
- Cada expediente se puede exportar a un Excel con la misma estructura de la matriz
  original (hojas de instrucciones, resumen, pasos 1–4 y una hoja plana `BD_Plana` lista
  para cargar a base de datos).
- El panel permite descargar también un consolidado `BD_Plana` de todos los expedientes.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Se despliega automáticamente a GitHub Pages en cada push a `main` (ver
`.github/workflows/deploy-pages.yml`).
