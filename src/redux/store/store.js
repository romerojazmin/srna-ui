import _ from 'lodash';
import logger from 'redux-logger';
import {
    configureStore,
    getDefaultMiddleware,
} from '@reduxjs/toolkit';
import { reducers } from '../slices';
import userSession from '../slices/userSession';
import { storage } from '../../services';

function rehydrateStore() {
    const $appData = JSON.parse(storage.get().getItem('$appData'));
    if ($appData) {
        _.set($appData, 'userSession', userSession.initialState);
        return $appData;
    }
    return {};
}

function dehydrateStore(store) {
    const $appData = store.getState();
    storage.get().setItem('$appData', JSON.stringify($appData));
}

const store = configureStore({
    preloadedState: rehydrateStore(),
    reducer: reducers,
    middleware: process && process.env && process.env.NODE_ENV === 'development'
        ? [
            ...getDefaultMiddleware(),
            logger,
        ]
        : [...getDefaultMiddleware()],
});

store.subscribe(() => dehydrateStore(store));

export default store;
