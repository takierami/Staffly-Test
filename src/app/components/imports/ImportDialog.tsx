import { useState, useRef } from "react";
import { UploadCloud, CheckCircle, AlertTriangle, ArrowRight, X, File, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { parseFile, autoMapFields, validateData, type ImportSchema, type MappedField, type ValidationResult } from "../../lib/import-engine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

export interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  schema: ImportSchema;
  onImport: (validData: any[]) => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'summary';

export function ImportDialog({ open, onOpenChange, title, schema, onImport }: ImportDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<MappedField[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setFileHeaders([]);
    setRawData([]);
    setMapping([]);
    setValidation(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    const isValidType = selected.name.match(/\.(xlsx|xls|json)$/i);
    if (!isValidType) {
      toast.error("Unsupported file format. Please upload .xlsx, .xls, or .json.");
      return;
    }

    setFile(selected);
    setIsParsing(true);
    
    const result = await parseFile(selected);
    setIsParsing(false);
    
    if (result.error) {
      toast.error(result.error);
      setFile(null);
      return;
    }

    setFileHeaders(result.headers);
    setRawData(result.data);
    setMapping(autoMapFields(schema, result.headers));
    setStep('mapping');
  };

  const handleMappingChange = (schemaKey: string, header: string) => {
    setMapping(prev => prev.map(m => m.schemaKey === schemaKey ? { ...m, fileHeader: header === 'none' ? null : header } : m));
  };

  const proceedToPreview = () => {
    const requiredUnmapped = schema.fields.filter(f => f.required && !mapping.find(m => m.schemaKey === f.key)?.fileHeader);
    if (requiredUnmapped.length > 0) {
      toast.error(`Please map all required fields: ${requiredUnmapped.map(f => f.label).join(', ')}`);
      return;
    }
    
    const valResult = validateData(rawData, schema, mapping);
    setValidation(valResult);
    setStep('preview');
  };

  const executeImport = () => {
    if (!validation) return;
    onImport(validation.validData);
    setStep('summary');
  };

  const closeDialog = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if(!val) closeDialog(); else onOpenChange(val); }}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {step === 'upload' && "Upload a .xlsx, .xls, or .json file to import records."}
            {step === 'mapping' && "Map columns from your file to the system fields."}
            {step === 'preview' && "Review data before importing."}
            {step === 'summary' && "Import completed."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4 flex flex-col">
          {step === 'upload' && (
            <div 
              className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors h-64"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.json" onChange={onFileSelect} />
              <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-1">Click or drag file to this area</h3>
              <p className="text-sm text-muted-foreground mb-4">Supports Excel (.xlsx, .xls) and JSON</p>
              <Button disabled={isParsing}>{isParsing ? "Parsing..." : "Select File"}</Button>
            </div>
          )}

          {step === 'mapping' && (
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-2 gap-4 font-semibold text-sm mb-2 px-2 text-muted-foreground">
                <div>System Field</div>
                <div>Your File Column</div>
              </div>
              <ScrollArea className="flex-1 border rounded-md">
                <div className="p-4 space-y-3">
                  {schema.fields.map(field => {
                    const mapped = mapping.find(m => m.schemaKey === field.key);
                    return (
                      <div key={field.key} className="grid grid-cols-2 gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{field.label}</span>
                          {field.required && <span className="text-red-500 text-xs">*</span>}
                        </div>
                        <Select 
                          value={mapped?.fileHeader || 'none'} 
                          onValueChange={(val) => handleMappingChange(field.key, val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Do not map" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- Do not map --</SelectItem>
                            {fileHeaders.map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={handleReset}>Cancel</Button>
                <Button onClick={proceedToPreview}>Preview Data <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </div>
          )}

          {step === 'preview' && validation && (
            <div className="flex flex-col h-full">
              <div className="flex gap-4 mb-4">
                <div className="p-3 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg flex-1 border border-green-200 dark:border-green-900">
                  <div className="font-semibold">{validation.validData.length}</div>
                  <div className="text-xs">Valid Records</div>
                </div>
                <div className="p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg flex-1 border border-red-200 dark:border-red-900">
                  <div className="font-semibold">{validation.invalidData.length}</div>
                  <div className="text-xs">Invalid Records</div>
                </div>
              </div>

              {validation.errors.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 text-sm rounded-lg border border-amber-200 dark:border-amber-900 flex items-start gap-2 max-h-32 overflow-y-auto">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Found {validation.errors.length} validation errors:</div>
                    <ul className="list-disc pl-4 space-y-1">
                      {validation.errors.slice(0, 5).map((e, i) => (
                        <li key={i}>Row {e.row}: {e.column} - {e.message}</li>
                      ))}
                      {validation.errors.length > 5 && <li>...and {validation.errors.length - 5} more</li>}
                    </ul>
                  </div>
                </div>
              )}

              <h4 className="font-semibold mb-2">Valid Records Preview (First 5)</h4>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {schema.fields.map(f => <TableHead key={f.key}>{f.label}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validation.validData.slice(0, 5).length === 0 && (
                      <TableRow><TableCell colSpan={schema.fields.length} className="text-center py-4">No valid records to display.</TableCell></TableRow>
                    )}
                    {validation.validData.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {schema.fields.map(f => (
                          <TableCell key={f.key}>{row[f.key] !== undefined ? String(row[f.key]) : '-'}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
                <Button onClick={executeImport} disabled={validation.validData.length === 0} className="bg-[var(--acc-primary)] hover:bg-[var(--acc-primary-strong)] text-white">
                  Import {validation.validData.length} Records
                </Button>
              </div>
            </div>
          )}

          {step === 'summary' && validation && (
            <div className="flex flex-col items-center justify-center text-center h-64 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Import Successful</h3>
              <p className="text-muted-foreground max-w-sm">
                Successfully imported <strong>{validation.validData.length}</strong> records into the system.
                {validation.invalidData.length > 0 && ` ${validation.invalidData.length} rows were skipped due to errors.`}
              </p>
              <Button onClick={closeDialog}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
