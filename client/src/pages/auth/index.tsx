import React from 'react';
import { Route, Switch } from 'wouter';

import SignIn from './SignIn';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import OtpVerification from './OtpVerification';

const AuthRouter: React.FC = () => {
  return (
    <Switch>
      <Route path="/auth/sign-in" component={SignIn} />
      <Route path="/auth/sign-up" component={SignUp} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/reset-password/:token" component={ResetPassword} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      <Route path="/auth/verify/:email" component={OtpVerification} />
      <Route path="/auth/verify" component={OtpVerification} />
      <Route>
        <SignIn />
      </Route>
    </Switch>
  );
};

export default AuthRouter;