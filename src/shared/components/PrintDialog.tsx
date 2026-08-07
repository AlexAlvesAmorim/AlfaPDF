import { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Select, MenuItem, FormControl, InputLabel,
  TextField, Checkbox, FormControlLabel, RadioGroup,
  Radio, FormLabel, CircularProgress, Alert, Box,
  ThemeProvider, createTheme, Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import PrintIcon from '@mui/icons-material/Print'
import type { PrintOptions, PrintQuality } from '../types'

interface Printer { name: string; isDefault?: boolean }
export type DuplexMode = 'simplex' | 'longEdge' | 'shortEdge'

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  onPrint: (options: PrintOptions) => void;
  onSaveAsPdf: (options: PrintOptions) => void;
  currentPage: number;
  totalPages: number;
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
  shape: { borderRadius: 8 },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: '1px solid rgba(228, 0, 43, 0.2)',
          boxShadow: '0 24px 72px rgba(0,0,0,0.8), 0 0 40px rgba(228,0,43,0.1)',
          backgroundImage: 'linear-gradient(180deg, #1e1e1e 0%, #161616 100%)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          letterSpacing: '0.5px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontSize: '1.15rem',
          padding: '20px 24px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { padding: '24px' },
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
          padding: '8px 20px',
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

export default function PrintDialog({ open, onClose, onPrint, onSaveAsPdf, currentPage, totalPages }: PrintDialogProps) {
  const [printers, setPrinters] = useState<Printer[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState('')
  const [copies, setCopies] = useState(1)
  const [color, setColor] = useState(false)
  const [duplex, setDuplex] = useState<DuplexMode>('simplex')
  const [pageRange, setPageRange] = useState<'all' | 'current' | 'custom'>('all')
  const [customPages, setCustomPages] = useState('')
  const [printQuality, setPrintQuality] = useState<PrintQuality>('normal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !window.electronAPI?.getPrinters) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    window.electronAPI.getPrinters()
      .then((list: Printer[]) => {
        if (!mounted) return;
        if (list.length) {
          setPrinters(list);
          const def = list.find((p) => p.isDefault);
          setSelectedPrinter(def?.name ?? list[0].name);
        } else {
          setError('Nenhuma impressora encontrada.');
        }
      })
      .catch(() => { if (mounted) setError('Erro ao carregar lista de impressoras.') })
      .finally(() => { if (mounted) setLoading(false) });
    return () => { mounted = false };
  }, [open]);

  const buildOptions = (): PrintOptions => ({
    printerName: selectedPrinter,
    copies,
    color,
    duplex,
    silent: true,
    printBackground: false,
    pageRange,
    currentPage,
    customPages: pageRange === 'custom' ? customPages : undefined,
    printQuality,
  });

  const handlePrint = () => {
    if (!selectedPrinter) { setError('Selecione uma impressora.'); return; }
    setLoading(true);
    onPrint(buildOptions());
    setTimeout(() => { setLoading(false); onClose(); }, 800);
  };

  const handleSaveAsPdf = () => {
    onSaveAsPdf(buildOptions());
    onClose();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PrintIcon sx={{ color: '#e4002b', fontSize: 22 }} />
          Impressão
        </DialogTitle>
        <DialogContent dividers>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {!loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="printer-label">Impressora</InputLabel>
                <Select labelId="printer-label" value={selectedPrinter} label="Impressora"
                  onChange={(e) => setSelectedPrinter(e.target.value)} disabled={!printers.length}>
                  {printers.map((p) => (
                    <MenuItem key={p.name} value={p.name}>{p.name}{p.isDefault && ' (padrão)'}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Cópias" type="number" size="small" sx={{ flex: 1 }} value={copies}
                  onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                  slotProps={{ htmlInput: { min: 1, max: 99 } }} />
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Checkbox checked={color} onChange={(e) => setColor(e.target.checked)} color="primary" size="small" />}
                    label="Colorida" />
                </Box>
              </Box>

              <Box>
                <FormLabel sx={{ display: 'block', mb: 0.5 }}>Qualidade de impressão</FormLabel>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {([
                    ['draft', 'Rascunho', 'Menor consumo de tinta', '#607d8b'],
                    ['normal', 'Padrão', 'Equilíbrio entre qualidade e performance', '#e4002b'],
                    ['high', 'Alta', 'Qualidade máxima para documentos importantes', '#ff6b00'],
                  ] as [PrintQuality, string, string, string][]).map(([quality, label, hint, accent]) => (
                    <Box
                      key={quality}
                      onClick={() => setPrintQuality(quality)}
                      sx={{
                        flex: 1,
                        cursor: 'pointer',
                        position: 'relative',
                        padding: '12px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: printQuality === quality ? accent : 'rgba(255,255,255,0.08)',
                        bgcolor: printQuality === quality ? `${accent}12` : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: printQuality === quality ? accent : 'rgba(255,255,255,0.18)',
                          bgcolor: printQuality === quality ? `${accent}18` : 'rgba(255,255,255,0.05)',
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          letterSpacing: '0.03em',
                          fontFamily: '"Space Grotesk", sans-serif',
                          color: printQuality === quality ? accent : 'rgba(255,255,255,0.7)',
                        }}
                        >
                        {label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.65rem',
                          color: 'rgba(255,255,255,0.38)',
                          textAlign: 'center',
                          lineHeight: 1.3,
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                        >
                        {hint}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <FormControl>
                <FormLabel sx={{ fontSize: '0.85rem' }}>Frente e verso</FormLabel>
                <RadioGroup row value={duplex} onChange={(e) => setDuplex(e.target.value as DuplexMode)}>
                  <FormControlLabel value="simplex" control={<Radio color="primary" size="small" />} label="Frente" />
                  <FormControlLabel value="longEdge" control={<Radio color="primary" size="small" />} label="Borda longa" />
                  <FormControlLabel value="shortEdge" control={<Radio color="primary" size="small" />} label="Borda curta" />
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel sx={{ fontSize: '0.85rem' }}>Páginas</FormLabel>
                <RadioGroup row value={pageRange} onChange={(e) => setPageRange(e.target.value as 'all' | 'current' | 'custom')}>
                  <FormControlLabel value="all" control={<Radio color="primary" size="small" />} label="Todas" />
                  <FormControlLabel value="current" control={<Radio color="primary" size="small" />} label={`Pág. ${currentPage}`} />
                  <FormControlLabel value="custom" control={<Radio color="primary" size="small" />} label="Personalizado" />
                </RadioGroup>
              </FormControl>
              {pageRange === 'custom' && (
                <TextField label="Ex: 1-3, 5, 7-9" fullWidth size="small" value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                  helperText={`Total: ${totalPages} páginas`} />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">Cancelar</Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={handleSaveAsPdf} disabled={loading} startIcon={<SaveIcon />}>
            Salvar PDF
          </Button>
          <Button variant="contained" color="primary" onClick={handlePrint} disabled={loading || !selectedPrinter}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PrintIcon />}>
            {loading ? 'Enviando...' : 'Imprimir'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}
