import axios from 'axios'

const main = async () => {
  const client = axios.create({ baseURL: 'http://localhost:8080', withCredentials: true })
  try {
    const signup = await client.post('/api/auth/signup', { email: 'cli@login.com', password: 'password123' })
    console.log('signup', signup.status, signup.data)
  } catch (err) {
    console.error('signup error', err.response?.status, err.response?.data)
  }

  try {
    const login = await client.post('/api/auth/login', { email: 'cli@login.com', password: 'password123' })
    console.log('login', login.status, login.data, login.headers['set-cookie'])
  } catch (err) {
    console.error('login error', err.response?.status, err.response?.data)
  }

  try {
    const me = await client.get('/api/auth/me')
    console.log('me', me.status, me.data)
  } catch (err) {
    console.error('me error', err.response?.status, err.response?.data)
  }
}

main().catch(console.error)
