import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ProjectDTO, MinimalProjectDTO } from './dto';

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

  // Aquí puedes añadir más métodos en el futuro
}

// Exporta una única instancia del servicio (patrón Singleton)
const projectClientApi = new ProjectClientApi();

export default projectClientApi;
