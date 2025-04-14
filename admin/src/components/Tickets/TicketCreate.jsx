import React, { useState, useEffect } from 'react';
import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  NumberInput,
  required,
  useNotify,
  useRedirect,
  FormDataConsumer,
  useGetOne
} from 'react-admin';
import { Box, Typography, Grid, Button } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';

const TicketCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [showtimeId, setShowtimeId] = useState(null);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { data: showtime } = useGetOne(
    'showtimes',
    { id: showtimeId },
    { enabled: !!showtimeId }
  );
  
  const fetchSeats = async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/seats/showtime/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch seats');
      }
      const data = await response.json();
      setSeats(data);
    } catch (error) {
      notify(`Error: ${error.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (showtimeId) {
      fetchSeats(showtimeId);
    }
  }, [showtimeId]);
  
  const handleShowtimeChange = (event) => {
    setShowtimeId(event.target.value);
    setSelectedSeatId(null);
  };
  
  const handleSeatClick = (seatId) => {
    setSelectedSeatId(seatId);
  };
  
  const onSuccess = () => {
    notify('Ticket created successfully');
    redirect('list', 'tickets');
  };
  
  const validateForm = (values) => {
    const errors = {};
    if (!values.userId) errors.userId = 'User is required';
    if (!values.showtimeId) errors.showtimeId = 'Showtime is required';
    if (!values.seatId) errors.seatId = 'Seat is required';
    if (!values.price) errors.price = 'Price is required';
    return errors;
  };
  
  // Group seats by row for better display
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});
  
  return (
    <Create title="Create Ticket" mutationOptions={{ onSuccess }}>
      <SimpleForm validate={validateForm}>
        <ReferenceInput source="userId" reference="users" validate={required()}>
          <SelectInput optionText="name" />
        </ReferenceInput>
        
        <ReferenceInput 
          source="showtimeId" 
          reference="showtimes" 
          validate={required()}
          onChange={handleShowtimeChange}
        >
          <SelectInput 
            optionText={(record) => 
              record ? `${record.movie?.title} (${new Date(record.startTime).toLocaleString()})` : ''
            } 
          />
        </ReferenceInput>
        
        <FormDataConsumer>
          {({ formData }) => (
            formData.showtimeId && (
              <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Select a Seat:
                </Typography>
                {loading ? (
                  <Typography>Loading seats...</Typography>
                ) : (
                  <Box mt={2}>
                    {Object.keys(seatsByRow).sort().map(row => (
                      <Box key={row} display="flex" mb={1}>
                        <Typography sx={{ width: 30, display: 'flex', alignItems: 'center' }}>
                          {row}
                        </Typography>
                        <Box display="flex" flexWrap="wrap">
                          {seatsByRow[row]
                            .sort((a, b) => parseInt(a.column) - parseInt(b.column))
                            .map(seat => (
                              <Button
                                key={seat.id}
                                variant={selectedSeatId === seat.id ? "contained" : "outlined"}
                                color={seat.status === 'AVAILABLE' ? "primary" : "error"}
                                disabled={seat.status !== 'AVAILABLE'}
                                onClick={() => handleSeatClick(seat.id)}
                                sx={{ 
                                  minWidth: 40, 
                                  height: 40, 
                                  m: 0.5, 
                                  p: 0 
                                }}
                              >
                                {seat.column}
                              </Button>
                            ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )
          )}
        </FormDataConsumer>
        
        <input 
          type="hidden" 
          name="seatId" 
          value={selectedSeatId || ''} 
          required
        />
        
        <NumberInput 
          source="price" 
          validate={required()} 
          defaultValue={showtime?.movie?.price || 0}
        />
      </SimpleForm>
    </Create>
  );
};

export default TicketCreate;