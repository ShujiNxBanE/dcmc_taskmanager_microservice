package com.dcmc.apps.taskmanager.service.mapper;

import com.dcmc.apps.taskmanager.domain.WorkGroup;
import com.dcmc.apps.taskmanager.service.dto.WorkGroupDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link WorkGroup} and its DTO {@link WorkGroupDTO}.
 */
@Mapper(componentModel = "spring")
public interface WorkGroupMapper extends EntityMapper<WorkGroupDTO, WorkGroup> {}
