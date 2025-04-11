import { User, QueryParams } from '@/types';
import { apiService } from './api';

class UserService {
  private readonly baseUrl = '/users';

  async getUsers(params?: QueryParams) {
    return apiService.get<User[]>(this.baseUrl, { params });
  }

  async getUserById(id: string) {
    return apiService.get<User>(`${this.baseUrl}/${id}`);
  }

  async createUser(userData: Partial<User>) {
    return apiService.post<User>(this.baseUrl, userData);
  }

  async updateUser(id: string, userData: Partial<User>) {
    return apiService.put<User>(`${this.baseUrl}/${id}`, userData);
  }

  async deleteUser(id: string) {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export const userService = new UserService(); 