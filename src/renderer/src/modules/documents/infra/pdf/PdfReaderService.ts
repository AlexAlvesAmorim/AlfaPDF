import {pdfjsLib} from '@/shared/services/pdfWorker'

export async function loadPdf(filePath: string) {
    const loadingTask = pdfjsLib.getDocument(filePath)
    const pdf = await loadingTask.promise
    

    return {
        pdf,
        totalPages: pdf.numPages,
    }
}