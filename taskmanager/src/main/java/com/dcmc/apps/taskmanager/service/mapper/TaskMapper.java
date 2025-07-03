package com.dcmc.apps.taskmanager.service.mapper;

import com.dcmc.apps.taskmanager.domain.Project;
import com.dcmc.apps.taskmanager.domain.Task;
import com.dcmc.apps.taskmanager.domain.User;
import com.dcmc.apps.taskmanager.domain.WorkGroup;
import com.dcmc.apps.taskmanager.service.dto.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Task} and its DTO {@link TaskDTO}.
 */
@Mapper(componentModel = "spring")
public interface TaskMapper extends EntityMapper<TaskDTO, Task> {
    @Mapping(target = "creator", source = "creator", qualifiedByName = "userLogin")
    @Mapping(target = "workGroup", source = "workGroup", qualifiedByName = "workGroupName")
    @Mapping(target = "assignedTos", source = "assignedTos", qualifiedByName = "userLoginSet")
    @Mapping(target = "parentProject", source = "parentProject", qualifiedByName = "projectId")
    @Mapping(target = "priorityName", source = "priorityEntity.name")
    @Mapping(target = "statusName", source = "statusEntity.name")
    TaskDTO toDto(Task s);

    @Mapping(target = "removeAssignedTo", ignore = true)
    Task toEntity(TaskDTO taskDTO);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);

    @Mapping(target = "creatorLogin", source = "creator.login")
    @Mapping(target = "workGroupId", source = "workGroup.id")
    @Mapping(target = "priorityName", source = "priorityEntity.name")
    @Mapping(target = "statusName", source = "statusEntity.name")
    TaskSimpleDTO toSimpleDto(Task task);


    List<TaskSimpleDTO> toSimpleDto(List<Task> tasks);

    @Mapping(target = "creatorLogin", source = "creator.login")
    @Mapping(target = "workGroup", source = "workGroup", qualifiedByName = "workGroupName")
    @Mapping(target = "assignedTos", source = "assignedTos", qualifiedByName = "userLoginSet")
    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "priorityName", source = "priorityEntity.name")
    @Mapping(target = "statusName", source = "statusEntity.name")
    TaskDetailsDTO toDetailsDto(Task task);

    @Named("userLoginSet")
    default Set<UserDTO> toDtoUserLoginSet(Set<User> user) {
        return user.stream().map(this::toDtoUserLogin).collect(Collectors.toSet());
    }

    @Named("workGroupName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    WorkGroupDTO toDtoWorkGroupName(WorkGroup workGroup);

    @Named("projectId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ProjectDTO toDtoProjectId(Project project);
}
