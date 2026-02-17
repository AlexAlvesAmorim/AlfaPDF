import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  CircularProgress,
  Alert,
} from '@mui/material';

import Grid2 from '@mui/material/Grid2';

import type { PrintOptions } from '@/shared/types';

interface Printer {
  name: string;
  isDefault?: boolean;
}

export type DuplexMode = 'simplex' | 'longEdge' | 'shortEdge';

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  onPrint: (options: PrintOptions) => void;
  currentPage: number;
  totalPages: number;
}

export default function PrintDialog({
  open,
  onClose,
  onPrint,
  currentPage,
  totalPages,
}: PrintDialogProps) {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState(true);
  const [duplex, setDuplex] = useState<DuplexMode>('simplex');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !window.electronAPI?.getPrinters) return;

    let mounted = true;

    setLoading(true);
    setError(null);

    window.electronAPI
      .getPrinters()
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
      .catch((err: unknown) => {
        if (mounted) setError('Erro ao carregar lista de impressoras.');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [open]);

  const handlePrint = () => {
    if (!selectedPrinter) return setError('Selecione uma impressora.');
    if (copies < 1 || copies > 999)
      return setError('Número de cópias deve estar entre 1 e 999.');

    const options: PrintOptions = {
      printerName: selectedPrinter,
      copies,
      color,
      duplex,
      silent: false,
      printBackground: true,
    };

    setLoading(true);
    onPrint(options);

    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configurações de Impressão</DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Grid2 container justifyContent="center" alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Grid2>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Grid2 container spacing={3}>
            <Grid2 xs={12}>
              <FormControl fullWidth>
                <InputLabel id="printer-select-label">Impressora</InputLabel>
                <Select
                  labelId="printer-select-label"
                  value={selectedPrinter}
                  label="Impressora"
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  disabled={!printers.length}
                >
                  {printers.map((printer) => (
                    <MenuItem key={printer.name} value={printer.name}>
                      {printer.name}
                      {printer.isDefault && ' (padrão)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 xs={6}>
              <TextField
                label="Cópias"
                type="number"
                fullWidth
                value={copies}
                onChange={(e) =>
                  setCopies(Math.max(1, Math.min(999, Number(e.target.value))))
                }
                inputProps={{ min: 1, max: 999 }}
                helperText="1 a 999 cópias"
              />
            </Grid2>

            <Grid2 xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={color}
                    onChange={(e) => setColor(e.target.checked)}
                  />
                }
                label="Impressão colorida"
              />
            </Grid2>

            <Grid2 xs={12}>
              <FormControl>
                <FormLabel id="duplex-group-label">Frente e verso</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="duplex-group-label"
                  value={duplex}
                  onChange={(e) => setDuplex(e.target.value as DuplexMode)}
                >
                  <FormControlLabel
                    value="simplex"
                    control={<Radio />}
                    label="Apenas frente"
                  />
                  <FormControlLabel
                    value="longEdge"
                    control={<Radio />}
                    label="Frente e verso (lado longo)"
                  />
                  <FormControlLabel
                    value="shortEdge"
                    control={<Radio />}
                    label="Frente e verso (lado curto)"
                  />
                </RadioGroup>
              </FormControl>
            </Grid2>

            <Grid2 xs={12}>
              <Alert severity="info">
                Atualmente imprimindo página {currentPage} de {totalPages}.
              </Alert>
            </Grid2>
          </Grid2>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handlePrint}
          disabled={loading || !selectedPrinter}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          {loading ? 'Enviando...' : 'Imprimir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}