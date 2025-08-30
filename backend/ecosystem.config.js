module.exports = {
  apps: [{
    name: 'termo2-backend',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      FRONTEND_URL: 'https://termo2-frontend-*.ondigitalocean.app'
    }
  }]
};
