import { parseMarkdown } from '@/utils/parse-markdown';

export interface FinalReportExercise {
  orderNumber: number;
  title: string;
  prompt: string | null;
  promptResponse: string | null;
}

export interface FinalReportModule {
  orderNumber: number;
  title: string;
  exercises: FinalReportExercise[];
}

export interface FinalReportData {
  caseStudyTitle: string;
  studentName: string | null;
  studentEmail: string | null;
  modules: FinalReportModule[];
}

export interface ExportOptions {
  includePrompt: boolean;
  includeResponse: boolean;
}

/**
 * Builds the HTML content for the final report PDF
 */
export function buildFinalReportContent(data: FinalReportData, options: ExportOptions): string {
  let content = `<h1>${data.caseStudyTitle}</h1>\n\n`;

  data.modules.forEach((module) => {
    // Only include module if it has exercises with content to show
    const exercisesWithContent = module.exercises.filter((exercise) => {
      const hasPrompt = options.includePrompt && exercise.prompt;
      const hasResponse = options.includeResponse && exercise.promptResponse;
      return hasPrompt || hasResponse;
    });

    if (exercisesWithContent.length === 0) return;

    content += `<h2>Module ${module.orderNumber}: ${module.title}</h2>\n\n`;

    exercisesWithContent.forEach((exercise) => {
      content += `<h3>Exercise ${exercise.orderNumber}: ${exercise.title}</h3>\n\n`;

      if (options.includePrompt && exercise.prompt) {
        content += `<h4>Student Prompt:</h4>\n`;
        content += `<div style="background-color: #eff6ff; padding: 15px; margin: 10px 0; border-left: 4px solid #3b82f6; border-radius: 5px;">${exercise.prompt}</div>\n\n`;
      }

      if (options.includeResponse && exercise.promptResponse) {
        content += `<h4>Selected Response:</h4>\n`;
        content += `<div style="background-color: #f9fafb; padding: 15px; margin: 10px 0; border-left: 4px solid #6b7280; border-radius: 5px;">${exercise.promptResponse}</div>\n\n`;
      }
    });
  });

  return content;
}

/**
 * Generates and downloads the final report as a PDF
 */
export function downloadFinalReportPdf(data: FinalReportData, options: ExportOptions): void {
  const content = buildFinalReportContent(data, options);

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Case Study Final Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 12px 10px; line-height: 1.6; }
            h1 { color: #2563eb; font-size: 1.5em; margin-bottom: 15px; }
            h2 { color: #2563eb; font-size: 1.2em; margin-top: 25px; margin-bottom: 10px; }
            h3 { color: #2563eb; font-size: 1.1em; margin-top: 15px; margin-bottom: 8px; }
            h4 { color: #374151; font-size: 0.95em; margin-top: 10px; margin-bottom: 5px; }
            .header { text-align: left; margin-bottom: 25px; }
            .student-info { margin-bottom: 5px; }
            .content { max-width: none; margin: 0; }
            @media print {
              body { margin: 10px 8px; }
              .no-print { display: none; }
              @page { margin: 12mm 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="student-info">Student: ${data.studentName || data.studentEmail || 'N/A'}</div>
            <div class="student-info">Email: ${data.studentEmail || 'N/A'}</div>
            <div>Downloaded on ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="content">
            ${parseMarkdown(content)}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

/**
 * Builds report content string for display (e.g., in view modal)
 */
export function buildFinalReportMarkdown(data: FinalReportData): string {
  let content = `# ${data.caseStudyTitle}\n\n`;

  data.modules.forEach((module) => {
    if (module.exercises.length === 0) return;

    content += `## Module ${module.orderNumber}: ${module.title}\n\n`;

    module.exercises.forEach((exercise) => {
      content += `### Exercise ${exercise.orderNumber}: ${exercise.title}\n\n`;

      if (exercise.prompt) {
        content += `**Student Prompt:**\n\n`;
        content += `${exercise.prompt}\n\n`;
      }

      if (exercise.promptResponse) {
        content += `**Selected Response:**\n\n`;
        content += `${exercise.promptResponse}\n\n`;
      }

      //   content += `---\n\n`;
    });
  });

  return content;
}
