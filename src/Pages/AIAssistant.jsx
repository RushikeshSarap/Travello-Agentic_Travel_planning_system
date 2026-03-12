import React, { useState } from 'react';
import { Box, Button, Input, VStack, Heading, Text, Textarea, Spinner, useToast } from '@chakra-ui/react';
import axios from 'axios';

const AIAssistant = () => {
    const [input, setInput] = useState({
        destination: '',
        days: 3,
        budget: 500,
        interests: ''
    });
    const [itinerary, setItinerary] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const generatePlan = async () => {
        setLoading(true);
        try {
            const interestsArray = input.interests.split(',').map(i => i.trim());
            const response = await axios.post('http://localhost:5000/api/ai/generate-itinerary', {
                ...input,
                interests: interestsArray
            });
            setItinerary(response.data.itinerary);
        } catch (error) {
            toast({ title: "AI Generation failed", status: "error", duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="800px" m="auto" mt="50px" p="10">
            <Heading mb="10" textAlign="center">AI Travel Assistant</Heading>
            <VStack spacing="5" mb="10">
                <Input placeholder="Where do you want to go?" value={input.destination} onChange={(e) => setInput({...input, destination: e.target.value})} />
                <Box display="flex" gap="4" w="full">
                    <Input placeholder="Days" type="number" value={input.days} onChange={(e) => setInput({...input, days: parseInt(e.target.value)})} />
                    <Input placeholder="Budget ($)" type="number" value={input.budget} onChange={(e) => setInput({...input, budget: parseInt(e.target.value)})} />
                </Box>
                <Input placeholder="Interests (e.g. beaches, food, adventure)" value={input.interests} onChange={(e) => setInput({...input, interests: e.target.value})} />
                <Button colorScheme="purple" w="full" onClick={generatePlan} isLoading={loading}>Generate AI Itinerary</Button>
            </VStack>

            {loading && <Spinner m="auto" display="block" size="xl" />}
            
            {itinerary && (
                <Box p="6" border="1px solid #eee" borderRadius="lg" bg="gray.50">
                    <Heading size="md" mb="4">Your Custom Trip Plan</Heading>
                    <Text whiteSpace="pre-wrap">{itinerary}</Text>
                    <Button mt="4" colorScheme="blue">Save to Trip</Button>
                </Box>
            )}
        </Box>
    );
};

export default AIAssistant;
