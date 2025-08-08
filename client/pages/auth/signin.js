import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: {
      email,
      password
    },
    onSuccess: () => Router.push('/')
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    await doRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign In</h1>`
      <div className="form-group">
        <label className='form-label'>Email</label>
        <input
          className='form-control'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
        />
      </div>
      <div className="form-group">
        <label className='form-label' >Password</label>
        <input
          className='form-control'
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
        />
      </div>
      {errors}
      <button className='btn btn-primary'>Sign In</button>
    </form>
  );
}

export default SignInForm;