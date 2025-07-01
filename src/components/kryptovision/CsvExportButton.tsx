"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface CsvExportButtonProps {
  data: Record<string, any>[];
  ticker: string;
}

export default function CsvExportButton({ data, ticker }: CsvExportButtonProps) {
  const { t } = useLanguage();

  const downloadCsv = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
          const processedCell = cell.includes(',') ? `"${cell}"` : cell;
          return processedCell;
        }).join(',')
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    link.setAttribute("download", `KryptoVision_Data_${ticker}_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={downloadCsv}>
      <Download className="mr-2 h-4 w-4" />
      {t('export_csv')}
    </Button>
  );
}
