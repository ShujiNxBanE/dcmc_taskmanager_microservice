import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import { ReducersMapObject, combineReducers } from '@reduxjs/toolkit';

import getStore from 'app/config/store';

import entitiesReducers from './reducers';
import WorkGroup from 'app/modules/work-group';
import Project from 'app/modules/project';

/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  const store = getStore();
  store.injectReducer('gateway', combineReducers(entitiesReducers as ReducersMapObject));
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
        <Route path="work-group/*" element={<WorkGroup />} />
        <Route path="project/*" element={<Project />} />
      </ErrorBoundaryRoutes>
    </div>
  );
};
