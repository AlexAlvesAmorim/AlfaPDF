import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Select, MenuItem, FormControl, InputLabel,
  TextField, Checkbox, FormControlLabel, RadioGroup,
  Radio, FormLabel, CircularProgress, Alert, Grid,
  ThemeProvider, createTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import type { PrintOptions } from '@/shared/types';

interface Printer { name: string; isDefault?: boolean }
export type DuplexMode = 'simplex' | 'longEdge' | 'shortEdge';

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  onPrint: (options: PrintOptions) => void;
  onSaveAsPdf: (options: PrintOptions) => void;
  currentPage: number;
  totalPages: number;
}

/**
 * Tema MUI escuro consistente com o design system do ALFA PDF.
 * Usa as mesmas cores definidas em theme.css para não criar dissonância visual.
 */
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#e4002b',
      light: '#ff2d55',
      dark: '#b20022',
    },
    background: {
      paper: '#1a1a1a',
      default: '#121212',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#b8b8b8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    error: {
      main: '#ff4444',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: '1px solid rgba(228, 0, 43, 0.2)',
          boxShadow: '0 24px 72px rgba(0,0,0,0.8), 0 0 40px rgba(228,0,43,0.1)',
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
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
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
          '& fieldset': {
            borderColor: 'rgba(255,255,255,0.15)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(228,0,43,0.4)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#e4002b',
          },
        },
      },
    },
  },
});

export default function PrintDialog({ open, onClose, onPrint, onSaveAsPdf, currentPage, totalPages }: PrintDialogProps) {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState(true);
  const [duplex, setDuplex] = useState<DuplexMode>('simplex');
  const [pageRange, setPageRange] = useState<'all' | 'current' | 'custom'>('all');
  const [customPages, setCustomPages] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <DialogTitle>Configurações de Impressão / Exportação</DialogTitle>
        <DialogContent dividers>
          {loading && (
            <Grid container justifyContent="center" alignItems="center" sx={{ py: 6 }}>
              <CircularProgress color="primary" />
            </Grid>
          )}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {!loading && (
            <Grid container spacing={3}>
              {/* Impressora */}
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel id="printer-label">Impressora</InputLabel>
                  <Select labelId="printer-label" value={selectedPrinter} label="Impressora"
                    onChange={(e) => setSelectedPrinter(e.target.value)} disabled={!printers.length}>
                    {printers.map((p) => (
                      <MenuItem key={p.name} value={p.name}>{p.name}{p.isDefault && ' (padrão)'}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Cópias */}
              <Grid size={6}>
                <TextField label="Cópias" type="number" fullWidth value={copies}
                  onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                  slotProps={{ htmlInput: { min: 1, max: 99 } }} />
              </Grid>
              {/* Cor */}
              <Grid size={6}>
                <FormControlLabel sx={{ mt: 1 }}
                  control={<Checkbox checked={color} onChange={(e) => setColor(e.target.checked)} color="primary" />}
                  label="Impressão colorida" />
              </Grid>
              {/* Frente e verso */}
              <Grid size={12}>
                <FormControl>
                  <FormLabel>Frente e verso</FormLabel>
                  <RadioGroup row value={duplex} onChange={(e) => setDuplex(e.target.value as DuplexMode)}>
                    <FormControlLabel value="simplex"   control={<Radio color="primary" />} label="Apenas frente" />
                    <FormControlLabel value="longEdge"  control={<Radio color="primary" />} label="Frente e verso (borda longa)" />
                    <FormControlLabel value="shortEdge" control={<Radio color="primary" />} label="Frente e verso (borda curta)" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {/* Intervalo de páginas */}
              <Grid size={12}>
                <FormControl>
                  <FormLabel>Páginas</FormLabel>
                  <RadioGroup row value={pageRange} onChange={(e) => setPageRange(e.target.value as 'all' | 'current' | 'custom')}>
                    <FormControlLabel value="all"     control={<Radio color="primary" />} label="Todas" />
                    <FormControlLabel value="current" control={<Radio color="primary" />} label={`Página atual (${currentPage})`} />
                    <FormControlLabel value="custom"  control={<Radio color="primary" />} label="Personalizado" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {pageRange === 'custom' && (
                <Grid size={12}>
                  <TextField label="Páginas (ex: 1-3, 5, 7-9)" fullWidth value={customPages}
                    onChange={(e) => setCustomPages(e.target.value)}
                    helperText={`Total disponível: ${totalPages} páginas`} />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading} color="inherit">Cancelar</Button>
          <Button variant="outlined" onClick={handleSaveAsPdf} disabled={loading} startIcon={<SaveIcon />}>
            Salvar como PDF
          </Button>
          <Button variant="contained" color="primary" onClick={handlePrint} disabled={loading || !selectedPrinter}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PrintIcon />}>
            {loading ? 'Enviando...' : 'Imprimir'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
