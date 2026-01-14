import ExcelJS from 'exceljs';
import { ParsedCRAResult } from './types';

export async function generateExcel(data: ParsedCRAResult): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();

    // 1. Cloud Solution Details Sheet
    const detailsSheet = workbook.addWorksheet('Cloud Solution Details');
    detailsSheet.columns = [
        { header: 'Label', key: 'label', width: 40 },
        { header: 'Value', key: 'value', width: 60 },
    ];

    // Add filled fields
    data.cloudSolutionDetails.filledFields.forEach(field => {
        detailsSheet.addRow({ label: field.label, value: field.value });
    });

    // Add missing fields (styled differently)
    if (data.cloudSolutionDetails.missingFields) {
        data.cloudSolutionDetails.missingFields.forEach(field => {
            const row = detailsSheet.addRow({ label: field.label, value: 'Not Provided' });
            row.getCell('value').font = { italic: true, color: { argb: 'FF999999' } };
        });
    }

    // Style header
    detailsSheet.getRow(1).font = { bold: true };
    detailsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    // 2. Assessment Sheet
    const assessmentSheet = workbook.addWorksheet('Assessment');
    assessmentSheet.columns = [
        { header: 'ID', key: 'id', width: 15 },
        { header: 'Question', key: 'question', width: 60 },
        { header: 'Response', key: 'response', width: 15 },
        { header: 'Mitigation / Remarks', key: 'mitigation', width: 40 },
        { header: 'AI Opinion', key: 'aiOpinion', width: 15 },
        { header: 'AI Reasoning', key: 'aiReasoning', width: 50 },
        { header: 'Required Action', key: 'action', width: 40 },
    ];

    data.assessment.allRows.forEach(row => {
        const rowData = {
            id: row.questionId,
            question: row.questionText,
            response: row.responseNormalized,
            mitigation: row.mitigationRemarks || '',
            aiOpinion: row.aiAnalysis?.opinion || '',
            aiReasoning: row.aiAnalysis?.reasoning || '',
            action: row.aiAnalysis?.requiredAction || ''
        };

        const addedRow = assessmentSheet.addRow(rowData);

        // Style based on AI opinion
        if (row.aiAnalysis?.opinion === 'FAIL') {
            addedRow.getCell('aiOpinion').font = { color: { argb: 'FFFF0000' }, bold: true };
        } else if (row.aiAnalysis?.opinion === 'PASS') {
            addedRow.getCell('aiOpinion').font = { color: { argb: 'FF008000' }, bold: true };
        }

        // Style based on Needs Attention
        if (row.needsAttention) {
            addedRow.getCell('response').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFE0E0' }
            };
        }
    });

    // Style header
    assessmentSheet.getRow(1).font = { bold: true };
    assessmentSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
