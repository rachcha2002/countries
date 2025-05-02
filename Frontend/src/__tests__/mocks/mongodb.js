// Mock for mongodb service
class MongoDBService {
  constructor() {
    this.API_URL = "http://localhost:5000/api";
    this.favorites = ["USA", "CAN"];
  }

  async getFavorites() {
    return this.favorites;
  }

  async toggleFavorite(countryCode) {
    const index = this.favorites.indexOf(countryCode);
    let added = false;

    if (index === -1) {
      this.favorites.push(countryCode);
      added = true;
    } else {
      this.favorites.splice(index, 1);
    }

    return { favorites: [...this.favorites], added };
  }
}

export default new MongoDBService();
