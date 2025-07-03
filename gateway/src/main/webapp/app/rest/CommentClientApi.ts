import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { CommentDTO } from './dto';

/**
 * Servicio para interactuar con la API de Comment.
 * Centraliza las llamadas a la API y mejora la organización del código.
 */
class CommentClientApi {
  private api: AxiosInstance;

  constructor() {
    // Inicializa la instancia de Axios con la base URL para comments.
    this.api = axios.create({
      baseURL: '/services/taskmanager',
    });
  }

  /**
   * Obtiene todos los comentarios de una tarea específica.
   * @param taskId - ID de la tarea
   */
  public getCommentsByTask(taskId: number): Promise<AxiosResponse<CommentDTO[]>> {
    return this.api.get<CommentDTO[]>(`/api/comments/by-task/${taskId}`);
  }

  /**
   * Crea un nuevo comentario.
   * @param data - Datos del comentario a crear
   */
  public createComment(data: CommentDTO): Promise<AxiosResponse<CommentDTO>> {
    return this.api.post<CommentDTO>('/api/comments', data);
  }

  /**
   * Actualiza un comentario existente.
   * @param commentId - ID del comentario
   * @param data - Datos a actualizar
   */
  public updateComment(commentId: number, data: CommentDTO): Promise<AxiosResponse<CommentDTO>> {
    return this.api.put<CommentDTO>(`/api/comments/${commentId}`, data);
  }

  /**
   * Elimina un comentario.
   * @param commentId - ID del comentario
   */
  public deleteComment(commentId: number): Promise<AxiosResponse<void>> {
    return this.api.delete<void>(`/api/comments/${commentId}`);
  }
}

// Exporta una única instancia del servicio (patrón Singleton)
const commentClientApi = new CommentClientApi();

export default commentClientApi;
