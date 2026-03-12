import React, { useState, useEffect } from 'react';
import { Box, Heading, Grid, GridItem, VStack, Text, Input, Button, useToast, Divider, List, ListItem } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
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
                const response = await apiClient.get(`/trips/${tripId}`);
                setTrip(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await apiClient.get(`/collab/trips/${tripId}/comments`);
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

    const handleAddActivity = async (dayNumber) => {
        const activity = prompt("Enter activity location:");
        if (!activity) return;
        const time = prompt("Enter time (HH:MM):", "09:00");
        
        try {
            await apiClient.post(`/trips/${tripId}/activity`, {
                day_number: dayNumber,
                location: activity,
                time: time,
                description: "Manual entry"
            });
            toast({ title: "Activity added", status: "success" });
            // Refresh trip details
            const response = await apiClient.get(`/trips/${tripId}`);
            setTrip(response.data);
        } catch (error) {
            toast({ title: "Failed to add activity", status: "error" });
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await apiClient.post(`/collab/trips/${tripId}/comments`, { content: newComment });
            setNewComment('');
            const response = await apiClient.get(`/collab/trips/${tripId}/comments`);
            setComments(response.data);
        } catch (error) {
            toast({ title: "Failed to add comment", status: "error" });
        }
    };

    const handleInvite = async () => {
        try {
            await apiClient.post(`/trips/${tripId}/invite`, { trip_id: parseInt(tripId), username: inviteUser });
            toast({ title: "Invite sent!", status: "success" });
            setInviteUser('');
        } catch (error) {
            toast({ title: "User not found", status: "error" });
        }
    };

    if (!trip) return <Box p="10">Loading Trip Workspace...</Box>;

    return (
        <Box p="5">
            <Heading mb="5" color="teal.600">{trip.name} - {trip.destination}</Heading>
            <Text mb="5" fontSize="lg" fontWeight="semibold">
                {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
            </Text>
            
            <Grid templateColumns="repeat(3, 1fr)" gap={8}>
                <GridItem colSpan={2}>
                    <Box height="400px" border="1px solid #ddd" borderRadius="xl" overflow="hidden" mb="8" boxShadow="sm">
                        <Map coordinates={{ lat: 20.5937, lng: 78.9629 }} zoom={5} />
                    </Box>
                    
                    <VStack align="stretch" spacing="6">
                        <Heading size="md">Itinerary</Heading>
                        {trip.itineraries && trip.itineraries.length > 0 ? (
                            trip.itineraries.map((day) => (
                                <Box key={day.id} p="5" border="1px solid #eee" borderRadius="lg" bg="white" boxShadow="xs">
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb="4">
                                        <Heading size="sm" color="blue.500">Day {day.day_number}</Heading>
                                        <Button size="xs" colorScheme="blue" variant="ghost" onClick={() => handleAddActivity(day.day_number)}>+ Add Activity</Button>
                                    </Box>
                                    <List spacing={3}>
                                        {day.activities && day.activities.map(act => (
                                            <ListItem key={act.id} p="3" bg="gray.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.300">
                                                <Box display="flex" gap="4">
                                                    <Text fontWeight="bold" minW="60px">{act.time}</Text>
                                                    <Box>
                                                        <Text fontWeight="semibold">{act.location}</Text>
                                                        <Text fontSize="sm" color="gray.600">{act.description}</Text>
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            ))
                        ) : (
                            <Box p="10" textAlign="center" border="2px dashed #eee" borderRadius="xl">
                                <Text color="gray.500">No activities planned yet.</Text>
                                <Button mt="4" colorScheme="purple" size="sm" onClick={() => window.location.href='/ai-assistant'}>Ask AI for a Plan</Button>
                            </Box>
                        )}
                        <Button mt="4" colorScheme="blue" variant="outline" onClick={() => handleAddActivity(trip.itineraries?.length + 1 || 1)}>Add Day</Button>
                        <Button mt="2" colorScheme="orange" variant="solid" onClick={() => window.location.href=`/things?trip_id=${tripId}`}>Explore Destinations on Map</Button>
                    </VStack>
                </GridItem>
                
                <GridItem colSpan={1}>
                    <VStack align="stretch" spacing="6">
                        <Box p="6" border="1px solid #eee" borderRadius="xl" bg="white" boxShadow="sm">
                            <Heading size="sm" mb="4">Collaborators</Heading>
                            <Box display="flex" gap="2" mb="4">
                                <Input placeholder="Invite by username" value={inviteUser} onChange={(e) => setInviteUser(e.target.value)} size="sm" borderRadius="md" />
                                <Button colorScheme="teal" size="sm" onClick={handleInvite} px="6">Invite</Button>
                            </Box>
                        </Box>
                        
                        <Box p="6" border="1px solid #eee" borderRadius="xl" bg="white" boxShadow="sm" height="500px" display="flex" flexDirection="column">
                            <Heading size="sm" mb="4">Group Discussion</Heading>
                            <VStack flex="1" overflowY="auto" align="stretch" spacing="4" mb="4" px="1">
                                {comments.map(c => (
                                    <Box key={c.id} alignSelf={c.username === 'You' ? 'flex-end' : 'flex-start'} maxW="90%">
                                        <Text fontSize="xs" color="gray.500" mb="1" textAlign={c.username === 'You' ? 'right' : 'left'}>
                                            {c.username} • {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        <Box p="3" bg={c.username === 'You' ? 'blue.500' : 'gray.100'} color={c.username === 'You' ? 'white' : 'black'} borderRadius="lg" borderTopRightRadius={c.username === 'You' ? '0' : 'lg'} borderTopLeftRadius={c.username === 'You' ? 'lg' : '0'}>
                                            <Text fontSize="sm">{c.content}</Text>
                                        </Box>
                                    </Box>
                                ))}
                            </VStack>
                            <Box display="flex" gap="2">
                                <Input placeholder="Message group..." value={newComment} onChange={(e) => setNewComment(e.target.value)} size="md" borderRadius="full" />
                                <Button colorScheme="blue" size="md" onClick={handleAddComment} borderRadius="full">Send</Button>
                            </Box>
                        </Box>
                    </VStack>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default TripWorkspace;
