// src/components/common/Table.jsx
import React from "react";

const Table = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
      <table className="min-w-full table-auto bg-white">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-center text-sm font-semibold text-gray-700"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="border-t hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-center text-sm text-gray-700"
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
