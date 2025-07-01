package com.dcmc.apps.taskmanager.service;

import com.dcmc.apps.taskmanager.domain.Status;
import com.dcmc.apps.taskmanager.repository.StatusRepository;
import com.dcmc.apps.taskmanager.service.dto.StatusDTO;
import com.dcmc.apps.taskmanager.service.mapper.StatusMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.dcmc.apps.taskmanager.domain.Status}.
 */
@Service
@Transactional
public class StatusService {

    private static final Logger LOG = LoggerFactory.getLogger(StatusService.class);

    private final StatusRepository statusRepository;
    private final StatusMapper statusMapper;
    private final SecurityUtilsService securityUtilsService;

    public StatusService(StatusRepository statusRepository, StatusMapper statusMapper, SecurityUtilsService securityUtilsService) {
        this.statusRepository = statusRepository;
        this.statusMapper = statusMapper;
        this.securityUtilsService = securityUtilsService;
    }

    public StatusDTO save(StatusDTO statusDTO) {
        LOG.debug("Request to save Status : {}", statusDTO);
        Status status = statusMapper.toEntity(statusDTO);
        status = statusRepository.save(status);
        return statusMapper.toDto(status);
    }

    public StatusDTO update(StatusDTO statusDTO) {
        LOG.debug("Request to update Status : {}", statusDTO);
        Status status = statusMapper.toEntity(statusDTO);
        status = statusRepository.save(status);
        return statusMapper.toDto(status);
    }

    public Optional<StatusDTO> partialUpdate(StatusDTO statusDTO) {
        LOG.debug("Request to partially update Status : {}", statusDTO);
        return statusRepository
            .findById(statusDTO.getId())
            .map(existingStatus -> {
                statusMapper.partialUpdate(existingStatus, statusDTO);
                return existingStatus;
            })
            .map(statusRepository::save)
            .map(statusMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<StatusDTO> findAll() {
        LOG.debug("Request to get all Statuses");
        return statusRepository.findAll()
            .stream()
            .map(statusMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public Optional<StatusDTO> findOne(Long id) {
        LOG.debug("Request to get Status : {}", id);
        return statusRepository.findById(id).map(statusMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Status : {}", id);
        statusRepository.deleteById(id);
    }

}

