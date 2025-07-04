import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { StatusDTO } from './dto';

class StatusClientApi {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/services/taskmanager',
    });
  }

  public getAllStatuses(): Promise<AxiosResponse<StatusDTO[]>> {
    return this.api.get<StatusDTO[]>('/api/statuses');
  }

  public getStatus(id: number): Promise<AxiosResponse<StatusDTO>> {
    return this.api.get<StatusDTO>(`/api/statuses/${id}`);
  }

  public createStatus(statusDTO: StatusDTO): Promise<AxiosResponse<StatusDTO>> {
    return this.api.post<StatusDTO>('/api/statuses', statusDTO);
  }

  public updateStatus(id: number, statusDTO: StatusDTO): Promise<AxiosResponse<StatusDTO>> {
    return this.api.put<StatusDTO>(`/api/statuses/${id}`, statusDTO);
  }

  public deleteStatus(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/api/statuses/${id}`);
  }
}

const statusClientApi = new StatusClientApi();
export default statusClientApi;
