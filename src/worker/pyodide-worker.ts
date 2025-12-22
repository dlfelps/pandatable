import { loadPyodide, PyodideInterface } from 'pyodide';

let pyodide: PyodideInterface | null = null;

async function initPyodide(indexURL: string) {
  if (pyodide) return pyodide;

  console.log('Worker: Initializing fully local Pyodide...');
  
  pyodide = await loadPyodide({
    indexURL: indexURL
  });

  console.log('Worker: Loading local pandas and dependencies...');
  await pyodide.loadPackage(['pandas', 'micropip']);
  
  // Pre-import pandas and io to save time on subsequent runs
  await pyodide.runPythonAsync(`
    import pandas as pd
    import io
    import json
  `);
  
  console.log('Worker: Pyodide and pandas ready.');
  
  return pyodide;
}

self.onmessage = async (event) => {
  const { type, code, data, indexURL } = event.data;

  if (type === 'INIT') {
    try {
      await initPyodide(indexURL);
      self.postMessage({ type: 'INIT_COMPLETE' });
    } catch (error: any) {
      console.error('Worker Init Error:', error);
      self.postMessage({ type: 'ERROR', error: error.message });
    }
  } else if (type === 'RUN_CODE') {
    try {
      const py = await initPyodide(indexURL);
      
      // Only inject data if it's provided and not empty
      if (data && Array.isArray(data) && data.length > 0) {
        py.globals.set('df_json_str', JSON.stringify(data));
        await py.runPythonAsync(`
          # Use StringIO to avoid FutureWarning about literal JSON strings
          df = pd.read_json(io.StringIO(df_json_str))
        `);
        console.log(`Worker: Injected ${data.length} rows into 'df' variable.`);
      }

      console.log('Worker: Executing user code...');
      const result = await py.runPythonAsync(code);
      
      // Convert result to JS if possible
      const jsResult = result?.toJs ? result.toJs() : result;
      console.log('Worker: Execution complete. Result:', jsResult);

      self.postMessage({ type: 'RUN_COMPLETE', result: jsResult });
    } catch (error: any) {
      console.error('Worker Run Error:', error);
      self.postMessage({ type: 'ERROR', error: error.message });
    }
  }
};
