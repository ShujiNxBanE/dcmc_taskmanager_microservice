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

export interface MinimalProjectDTO {
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
