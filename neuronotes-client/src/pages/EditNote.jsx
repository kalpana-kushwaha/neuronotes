import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get('/notes');
        const note = res.data.find((n) => n.id === parseInt(id));
        if (note) {
          setTitle(note.title);
          setContent(note.content);
          setTags(note.tags || []);
        }
      } catch (err) {
        console.error('Failed to load note:', err);
        alert('Note not found.');
        navigate('/notes');
      }
    };

    fetchNote();
  }, [id, navigate]); // ✅ Added navigate here

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      if (!tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      }
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToDelete));
  };

  const handleSave = async () => {
    try {
      await axios.put(`/notes/${id}`, {
        title: title.trim(),
        content: content.trim(),
        tags,
      });
      navigate('/notes');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save note.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        ✏️ Edit Note
      </Typography>

      <TextField
        label="Title"
        fullWidth
        autoFocus
        sx={{ mb: 3 }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <TextField
        label="Content"
        fullWidth
        multiline
        minRows={6}
        sx={{ mb: 3 }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <TextField
        label="Add Tag (press Enter)"
        fullWidth
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleAddTag}
      />

      <Stack direction="row" spacing={1} sx={{ my: 2, flexWrap: 'wrap' }}>
        {tags.map((tag, i) => (
          <Chip key={i} label={tag} onDelete={() => handleDeleteTag(tag)} />
        ))}
      </Stack>

      <Button variant="contained" onClick={handleSave}>
        Save Changes
      </Button>
    </Container>
  );
};

export default EditNote;
