import ExcelJS from 'exceljs';
import { parseCRA } from '../src/lib/craParser';
import assert from 'assert';

async function createMockWorkbook(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // 1. Cloud Solution Details
    const sheet1 = workbook.addWorksheet('a. Cloud Solution Details');
    sheet1.getCell('B2').value = 'Solution Name';
    sheet1.getCell('C2').value = 'Test Solution';
    sheet1.getCell('B3').value = 'Description';
    sheet1.getCell('C3').value = 'A test solution for CRA parser.';
    // Gap Test: Label in A, Gap in B, Value in C
    sheet1.getCell('A4').value = 'Gap Label';
    sheet1.getCell('C4').value = 'Gap Value';
    sheet1.getCell('B5').value = 'Provider: AWS'; // Colon pattern

    // 2. Assessment
    const sheet2 = workbook.addWorksheet('b. Assessment');

    // Header with Shifted Columns (Simulating "Risk Area" in Col A)
    // A: Risk Area, B: #, C: Assessment (Question), D: Empty?, E: Response, F: Mitigation
    sheet2.getCell('A5').value = 'Risk Area';
    sheet2.getCell('B5').value = '#';
    sheet2.getCell('C5').value = 'Assessment'; // Question
    sheet2.getCell('E5').value = 'Assessment Response';
    sheet2.getCell('F5').value = 'Mitigation / Remarks';
    sheet2.getCell('G5').value = 'Extra Col';

    // Rows
    // Row 6: Answered YES
    sheet2.getCell('A6').value = 'Access Control';
    sheet2.getCell('B6').value = '1';
    sheet2.getCell('C6').value = 'Is this secure?';
    sheet2.getCell('E6').value = 'Yes';
    sheet2.getCell('F6').value = 'It is secure.';
    sheet2.getCell('G6').value = 'Extra Value 1';

    // Row 7: Answered NO with Mitigation
    sheet2.getCell('B7').value = '2';
    sheet2.getCell('C7').value = 'Is encryption used?';
    sheet2.getCell('E7').value = 'No';
    sheet2.getCell('F7').value = 'Will be implemented.';

    // Row 8: Answered NO without Mitigation (Needs Attention)
    sheet2.getCell('B8').value = '3';
    sheet2.getCell('C8').value = 'Is logging enabled?';
    sheet2.getCell('E8').value = 'No';

    // Row 9: Unanswered
    sheet2.getCell('B9').value = '4';
    sheet2.getCell('C9').value = 'Is MFA enabled?';

    // Row 10: N/A
    sheet2.getCell('B10').value = '5';
    sheet2.getCell('C10').value = 'Legacy support?';
    sheet2.getCell('E10').value = 'N/A';
    sheet2.getCell('F10').value = 'Not applicable.';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}

async function runTest() {
    console.log('Generating mock workbook with shifted columns...');
    const buffer = await createMockWorkbook();

    console.log('Parsing workbook...');
    const result = await parseCRA(buffer, 'test.xlsx');

    console.log('Verifying results...');

    // Verify Cloud Solution Details
    const details = result.cloudSolutionDetails.filledFields;
    assert.strictEqual(details.find(f => f.label === 'Solution Name')?.value, 'Test Solution', 'Solution Name mismatch');
    assert.strictEqual(details.find(f => f.label === 'Gap Label')?.value, 'Gap Value', 'Gap Value mismatch');
    console.log('✓ Cloud Solution Details verified');

    // Verify Assessment Summary
    const summary = result.assessment.summary;
    assert.strictEqual(summary.totalQuestions, 5, 'Total questions mismatch');
    assert.strictEqual(summary.answeredCount, 4, 'Answered count mismatch');

    assert.strictEqual(summary.yesCount, 1, 'YES count mismatch');
    assert.strictEqual(summary.noCount, 2, 'NO count mismatch');
    assert.strictEqual(summary.naCount, 1, 'NA count mismatch');
    assert.strictEqual(summary.needsAttentionCount, 1, 'Needs Attention count mismatch');
    console.log('✓ Assessment Summary verified');

    // Verify Rows
    const rows = result.assessment.allRows;
    const row1 = rows.find(r => r.questionId === '1');
    assert.strictEqual(row1?.questionText, 'Is this secure?', 'Question text mismatch');
    assert.strictEqual(row1?.responseNormalized, 'YES', 'Response mismatch');
    assert.strictEqual(row1?.extra?.['Risk Area'], 'Access Control', 'Risk Area extraction mismatch');
    assert.strictEqual(row1?.extra?.['Extra Col'], 'Extra Value 1', 'Extra column mismatch');
    console.log('✓ Assessment Rows verified');

    console.log('All tests passed!');
}

runTest().catch(console.error);
