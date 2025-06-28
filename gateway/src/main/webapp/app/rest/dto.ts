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
