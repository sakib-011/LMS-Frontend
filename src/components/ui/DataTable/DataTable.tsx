import React from 'react';
import './DataTable.css';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick
}: DataTableProps<T>) {
  return (
    <div className="bg-datatable-wrapper">
      <table className="bg-datatable">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="bg-datatable-th">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr 
              key={item.id} 
              className={`bg-datatable-tr ${onRowClick ? 'bg-datatable-tr--clickable' : ''}`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map(col => (
                <td key={col.key} className="bg-datatable-td">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="bg-datatable-empty">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
