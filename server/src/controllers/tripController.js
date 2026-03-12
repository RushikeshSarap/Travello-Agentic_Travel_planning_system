import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Trip CRUD
export const getAllTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        OR: [
          { ownerId: req.user.userId },
          { participants: { some: { id: req.user.userId } } }
        ]
      },
      include: {
        destinations: true,
        participants: true,
      },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const createTrip = async (req, res) => {
  const { title, description, startDate, endDate, budget } = req.body;
  try {
    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: parseFloat(budget) || 0,
        ownerId: req.user.userId,
      },
    });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trip', details: error.message });
  }
};

export const getTripById = async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        destinations: { include: { activities: true } },
        participants: true,
        activities: true,
      },
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
};

// Destination Management
export const addDestination = async (req, res) => {
  const { tripId, name, description, location } = req.body;
  try {
    const destination = await prisma.destination.create({
      data: { name, description, location, tripId },
    });
    res.status(201).json(destination);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add destination' });
  }
};

// Activity Management
export const addActivity = async (req, res) => {
  const { tripId, destinationId, title, description, startTime, endTime, cost } = req.body;
  try {
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        cost: parseFloat(cost) || 0,
        tripId,
        destinationId,
      },
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

// Participant Management
export const addParticipant = async (req, res) => {
  const { tripId, email } = req.body;
  try {
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ error: 'User not found' });

    await prisma.trip.update({
      where: { id: tripId },
      data: {
        participants: { connect: { id: userToAdd.id } }
      }
    });
    res.json({ message: 'Participant added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add participant' });
  }
};

// Budget Summary
export const getBudgetSummary = async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { activities: true },
    });
    const totalSpent = trip.activities.reduce((sum, act) => sum + (act.cost || 0), 0);
    res.json({
      budget: trip.budget,
      spent: totalSpent,
      remaining: trip.budget - totalSpent
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget summary' });
  }
};

// Discovery API
export const discoverySearch = async (req, res) => {
  const { query } = req.query;
  // This would typically call an external API like Google Places or TripAdvisor
  // For now, we will provide some interesting curated mock data for "Discovery"
  const destinations = [
    { name: 'Eiffel Tower', location: 'Paris, France', description: 'Iconic iron lattice tower on the Champ de Mars.' },
    { name: 'Louvre Museum', location: 'Paris, France', description: 'World\'s largest art museum and a historic monument.' },
    { name: 'Colosseum', location: 'Rome, Italy', description: 'Oval amphitheatre in the centre of the city of Rome.' }
  ].filter(d => d.name.toLowerCase().includes(query?.toLowerCase() || ''));
  
  res.json(destinations);
};
