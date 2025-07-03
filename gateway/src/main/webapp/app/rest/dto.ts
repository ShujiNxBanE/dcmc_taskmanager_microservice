// rest/dto.ts

export interface WorkGroupDTO {
  id?: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UserGroupViewDTO {
  groupId?: number;
  groupName: string;
  groupDescription?: string;
  isActive?: boolean;
  isInGroup?: boolean;
  role?: string;
}

export interface ProjectCreateDTO {
  title: string;
  description?: string;
}

export interface ProjectUpdateDTO {
  title: string;
  description?: string;
}

export interface ProjectAssignUsersDTO {
  userIds: string[];
}

export interface MinimalProjectDTO {
  id?: number;
  title: string;
  description: string;
  creatorId: string;
  workGroupId: number;
}

export interface ProjectDTO {
  id: number;
  title: string;
  description: string;
  creator: UserDTO;
  workGroup: WorkGroupDTO;
  members: UserDTO[];
}

export interface UserDTO {
  id: number;
  login: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface PriorityDTO {
  id?: number;
  name: string;
  isHidden?: boolean;
}

export interface TaskSimpleDTO {
  id?: number;
  title: string;
  description?: string;
  priorityName?: string;
  statusName?: string;
  createTime?: string;
  updateTime?: string;
  archived?: boolean;
  creatorLogin?: string;
  workGroupId?: number;
}

export interface TaskDetailsDTO {
  id?: number;
  title: string;
  description?: string;
  priorityName?: string;
  statusName?: string;
  createTime?: string;
  updateTime?: string;
  archived?: boolean;
  creatorLogin?: string;
  workGroupId?: number;
  projectId?: number;
  assignedTos?: UserDTO[];
}

export interface TaskCreateDTO {
  title: string;
  description?: string;
  priorityId: number;
  statusId: number;
}

export interface StatusDTO {
  id: number;
  name: string;
}

export interface TaskUpdateDTO {
  title: string;
  description?: string;
  priorityId: number;
  statusId: number;
}

export interface CommentDTO {
  id?: number;
  content: string;
  createdDate?: string;
  creatorLogin?: string;
  projectId?: number;
  taskId?: number;
}
