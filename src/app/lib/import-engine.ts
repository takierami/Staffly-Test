import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid'; // Let's check if uuid is available, else I can use Math.random()

export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'email';

export interface ImportSchemaField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  aliases?: string[]; // E.g., ['First Name', 'Given Name']
  validate?: (value: any) => string | null; // Returns error message if invalid
}

export interface ImportSchema {
  fields: ImportSchemaField[];
}

export interface ParseResult {
  headers: string[];
  data: any[];
  error?: string;
}

export interface MappedField {
  schemaKey: string;
  fileHeader: string | null;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export interface ValidationResult {
  validData: any[];
  invalidData: any[];
  errors: ValidationError[];
}

/**
 * Parses an uploaded file (.xlsx, .xls, .json)
 */
export async function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File is empty");

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(data as string);
          if (!Array.isArray(parsed)) {
            resolve({ headers: [], data: [], error: "JSON must be an array of objects." });
            return;
          }
          if (parsed.length === 0) {
            resolve({ headers: [], data: [], error: "JSON file is empty." });
            return;
          }
          const headers = Array.from(new Set(parsed.flatMap(Object.keys)));
          resolve({ headers, data: parsed });
        } else {
          // XLSX / XLS
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          
          if (parsedData.length === 0) {
            resolve({ headers: [], data: [], error: "Excel file is empty or formatted incorrectly." });
            return;
          }
          
          const headers = Object.keys(parsedData[0] as object);
          resolve({ headers, data: parsedData });
        }
      } catch (err: any) {
        resolve({ headers: [], data: [], error: `Failed to parse file: ${err.message}` });
      }
    };

    reader.onerror = () => {
      resolve({ headers: [], data: [], error: "Error reading the file." });
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
}

/**
 * Auto-maps schema fields to file headers based on exact matches or aliases.
 */
export function autoMapFields(schema: ImportSchema, headers: string[]): MappedField[] {
  return schema.fields.map(field => {
    let matchedHeader = null;
    
    // Exact match
    const exact = headers.find(h => h.toLowerCase() === field.key.toLowerCase());
    if (exact) matchedHeader = exact;
    
    // Alias match
    if (!matchedHeader && field.aliases) {
      const aliasMatch = headers.find(h => 
        field.aliases?.some(a => a.toLowerCase() === h.toLowerCase()) ||
        field.label.toLowerCase() === h.toLowerCase()
      );
      if (aliasMatch) matchedHeader = aliasMatch;
    }
    
    // Fuzzy match (basic includes)
    if (!matchedHeader) {
      const fuzzy = headers.find(h => h.toLowerCase().includes(field.label.toLowerCase()) || field.label.toLowerCase().includes(h.toLowerCase()));
      if (fuzzy) matchedHeader = fuzzy;
    }

    return { schemaKey: field.key, fileHeader: matchedHeader };
  });
}

/**
 * Validates parsed data against the schema and mappings.
 */
export function validateData(data: any[], schema: ImportSchema, mapping: MappedField[]): ValidationResult {
  const validData: any[] = [];
  const invalidData: any[] = [];
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 1; // 1-indexed for display
    const processedRow: any = {};
    let isRowValid = true;

    schema.fields.forEach(field => {
      const mappedHeader = mapping.find(m => m.schemaKey === field.key)?.fileHeader;
      let rawValue = mappedHeader ? row[mappedHeader] : undefined;

      // Handle empty string as undefined
      if (rawValue === "") rawValue = undefined;

      // Check required
      if (field.required && (rawValue === undefined || rawValue === null)) {
        errors.push({ row: rowNumber, column: field.label, message: "Field is required" });
        isRowValid = false;
        return;
      }

      if (rawValue !== undefined && rawValue !== null) {
        // Type coercion & validation
        if (field.type === 'number') {
          const num = Number(rawValue);
          if (isNaN(num)) {
            errors.push({ row: rowNumber, column: field.label, message: `Must be a valid number. Got: ${rawValue}` });
            isRowValid = false;
          } else {
            processedRow[field.key] = num;
          }
        } else if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(rawValue))) {
            errors.push({ row: rowNumber, column: field.label, message: "Invalid email format" });
            isRowValid = false;
          } else {
            processedRow[field.key] = String(rawValue);
          }
        } else if (field.type === 'date') {
          // Check if it's an Excel date serial or a string
          let dateStr = String(rawValue);
          if (typeof rawValue === 'number') {
            // Excel serial date to JS Date
            const date = new Date((rawValue - (25567 + 2)) * 86400 * 1000);
            if (!isNaN(date.getTime())) {
              dateStr = date.toISOString().split('T')[0];
            } else {
              errors.push({ row: rowNumber, column: field.label, message: "Invalid date format" });
              isRowValid = false;
            }
          }
          processedRow[field.key] = dateStr;
        } else if (field.type === 'boolean') {
          const truthy = ['true', 'yes', '1', 'y', 'active'];
          processedRow[field.key] = truthy.includes(String(rawValue).toLowerCase());
        } else {
          processedRow[field.key] = String(rawValue);
        }

        // Custom validation
        if (isRowValid && field.validate) {
          const customError = field.validate(processedRow[field.key]);
          if (customError) {
            errors.push({ row: rowNumber, column: field.label, message: customError });
            isRowValid = false;
          }
        }
      }
    });

    if (isRowValid) {
      validData.push(processedRow);
    } else {
      invalidData.push({ ...row, _rowNumber: rowNumber });
    }
  });

  return { validData, invalidData, errors };
}
