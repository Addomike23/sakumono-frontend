import axiosClient from "./axiosClient";

export const heroApi = {
  getHeroMessages: async () => {
    try {
      const response = await axiosClient.get('/hero');
      console.log('Raw API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching hero messages:', error);
      return {
        success: false,
        message: null
      };
    }
  }
};