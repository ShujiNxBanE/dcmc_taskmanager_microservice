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

  /**
   * Actualiza un grupo de trabajo existente.
   * @param id - El ID del grupo de trabajo a actualizar.
   * @param workGroupDTO - Los datos actualizados del grupo de trabajo.
   * @returns {Promise<AxiosResponse<WorkGroupDTO>>} Una promesa con la respuesta de la API.
   */
  public updateWorkGroup(id: number, workGroupDTO: WorkGroupDTO): Promise<AxiosResponse<WorkGroupDTO>> {
    return this.api.post<WorkGroupDTO>(`/api/work-groups/${id}`, workGroupDTO);
  }

  /**
   * Elimina un grupo de trabajo.
   * @param id - El ID del grupo de trabajo a eliminar.
   * @returns {Promise<AxiosResponse<void>>} Una promesa con la respuesta de la API.
   */
  public deleteWorkGroup(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/api/work-groups/${id}`);
  }

  /**
   * Obtiene los miembros activos de un grupo de trabajo.
   * @param groupId - El ID del grupo de trabajo.
   * @returns {Promise<AxiosResponse<GroupMemberDTO[]>>} Una promesa con la respuesta de la API.
   */
  public getActiveMembers(groupId: number): Promise<AxiosResponse<any[]>> {
    return this.api.get<any[]>(`/api/work-group-memberships/${groupId}/active-members`);
  }

  /**
   * Añade un miembro a un grupo de trabajo.
   * @param groupId - El ID del grupo de trabajo.
   * @param username - El nombre de usuario a añadir.
   * @returns {Promise<AxiosResponse<void>>} Una promesa con la respuesta de la API.
   */
  public addMember(groupId: number, username: string): Promise<AxiosResponse<void>> {
    return this.api.post<void>(`/api/work-groups/${groupId}/add-member`, { username });
  }

  /**
   * Elimina un miembro de un grupo de trabajo.
   * @param groupId - El ID del grupo de trabajo.
   * @param username - El nombre de usuario a eliminar.
   * @returns {Promise<AxiosResponse<void>>}
   */
  public removeMember(groupId: number, username: string): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/api/work-groups/${groupId}/remove-member`, { data: { username } });
  }

  // Aquí puedes añadir más métodos en el futuro
}

// Exporta una única instancia del servicio (patrón Singleton)
const workGroupClientApi = new WorkGroupClientApi();

export default workGroupClientApi;
