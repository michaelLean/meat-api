export const environment = {
    server: { port: process.env.PORT || 3000},
    db: { url: process.env.URL || 'mongodb://localhost/meat-api'}
}