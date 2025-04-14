import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  ReferenceField,
  NumberField,
  useRecordContext,
  Button,
  TabbedShowLayout,
  Tab,
  useShowController,
  useNotify,
  useRedirect
} from 'react-admin';
import { Box, Card, CardContent, Typography, Chip, Grid, Divider } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import MovieIcon from '@mui/icons-material/Movie';
import TheatersIcon from '@mui/icons-material/Theaters';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const TicketTitle = () => {
  const record = useRecordContext();
  return record ? <span>Ticket #{record.id}</span> : null;
};

const statusColors = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error'
};

const TicketShow = () => {
  const { record, isLoading, refetch } = useShowController();
  const notify = useNotify();
  const redirect = useRedirect();
  
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers if needed
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }
      
      notify(`Ticket status updated to ${newStatus}`, { type: 'success' });
      refetch();
    } catch (error) {
      notify(`Error: ${error.message}`, { type: 'error' });
    }
  };
  
  if (isLoading) return null;
  
  return (
    <Show title={<TicketTitle />}>
      <TabbedShowLayout>
        <Tab label="Summary">
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Ticket Status: 
              <Chip 
                label={record?.status} 
                color={statusColors[record?.status]}
                sx={{ ml: 1 }}
              />
            </Typography>
            
            <Box>
              {record?.status === 'PENDING' && (
                <>
                  <Button
                    label="Confirm"
                    onClick={() => handleUpdateStatus(record.id, 'CONFIRMED')}
                    color="primary"
                  >
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    Confirm
                  </Button>
                  <Button
                    label="Cancel"
                    onClick={() => handleUpdateStatus(record.id, 'CANCELLED')}
                    color="error"
                    sx={{ ml: 1 }}
                  >
                    <CancelIcon sx={{ mr: 1 }} />
                    Cancel
                  </Button>
                </>
              )}
              {record?.status === 'CONFIRMED' && (
                <Button
                  label="Complete"
                  onClick={() => handleUpdateStatus(record.id, 'COMPLETED')}
                  color="success"
                >
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  Complete
                </Button>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <MovieIcon /> Movie Details
                  </Typography>
                  <ReferenceField source="showtimeId" reference="showtimes">
                    <TextField source="movie.title" label="Movie Title" />
                  </ReferenceField>
                  <ReferenceField source="showtimeId" reference="showtimes" label="Start Time">
                    <DateField source="startTime" showTime />
                  </ReferenceField>
                  <ReferenceField source="showtimeId" reference="showtimes" label="End Time">
                    <DateField source="endTime" showTime />
                  </ReferenceField>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TheatersIcon /> Venue Information
                  </Typography>
                  <ReferenceField source="showtimeId" reference="showtimes" label="Hall">
                    <TextField source="hall.name" />
                  </ReferenceField>
                  <ReferenceField source="showtimeId" reference="showtimes" label="Cinema">
                    <TextField source="hall.cinema.name" />
                  </ReferenceField>
                  <ReferenceField source="showtimeId" reference="showtimes" label="Address">
                    <TextField source="hall.cinema.address" />
                  </ReferenceField>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <PersonIcon /> Customer Information
                  </Typography>
                  <ReferenceField source="userId" reference="users">
                    <TextField source="name" />
                  </ReferenceField>
                  <ReferenceField source="userId" reference="users" label="Email">
                    <TextField source="email" />
                  </ReferenceField>
                  <ReferenceField source="userId" reference="users" label="Phone">
                    <TextField source="phone" />
                  </ReferenceField>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <EventSeatIcon /> Seat & Payment Details
                  </Typography>
                  <Typography variant="body1">
                    Seat: 
                    <Chip 
                      icon={<EventSeatIcon />} 
                      label={`${record?.seat?.row}${record?.seat?.column}`} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Price: <NumberField source="price" options={{ style: 'currency', currency: 'VND' }} />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Tab>
        
        <Tab label="Payment Information" path="payment">
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PaymentIcon /> Payment Details
              </Typography>
              {record?.payment ? (
                <>
                  <TextField source="payment.id" label="Payment ID" />
                  <NumberField source="payment.amount" options={{ style: 'currency', currency: 'VND' }} />
                  <TextField source="payment.method" label="Payment Method" />
                  <TextField source="payment.status" label="Payment Status" />
                  <DateField source="payment.createdAt" label="Payment Date" showTime />
                </>
              ) : (
                <Typography variant="body1">No payment information available</Typography>
              )}
            </CardContent>
          </Card>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export default TicketShow;