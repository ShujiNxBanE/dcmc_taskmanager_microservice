package com.dcmc.apps.taskmanager.service.mapper;

import com.dcmc.apps.taskmanager.domain.User;
import com.dcmc.apps.taskmanager.domain.WorkGroup;
import com.dcmc.apps.taskmanager.domain.WorkGroupMembership;
import com.dcmc.apps.taskmanager.service.dto.UserDTO;
import com.dcmc.apps.taskmanager.service.dto.WorkGroupDTO;
import com.dcmc.apps.taskmanager.service.dto.WorkGroupMembershipDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link WorkGroupMembership} and its DTO {@link WorkGroupMembershipDTO}.
 */
@Mapper(componentModel = "spring")
public interface WorkGroupMembershipMapper extends EntityMapper<WorkGroupMembershipDTO, WorkGroupMembership> {
    @Mapping(target = "user", source = "user", qualifiedByName = "userLogin")
    @Mapping(target = "workGroup", source = "workGroup", qualifiedByName = "workGroupName")
    WorkGroupMembershipDTO toDto(WorkGroupMembership s);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);

    @Named("workGroupName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    WorkGroupDTO toDtoWorkGroupName(WorkGroup workGroup);
}
