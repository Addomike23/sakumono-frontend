import axiosClient from "./axiosClient";

export const heroApi = {
  getHeroMessages: async () => {
    try {
      const response = await axiosClient.get('/hero');
  
      return response.data;
    } catch (error) {
      
      return {
        success: false,
        message: null
      };
    }
  }
};