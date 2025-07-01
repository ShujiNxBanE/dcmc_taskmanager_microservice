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
}

const statusClientApi = new StatusClientApi();
export default statusClientApi;
