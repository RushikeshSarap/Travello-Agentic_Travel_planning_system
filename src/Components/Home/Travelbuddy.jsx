import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Grid,
  GridItem,
  Button,
  Avatar,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import apiClient from "../../api/apiClient";


function TravelBuddyMatching() {
  const [userProfiles, setUserProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    destination: "",
    interest: "",
    budget: "",
    preference: "",
  });
  const toast = useToast();

  useEffect(() => {
    const fetchBuddies = async () => {
      try {
        const response = await apiClient.get('/discovery/buddies');
        setUserProfiles(response.data);
        setMatches(response.data);
      } catch (error) {
        console.error("Error fetching buddies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuddies();
  }, []);

  const handleMatchSearch = () => {
    const filteredMatches = userProfiles.filter((profile) => {
      const destinationMatch =
        filters.destination === "" ||
        profile.destination
          .toLowerCase()
          .includes(filters.destination.toLowerCase());
      const interestMatch =
        filters.interest === "" ||
        profile.interests
          .toLowerCase()
          .includes(filters.interest.toLowerCase());
      const budgetMatch =
        filters.budget === "" || profile.budget === filters.budget;
      const preferenceMatch = 
        filters.preference === "" || profile.preference === filters.preference;

      return destinationMatch && interestMatch && budgetMatch && preferenceMatch;
    });

    if (filteredMatches.length === 0) {
      toast({
        title: "No matches found.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }

    setMatches(filteredMatches);
  };

  return (
    <Box
      w="85%"
      m="auto"
      p="20px"
      mt="40px"
      bg="#FAF1ED"
      borderRadius="8px"
      color="black"
      marginBottom="100px"
    >
      <Text
        fontWeight="600"
        fontSize="2xl"
        textAlign="center"
        mb="20px"
        color="black"
      >
        Find Your Travel Buddy
      </Text>

      {/* Filter Options */}
      <Box mb="20px">
        <Grid templateColumns="repeat(4, 1fr)" gap={6}>
          <Input
            placeholder="Destination"
            value={filters.destination}
            onChange={(e) =>
              setFilters({ ...filters, destination: e.target.value })
            }
          />
          <Select
            placeholder="Interest"
            value={filters.interest}
            onChange={(e) =>
              setFilters({ ...filters, interest: e.target.value })
            }
          >
            <option value="Sightseeing">Sightseeing</option>
            <option value="Food">Food</option>
            <option value="Culture">Culture</option>
            <option value="Hiking">Hiking</option>
          </Select>
          <Select
            placeholder="Budget"
            value={filters.budget}
            onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
          >
            <option value="₹20,000">₹20,000</option>
            <option value="₹40,000">₹40,000</option>
            <option value="₹60,000">₹60,000</option>
          </Select>
          <Select
            placeholder="Travel Buddy Preference"
            value={filters.preference}
            onChange={(e) => setFilters({ ...filters, preference: e.target.value })}
          >
            <option value="male">Male Buddy</option>
            <option value="female">Female Buddy</option>
            <option value="any">Any</option>
          </Select>
        </Grid>
        <Button
          mt="40px"
          fontWeight="700"
          color="white"
          bg="black"
          rounded="25px"
          p="23px 23px"
          onClick={handleMatchSearch}
        >
          Find Matches
        </Button>
      </Box>

      {/* Display Matches */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {matches.map((profile) => (
          <GridItem
            key={profile.id}
            bg="white"
            p="20px"
            borderRadius="8px"
            boxShadow="md"
          >
            <Avatar src={profile.avatar} size="xl" mb="10px" />
            <Text fontWeight="600" fontSize="lg">
              {profile.name}
            </Text>
            <Text fontSize="md" color="gray.600">
              Destination: {profile.destination}
            </Text>
            <Text fontSize="md" color="gray.600">
              Dates: {profile.dates}
            </Text>
            <Text fontSize="md" color="gray.600">
              Interests: {profile.interests}
            </Text>
            <Text fontSize="md" color="gray.600">
              Budget: {profile.budget}
            </Text>
            <Button
              mt="40px"
              fontWeight="700"
              color="white"
              bg="black"
              rounded="25px"
              p="23px 23px"
              onClick={() => alert("Connection request is sent!")}
            >
              Connect
            </Button>
          </GridItem>
        ))}
      </Grid>

      {/* Default Message */}
      {matches.length === 0 && (
        <Box textAlign="center" mt="40px">
          <Text fontSize="md" color="gray.600">
            No matches found. Please adjust your filters or try again later.
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default TravelBuddyMatching;
