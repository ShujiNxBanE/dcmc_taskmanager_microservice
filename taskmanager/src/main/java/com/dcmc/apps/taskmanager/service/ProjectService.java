package com.dcmc.apps.taskmanager.service;

import com.dcmc.apps.taskmanager.domain.Project;
import com.dcmc.apps.taskmanager.domain.User;
import com.dcmc.apps.taskmanager.domain.WorkGroup;
import com.dcmc.apps.taskmanager.repository.ProjectRepository;
import com.dcmc.apps.taskmanager.repository.UserRepository;
import com.dcmc.apps.taskmanager.repository.WorkGroupRepository;
import com.dcmc.apps.taskmanager.service.dto.ProjectCreateDTO;
import com.dcmc.apps.taskmanager.service.dto.ProjectDTO;
import com.dcmc.apps.taskmanager.service.dto.ProjectUpdateDTO;
import com.dcmc.apps.taskmanager.service.mapper.ProjectMapper;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.dcmc.apps.taskmanager.domain.Project}.
 */
@Service
@Transactional
public class ProjectService {

    private static final Logger LOG = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;

    private final ProjectMapper projectMapper;

    private final UserRepository userRepository;

    private final WorkGroupRepository workGroupRepository;

    private final SecurityUtilsService securityUtilsService;

    public ProjectService(ProjectRepository projectRepository, ProjectMapper projectMapper
    , UserRepository userRepository, WorkGroupRepository workGroupRepository,
                          SecurityUtilsService securityUtilsService) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
        this.userRepository = userRepository;
        this.workGroupRepository = workGroupRepository;
        this.securityUtilsService = securityUtilsService;
    }

    /**
     * Save a project.
     *
     * @param projectDTO the entity to save.
     * @return the persisted entity.
     */
    public ProjectDTO save(ProjectDTO projectDTO) {
        LOG.debug("Request to save Project : {}", projectDTO);
        Project project = projectMapper.toEntity(projectDTO);
        project = projectRepository.save(project);
        return projectMapper.toDto(project);
    }

    /**
     * Update a project.
     *
     * @param projectDTO the entity to save.
     * @return the persisted entity.
     */
    public ProjectDTO update(ProjectDTO projectDTO) {
        LOG.debug("Request to update Project : {}", projectDTO);
        Project project = projectMapper.toEntity(projectDTO);
        project = projectRepository.save(project);
        return projectMapper.toDto(project);
    }

    /**
     * Partially update a project.
     *
     * @param projectDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ProjectDTO> partialUpdate(ProjectDTO projectDTO) {
        LOG.debug("Request to partially update Project : {}", projectDTO);

        return projectRepository
            .findById(projectDTO.getId())
            .map(existingProject -> {
                projectMapper.partialUpdate(existingProject, projectDTO);

                return existingProject;
            })
            .map(projectRepository::save)
            .map(projectMapper::toDto);
    }

    /**
     * Get all the projects with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ProjectDTO> findAllWithEagerRelationships(Pageable pageable) {
        return projectRepository.findAllWithEagerRelationships(pageable).map(projectMapper::toDto);
    }

    /**
     * Get one project by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ProjectDTO> findOne(Long id) {
        LOG.debug("Request to get Project : {}", id);
        return projectRepository.findOneWithEagerRelationships(id).map(projectMapper::toDto);
    }

    /**
     * Delete the project by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Project : {}", id);
        projectRepository.deleteById(id);
    }

    @Transactional
    public ProjectDTO createProject(ProjectCreateDTO dto, Long workGroupId) {
        Project project = new Project();
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setActive(true);

        // Obtener el usuario autenticado y asignarlo como creador
        String currentUserLogin = securityUtilsService.getCurrentUser();
        User creator = userRepository.findOneByLogin(currentUserLogin)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
        project.setCreator(creator);

        // Asignar grupo de trabajo
        WorkGroup workGroup = workGroupRepository.findById(workGroupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "WorkGroup not found"));
        project.setWorkGroup(workGroup);

        Project saved = projectRepository.save(project);
        return projectMapper.toDto(saved);
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectUpdateDTO dto) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        // Verificar que el usuario autenticado es el creador del proyecto
        String currentLogin = securityUtilsService.getCurrentUser();
        if (!project.getCreator().getLogin().equals(currentLogin)) {
            throw new AccessDeniedException("Only the creator can update this project.");
        }

        // Actualizar los campos permitidos
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());

        Project updated = projectRepository.save(project);
        return projectMapper.toDto(updated);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        String currentUserLogin = securityUtilsService.getCurrentUser();
        if (!project.getCreator().getLogin().equals(currentUserLogin)) {
            throw new AccessDeniedException("Only the creator can delete this project.");
        }

        if (!Boolean.TRUE.equals(project.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project is already deleted.");
        }

        project.setActive(false);
        projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> findActiveProjectsByWorkGroup(Long workGroupId) {
        List<Project> projects = projectRepository.findByWorkGroup_IdAndIsActiveTrue(workGroupId);
        return projects.stream().map(projectMapper::toDto).toList();
    }

}
