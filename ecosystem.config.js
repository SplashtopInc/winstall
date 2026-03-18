module.exports = {
  apps: [{
    name: 'winstall',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    node_args: '--max-old-space-size=8192', // 8GB heap memory
    max_memory_restart: '8G',               // restart if exceeds 8GB
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Log configuration
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Auto restart on crash
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
