const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function extractScenarioContent() {
    console.log('Extracting content from scenario PDF files...\n');
    
    const files = ['The Inventory That Changed Everything.pdf', 'scenario.pdf'];
    
    for (const file of files) {
        const filePath = path.join('.', file);
        try {
            if (fs.existsSync(filePath)) {
                console.log(`Processing ${file}...`);
                const pdfBuffer = fs.readFileSync(filePath);
                console.log(`  File size: ${pdfBuffer.length} bytes`);
                
                // Use the correct API for pdf-parse v2.4.3
                console.log('  pdfParse type:', typeof pdfParse);
                
                // Check which version of pdf-parse we're using
                let pdfData;
                if (typeof pdfParse === 'function') {
                    // Old API (v1.x)
                    console.log('  Using old pdf-parse API');
                    pdfData = await pdfParse(pdfBuffer);
                } else if (typeof pdfParse === 'object' && pdfParse.PDFParse) {
                    // New API (v2.x)
                    console.log('  Using new pdf-parse API');
                    const parser = new pdfParse.PDFParse({ data: pdfBuffer });
                    const result = await parser.getText();
                    await parser.destroy();
                    pdfData = { text: result.text, numpages: result.pages.length };
                } else {
                    console.error('  Unknown pdf-parse API');
                    continue;
                }
                
                console.log(`  Pages: ${pdfData.numpages || 'unknown'}`);
                console.log(`  Text length: ${pdfData.text.length}`);
                console.log(`  First 500 characters:`);
                console.log(`  "${pdfData.text.substring(0, 500)}..."`);
                console.log('----------------------------------------\n');
            } else {
                console.log(`${file}: Not found\n`);
            }
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
            console.log('----------------------------------------\n');
        }
    }
}

extractScenarioContent();