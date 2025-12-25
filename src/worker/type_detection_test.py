import unittest
import pandas as pd
import numpy as np

# This import will fail until we create the module, or we can stub it here for the test if we want to test logic isolation
# But for real TDD, we expect to test the actual module.
# I will assume the module name is 'type_detection' and it will be in the same directory.
try:
    from type_detection import clean_numeric_string, infer_and_convert_column, auto_convert_dataframe
except ImportError:
    # define stubs so tests run but fail
    def clean_numeric_string(s): return s
    def infer_and_convert_column(col): return col
    def auto_convert_dataframe(df): return df

class TestTypeDetection(unittest.TestCase):

    def test_clean_numeric_string_basic(self):
        self.assertEqual(clean_numeric_string("1,234"), 1234.0)
        self.assertEqual(clean_numeric_string("$12.50"), 12.5)
        self.assertEqual(clean_numeric_string("£100"), 100.0)
        self.assertEqual(clean_numeric_string("€50"), 50.0)
        self.assertEqual(clean_numeric_string("84.3%"), 0.843)
        self.assertEqual(clean_numeric_string("50%"), 0.5)

    def test_clean_numeric_string_wikipedia(self):
        self.assertEqual(clean_numeric_string("39,538,223[4]"), 39538223.0)
        self.assertAlmostEqual(clean_numeric_string("−0.1%"), -0.001)
        self.assertAlmostEqual(clean_numeric_string("+6.1%↑"), 0.061)
        self.assertEqual(clean_numeric_string("93.83 people/sq mi"), 93.83)

    def test_clean_numeric_string_invalid(self):
        self.assertTrue(np.isnan(clean_numeric_string("abc")))
        self.assertTrue(np.isnan(clean_numeric_string("")))
        self.assertTrue(np.isnan(clean_numeric_string(None)))

    def test_infer_and_convert_column(self):
        # Case 1: Majority numeric with currency
        s1 = pd.Series(["$10", "$20", "N/A", "$30"])
        converted_s1 = infer_and_convert_column(s1)
        self.assertTrue(pd.api.types.is_float_dtype(converted_s1))
        self.assertEqual(converted_s1[0], 10.0)
        self.assertTrue(np.isnan(converted_s1[2]))

        # Case 2: Majority numeric with percentage
        s2 = pd.Series(["10%", "20%", "abc", "50%"])
        converted_s2 = infer_and_convert_column(s2)
        self.assertTrue(pd.api.types.is_float_dtype(converted_s2))
        self.assertAlmostEqual(converted_s2[0], 0.1)
        self.assertTrue(np.isnan(converted_s2[2]))

        # Case 3: Mixed but NOT majority numeric (should remain object)
        s3 = pd.Series(["10", "abc", "def", "ghi"])
        converted_s3 = infer_and_convert_column(s3)
        self.assertEqual(converted_s3.dtype, 'O') # Object
        
        # Case 4: Already numeric
        s4 = pd.Series([1.1, 2.2, 3.3])
        converted_s4 = infer_and_convert_column(s4)
        self.assertTrue(pd.api.types.is_float_dtype(converted_s4))

    def test_infer_and_convert_column_edge_cases(self):
        # Already numeric scalar in clean_numeric_string
        self.assertEqual(clean_numeric_string(100), 100.0)
        self.assertEqual(clean_numeric_string(12.5), 12.5)
        
        # Empty series
        s_empty = pd.Series([], dtype='object')
        converted_empty = infer_and_convert_column(s_empty)
        self.assertEqual(len(converted_empty), 0)
        self.assertEqual(converted_empty.dtype, 'O')

    def test_auto_convert_dataframe(self):
        df = pd.DataFrame({
            'A': ["$1,000", "$2,000", "invalid"],
            'B': ["10%", "20%", "30%"],
            'C': ["foo", "bar", "baz"]
        })
        
        processed_df = auto_convert_dataframe(df)
        
        # Column A should be float
        self.assertTrue(pd.api.types.is_float_dtype(processed_df['A']))
        self.assertEqual(processed_df['A'][0], 1000.0)
        
        # Column B should be float
        self.assertTrue(pd.api.types.is_float_dtype(processed_df['B']))
        self.assertAlmostEqual(processed_df['B'][0], 0.1)
        
        # Column C should remain object
        self.assertEqual(processed_df['C'].dtype, 'O')

if __name__ == '__main__':
    unittest.main()
