import { pdfjsLib } from '@/shared/services/pdfWorker'

export class PasswordRequiredError extends Error {
    constructor() {
        super('PASSWORD_REQUIRED')
    }
}

export class PasswordWrongError extends Error {
    constructor() {
        super('PASSWORD_WRONG')
    }
}

export async function loadPdf(filePath: string, password?: string) {
    return new Promise<{ pdf: any; totalPages: number }>((resolve, reject) => {
        const loadingTask = pdfjsLib.getDocument({
            url: filePath,
            ...(password ? { password } : {}),
        })

        loadingTask.onPassword = (_updatePassword, reason) => {
            if (reason === 2) {
                reject(new PasswordWrongError())
            } else {
                reject(new PasswordRequiredError())
            }
        }

        loadingTask.promise
            .then(pdf => resolve({ pdf, totalPages: pdf.numPages }))
            .catch(err => reject(err))
    })
}