import {connectToStore} from "@applicaster/zapp-react-native-redux";
import { InterstitialAd, AdEventType,TestIds } from '@react-native-firebase/admob';
import React, { Component } from 'react';


const storeConnector = connectToStore((state) => { // Store connector entity to obtain screen data
    const values = Object.values(state.rivers);
    const screenData = values.find(
        ({ type }) => type === 'google-admob-interstitials-qb'
    );
    return { screenData };
});


const interstitials = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL);
const eventListener = interstitials.onAdEvent(type => {
    if (type === AdEventType.LOADED) {
        interstitials.show();
    }
    if(type === AdEventType.ERROR) {
        console.log("Error")
    }
});


class AdInterstitialsComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataSource: null
        };
    }

    componentDidMount() {
        interstitials.load()
    }

    componentWillUnmount() {

    }

    render() {
        return (null);
    }

}

export default storeConnector(AdInterstitialsComponent);
