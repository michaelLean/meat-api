export const environment = {
    server: { port: process.env.PORT || 3000 },
    db: { url: process.env.URL || 'mongodb://localhost/meat-api' },
    security: {
        rounds: process.env.SALT_ROUNDS || 10,
        apiSecret: process.env.API_SECRET || 'meat-api-secret',
        enableHTTPS: process.env.ENABLE_HTTPS || false,
        certificate: process.env.CERT_FILE || './security/keys/cert.pem',
        key: process.env.CERT_KEY_FILE || './security/keys/key.pem'
    }
}