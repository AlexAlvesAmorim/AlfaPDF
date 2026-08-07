import { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Select, MenuItem, FormControl, InputLabel,
  TextField, FormLabel, CircularProgress, Alert, Box,
  ThemeProvider, createTheme, Typography, Divider, Chip,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import PrintIcon from '@mui/icons-material/Print'
import DescriptionIcon from '@mui/icons-material/Description'
import PaletteIcon from '@mui/icons-material/Palette'
import LayersIcon from '@mui/icons-material/Layers'
import type { PrintOptions, PrintQuality } from '../types'

interface Printer { name: string; isDefault?: boolean }

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  onPrint: (options: PrintOptions) => void;
  onSaveAsPdf: (options: PrintOptions) => void;
  currentPage: number;
  totalPages: number;
  fileName?: string;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#e4002b', light: '#ff2d55', dark: '#b20022' },
    background: { paper: '#1a1a1a', default: '#121212' },
    text: { primary: '#f5f5f5', secondary: '#b8b8b8' },
    divider: 'rgba(255, 255, 255, 0.08)',
    error: { main: '#ff4444' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: '1px solid rgba(228, 0, 43, 0.18)',
          boxShadow: '0 24px 72px rgba(0,0,0,0.8), 0 0 40px rgba(228,0,43,0.08)',
          backgroundImage: 'linear-gradient(180deg, #1e1e1e 0%, #141414 100%)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          letterSpacing: '0.5px',
          fontSize: '1.15rem',
          padding: '20px 24px 16px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { padding: '8px 24px 20px' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          borderRadius: 8,
          padding: '8px 18px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #b20022 0%, #e4002b 100%)',
          boxShadow: '0 4px 12px rgba(228,0,43,0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #e4002b 0%, #ff2d55 100%)',
            boxShadow: '0 8px 24px rgba(228,0,43,0.5)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
          '&:hover fieldset': { borderColor: 'rgba(228,0,43,0.4)' },
          '&.Mui-focused fieldset': { borderColor: '#e4002b' },
        },
      },
    },
  },
});

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        bgcolor: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '8px',
            bgcolor: 'rgba(228,0,43,0.12)',
            color: '#e4002b',
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.55)',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  )
}

export default function PrintDialog({
  open, onClose, onPrint, onSaveAsPdf, currentPage, totalPages, fileName,
}: PrintDialogProps) {
  const [printers, setPrinters] = useState<Printer[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState('')
  const [copies, setCopies] = useState(1)
  const [color, setColor] = useState(true)
  const [pageRange, setPageRange] = useState<'all' | 'current' | 'custom'>('all')
  const [customPages, setCustomPages] = useState('')
  const [printQuality, setPrintQuality] = useState<PrintQuality>('normal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !window.electronAPI?.getPrinters) return
    let mounted = true
    setLoading(true)
    setError(null)
    window.electronAPI.getPrinters()
      .then((list: Printer[]) => {
        if (!mounted) return
        if (list.length) {
          setPrinters(list)
          const def = list.find((p) => p.isDefault)
          setSelectedPrinter(def?.name ?? list[0].name)
        } else {
          setError('Nenhuma impressora encontrada no sistema.')
        }
      })
      .catch(() => { if (mounted) setError('Erro ao carregar lista de impressoras.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [open])

  const buildOptions = (): PrintOptions => ({
    printerName: selectedPrinter,
    copies,
    color,
    duplex: 'simplex',
    silent: true,
    printBackground: false,
    pageRange,
    currentPage,
    customPages: pageRange === 'custom' ? customPages : undefined,
    printQuality,
  })

  const handlePrint = () => {
    if (!selectedPrinter) { setError('Selecione uma impressora.'); return }
    setLoading(true)
    onPrint(buildOptions())
    setTimeout(() => { setLoading(false); onClose() }, 800)
  }

  const handleSaveAsPdf = () => {
    onSaveAsPdf(buildOptions())
    onClose()
  }

  const pageRangeLabel = pageRange === 'all'
    ? `Todas (${totalPages})`
    : pageRange === 'current'
      ? `Página ${currentPage}`
      : customPages.trim() || 'Personalizado'

  const qualityOptions: Array<{ value: PrintQuality; label: string; hint: string }> = [
    { value: 'draft', label: 'Rascunho', hint: 'Econômico' },
    { value: 'normal', label: 'Padrão', hint: 'Equilibrado' },
    { value: 'high', label: 'Alta', hint: 'Qualidade máxima' },
  ]

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PrintIcon sx={{ color: '#e4002b', fontSize: 22 }} />
            <Box sx={{ flex: 1 }}>
              <Box>Imprimir documento</Box>
              {fileName && (
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.45)',
                    fontFamily: '"JetBrains Mono", monospace',
                    mt: 0.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    letterSpacing: 0,
                    textTransform: 'none',
                  }}
                >
                  {fileName}
                </Typography>
              )}
            </Box>
            <Chip
              size="small"
              label={`${totalPages} ${totalPages === 1 ? 'página' : 'páginas'}`}
              sx={{
                bgcolor: 'rgba(228,0,43,0.12)',
                color: '#ff6b80',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.7rem',
                fontWeight: 600,
                height: 22,
              }}
            />
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {loading && !printers.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              {error && <Alert severity="error">{error}</Alert>}

              <Section icon={<DescriptionIcon sx={{ fontSize: 16 }} />} title="Documento">
                <FormControl fullWidth size="small">
                  <InputLabel id="printer-label">Impressora</InputLabel>
                  <Select
                    labelId="printer-label"
                    value={selectedPrinter}
                    label="Impressora"
                    onChange={(e) => setSelectedPrinter(e.target.value)}
                    disabled={!printers.length}
                  >
                    {printers.map((p) => (
                      <MenuItem key={p.name} value={p.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <PrintIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                          <span style={{ flex: 1 }}>{p.name}</span>
                          {p.isDefault && (
                            <Chip
                              size="small"
                              label="padrão"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                bgcolor: 'rgba(228,0,43,0.15)',
                                color: '#ff6b80',
                              }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Section>

              <Section icon={<LayersIcon sx={{ fontSize: 16 }} />} title="Configurações">
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    label="Cópias"
                    type="number"
                    size="small"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                    slotProps={{ htmlInput: { min: 1, max: 99 } }}
                    sx={{
                      width: 110,
                      '& input': { fontFamily: '"JetBrains Mono", monospace', textAlign: 'center' },
                    }}
                  />
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel id="pages-label">Páginas</InputLabel>
                    <Select
                      labelId="pages-label"
                      value={pageRange}
                      label="Páginas"
                      onChange={(e) => setPageRange(e.target.value as 'all' | 'current' | 'custom')}
                    >
                      <MenuItem value="all">Todas ({totalPages})</MenuItem>
                      <MenuItem value="current">Página atual ({currentPage})</MenuItem>
                      <MenuItem value="custom">Personalizado...</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {pageRange === 'custom' && (
                  <TextField
                    label="Intervalo"
                    placeholder="Ex: 1-3, 5, 7-9"
                    fullWidth
                    size="small"
                    value={customPages}
                    onChange={(e) => setCustomPages(e.target.value)}
                    helperText={`Total: ${totalPages} páginas`}
                    sx={{ mt: 1.5 }}
                  />
                )}
              </Section>

              <Section icon={<PaletteIcon sx={{ fontSize: 16 }} />} title="Aparência">
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                  <Box
                    onClick={() => setColor(true)}
                    sx={{
                      flex: 1,
                      cursor: 'pointer',
                      p: 1.5,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: color ? '#e4002b' : 'rgba(255,255,255,0.08)',
                      bgcolor: color ? 'rgba(228,0,43,0.08)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { borderColor: color ? '#e4002b' : 'rgba(255,255,255,0.18)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, #ff2d55 0%, #e4002b 50%, #1976d2 100%)',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Colorida</Typography>
                    </Box>
                  </Box>
                  <Box
                    onClick={() => setColor(false)}
                    sx={{
                      flex: 1,
                      cursor: 'pointer',
                      p: 1.5,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: !color ? '#e4002b' : 'rgba(255,255,255,0.08)',
                      bgcolor: !color ? 'rgba(228,0,43,0.08)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { borderColor: !color ? '#e4002b' : 'rgba(255,255,255,0.18)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: '4px',
                        background: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Preto e branco</Typography>
                    </Box>
                  </Box>
                </Box>

                <FormLabel sx={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', mb: 0.75, fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Qualidade
                </FormLabel>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {qualityOptions.map(({ value, label, hint }) => {
                    const active = printQuality === value
                    return (
                      <Box
                        key={value}
                        onClick={() => setPrintQuality(value)}
                        sx={{
                          flex: 1,
                          cursor: 'pointer',
                          p: 1.25,
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: active ? '#e4002b' : 'rgba(255,255,255,0.08)',
                          bgcolor: active ? 'rgba(228,0,43,0.08)' : 'rgba(255,255,255,0.02)',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                          '&:hover': { borderColor: active ? '#e4002b' : 'rgba(255,255,255,0.18)' },
                        }}
                      >
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: active ? '#ff6b80' : 'rgba(255,255,255,0.85)' }}>
                          {label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: '"JetBrains Mono", monospace', mt: 0.25 }}>
                          {hint}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              </Section>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#e4002b', boxShadow: '0 0 8px #e4002b' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{pageRangeLabel}</span>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                <span>{copies} {copies === 1 ? 'cópia' : 'cópias'}</span>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                <span>{color ? 'Cor' : 'P&B'}</span>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">Cancelar</Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={handleSaveAsPdf} disabled={loading} startIcon={<SaveIcon />}>
            Salvar PDF
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrint}
            disabled={loading || !selectedPrinter}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PrintIcon />}
          >
            {loading ? 'Enviando...' : 'Imprimir'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}
