const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { ApolloServer } = require('apollo-server-express');


const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const startServer = async () => {
  // build our port, start the app
  const PORT = process.env.PORT || 3001;
  const app = express();
  // server for apollo (GraphQL server)
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });
  // creates and endpoint called /graphql
  await server.start();
  server.applyMiddleware({ app });
  // req.body
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }
  // app.use(routes);
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(` :earth_africa: Now listening on localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};
startServer();