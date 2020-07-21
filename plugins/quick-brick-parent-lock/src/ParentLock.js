import React, { Component } from 'react';
import * as R from 'ramda';
import { connectToStore } from '@applicaster/zapp-react-native-redux';

const storeConnector = connectToStore((state) => { // Store connector entity to obtain screen data
    const values = Object.values(state.rivers);
    const screenData = values.find(
        ({ type }) => type === 'parent-lock-qb'
    );
    return { screenData };
});

function ParentLock(props) {

}

export default storeConnector(ParentLock);
