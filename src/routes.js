import React from 'react';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import TravelSearch from './componenents/views/travelSearch';

import Tracker from './componenents/views/tracker';

const Routes = () => (
    <Router>
        <Switch>
            <Route exact path="/" component={TravelSearch}/>
            <Route path="/tracker/:serviceNumber" component={Tracker}/>
        </Switch>
    </Router>
);

export default Routes;