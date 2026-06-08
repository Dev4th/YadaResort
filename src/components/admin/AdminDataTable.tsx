import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type AdminDataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  highlightId?: string;
};

export default function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'ไม่มีข้อมูล',
  onRowClick,
  highlightId,
}: AdminDataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-yada-border bg-yada-surface p-12 text-center text-yada-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-yada-border bg-yada-surface">
      <Table>
        <TableHeader>
          <TableRow className="bg-yada-sand hover:bg-yada-sand">
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={keyExtractor(row)}
              className={`hover:bg-yada-sand/60 ${onRowClick ? 'cursor-pointer' : ''} ${
                highlightId && keyExtractor(row) === highlightId ? 'bg-yada-primary/10 ring-1 ring-yada-primary/30' : ''
              }`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>{col.render(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
