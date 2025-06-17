export default function disableHostCheck() {
  return {
    name: 'disable-host-check',
    configureServer(server) {
      server.middlewares.use('/', (req, res, next) => {
        // Remove host header validation
        req.headers.host = 'localhost:5000';
        next();
      });
    }
  };
}