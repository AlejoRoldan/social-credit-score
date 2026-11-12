import { pathToFileURL } from 'node:url';
import { serve } from './backend/server.mjs';

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    const server = await serve(Number(process.argv[2] ?? 8000));
    console.log(`Entrevecinos está disponible en http://127.0.0.1:${server.address().port}/`);
  } catch (error) {
    console.error(error.code === 'EADDRINUSE'
      ? 'El puerto está ocupado. Prueba con node serve.mjs 8001.'
      : error.message);
    process.exitCode = 1;
  }
}
