import PDFDocument from 'pdfkit';

/**
 * Generates and streams a professional, multi-page, complete PDF document for any book in the library.
 * Includes Title/Cover Page, Table of Contents, Detailed Chapters, Notes, and Page Numbers.
 */
export function streamBookPdf(book, chapters, res, isDownload = false) {
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
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // By default serve inline so browser PDF viewer & PDF.js render directly in page without downloading
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}_Complete_Edition.pdf"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${cleanFilename}_Complete_Edition.pdf"`);
    }
  }

  doc.pipe(res);

  // Helper to safely write text without crashing on unexpected unicode glyphs or producing Mojibake
  const cleanAsciiText = (txt) => {
    if (!txt) return '';
    let s = String(txt)
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-');

    // If text contains non-ASCII characters (e.g. Gujarati, Devanagari, Urdu):
    if (/[^\x00-\x7F]/.test(s)) {
      // 1. Extract English / Latin readable title from parentheses if available
      const parenMatch = s.match(/\(([^)]+)\)/);
      if (parenMatch && /[a-zA-Z]/.test(parenMatch[1])) {
        return parenMatch[1].trim();
      }

      // 2. Extract Latin character sequences
      const latinWords = s.match(/[a-zA-Z0-9\s.,'":;?!/-]+/g);
      if (latinWords) {
        const extracted = latinWords.join(' ').replace(/\s+/g, ' ').trim();
        if (extracted.length > 5) return extracted;
      }

      // If purely Indic without Latin, return empty string to prevent Helvetica Mojibake corruption
      return '';
    }

    return s.trim();
  };

  const safeText = (txt) => cleanAsciiText(txt);

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

    const chapterTitle = cleanAsciiText(chap.title) || `Module ${idx + 1}: Core Study Text`;
    doc.fontSize(16).fillColor('#0f172a').font('Helvetica-Bold').text(chapterTitle, {
      lineGap: 3
    });
    doc.moveDown(0.4);
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Primary Text / Extended In-depth treatise (clean Latin text only)
    const primaryText = cleanAsciiText(chap.fullText) || cleanAsciiText(chap.originalText);
    if (primaryText && primaryText.length > 10) {
      doc.fontSize(10.5).fillColor('#1e293b').font('Helvetica').text(primaryText, {
        align: 'justify',
        lineGap: 3.5
      });
      doc.moveDown(1.2);
    }

    // Translation & Scholarly Commentary
    if (chap.englishTranslation) {
      const cleanCommentary = cleanAsciiText(chap.englishTranslation) || chap.englishTranslation.replace(/[^\x00-\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleanCommentary && cleanCommentary.length > 5) {
        doc.fontSize(10).fillColor('#4c1d95').font('Helvetica-Bold').text('Scholarly Analysis & English Translation:');
        doc.moveDown(0.3);
        doc.fontSize(9.5).fillColor('#334155').font('Helvetica').text(cleanCommentary, {
          align: 'justify',
          lineGap: 3
        });
        doc.moveDown(1.2);
      }
    }

    // Key Takeaways & Study Points
    if (chap.keyTakeaways && chap.keyTakeaways.length > 0) {
      const cleanPoints = chap.keyTakeaways
        .map(p => cleanAsciiText(p) || p.replace(/[^\x00-\x7F]/g, ' ').trim())
        .filter(p => p && p.length > 3);

      if (cleanPoints.length > 0) {
        doc.fontSize(10).fillColor('#1e1b4b').font('Helvetica-Bold').text('Key Takeaways & Core Concepts:');
        doc.moveDown(0.4);
        cleanPoints.forEach(point => {
          doc.fontSize(9).fillColor('#334155').font('Helvetica').text(`  *  ${point}`, {
            lineGap: 2.5
          });
        });
        doc.moveDown(1);
      }
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
