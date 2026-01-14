import ExcelJS from 'exceljs';
import {
    ParsedCRAResult,
    CloudDetailField,
    AssessmentRow,
    AssessmentResponseNormalized,
    AssessmentSummary,
} from './types';

export async function parseCRA(buffer: Buffer, fileName: string): Promise<ParsedCRAResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheetNames = workbook.worksheets.map((ws) => ws.name);
    const parsedAtISO = new Date().toISOString();

    // 1. Parse "a. Cloud Solution Details"
    const cloudSolutionDetails = parseCloudSolutionDetails(workbook);

    // 2. Parse "b. Assessment"
    const assessment = parseAssessment(workbook);

    return {
        meta: {
            fileName,
            parsedAtISO,
            sheetNames,
        },
        cloudSolutionDetails,
        assessment,
    };
}

function parseCloudSolutionDetails(workbook: ExcelJS.Workbook) {
    const sheetName = 'a. Cloud Solution Details';
    const sheet = workbook.getWorksheet(sheetName);

    const allFields: CloudDetailField[] = [];

    if (!sheet) {
        return { allFields: [], filledFields: [], missingFields: [] };
    }

    // Iterate all rows to find key/value pairs
    sheet.eachRow((row, rowIndex) => {
        // Strategy 1: Two-column key/value blocks
        // We'll scan cells in the row. If cell N is a label and cell N+1 is a value.
        // Heuristic: Label is string, Value is not empty.
        // Also handle merged cells.

        // We'll iterate cells using eachCell to handle sparse rows correctly
        row.eachCell((cell, colIndex) => {
            const nextCell = row.getCell(colIndex + 1);

            const label = getCellText(cell);
            const value = getCellText(nextCell);

            // Strategy 3: Colon pattern "Label: Value" in a single cell
            if (label && label.includes(':')) {
                const parts = label.split(':');
                if (parts.length > 1) {
                    const extractedLabel = parts[0].trim();
                    const extractedValue = parts.slice(1).join(':').trim();
                    if (extractedLabel) {
                        // Check if we already have this label to avoid duplicates from merged cells
                        if (!allFields.some(f => f.label === extractedLabel && f.value === extractedValue)) {
                            allFields.push({
                                section: 'Cloud Solution Details',
                                label: extractedLabel,
                                value: extractedValue,
                                sheetName,
                                cellRef: cell.address,
                                rowIndex,
                            });
                        }
                        return; // processed this cell for colon pattern
                    }
                }
            }

            // Strategy 1 & 2: Label in one cell, Value in next (or next+1 if gap)
            // Basic heuristic: Label cell has a border or bold font? Or just non-empty text.

            let finalValue = value;
            if (label && isValueEmpty(value)) {
                // Check next cell (gap of 1)
                const nextNextCell = row.getCell(colIndex + 2);
                const nextNextValue = getCellText(nextNextCell);
                if (!isValueEmpty(nextNextValue)) {
                    finalValue = nextNextValue;
                }
            }

            if (label && !isValueEmpty(finalValue)) {
                // Avoid duplicates and self-reference (Label == Value)
                if (label === finalValue) return;

                // Check if this looks like a label.
                // Usually labels are shorter than values, but not always.

                // Let's add it if it's not already there.
                const existing = allFields.find(f => f.label === label && f.rowIndex === rowIndex);
                if (!existing) {
                    allFields.push({
                        section: 'Cloud Solution Details',
                        label: label,
                        value: finalValue,
                        sheetName,
                        cellRef: cell.address,
                        rowIndex,
                    });
                }
            }
        });
    });

    // Deduplicate: If we have multiple entries with same label, what to do?
    // The prompt says "deduplicate labels". We'll keep the first one or the one with value?
    // Let's filter for unique labels, preferring filled ones.

    const uniqueFieldsMap = new Map<string, CloudDetailField>();

    for (const field of allFields) {
        if (!uniqueFieldsMap.has(field.label)) {
            uniqueFieldsMap.set(field.label, field);
        } else {
            // If existing is empty and new is filled, replace.
            const existing = uniqueFieldsMap.get(field.label)!;
            if (isValueEmpty(existing.value) && !isValueEmpty(field.value)) {
                uniqueFieldsMap.set(field.label, field);
            }
        }
    }

    const uniqueFields = Array.from(uniqueFieldsMap.values());

    const filledFields = uniqueFields.filter((f) => !isValueEmpty(f.value));
    const missingFields = uniqueFields.filter((f) => isValueEmpty(f.value));

    return {
        allFields: uniqueFields,
        filledFields,
        missingFields,
    };
}

function parseAssessment(workbook: ExcelJS.Workbook) {
    const sheetName = 'b. Assessment';
    const sheet = workbook.getWorksheet(sheetName);

    const allRows: AssessmentRow[] = [];

    if (!sheet) {
        return {
            allRows: [],
            answeredRows: [],
            needsAttentionRows: [],
            summary: createEmptySummary(),
        };
    }

    // 1. Find Header Row & Map Columns
    let headerRowIndex = -1;
    let colMap = {
        id: -1,
        question: -1,
        response: -1,
        mitigation: -1,
    };
    let extraHeaders: Record<string, string> = {}; // colKey -> headerText

    sheet.eachRow((row, rowIndex) => {
        if (headerRowIndex !== -1) return; // already found

        let hasAssessmentResponse = false;
        let hasMitigation = false;

        // First pass: detect if this is the header row
        row.eachCell((cell) => {
            const text = getCellText(cell).toLowerCase();
            if (text.includes('assessment response')) hasAssessmentResponse = true;
            if (text.includes('mitigation') || text.includes('remarks')) hasMitigation = true;
        });

        if (hasAssessmentResponse && hasMitigation) {
            headerRowIndex = rowIndex;

            // Second pass: map columns
            row.eachCell((cell, colIndex) => {
                const text = getCellText(cell).toLowerCase();

                if (colMap.id === -1 && (text === '#' || text === 'id' || text === 'ref' || text === 'no' || text === 'no.')) {
                    colMap.id = colIndex;
                } else if (colMap.question === -1 && (text.includes('assessment') || text.includes('question') || text.includes('control'))) {
                    // Note: "Assessment Response" also contains "Assessment", so check response first or be specific.
                    // "Assessment" usually refers to the question/control text in this context (based on image: "Assessment" header for questions)
                    // But "Assessment Response" is another column.
                    if (!text.includes('response')) {
                        colMap.question = colIndex;
                    }
                } else if (colMap.response === -1 && (text.includes('assessment response') || text === 'response')) {
                    colMap.response = colIndex;
                } else if (colMap.mitigation === -1 && (text.includes('mitigation') || text.includes('remarks'))) {
                    colMap.mitigation = colIndex;
                } else {
                    // Potential extra column
                    // Only add if it's not one of the mapped ones (though we might map it later, so this logic is slightly fragile if order varies wildy)
                    // Better: After mapping main cols, anything else is extra.
                }
            });

            // Fallback for ID if not found (sometimes it's just the first column or labeled "Risk Area"?)
            // Image shows: "Risk Area" (A), "#" (B), "Assessment" (C), "Assessment Response" (E), "Mitigation/Remarks" (F).
            // So ID is "#".

            // Collect extra headers
            row.eachCell((cell, colIndex) => {
                if (colIndex !== colMap.id && colIndex !== colMap.question && colIndex !== colMap.response && colIndex !== colMap.mitigation) {
                    const headerText = getCellText(cell);
                    if (headerText) {
                        extraHeaders[colIndex] = headerText;
                    }
                }
            });
        }
    });

    if (headerRowIndex === -1 || colMap.response === -1) {
        // Fallback or error? Return empty for now.
        return {
            allRows: [],
            answeredRows: [],
            needsAttentionRows: [],
            summary: createEmptySummary(),
        };
    }

    // 2. Parse Rows
    let consecutiveEmptyCount = 0;
    const maxRow = sheet.rowCount + 20; // safety buffer

    for (let rowIndex = headerRowIndex + 1; rowIndex <= maxRow; rowIndex++) {
        const row = sheet.getRow(rowIndex);

        // Use mapped columns. If map is -1, try reasonable defaults or skip?
        // If ID is missing, we generate one.
        // If Question is missing, we might use the column before Response?
        // Let's assume if map is -1, we can't extract that field (except ID).

        const qIdRaw = colMap.id !== -1 ? getCellText(row.getCell(colMap.id)) : '';
        const qText = colMap.question !== -1 ? getCellText(row.getCell(colMap.question)) : '';
        const respRaw = colMap.response !== -1 ? getCellText(row.getCell(colMap.response)) : '';
        const mitRaw = colMap.mitigation !== -1 ? getCellText(row.getCell(colMap.mitigation)) : '';

        // Extract extra values
        const extra: Record<string, string> = {};
        let hasExtra = false;
        for (const [colIdx, header] of Object.entries(extraHeaders)) {
            const val = getCellText(row.getCell(parseInt(colIdx)));
            if (val) {
                extra[header] = val;
                hasExtra = true;
            }
        }

        const isRowEmpty = !qIdRaw && !qText && !respRaw && !mitRaw && !hasExtra;

        if (isRowEmpty) {
            consecutiveEmptyCount++;
            if (consecutiveEmptyCount >= 10) break;
            continue;
        }
        consecutiveEmptyCount = 0;

        // Normalization
        const responseNormalized = normalizeResponse(respRaw);
        const questionId = qIdRaw || `row-${rowIndex}`;

        const isAnswered = responseNormalized !== 'UNANSWERED';
        const hasMitigation = !!mitRaw;
        const needsAttention = responseNormalized === 'NO' && !hasMitigation;

        // Row inclusion rule: non-empty questionText OR any filled response/mitigation/extra
        if (qText || isAnswered || hasMitigation || hasExtra) {
            allRows.push({
                questionId,
                questionText: qText,
                responseRaw: respRaw || null,
                responseNormalized,
                mitigationRemarks: mitRaw || null,
                extra: hasExtra ? extra : undefined,
                rowIndex,
                sheetName,
                isAnswered,
                hasMitigation,
                needsAttention,
            });
        }
    }

    const answeredRows = allRows.filter(r => r.isAnswered || r.hasMitigation || (r.extra && Object.keys(r.extra).length > 0));
    const needsAttentionRows = allRows.filter(r => r.needsAttention);

    // Summary
    const totalQuestions = allRows.filter(r => !!r.questionText).length;
    const yesCount = allRows.filter(r => r.responseNormalized === 'YES').length;
    const noCount = allRows.filter(r => r.responseNormalized === 'NO').length;
    const naCount = allRows.filter(r => r.responseNormalized === 'NA').length;
    const otherCount = allRows.filter(r => r.responseNormalized === 'OTHER').length;

    const answeredCount = allRows.filter(r => r.responseNormalized !== 'UNANSWERED').length;
    const finalUnansweredCount = Math.max(0, totalQuestions - answeredCount);
    const needsAttentionCount = allRows.filter(r => r.responseNormalized === 'NO' && !r.mitigationRemarks).length;

    return {
        allRows,
        answeredRows,
        needsAttentionRows,
        summary: {
            totalQuestions,
            answeredCount,
            yesCount,
            noCount,
            naCount,
            otherCount,
            unansweredCount: finalUnansweredCount,
            needsAttentionCount,
        }
    };
}

// Helpers

function getCellText(cell: ExcelJS.Cell): string {
    if (!cell || cell.value === null || cell.value === undefined) return '';

    // Handle rich text
    if (typeof cell.value === 'object' && 'richText' in cell.value) {
        return (cell.value as ExcelJS.CellRichTextValue).richText.map(t => t.text).join('');
    }

    // Handle formulas
    if (typeof cell.value === 'object' && 'result' in cell.value) {
        const val = (cell.value as ExcelJS.CellFormulaValue).result;
        return val ? String(val).trim() : '';
    }

    // Handle hyperlinks
    if (typeof cell.value === 'object' && 'text' in cell.value) {
        return (cell.value as ExcelJS.CellHyperlinkValue).text;
    }

    return String(cell.value).trim();
}

function isValueEmpty(val: string): boolean {
    if (!val) return true;
    const trimmed = val.trim();
    return trimmed === '' || trimmed === '-';
    // "Not Applicable" is valid filled value, so we don't check for it here.
}

function normalizeResponse(raw: string): AssessmentResponseNormalized {
    if (!raw) return 'UNANSWERED';
    const upper = raw.trim().toUpperCase();

    if (upper === 'YES') return 'YES';
    if (upper === 'NO') return 'NO';
    if (['NA', 'N/A', 'NOT APPLICABLE'].includes(upper)) return 'NA';

    return 'OTHER';
}

function getCellColumnLetter(colIndex: number): string {
    return `Col${colIndex}`;
}

function createEmptySummary(): AssessmentSummary {
    return {
        totalQuestions: 0,
        answeredCount: 0,
        yesCount: 0,
        noCount: 0,
        naCount: 0,
        otherCount: 0,
        unansweredCount: 0,
        needsAttentionCount: 0,
    };
}
