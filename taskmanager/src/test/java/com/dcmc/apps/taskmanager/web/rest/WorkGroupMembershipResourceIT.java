package com.dcmc.apps.taskmanager.web.rest;

import static com.dcmc.apps.taskmanager.domain.WorkGroupMembershipAsserts.*;
import static com.dcmc.apps.taskmanager.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.dcmc.apps.taskmanager.IntegrationTest;
import com.dcmc.apps.taskmanager.domain.WorkGroupMembership;
import com.dcmc.apps.taskmanager.domain.enumeration.GroupRole;
import com.dcmc.apps.taskmanager.repository.UserRepository;
import com.dcmc.apps.taskmanager.repository.WorkGroupMembershipRepository;
import com.dcmc.apps.taskmanager.service.WorkGroupMembershipService;
import com.dcmc.apps.taskmanager.service.dto.WorkGroupMembershipDTO;
import com.dcmc.apps.taskmanager.service.mapper.WorkGroupMembershipMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link WorkGroupMembershipResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class WorkGroupMembershipResourceIT {

    private static final GroupRole DEFAULT_ROLE = GroupRole.OWNER;
    private static final GroupRole UPDATED_ROLE = GroupRole.MODERATOR;

    private static final String ENTITY_API_URL = "/api/work-group-memberships";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private WorkGroupMembershipRepository workGroupMembershipRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private WorkGroupMembershipRepository workGroupMembershipRepositoryMock;

    @Autowired
    private WorkGroupMembershipMapper workGroupMembershipMapper;

    @Mock
    private WorkGroupMembershipService workGroupMembershipServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restWorkGroupMembershipMockMvc;

    private WorkGroupMembership workGroupMembership;

    private WorkGroupMembership insertedWorkGroupMembership;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static WorkGroupMembership createEntity() {
        return new WorkGroupMembership().role(DEFAULT_ROLE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static WorkGroupMembership createUpdatedEntity() {
        return new WorkGroupMembership().role(UPDATED_ROLE);
    }

    @BeforeEach
    void initTest() {
        workGroupMembership = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedWorkGroupMembership != null) {
            workGroupMembershipRepository.delete(insertedWorkGroupMembership);
            insertedWorkGroupMembership = null;
        }
        userRepository.deleteAll();
    }

    @Test
    @Transactional
    void createWorkGroupMembership() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the WorkGroupMembership
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(workGroupMembership);
        var returnedWorkGroupMembershipDTO = om.readValue(
            restWorkGroupMembershipMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(workGroupMembershipDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            WorkGroupMembershipDTO.class
        );

        // Validate the WorkGroupMembership in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedWorkGroupMembership = workGroupMembershipMapper.toEntity(returnedWorkGroupMembershipDTO);
        assertWorkGroupMembershipUpdatableFieldsEquals(
            returnedWorkGroupMembership,
            getPersistedWorkGroupMembership(returnedWorkGroupMembership)
        );

        insertedWorkGroupMembership = returnedWorkGroupMembership;
    }

    @Test
    @Transactional
    void createWorkGroupMembershipWithExistingId() throws Exception {
        // Create the WorkGroupMembership with an existing ID
        workGroupMembership.setId(1L);
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(workGroupMembership);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restWorkGroupMembershipMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(workGroupMembershipDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the WorkGroupMembership in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkRoleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        workGroupMembership.setRole(null);

        // Create the WorkGroupMembership, which fails.
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(workGroupMembership);

        restWorkGroupMembershipMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(workGroupMembershipDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllWorkGroupMemberships() throws Exception {
        // Initialize the database
        insertedWorkGroupMembership = workGroupMembershipRepository.saveAndFlush(workGroupMembership);

        // Get all the workGroupMembershipList
        restWorkGroupMembershipMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(workGroupMembership.getId().intValue())))
            .andExpect(jsonPath("$.[*].role").value(hasItem(DEFAULT_ROLE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllWorkGroupMembershipsWithEagerRelationshipsIsEnabled() throws Exception {
        when(workGroupMembershipServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restWorkGroupMembershipMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(workGroupMembershipServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllWorkGroupMembershipsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(workGroupMembershipServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restWorkGroupMembershipMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(workGroupMembershipRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getWorkGroupMembership() throws Exception {
        // Initialize the database
        insertedWorkGroupMembership = workGroupMembershipRepository.saveAndFlush(workGroupMembership);

        // Get the workGroupMembership
        restWorkGroupMembershipMockMvc
            .perform(get(ENTITY_API_URL_ID, workGroupMembership.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(workGroupMembership.getId().intValue()))
            .andExpect(jsonPath("$.role").value(DEFAULT_ROLE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingWorkGroupMembership() throws Exception {
        // Get the workGroupMembership
        restWorkGroupMembershipMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingWorkGroupMembership() throws Exception {
        // Initialize the database
        insertedWorkGroupMembership = workGroupMembershipRepository.saveAndFlush(workGroupMembership);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the workGroupMembership
        WorkGroupMembership updatedWorkGroupMembership = workGroupMembershipRepository.findById(workGroupMembership.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedWorkGroupMembership are not directly saved in db
        em.detach(updatedWorkGroupMembership);
        updatedWorkGroupMembership.role(UPDATED_ROLE);
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(updatedWorkGroupMembership);

        restWorkGroupMembershipMockMvc
            .perform(
                put(ENTITY_API_URL_ID, workGroupMembershipDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(workGroupMembershipDTO))
            )
            .andExpect(status().isOk());

        // Validate the WorkGroupMembership in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedWorkGroupMembershipToMatchAllProperties(updatedWorkGroupMembership);
    }

    @Test
    @Transactional
    void putNonExistingWorkGroupMembership() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        workGroupMembership.setId(longCount.incrementAndGet());

        // Create the WorkGroupMembership
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(workGroupMembership);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restWorkGroupMembershipMockMvc
            .perform(
                put(ENTITY_API_URL_ID, workGroupMembershipDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(workGroupMembershipDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the WorkGroupMembership in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchWorkGroupMembership() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        workGroupMembership.setId(longCount.incrementAndGet());

        // Create the WorkGroupMembership
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(workGroupMembership);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restWorkGroupMembershipMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(workGroupMembershipDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the WorkGroupMembership in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamWorkGroupMembership() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        workGroupMembership.setId(longCount.incrementAndGet());

        // Create the WorkGroupMembership
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(workGroupMembership);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restWorkGroupMembershipMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(workGroupMembershipDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the WorkGroupMembership in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateWorkGroupMembershipWithPatch() throws Exception {
        // Initialize the database
        insertedWorkGroupMembership = workGroupMembershipRepository.saveAndFlush(workGroupMembership);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the workGroupMembership using partial update
        WorkGroupMembership partialUpdatedWorkGroupMembership = new WorkGroupMembership();
        partialUpdatedWorkGroupMembership.setId(workGroupMembership.getId());

        restWorkGroupMembershipMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedWorkGroupMembership.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedWorkGroupMembership))
            )
            .andExpect(status().isOk());

        // Validate the WorkGroupMembership in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertWorkGroupMembershipUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedWorkGroupMembership, workGroupMembership),
            getPersistedWorkGroupMembership(workGroupMembership)
        );
    }

    @Test
    @Transactional
    void fullUpdateWorkGroupMembershipWithPatch() throws Exception {
        // Initialize the database
        insertedWorkGroupMembership = workGroupMembershipRepository.saveAndFlush(workGroupMembership);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the workGroupMembership using partial update
        WorkGroupMembership partialUpdatedWorkGroupMembership = new WorkGroupMembership();
        partialUpdatedWorkGroupMembership.setId(workGroupMembership.getId());

        partialUpdatedWorkGroupMembership.role(UPDATED_ROLE);

        restWorkGroupMembershipMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedWorkGroupMembership.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedWorkGroupMembership))
            )
            .andExpect(status().isOk());

        // Validate the WorkGroupMembership in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertWorkGroupMembershipUpdatableFieldsEquals(
            partialUpdatedWorkGroupMembership,
            getPersistedWorkGroupMembership(partialUpdatedWorkGroupMembership)
        );
    }

    @Test
    @Transactional
    void patchNonExistingWorkGroupMembership() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        workGroupMembership.setId(longCount.incrementAndGet());

        // Create the WorkGroupMembership
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(workGroupMembership);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restWorkGroupMembershipMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, workGroupMembershipDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(workGroupMembershipDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the WorkGroupMembership in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchWorkGroupMembership() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        workGroupMembership.setId(longCount.incrementAndGet());

        // Create the WorkGroupMembership
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(workGroupMembership);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restWorkGroupMembershipMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(workGroupMembershipDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the WorkGroupMembership in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamWorkGroupMembership() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        workGroupMembership.setId(longCount.incrementAndGet());

        // Create the WorkGroupMembership
        WorkGroupMembershipDTO workGroupMembershipDTO = workGroupMembershipMapper.toDto(workGroupMembership);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restWorkGroupMembershipMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(workGroupMembershipDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the WorkGroupMembership in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteWorkGroupMembership() throws Exception {
        // Initialize the database
        insertedWorkGroupMembership = workGroupMembershipRepository.saveAndFlush(workGroupMembership);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the workGroupMembership
        restWorkGroupMembershipMockMvc
            .perform(delete(ENTITY_API_URL_ID, workGroupMembership.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return workGroupMembershipRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected WorkGroupMembership getPersistedWorkGroupMembership(WorkGroupMembership workGroupMembership) {
        return workGroupMembershipRepository.findById(workGroupMembership.getId()).orElseThrow();
    }

    protected void assertPersistedWorkGroupMembershipToMatchAllProperties(WorkGroupMembership expectedWorkGroupMembership) {
        assertWorkGroupMembershipAllPropertiesEquals(
            expectedWorkGroupMembership,
            getPersistedWorkGroupMembership(expectedWorkGroupMembership)
        );
    }

    protected void assertPersistedWorkGroupMembershipToMatchUpdatableProperties(WorkGroupMembership expectedWorkGroupMembership) {
        assertWorkGroupMembershipAllUpdatablePropertiesEquals(
            expectedWorkGroupMembership,
            getPersistedWorkGroupMembership(expectedWorkGroupMembership)
        );
    }
}
