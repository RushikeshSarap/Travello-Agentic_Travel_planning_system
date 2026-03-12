import React, { useState, useEffect } from 'react';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Button, Text, Stat, StatLabel, StatNumber, StatGroup, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const BudgetTracker = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const tripId = query.get('trip_id') || 1; // Default to 1 for now
    
    const [budgetData, setBudgetData] = useState({ total_budget: 0, total_spent: 0, remaining: 0, expenses: [] });
    const [newExpense, setNewExpense] = useState({ item: '', amount: 0, category: 'Travel' });
    const toast = useToast();

    const fetchBudget = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/budget/${tripId}`);
            setBudgetData(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBudget();
    }, [tripId]);

    const handleAddExpense = async () => {
        try {
            await axios.post(`http://localhost:5000/api/budget/${tripId}`, newExpense);
            toast({ title: "Expense added", status: "success" });
            fetchBudget();
            setNewExpense({ item: '', amount: 0, category: 'Travel' });
        } catch (error) {
            toast({ title: "Failed to add expense", status: "error" });
        }
    };

    return (
        <Box p="10" maxW="1000px" m="auto">
            <Heading mb="10">Budget Tracker</Heading>
            
            <StatGroup mb="10" p="6" border="1px solid #eee" borderRadius="lg">
                <Stat>
                    <StatLabel>Total Budget</StatLabel>
                    <StatNumber>${budgetData.total_budget}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Total Spent</StatLabel>
                    <StatNumber color="red.500">${budgetData.total_spent}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Remaining</StatLabel>
                    <StatNumber color="green.500">${budgetData.remaining}</StatNumber>
                </Stat>
            </StatGroup>

            <Box display="flex" gap="4" mb="10">
                <Input placeholder="Expense Item" value={newExpense.item} onChange={(e) => setNewExpense({...newExpense, item: e.target.value})} />
                <Input placeholder="Amount" type="number" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} />
                <Button colorScheme="teal" onClick={handleAddExpense}>Add Expense</Button>
            </Box>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Item</Th>
                        <Th>Category</Th>
                        <Th>Date</Th>
                        <Th isNumeric>Amount</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {budgetData.expenses.map(exp => (
                        <Tr key={exp.id}>
                            <Td>{exp.item}</Td>
                            <Td>{exp.category}</Td>
                            <Td>{new Date(exp.date).toLocaleDateString()}</Td>
                            <Td isNumeric>${exp.amount}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default BudgetTracker;
