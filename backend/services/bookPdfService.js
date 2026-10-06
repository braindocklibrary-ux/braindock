import PDFDocument from 'pdfkit';

/**
 * Generates and streams a professional, multi-page, complete PDF document for any book in the library.
 * Includes Title/Cover Page, Table of Contents, Detailed Chapters, Notes, and Page Numbers.
 */
export function streamBookPdf(book, chapters, res) {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    bufferPages: true, // Allows calculating total pages for footer numbers
    info: {
      Title: book.title || 'Brain Dock Library Book',
      Author: book.author || 'Brain Dock Library',
      Subject: `${book.category || 'Academic Literature'} - Complete Digital Edition`,
      Producer: 'Brain Dock Library Digital Publishing Engine v2.0'
    }
  });

  const cleanFilename = (book.title || 'Book').replace(/[^a-zA-Z0-9_-]/g, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}_Complete_Edition.pdf"`);

  doc.pipe(res);

  // Helper to safely write text without crashing on unexpected unicode glyphs
  const safeText = (txt) => {
    if (!txt) return '';
    // Replace non-ascii chars that standard Helvetica doesn't support with readable representations
    return String(txt).replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-');
  };

  // ==========================================
  // PAGE 1: FORMAL COVER PAGE
  // ==========================================
  doc.rect(20, 20, 555, 802).lineWidth(2).strokeColor('#4c1d95').stroke();
  doc.rect(26, 26, 543, 790).lineWidth(0.5).strokeColor('#8b5cf6').stroke();

  doc.moveDown(3);
  doc.fontSize(11).fillColor('#6b21a8').font('Helvetica-Bold').text('BRAIN DOCK LIBRARY - COMPLETE DIGITAL ARCHIVE', {
    align: 'center',
    characterSpacing: 2
  });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#64748b').font('Helvetica').text('24/7 Academic Reading Sanctuary - Certified Unabridged Study Text', { align: 'center' });

  doc.moveDown(4);
  doc.fontSize(22).fillColor('#0f172a').font('Helvetica-Bold').text(safeText(book.title), {
    align: 'center',
    lineGap: 4
  });

  if (book.originalScriptTitle) {
    doc.moveDown(0.5);
    doc.fontSize(13).fillColor('#64748b').font('Helvetica').text(safeText(book.originalScriptTitle), { align: 'center' });
  }

  doc.moveDown(1.5);
  doc.fontSize(14).fillColor('#334155').font('Helvetica').text(`By ${safeText(book.author)}`, { align: 'center' });

  doc.moveDown(4);
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(100, doc.y).lineTo(495, doc.y).stroke();
  doc.moveDown(1.5);

  doc.fontSize(10).fillColor('#475569').font('Helvetica-Bold').text('ARCHIVAL CATALOG RECORD', { align: 'center' });
  doc.moveDown(0.6);
  doc.fontSize(9.5).fillColor('#334155').font('Helvetica');
  doc.text(`Category: ${safeText(book.category || 'General Academic')}`, { align: 'center' });
  doc.text(`Publisher: ${safeText(book.publisher || 'Brain Dock Library Press')} | Year: ${book.publicationYear || 'Contemporary'}`, { align: 'center' });
  doc.text(`ISBN / Catalog ID: ${safeText(book.isbn || book.bookId)} | Shelf: ${safeText(book.shelf || 'Main Academic Wing')}`, { align: 'center' });
  doc.text(`Total Chapters: ${chapters.length} Comprehensive Modules`, { align: 'center' });

  doc.moveDown(4);
  doc.fontSize(8.5).fillColor('#94a3b8').text(
    'This unabridged digital document is certified by Brain Dock Library for academic, scholarly, and student research. Reproduction rights preserved.',
    { align: 'center' }
  );

  // ==========================================
  // PAGE 2: TABLE OF CONTENTS & OVERVIEW
  // ==========================================
  doc.addPage();
  doc.fontSize(18).fillColor('#1e1b4b').font('Helvetica-Bold').text('Table of Contents', 50, 60);
  doc.moveDown(0.3);
  doc.strokeColor('#8b5cf6').lineWidth(1.5).moveTo(50, doc.y).lineTo(200, doc.y).stroke();
  doc.moveDown(1);

  if (book.description) {
    doc.fontSize(10).fillColor('#334155').font('Helvetica-Oblique').text(
      `Executive Overview: ${safeText(book.description)}`,
      { align: 'justify', lineGap: 3 }
    );
    doc.moveDown(1.5);
  }

  doc.fontSize(11).fillColor('#4c1d95').font('Helvetica-Bold').text('CHAPTER OUTLINE');
  doc.moveDown(0.5);

  chapters.forEach((chap, idx) => {
    doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text(`Module ${idx + 1}: ${safeText(chap.title)}`);
    if (chap.englishTranslation) {
      doc.fontSize(8.5).fillColor('#64748b').font('Helvetica').text(`   * ${safeText(chap.englishTranslation.slice(0, 120))}...`);
    }
    doc.moveDown(0.5);
  });

  // ==========================================
  // CHAPTER PAGES
  // ==========================================
  chapters.forEach((chap, idx) => {
    doc.addPage();

    // Chapter Header
    doc.fontSize(9).fillColor('#6b21a8').font('Helvetica-Bold').text(
      `BRAIN DOCK LIBRARY DIGITAL EDITION - MODULE ${idx + 1} OF ${chapters.length}`,
      50,
      50,
      { characterSpacing: 1 }
    );
    doc.moveDown(0.3);

    doc.fontSize(16).fillColor('#0f172a').font('Helvetica-Bold').text(safeText(chap.title), {
      lineGap: 3
    });
    doc.moveDown(0.4);
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Primary Text / Historical Script
    if (chap.originalText) {
      doc.fontSize(11).fillColor('#1e293b').font('Helvetica').text(safeText(chap.originalText), {
        align: 'justify',
        lineGap: 4
      });
      doc.moveDown(1.2);
    }

    // Extended In-depth fullText
    if (chap.fullText) {
      doc.fontSize(10).fillColor('#334155').font('Helvetica').text(safeText(chap.fullText), {
        align: 'justify',
        lineGap: 3.5
      });
      doc.moveDown(1.2);
    }

    // Translation & Scholarly Commentary
    if (chap.englishTranslation && chap.englishTranslation !== chap.originalText) {
      doc.fontSize(10).fillColor('#4c1d95').font('Helvetica-Bold').text('Scholarly Analysis & Interpretation:');
      doc.moveDown(0.3);
      doc.fontSize(9.5).fillColor('#475569').font('Helvetica-Oblique').text(safeText(chap.englishTranslation), {
        align: 'justify',
        lineGap: 3
      });
      doc.moveDown(1.2);
    }

    // Key Takeaways & Study Points
    if (chap.keyTakeaways && chap.keyTakeaways.length > 0) {
      doc.fontSize(10).fillColor('#1e1b4b').font('Helvetica-Bold').text('Key Takeaways & Core Concepts:');
      doc.moveDown(0.4);
      chap.keyTakeaways.forEach(point => {
        doc.fontSize(9).fillColor('#334155').font('Helvetica').text(`  *  ${safeText(point)}`, {
          lineGap: 2.5
        });
      });
      doc.moveDown(1);
    }
  });

  // ==========================================
  // FOOTER & PAGE NUMBERING ACROSS ALL PAGES
  // ==========================================
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    // Skip page 1 footer
    if (i > 0) {
      doc.fontSize(8).fillColor('#94a3b8').font('Helvetica').text(
        `Brain Dock Library (24/7 Digital Hub) | ${safeText(book.title)} | Page ${i + 1} of ${range.count}`,
        50,
        805,
        { align: 'center', width: 495 }
      );
    }
  }

  doc.end();
}
