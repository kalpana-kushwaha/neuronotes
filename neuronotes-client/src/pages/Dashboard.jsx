import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get('/notes');
        const allNotes = res.data;
        setNotes(allNotes);

        // Count tag frequency
        const tagFrequency = {};
        allNotes.forEach((note) => {
          const tags = typeof note.tags === 'string' ? JSON.parse(note.tags) : note.tags;
          tags.forEach((tag) => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
          });
        });

        const sortedTags = Object.entries(tagFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag]) => tag);

        setTopTags(sortedTags);
      } catch (err) {
        console.error('Failed to fetch notes:', err);
      }
    };

    fetchNotes();
  }, []);

  const recentNotes = notes
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        📊 Dashboard
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">📝 Total Notes: {notes.length}</Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🏷️ Top Tags
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {topTags.length > 0 ? (
            topTags.map((tag, i) => <Chip key={i} label={tag} color="primary" />)
          ) : (
            <Typography>No tags yet.</Typography>
          )}
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6" gutterBottom>
          🕒 Recent Notes
        </Typography>
        <Paper variant="outlined">
          <List>
            {recentNotes.map((note) => (
              <ListItem
                key={note.id}
                button
                onClick={() => navigate(`/note/${note.id}`)}

              >
                <ListItemText
                  primary={note.title}
                  secondary={new Date(note.created_at).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
