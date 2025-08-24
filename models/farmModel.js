// models/farmModel.js - Farm data storage and operations

// Sample database (in a real app, use a proper database)
const farmLocations = [
    { id: 1, name: 'North Farm', lat: 37.7749, lng: -122.4194, userId: 1 },
    { id: 2, name: 'South Orchard', lat: 34.0522, lng: -118.2437, userId: 1 },
  ];
  
  // Get farm by ID
  const getFarmById = (farmId) => {
    return farmLocations.find(farm => farm.id === farmId);
  };
  
  // Get farms by user ID
  const getFarmsByUserId = (userId) => {
    return farmLocations.filter(farm => farm.userId === userId);
  };
  
  // Create a new farm
  const createFarm = (farmData) => {
    const newFarm = {
      id: farmLocations.length + 1,
      name: farmData.name,
      lat: farmData.lat,
      lng: farmData.lng,
      userId: farmData.userId
    };
    
    farmLocations.push(newFarm);
    return newFarm;
  };
  
  module.exports = {
    getFarmById,
    getFarmsByUserId,
    createFarm
  };