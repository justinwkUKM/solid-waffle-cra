import { useState, useMemo } from 'react';
import { AssessmentRow, AssessmentResponseNormalized } from '../lib/types';
import { FILTER_TYPES, FilterType } from '../lib/constants';

export function useAssessmentFilter(
    rows: AssessmentRow[],
    filter: FilterType | AssessmentResponseNormalized,
    reviewMode: boolean
) {
    const [search, setSearch] = useState('');

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            // 0. Review Mode Filter
            if (reviewMode) {
                const isRisky =
                    row.responseNormalized === 'NO' ||
                    row.needsAttention ||
                    row.aiAnalysis?.opinion === 'FAIL' ||
                    row.aiAnalysis?.opinion === 'INFO' ||
                    !row.isAnswered;

                if (!isRisky) return false;
            }

            // 1. Filter by status
            if (filter === FILTER_TYPES.NEEDS_ATTENTION) {
                if (!row.needsAttention) return false;
            } else if (filter === FILTER_TYPES.HIGH_RISK) {
                // High Risk: NO response and no mitigation
                if (row.responseNormalized !== 'NO' || (row.mitigationRemarks && row.mitigationRemarks.trim().length > 0)) return false;
            } else if (filter === FILTER_TYPES.ACTION_REQUIRED) {
                // Action Required: AI requested action
                if (!row.aiAnalysis?.requiredAction) return false;
            } else if (filter !== FILTER_TYPES.ALL) {
                if (row.responseNormalized !== filter) return false;
            }

            // 2. Search
            if (search) {
                const q = search.toLowerCase();
                const textMatch =
                    row.questionText?.toLowerCase().includes(q) ||
                    row.questionId.toLowerCase().includes(q) ||
                    row.mitigationRemarks?.toLowerCase().includes(q) ||
                    row.responseRaw?.toLowerCase().includes(q);
                if (!textMatch) return false;
            }

            return true;
        });
    }, [rows, filter, search, reviewMode]);

    return {
        search,
        setSearch,
        filteredRows,
    };
}
