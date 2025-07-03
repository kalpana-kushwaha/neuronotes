  // pages/Search.jsx
  import { useState } from 'react';
  import { TextField, Container, Typography, Grid } from '@mui/material';
  import NoteCard from '../components/NoteCard';
  import axios from '../api/axios';

  const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
      const value = e.target.value;
      setQuery(value);

      if (value.trim().length === 0) {
        setResults([]);
        return;
      }

      try {
        const res = await axios.get(`/notes/search?q=${value}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      }
    };

    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Search Notes
        </Typography>

        <TextField
          fullWidth
          label="Search by title or content"
          value={query}
          onChange={handleSearch}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={2}>
          {results.map((note) => (
            <Grid item xs={12} md={6} lg={4} key={note.id}>
              <NoteCard note={note} onDelete={() => {}} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  };

  export default Search;
