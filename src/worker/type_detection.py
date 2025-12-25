import pandas as pd
import numpy as np
import re

def clean_numeric_string(val):
    """
    Cleans a string to attempt to convert it to a float.
    Handles currency symbols, commas, percentages, unicode minus, and footnotes.
    """
    if pd.isna(val) or val == "":
        return np.nan
    
    if isinstance(val, (int, float)):
        return float(val)

    s = str(val).strip()
    
    # 1. Strip footnotes like [1], [a], [note 1]
    s = re.sub(r'\[.*?\]', '', s)
    
    # 2. Normalize unicode minus and remove arrows
    s = s.replace('−', '-').replace('↑', '').replace('↓', '')
    
    # 3. Check for percentage
    is_percent = False
    if '%' in s:
        is_percent = True
        s = s.replace('%', '')
    
    # 4. Remove currency symbols and commas
    s = re.sub(r'[£$€,]', '', s)
    
    # 5. Final strip and conversion
    s = s.strip()
    
    try:
        num = float(s)
        if is_percent:
            return num / 100.0
        return num
    except ValueError:
        # Try to extract the first numeric-looking part if it's messy
        # (e.g., "93.83 people/sq mi")
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
    """
    Analyzes a Series (column). If > 50% of non-null values can be converted 
    to numeric after cleaning, converts the entire column.
    """
    # If already numeric, return as is
    if pd.api.types.is_numeric_dtype(series):
        return series

    # 1. Clean all values
    cleaned = series.map(clean_numeric_string)
    
    # 2. Check conversion success rate
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
    """
    Iterates over all columns in the DataFrame and attempts to convert 
    object columns to numeric types.
    """
    new_df = df.copy()
    for col in new_df.columns:
        if new_df[col].dtype == 'object':
            new_df[col] = infer_and_convert_column(new_df[col])
    return new_df
