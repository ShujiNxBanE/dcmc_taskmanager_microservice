// rest/WorkGroupClientApi.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { WorkGroupDTO, UserGroupViewDTO } from './dto';

/**
 * Servicio para interactuar con la API de WorkGroup.
 * Centraliza las llamadas a la API y mejora la organización del código.
 */
class WorkGroupClientApi {
  private api: AxiosInstance;

  constructor() {
    // Inicializa la instancia de Axios con la base URL para work-groups.
    this.api = axios.create({
      baseURL: '/services/taskmanager',
    });
  }

  /**
   * Obtiene la lista de grupos de trabajo.
   * @returns {Promise<AxiosResponse<WorkGroupDTO[]>>} Una promesa con la respuesta de la API.
   */
  public getAllWorkGroups(): Promise<AxiosResponse<WorkGroupDTO[]>> {
    // La ruta es '/' porque la baseURL ya termina en /api/work-groups
    return this.api.get<WorkGroupDTO[]>('/api/work-groups');
  }

  /**
   * Obtiene los grupos de trabajo activos del usuario actual.
   * @returns {Promise<AxiosResponse<UserGroupViewDTO[]>>} Una promesa con la respuesta de la API.
   */
  public getMyActiveGroups(): Promise<AxiosResponse<UserGroupViewDTO[]>> {
    return this.api.get<UserGroupViewDTO[]>('/api/work-group-memberships/my-active-groups');
  }

  /**
   * Crea un nuevo grupo de trabajo.
   * @param workGroupDTO - Los datos del grupo de trabajo a crear.
   * @returns {Promise<AxiosResponse<WorkGroupDTO>>} Una promesa con la respuesta de la API.
   */
  public createWorkGroup(workGroupDTO: WorkGroupDTO): Promise<AxiosResponse<WorkGroupDTO>> {
    return this.api.post<WorkGroupDTO>('/api/work-groups/create-group', workGroupDTO);
  }

  // Aquí puedes añadir más métodos en el futuro (update, delete, etc.)
}

// Exporta una única instancia del servicio (patrón Singleton)
const workGroupClientApi = new WorkGroupClientApi();

export default workGroupClientApi;
