import { useState } from 'react'

interface PasswordDialogProps {
    wrongPassword: boolean
    onConfirm: (password: string) => void
    onCancel: () => void
}

export function PasswordDialog({ wrongPassword, onConfirm, onCancel }: PasswordDialogProps) {
    const [value, setValue] = useState('')

    const handleConfirm = () => {
        if (!value.trim()) return
        onConfirm(value)
        setValue('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleConfirm()
        if (e.key === 'Escape') onCancel()
    }

    return (
        <div className="password-dialog-overlay">
            <div className="password-dialog">
                <h2 className="password-dialog__title">PDF Protegido</h2>
                <p className="password-dialog__message">
                    {wrongPassword
                        ? 'Senha incorreta. Tente novamente.'
                        : 'Este PDF está protegido. Digite a senha para abrir.'}
                </p>
                <input
                    className="password-dialog__input"
                    type="password"
                    placeholder="Digite a senha..."
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <div className="password-dialog__actions">
                    <button className="password-dialog__btn password-dialog__btn--cancel" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className="password-dialog__btn password-dialog__btn--confirm" onClick={handleConfirm}>
                        Abrir
                    </button>
                </div>
            </div>
        </div>
    )
}