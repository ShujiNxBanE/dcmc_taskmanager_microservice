import React from 'react';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import ProjectAdmin from './project-admin';
import ProjectUser from './project-user';
import './project-modal.scss';

const Project = () => {
  const authorities = useAppSelector(state => state.authentication.account?.authorities ?? []);
  const isAdmin = hasAnyAuthority(authorities, [AUTHORITIES.ADMIN]);

  return <>{isAdmin ? <ProjectAdmin /> : <ProjectUser />}</>;
};

export default Project;
