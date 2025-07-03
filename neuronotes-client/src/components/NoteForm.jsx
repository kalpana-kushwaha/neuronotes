import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Stack,
  Chip,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import axios from '../api/axios'; // Make sure this path is correct based on your structure

const NoteForm = ({ onAddNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setTags((prevTags) => [...prevTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const response = await axios.post('/notes', {
        title,
        content,
        tags,
      });

      if (onAddNote) {
        onAddNote(response.data); // Inform parent to update UI
      }

      // Reset form
      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to save note. Try again.');
    }
  };

  return (
    <Card sx={{ mb: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Create a New Note
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <TextField
            label="Tags (press Enter)"
            fullWidth
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          <Stack direction="row" spacing={1}>
            {tags.map((tag, index) => (
              <Chip key={index} label={tag} />
            ))}
          </Stack>
          <Button type="submit" variant="contained" size="large">
            Save Note
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NoteForm;
