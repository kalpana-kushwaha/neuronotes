import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Chip,
  Stack,
  Divider,
  Box,
  CircularProgress,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ViewNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get('/notes');
        const match = res.data.find((n) => n.id === parseInt(id));
        setNote(match);
      } catch (err) {
        console.error('Failed to load note:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/notes/${note.id}`);
      navigate('/notes');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleSummarize = async () => {
    try {
      const res = await axios.post(`/summarize/${note.id}`);
      alert('Summary: ' + res.data.summary);
    } catch (err) {
      console.error('Failed to summarize:', err);
    }
  };

  const handleAutoTag = async () => {
    try {
      const res = await axios.post(`/tag/${note.id}`);
      setNote({ ...note, tags: res.data.tags });
    } catch (err) {
      console.error('Failed to tag:', err);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('note-view');
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${note.title}.pdf`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!note) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography variant="h6">Note not found.</Typography>
      </Container>
    );
  }

  const parsedTags = typeof note.tags === 'string' ? JSON.parse(note.tags) : note.tags;

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{note.title}</Typography>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Summarize">
            <IconButton color="primary" onClick={handleSummarize}>
              <SummarizeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Auto Tag">
            <IconButton color="secondary" onClick={handleAutoTag}>
              <AutoAwesomeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export to PDF">
            <IconButton onClick={handleExportPDF}>
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit">
            <IconButton onClick={() => navigate(`/edit/${note.id}`)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Typography variant="caption" color="textSecondary">
        Created on {new Date(note.created_at).toLocaleString()}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box id="note-view">
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </Box>

      {parsedTags.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Tags:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {parsedTags.map((tag, i) => (
              <Chip key={i} label={tag} />
            ))}
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default ViewNote;
