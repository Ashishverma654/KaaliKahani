"use client";
import React from 'react';

const Table = ({ headers, data, renderRow, loading }) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full border-collapse">
        <thead className="border-b border-white/5">
          <tr>
            {headers.map((header, i) => (
              <th 
                key={i} 
                className="text-left py-4 px-4 text-[10px] font-black uppercase text-on-surface-variant/40 tracking-[0.3em]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {headers.map((_, j) => (
                  <td key={j} className="py-4 px-4 align-middle">
                    <div className="h-2 bg-white/5 rounded-full w-24"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data && data.length > 0 ? (
            data.map((item, i) => (
              <tr key={i} className="group hover:bg-white/[0.02] transition-colors duration-300">
                {renderRow(item, i)}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="py-16 text-center align-middle">
                <p className="text-[10px] font-black uppercase text-on-surface-variant/20 tracking-widest">
                  No Archival Data Found
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
