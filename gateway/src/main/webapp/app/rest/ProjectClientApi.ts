import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ProjectDTO, MinimalProjectDTO, ProjectCreateDTO, ProjectUpdateDTO, UserDTO, ProjectAssignUsersDTO } from './dto';

/**
 * Servicio para interactuar con la API de Project.
 * Centraliza las llamadas a la API y mejora la organización del código.
 */
class ProjectClientApi {
  private api: AxiosInstance;

  constructor() {
    // Inicializa la instancia de Axios con la base URL para projects.
    this.api = axios.create({
      baseURL: '/services/taskmanager',
    });
  }

  /**
   * Obtiene los proyectos asignados al usuario actual.
   * @returns {Promise<AxiosResponse<ProjectDTO[]>>} Una promesa con la respuesta de la API.
   */
  public getAssignedProjects(): Promise<AxiosResponse<ProjectDTO[]>> {
    return this.api.get<ProjectDTO[]>('/api/projects/assigned');
  }

  /**
   * Obtiene los proyectos creados por el usuario actual.
   * @returns {Promise<AxiosResponse<MinimalProjectDTO[]>>} Una promesa con la respuesta de la API.
   */
  public getMyCreatedProjects(): Promise<AxiosResponse<MinimalProjectDTO[]>> {
    return this.api.get<MinimalProjectDTO[]>('/api/projects/my-created');
  }

  /**
   * Obtiene los proyectos activos de un grupo de trabajo específico.
   * @param workGroupId - El ID del grupo de trabajo.
   * @returns {Promise<AxiosResponse<ProjectDTO[]>>} Una promesa con la respuesta de la API.
   */
  public getActiveProjectsByWorkGroup(workGroupId: number): Promise<AxiosResponse<ProjectDTO[]>> {
    return this.api.get<ProjectDTO[]>(`/api/projects/in-work-group/${workGroupId}`);
  }

  /**
   * Obtiene todos los proyectos activos.
   * @returns {Promise<AxiosResponse<ProjectDTO[]>>} Una promesa con la respuesta de la API.
   */
  public getAllActiveProjects(): Promise<AxiosResponse<ProjectDTO[]>> {
    return this.api.get<ProjectDTO[]>('/api/projects/active');
  }

  /**
   * Crea un nuevo proyecto en un grupo de trabajo específico.
   * @param workGroupId - El ID del grupo de trabajo donde se creará el proyecto.
   * @param projectData - Los datos del proyecto a crear.
   * @returns {Promise<AxiosResponse<ProjectDTO>>} Una promesa con la respuesta de la API.
   */
  public createProject(workGroupId: number, projectData: ProjectCreateDTO): Promise<AxiosResponse<ProjectDTO>> {
    return this.api.post<ProjectDTO>(`/api/projects/create-in/work-group/${workGroupId}`, projectData);
  }

  /**
   * Actualiza un proyecto existente.
   * @param projectId - El ID del proyecto a actualizar.
   * @param projectData - Los datos del proyecto a actualizar.
   * @returns {Promise<AxiosResponse<ProjectDTO>>} Una promesa con la respuesta de la API.
   */
  public updateProject(projectId: number, projectData: ProjectUpdateDTO): Promise<AxiosResponse<ProjectDTO>> {
    return this.api.post<ProjectDTO>(`/api/projects/${projectId}/update`, projectData);
  }

  /**
   * Elimina un proyecto (marca como inactivo).
   * @param projectId - El ID del proyecto a eliminar.
   * @returns {Promise<AxiosResponse<void>>} Una promesa con la respuesta de la API.
   */
  public deleteProject(projectId: number): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/api/projects/${projectId}/delete`);
  }

  /**
   * Obtiene los detalles de un proyecto específico.
   * @param projectId - El ID del proyecto.
   * @returns {Promise<AxiosResponse<ProjectDTO>>} Una promesa con la respuesta de la API.
   */
  public getProject(projectId: number): Promise<AxiosResponse<ProjectDTO>> {
    return this.api.get<ProjectDTO>(`/api/projects/${projectId}`);
  }

  /**
   * Obtiene los usuarios asignados a un proyecto específico.
   * @param projectId - El ID del proyecto.
   * @returns {Promise<AxiosResponse<UserDTO[]>>} Una promesa con la respuesta de la API.
   */
  public getAssignedUsers(projectId: number): Promise<AxiosResponse<UserDTO[]>> {
    return this.api.get<UserDTO[]>(`/api/projects/${projectId}/assigned-users`);
  }

  /**
   * Asigna usuarios a un proyecto específico.
   * @param projectId - El ID del proyecto.
   * @param assignUsersData - Los datos de usuarios a asignar.
   * @returns {Promise<AxiosResponse<void>>} Una promesa con la respuesta de la API.
   */
  public assignUsersToProject(projectId: number, assignUsersData: ProjectAssignUsersDTO): Promise<AxiosResponse<void>> {
    return this.api.post<void>(`/api/projects/${projectId}/assign-users`, assignUsersData);
  }

  /**
   * Desasigna un usuario de un proyecto específico.
   * @param projectId - El ID del proyecto.
   * @param userId - El ID/login del usuario a desasignar.
   * @returns {Promise<AxiosResponse<void>>} Una promesa con la respuesta de la API.
   */
  public unassignUserFromProject(projectId: number, userId: string): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/api/projects/${projectId}/unassign/${userId}`);
  }

  // Aquí puedes añadir más métodos en el futuro
}

// Exporta una única instancia del servicio (patrón Singleton)
const projectClientApi = new ProjectClientApi();

export default projectClientApi;
