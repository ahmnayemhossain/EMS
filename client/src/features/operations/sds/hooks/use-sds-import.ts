import * as React from "react";

import { toast } from "@/core/app/lib/toast";

import { importSdsRecords } from "@/features/operations/sds/services/api";
import { buildSdsTemplateCsv, validateSdsCsv, type SdsCsvValidationIssue } from "@/features/operations/sds/utils/csv";

type UseSdsImportArgs = {
  userId: string;
  reload: () => Promise<unknown>;
  onImported: (firstRecordId: string) => void;
};

export function useSdsImport(props: UseSdsImportArgs) {
  const { userId, reload, onImported } = props;
  const [importing, setImporting] = React.useState(false);
  const [importValidationOpen, setImportValidationOpen] = React.useState(false);
  const [importValidationFileName, setImportValidationFileName] = React.useState("");
  const [importValidationIssues, setImportValidationIssues] = React.useState<SdsCsvValidationIssue[]>([]);

  const downloadTemplate = React.useCallback(() => {
    const blob = new Blob([buildSdsTemplateCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sds-import-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const importCsvFile = React.useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }

      setImporting(true);
      try {
        const csvText = await file.text();
        const validation = validateSdsCsv(csvText);
        if (validation.issues.length) {
          setImportValidationFileName(file.name);
          setImportValidationIssues(validation.issues);
          setImportValidationOpen(true);
          return;
        }

        const result = await importSdsRecords(userId, validation.records);
        await reload();
        onImported(result.records[0]?.id || "");
        toast.success(`${result.createdCount} SDS record${result.createdCount > 1 ? "s" : ""} imported`);
      } catch (error) {
        setImportValidationFileName(file.name);
        setImportValidationIssues([
          {
            rowLabel: "Server",
            field: "Import",
            message: error instanceof Error ? error.message : "SDS import failed.",
            suggestion: "Review the CSV data and try again.",
          },
        ]);
        setImportValidationOpen(true);
      } finally {
        setImporting(false);
      }
    },
    [onImported, reload, userId],
  );

  return {
    importing,
    importValidationOpen,
    setImportValidationOpen,
    importValidationFileName,
    importValidationIssues,
    downloadTemplate,
    importCsvFile,
  };
}
