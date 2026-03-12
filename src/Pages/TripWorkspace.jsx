import React, { useState, useEffect } from 'react';
import { Box, Heading, Grid, GridItem, VStack, Text, Input, Button, useToast, Divider, List, ListItem } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Map from '../Components/Thingstodo/Map/Map';

const TripWorkspace = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const tripId = query.get('trip_id');
    
    const [trip, setTrip] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [inviteUser, setInviteUser] = useState('');
    const toast = useToast();

    useEffect(() => {
        const fetchTripDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/trips`);
                const currentTrip = response.data.find(t => t.id === parseInt(tripId));
                setTrip(currentTrip);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/collab/trips/${tripId}/comments`);
                setComments(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        if (tripId) {
            fetchTripDetails();
            fetchComments();
        }
    }, [tripId]);

    const handleAddComment = async () => {
        try {
            await axios.post(`http://localhost:5000/api/collab/trips/${tripId}/comments`, { content: newComment });
            setNewComment('');
            // Refresh comments
            const response = await axios.get(`http://localhost:5000/api/collab/trips/${tripId}/comments`);
            setComments(response.data);
        } catch (error) {
            toast({ title: "Failed to add comment", status: "error" });
        }
    };

    const handleInvite = async () => {
        try {
            await axios.post(`http://localhost:5000/api/trips/${tripId}/invite`, { trip_id: tripId, username: inviteUser });
            toast({ title: "Invite sent!", status: "success" });
            setInviteUser('');
        } catch (error) {
            toast({ title: "User not found", status: "error" });
        }
    };

    const addToCalendar = async () => {
        try {
            await axios.post('http://localhost:5000/api/google/add-to-calendar', { trip_id: tripId });
            toast({ title: "Calendar Sync Requested", description: "Google Calendar API placeholder triggered", status: "info" });
        } catch (error) {
            toast({ title: "Calendar Sync Failed", status: "error" });
        }
    }

    if (!trip) return <Box p="10">Loading Trip Workspace...</Box>;

    return (
        <Box p="5">
            <Heading mb="5">{trip.name} - Workspace</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <GridItem colSpan={2}>
                    <Box height="500px" border="1px solid #ddd" borderRadius="md" mb="5">
                        <Map coordinates={{ lat: 20.5937, lng: 78.9629 }} zoom={5} />
                    </Box>
                    <Box p="5" border="1px solid #ddd" borderRadius="md">
                        <Heading size="md" mb="3">Itinerary</Heading>
                        <Text>Click destinations on map to add to itinerary (Coming Soon)</Text>
                        <Button mt="4" colorScheme="blue" onClick={addToCalendar}>Add trip to Google Calendar</Button>
                    </Box>
                </GridItem>
                <GridItem colSpan={1}>
                    <VStack align="stretch" spacing="5">
                        <Box p="5" border="1px solid #ddd" borderRadius="md">
                            <Heading size="sm" mb="3">Invite Friends</Heading>
                            <Box display="flex" gap="2">
                                <Input placeholder="Username" value={inviteUser} onChange={(e) => setInviteUser(e.target.value)} size="sm" />
                                <Button colorScheme="teal" size="sm" onClick={handleInvite}>Invite</Button>
                            </Box>
                        </Box>
                        <Box p="5" border="1px solid #ddd" borderRadius="md" height="400px" overflowY="auto">
                            <Heading size="sm" mb="3">Discussion</Heading>
                            <List spacing={3} mb="4">
                                {comments.map(c => (
                                    <ListItem key={c.id}>
                                        <Text fontWeight="bold" fontSize="xs">{c.username} - {new Date(c.timestamp).toLocaleTimeString()}</Text>
                                        <Text fontSize="sm">{c.content}</Text>
                                        <Divider mt="2" />
                                    </ListItem>
                                ))}
                            </List>
                            <Box display="flex" gap="2">
                                <Input placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} size="sm" />
                                <Button colorScheme="blue" size="sm" onClick={handleAddComment}>Send</Button>
                            </Box>
                        </Box>
                    </VStack>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default TripWorkspace;
