import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TaskSimpleDTO, TaskCreateDTO, TaskUpdateDTO, UserDTO } from './dto';

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

  /**
   * Elimina (soft delete) una tarea. Solo el creador puede hacerlo si no está archivada.
   * @param taskId - ID de la tarea
   */
  public deleteTask(taskId: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/api/tasks/${taskId}/delete`);
  }

  /**
   * Obtiene las tareas archivadas activas de un proyecto específico.
   * @param projectId - ID del proyecto
   */
  public getArchivedTasksByProject(projectId: number): Promise<AxiosResponse<TaskSimpleDTO[]>> {
    return this.api.get<TaskSimpleDTO[]>(`/api/tasks/project/${projectId}/archived-tasks`);
  }

  /**
   * Archiva una tarea (solo OWNER o MODERATOR, y solo si está en estado DONE).
   * @param taskId - ID de la tarea
   */
  public archiveTask(taskId: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/api/tasks/${taskId}/archive`);
  }

  /**
   * Desarchiva una tarea (solo OWNER o MODERATOR).
   * @param taskId - ID de la tarea
   */
  public unarchiveTask(taskId: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/api/tasks/${taskId}/unarchive`);
  }

  /**
   * Obtiene los detalles de una tarea específica.
   * @param taskId - ID de la tarea
   */
  public getTaskDetails(taskId: number): Promise<AxiosResponse<TaskSimpleDTO>> {
    return this.api.get<TaskSimpleDTO>(`/api/tasks/${taskId}`);
  }

  /**
   * Obtiene las subtareas de una tarea específica.
   * @param taskId - ID de la tarea padre
   */
  public getSubTasks(taskId: number): Promise<AxiosResponse<TaskSimpleDTO[]>> {
    return this.api.get<TaskSimpleDTO[]>(`/api/tasks/${taskId}/subtasks`);
  }

  /**
   * Obtiene los usuarios asignados a una tarea específica.
   * @param taskId - ID de la tarea
   */
  public getAssignedUsers(taskId: number): Promise<AxiosResponse<UserDTO[]>> {
    return this.api.get<UserDTO[]>(`/api/tasks/${taskId}/assigned-users`);
  }

  /**
   * Asigna usuarios a una tarea en un grupo específico.
   * @param groupId - ID del grupo de trabajo
   * @param taskId - ID de la tarea
   * @param userIds - Array de IDs de usuarios a asignar
   */
  public assignUsersToTask(groupId: number, taskId: number, userIds: string[]): Promise<AxiosResponse<void>> {
    return this.api.post(`/api/tasks/group/${groupId}/assign-member`, {
      taskId,
      userIds,
    });
  }

  /**
   * Crea una subtarea en un grupo, proyecto y tarea padre específicos.
   */
  public createSubTask(groupId: number, projectId: number, parentTaskId: number, data: TaskCreateDTO): Promise<AxiosResponse<any>> {
    return this.api.post(`/api/tasks/work-group/${groupId}/project/${projectId}/parent/${parentTaskId}/create-subtask`, data);
  }

  // Aquí puedes añadir más métodos en el futuro
}

// Exporta una única instancia del servicio (patrón Singleton)
const taskClientApi = new TaskClientApi();

export default taskClientApi;
