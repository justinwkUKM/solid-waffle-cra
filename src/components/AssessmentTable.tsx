import React, { useState } from 'react';
import { AssessmentRow as AssessmentRowType, AssessmentResponseNormalized } from '../lib/types';
import { AssessmentRow } from './AssessmentRow';
import { AssessmentHeader } from './AssessmentHeader';
import { useAssessmentFilter } from '../hooks/useAssessmentFilter';
import { FilterType } from '../lib/constants';

interface AssessmentTableProps {
    rows: AssessmentRowType[];
    onUpdateRow: (rowIndex: number, field: 'response' | 'mitigation' | 'assessorComment', value: string) => void;
    onGenerateMitigation: (rowIndex: number) => Promise<void>;
    onAttachFile: (rowIndex: number, file: File) => Promise<void>;
    readOnly?: boolean;
    isAssessor?: boolean;
    filter: FilterType | AssessmentResponseNormalized;
    onFilterChange: (filter: FilterType | AssessmentResponseNormalized) => void;
}

export function AssessmentTable({
    rows,
    onUpdateRow,
    onGenerateMitigation,
    onAttachFile,
    readOnly = false,
    isAssessor = false,
    filter,
    onFilterChange
}: AssessmentTableProps) {
    const [reviewMode, setReviewMode] = useState(false);

    const {
        search,
        setSearch,
        filteredRows
    } = useAssessmentFilter(rows, filter, reviewMode);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-border flex flex-col h-full overflow-hidden">
            <AssessmentHeader
                itemCount={filteredRows.length}
                filter={filter}
                setFilter={onFilterChange}
                search={search}
                setSearch={setSearch}
                reviewMode={reviewMode}
                setReviewMode={setReviewMode}
            />

            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-sm border-b border-border">
                        <tr>
                            <th className="p-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-32">Risk Area</th>
                            <th className="p-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-16 text-center">ID</th>
                            <th className="p-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-1/3">Question / Control</th>
                            <th className="p-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-40">Response</th>
                            <th className="p-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-48">AI Opinion</th>
                            <th className="p-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mitigation / Remarks</th>
                            <th className="p-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-48">Assessor Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-muted-foreground text-sm">
                                    {reviewMode
                                        ? "Great job! No risky items found requiring review."
                                        : "No rows match your filter."}
                                </td>
                            </tr>
                        ) : (
                            filteredRows.map((row) => (
                                <AssessmentRow
                                    key={row.rowIndex}
                                    row={row}
                                    onUpdateRow={onUpdateRow}
                                    onGenerateMitigation={onGenerateMitigation}
                                    onAttachFile={onAttachFile}
                                    readOnly={readOnly}
                                    isAssessor={isAssessor}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
