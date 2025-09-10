import { ApiResponse } from '@/types/global';
import axios, { AxiosResponse } from 'axios';

export class sellerService {
  // TODO: Implement service methods
  
  static async getData(): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.get('/api/data');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default sellerService;