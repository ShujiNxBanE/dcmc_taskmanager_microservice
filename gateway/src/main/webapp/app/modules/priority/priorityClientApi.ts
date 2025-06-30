import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PriorityDTO } from 'app/rest/dto';

class PriorityClientApi {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/services/taskmanager',
    });
  }

  public getAllPriorities(): Promise<AxiosResponse<PriorityDTO[]>> {
    return this.api.get<PriorityDTO[]>('/api/priorities');
  }

  public getPriority(id: number): Promise<AxiosResponse<PriorityDTO>> {
    return this.api.get<PriorityDTO>(`/api/priorities/${id}`);
  }

  public createPriority(priority: Omit<PriorityDTO, 'id'>): Promise<AxiosResponse<PriorityDTO>> {
    return this.api.post<PriorityDTO>('/api/priorities', priority);
  }

  public updatePriority(id: number, priority: PriorityDTO): Promise<AxiosResponse<PriorityDTO>> {
    return this.api.put<PriorityDTO>(`/api/priorities/${id}`, priority);
  }

  public deletePriority(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/api/priorities/${id}`);
  }

  public hidePriority(id: number): Promise<AxiosResponse<PriorityDTO>> {
    return this.api.post<PriorityDTO>(`/api/priorities/${id}/hide`);
  }

  public unhidePriority(id: number): Promise<AxiosResponse<PriorityDTO>> {
    return this.api.post<PriorityDTO>(`/api/priorities/${id}/unhide`);
  }
}

const priorityClientApi = new PriorityClientApi();
export default priorityClientApi;
