import { ByteLinkedinPdfContent } from '@/graphql/generated/generated-types';
import fs from 'fs';
import sizeOf from 'image-size';
import path from 'path';
import { PDFImage } from 'pdf-image';
import PDFDocument from 'pdfkit';

export function writeByteLinkedinContentToPdf(backgroundImagePath: string, linkedinPdfContent: ByteLinkedinPdfContent, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc: PDFKit.PDFDocument = new PDFDocument({
        autoFirstPage: false,
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      const imgSize = sizeOf(backgroundImagePath);

      doc.font('Helvetica');
      // Add first page
      doc.addPage({ size: [imgSize.width!, imgSize.height!] });
      doc.image(backgroundImagePath, 0, 0);

      // Add Title
      doc.fontSize(140);
      doc.text(linkedinPdfContent.title, 20, 220, {
        width: imgSize.width! - 40,
        align: 'center',
      });

      // Add Subtitle
      doc.fontSize(100);
      doc.text(linkedinPdfContent.excerpt, 20, 570, {
        width: imgSize.width! - 40,
        align: 'center',
      });

      linkedinPdfContent.steps.map((content) => {
        doc.addPage({ size: [imgSize.width!, imgSize.height!] });
        doc.image(backgroundImagePath, 0, 0);
        doc.fontSize(100);
        doc.text(content.name, 20, 220, {
          width: imgSize.width! - 40,
          align: 'center',
        });

        doc.fontSize(80);
        doc.text(content.content, 20, 470, {
          width: imgSize.width! - 40,
          align: 'center',
        });
      });
      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}
// pdf2Image();
async function extractImagesFromPdf() {
  const pdfPath = path.resolve('output.pdf');
  const pdfImage = new PDFImage(pdfPath, {
    combinedImage: false,
    convertOptions: {
      '-quality': '100',
    },
  });

  const pagePaths = await pdfImage.convertFile();
}
