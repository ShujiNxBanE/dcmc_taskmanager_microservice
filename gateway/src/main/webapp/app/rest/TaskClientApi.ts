import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TaskSimpleDTO } from './dto';

/**
 * Servicio para interactuar con la API de Task.
 * Centraliza las llamadas a la API y mejora la organización del código.
 */
class TaskClientApi {
  private api: AxiosInstance;

  constructor() {
    // Inicializa la instancia de Axios con la base URL para tasks.
    this.api = axios.create({
      baseURL: '/services/taskmanager',
    });
  }

  /**
   * Obtiene todas las tareas (solo admin).
   * @returns {Promise<AxiosResponse<TaskSimpleDTO[]>>}
   */
  public getAllTasks(): Promise<AxiosResponse<TaskSimpleDTO[]>> {
    return this.api.get<TaskSimpleDTO[]>('/api/tasks');
  }

  /**
   * Obtiene las tareas asignadas al usuario actual.
   * @returns {Promise<AxiosResponse<TaskSimpleDTO[]>>}
   */
  public getAssignedTasks(): Promise<AxiosResponse<TaskSimpleDTO[]>> {
    return this.api.get<TaskSimpleDTO[]>('/api/tasks/assigned');
  }

  /**
   * Obtiene las tareas creadas por el usuario actual.
   * @returns {Promise<AxiosResponse<TaskSimpleDTO[]>>}
   */
  public getCreatedTasks(): Promise<AxiosResponse<TaskSimpleDTO[]>> {
    return this.api.get<TaskSimpleDTO[]>('/api/tasks/created');
  }

  // Aquí puedes añadir más métodos en el futuro
}

// Exporta una única instancia del servicio (patrón Singleton)
const taskClientApi = new TaskClientApi();

export default taskClientApi;
