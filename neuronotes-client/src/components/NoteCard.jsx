import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  CardActions,
  Button,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SummarizeIcon from '@mui/icons-material/Summarize';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const NoteCard = ({ note, onDelete, onUpdate }) => {
  const parsedTags =
    typeof note.tags === 'string' ? JSON.parse(note.tags) : note.tags || [];

  const navigate = useNavigate();

  const handleExportPDF = async () => {
    const element = document.getElementById(`note-${note.id}`);
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${note.title}.pdf`);
  };

  return (
    <Card sx={{ mb: 2 }} id={`note-${note.id}`}>
      <CardContent
        sx={{ cursor: 'pointer' }}
        onClick={() => navigate(`/note/${note.id}`)}
      >
        <Typography variant="h6">{note.title}</Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            maxHeight: '5.5rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {note.content.length > 180
            ? note.content.slice(0, 180) + '...'
            : note.content}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {parsedTags.map((tag, i) => (
            <Chip key={i} label={tag} size="small" />
          ))}
        </Stack>
      </CardContent>

      <CardActions>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => onDelete(note.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Summarize">
          <IconButton color="primary" onClick={() => onUpdate('summarize', note.id)}>
            <SummarizeIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Auto Tag">
          <IconButton color="secondary" onClick={() => onUpdate('tag', note.id)}>
            <AutoAwesomeIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export to PDF">
          <IconButton onClick={handleExportPDF}>
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>

        <Button onClick={() => navigate(`/edit/${note.id}`)}>Edit</Button>

        <Tooltip title="View Full">
          <IconButton onClick={() => navigate(`/note/${note.id}`)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default NoteCard;
