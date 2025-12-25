import { loadPyodide, PyodideInterface } from 'pyodide';

let pyodide: PyodideInterface | null = null;

async function initPyodide(indexURL: string) {
  if (pyodide) return pyodide;

  console.log('Worker: Initializing fully local Pyodide...');
  pyodide = await loadPyodide({ indexURL });

  await pyodide.loadPackage(['pandas', 'micropip', 'matplotlib']);
  
  await pyodide.runPythonAsync(`
    import pandas as pd
    import numpy as np
    import io
    import json
    import matplotlib.pyplot as plt
    import base64

    # Setup matplotlib to use a non-interactive backend
    import matplotlib
    matplotlib.use('Agg')

    def get_plot_base64():
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')

    import re

    def clean_numeric_string(val):
        if pd.isna(val) or val == "":
            return np.nan
        if isinstance(val, (int, float)):
            return float(val)
        s = str(val).strip()
        s = re.sub(r'\[.*?\]', '', s)
        s = s.replace('−', '-').replace('↑', '').replace('↓', '')
        is_percent = False
        if '%' in s:
            is_percent = True
            s = s.replace('%', '')
        s = re.sub(r'[£$€,]', '', s)
        s = s.strip()
        try:
            num = float(s)
            if is_percent:
                return num / 100.0
            return num
        except ValueError:
            match = re.search(r'-?\d+\.?\d*', s)
            if match:
                try:
                    num = float(match.group())
                    if is_percent:
                        return num / 100.0
                    return num
                except ValueError:
                    return np.nan
            return np.nan

    def infer_and_convert_column(series):
        if pd.api.types.is_numeric_dtype(series):
            return series
        cleaned = series.map(clean_numeric_string)
        non_null_count = series.notna().sum()
        if non_null_count == 0:
            return series 
        converted_count = cleaned.notna().sum()
        success_rate = converted_count / non_null_count
        if success_rate > 0.5:
            return cleaned
        else:
            return series

    def auto_convert_dataframe(df):
        new_df = df.copy()
        for col in new_df.columns:
            if new_df[col].dtype == 'object':
                new_df[col] = infer_and_convert_column(new_df[col])
        return new_df
  `);
  
  return pyodide;
}

self.onmessage = async (event) => {
  const { type, code, data, indexURL } = event.data;

  if (type === 'RUN_CODE') {
    try {
      const py = await initPyodide(indexURL);
      
      if (data && Array.isArray(data) && data.length > 0) {
        py.globals.set('df_json_str', JSON.stringify(data));
        await py.runPythonAsync(`
          df = pd.read_json(io.StringIO(df_json_str))
          df = auto_convert_dataframe(df)
        `);
      }

      // Capture stdout
      await py.runPythonAsync(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      const result = await py.runPythonAsync(code);
      
      // Get captured stdout
      const stdout = (await py.runPythonAsync(`sys.stdout.getvalue()`)) as string;

      // Check for plots
      let plotBase64 = null;
      try {
        const hasPlots = (await py.runPythonAsync(`len(plt.get_fignums()) > 0`)) as boolean;
        if (hasPlots) {
          plotBase64 = (await py.runPythonAsync(`get_plot_base64()`)) as string;
        }
      } catch (e) { /* ignore plot errors */ }

      // Get HTML representation if it's a DataFrame
      let htmlResult = null;
      try {
        if (result && result.to_html) {
          htmlResult = result.to_html(classes='table-view');
        } else {
          // Fallback check if the global 'df' is a dataframe and was modified
          const isDF = (await py.runPythonAsync(`isinstance(globals().get('df'), pd.DataFrame)`)) as boolean;
          if (isDF) {
             htmlResult = (await py.runPythonAsync(`df.head(20).to_html(classes='table-view')`)) as string;
          }
        }
      } catch (e) { /* ignore */ }

      // Get CSV for export
      let csvData = null;
      try {
        const hasDF = (await py.runPythonAsync(`isinstance(globals().get('df'), pd.DataFrame)`)) as boolean;
        if (hasDF) {
          csvData = (await py.runPythonAsync(`df.to_csv(index=False)`)) as string;
        }
      } catch (e) { /* ignore */ }

      // Safely convert result to JS
      let jsResult: any = null;
      if (result !== undefined && result !== null) {
        try {
          if (result.toJs) {
            jsResult = result.toJs({ dict_converter: Object.fromEntries });
          } else {
            jsResult = result;
          }
        } catch (e) {
          jsResult = String(result);
        }
      }

      // Final check to ensure nothing is a Proxy
      const cleanResult = JSON.parse(JSON.stringify(jsResult === undefined ? null : jsResult, (key, value) => {
        return (typeof value === 'object' && value !== null && value.constructor && value.constructor.name === 'PyProxy') 
          ? '[PyProxy]' 
          : value;
      }));

      self.postMessage({ 
        type: 'RUN_COMPLETE', 
        result: cleanResult,
        stdout,
        plot: plotBase64,
        html: htmlResult,
        csv: csvData
      });

      // Clean up result proxy if it exists
      if (result && result.destroy) {
        result.destroy();
      }

    } catch (error: any) {
      self.postMessage({ type: 'ERROR', error: error.message });
    }
  }
};
