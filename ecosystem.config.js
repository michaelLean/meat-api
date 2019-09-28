module.exports = {
  apps : [{
    name   : "meat-api",
    script : "./dist/main.js",
    instances: 0,
    exec_mode: "cluster",
    env: {
      PORT: 4000,
      URL: 'mongodb://localhost/meat-api',
    },
    env_production: {
      PORT: 5001,
      URL: 'mongodb://localhost/meat-api',
      SALT_ROUNDS: 10,
      API_SECRET: "meat-api-secret",
      NODE_ENV: "production"
    }
  }]
}