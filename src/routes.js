import React from 'react';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Ticket from './componenents/Ticket';

import Tracker from './componenents/Tracker';

const Routes = () => (
    <Router>
        <Switch>
            <Route exact path="/" component={Ticket}/>
            <Route path="/tracker/:id" component={Tracker}/>
        </Switch>
    </Router>
);

export default Routes;