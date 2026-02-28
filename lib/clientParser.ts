export async function parseFileOnClient(file: File): Promise<string> {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "pdf") {
        return parsePDF(file);
    } else if (extension === "docx") {
        return parseDocx(file);
    } else {
        // Default to plain text (txt, md, etc.)
        return file.text();
    }
}

async function parsePDF(file: File): Promise<string> {
    // Use dynamic import to prevent Node.js/SSR Evaluation errors
    const pdfjs = await import("pdfjs-dist");

    // Set worker source only if in browser and not set
    if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
        fullText += pageText + "\n";
    }

    return fullText;
}

async function parseDocx(file: File): Promise<string> {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}
