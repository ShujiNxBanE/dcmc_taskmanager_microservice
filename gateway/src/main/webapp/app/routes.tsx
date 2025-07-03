import React from 'react';
import { Route } from 'react-router';

import Loadable from 'react-loadable';

import LoginRedirect from 'app/modules/login/login-redirect';
import Logout from 'app/modules/login/logout';
import Home from 'app/modules/home/home';
import EntitiesRoutes from 'app/entities/routes';
import PrivateRoute from 'app/shared/auth/private-route';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import PageNotFound from 'app/shared/error/page-not-found';
import { AUTHORITIES } from 'app/config/constants';
import WorkGroup from './modules/work-group';
import GroupMembers from './modules/work-group/group-members';
import Project from './modules/project';
import ProjectDetails from './modules/project/project-details';
import Priority from './modules/priority';
import Task from './modules/task';
import TaskDetails from './modules/task/task-details';
import ArchivedTaskDetails from './modules/task/archived-task-details';
import SubTaskDetails from './modules/task/subtask-details';

const loading = <div>loading ...</div>;

const Admin = Loadable({
  loader: () => import(/* webpackChunkName: "administration" */ 'app/modules/administration'),
  loading: () => loading,
});

const AppRoutes = () => {
  return (
    <div className="view-routes">
      <ErrorBoundaryRoutes>
        <Route index element={<Home />} />
        <Route path="logout" element={<Logout />} />
        <Route
          path="admin/*"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.ADMIN]}>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route path="sign-in" element={<LoginRedirect />} />
        <Route
          path="*"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <EntitiesRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path="work-group/*"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <WorkGroup />
            </PrivateRoute>
          }
        />
        <Route
          path="work-group/members/:groupId/:groupName"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <GroupMembers />
            </PrivateRoute>
          }
        />
        <Route
          path="project"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <Project />
            </PrivateRoute>
          }
        />
        <Route
          path="project/:id"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <ProjectDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="priority"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.ADMIN]}>
              <Priority />
            </PrivateRoute>
          }
        />
        <Route
          path="task"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <Task />
            </PrivateRoute>
          }
        />
        <Route
          path="task/:id"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <TaskDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="task/archived/:id"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <ArchivedTaskDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="task/subtask/:id"
          element={
            <PrivateRoute hasAnyAuthorities={[AUTHORITIES.USER]}>
              <SubTaskDetails />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </ErrorBoundaryRoutes>
    </div>
  );
};

export default AppRoutes;
