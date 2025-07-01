import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TaskSimpleDTO, TaskCreateDTO, TaskUpdateDTO } from './dto';

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

  /**
   * Crea una nueva tarea en un proyecto y grupo de trabajo específico.
   * @param groupId - ID del grupo de trabajo
   * @param projectId - ID del proyecto
   * @param data - Datos de la tarea a crear
   */
  public createTask(groupId: number, projectId: number, data: TaskCreateDTO): Promise<AxiosResponse<any>> {
    return this.api.post(`/api/tasks/work-group/${groupId}/project/${projectId}/create-task`, data);
  }

  /**
   * Actualiza una tarea existente (solo el creador puede hacerlo).
   * @param taskId - ID de la tarea
   * @param data - Datos a actualizar
   */
  public updateTask(taskId: number, data: TaskUpdateDTO): Promise<AxiosResponse<any>> {
    return this.api.post(`/api/tasks/${taskId}/update`, data);
  }

  // Aquí puedes añadir más métodos en el futuro
}

// Exporta una única instancia del servicio (patrón Singleton)
const taskClientApi = new TaskClientApi();

export default taskClientApi;
