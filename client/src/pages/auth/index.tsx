import React from 'react';
import { Route, Switch } from 'wouter';

import SignIn from './SignIn';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import OtpVerification from './OtpVerification';

const AuthRouter: React.FC = () => {
  // When /auth is accessed directly, we default to sign-in
  // For /auth/* routes, we need to match the path without the /auth prefix
  return (
    <Switch>
      <Route path="/auth/sign-in" component={SignIn} />
      <Route path="/auth/sign-up" component={SignUp} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/reset-password/:token" component={ResetPassword} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      <Route path="/auth/verify/:email" component={OtpVerification} />
      <Route path="/auth/verify" component={OtpVerification} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password/:token" component={ResetPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify/:email" component={OtpVerification} />
      <Route path="/verify" component={OtpVerification} />
      <Route>
        <SignIn />
      </Route>
    </Switch>
  );
};

export default AuthRouter;