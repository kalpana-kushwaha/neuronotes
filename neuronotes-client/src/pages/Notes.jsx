import { useEffect, useState } from 'react';
import { Container, Typography, Grid } from '@mui/material';
import NoteForm from '../components/NoteForm';
import NoteCard from '../components/NoteCard';
import axios from '../api/axios';
import { useLocation } from 'react-router-dom';


const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [summaries, setSummaries] = useState({});
  const location = useLocation();
  const expandNoteId = location.state?.expandNoteId;


  // Fetch all notes
  const fetchNotes = async () => {
    try {
      const response = await axios.get('/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // Delete a note
  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      const updatedSummaries = { ...summaries };
      delete updatedSummaries[id];
      setSummaries(updatedSummaries);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Add a new note
  const handleAddNote = (note) => {
    setNotes((prev) => [note, ...prev]);
  };

  // Summarize a note
  const handleSummarizeNote = async (id) => {
    try {
      const res = await axios.post(`/summarize/${id}`);
      setSummaries((prev) => ({ ...prev, [id]: res.data.summary }));
    } catch (error) {
      console.error('Failed to summarize note:', error);
    }
  };

  // Auto-tag a note
  const handleAutoTag = async (id) => {
    try {
      const res = await axios.post(`/tag/${id}`);
      const newTags = res.data.tags;

      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? {
                ...note,
                tags: Array.from(new Set([...(note.tags || []), ...newTags])),
              }
            : note
        )
      );
    } catch (error) {
      console.error('Failed to auto-tag note:', error);
    }
  };

  // Action handler (used in NoteCard)
  const handleNoteAction = async (action, id) => {
    if (action === 'summarize') {
      await handleSummarizeNote(id);
    } else if (action === 'tag') {
      await handleAutoTag(id);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Notes
      </Typography>

      <NoteForm onAddNote={handleAddNote} />

      <Grid container spacing={2}>
        {notes.map((note) => (
          <Grid item xs={12} md={6} lg={4} key={note.id}>
            <NoteCard
              note={{
                ...note,
                summary: summaries[note.id] || null,
              }}
              onDelete={handleDeleteNote}
              onUpdate={handleNoteAction}
              defaultExpanded={note.id === expandNoteId}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Notes;
