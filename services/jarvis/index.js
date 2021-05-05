const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

// i'm trying to get a type name to conflict between two services. I think it's
// related to adding the @key property to mark it as an entity
// from https://www.apollographql.com/docs/federation/entities/ note that
// > Entities are the core building block of a federated graph.
// > Types besides object types (unions, interfaces, etc.) cannot be entities.
// In a GraphQL schema, you can designate any object type as an entity by adding a @key directive to its definition
// marking it as an entity causes the conflict
// so what hapepns if two services define the same name?
const typeDefs = gql`
  interface Interaction {
    id: ID!
    name: String!
    dorf: String!
  }
  type CaseType implements Interaction {
    id: ID!
    name: String!
    dorf: String!
  }

  extend type Query {
    me: Member
  }

  type Member @key(fields: "id") {
    id: ID!
    name: String
    username: String
    cases: [CaseType]
  }

  extend type Mutation {
   createClinicalVisit(caseId: ID): CaseType
   cancelAppointment(id: ID): ID
   rescheduleAppointment(id: ID): ID
  }
`;

const resolvers = {
  Query: {
    me() {
      return users[0];
    }
  },
  Member: {
    __resolveReference(object) {
      console.log('Jarvis resolving Member reference');
      return users.find(user => user.id === object.id);
    }
  },
  Mutation: {
    createClinicalVisit(object) {
      console.log(object);
      return { id: 1, name: 'hi', dorf: 'bye' };
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const users = [
  {
    id: "1",
    name: "Ada Lovelace",
    birthDate: "1815-12-10",
    username: "@ada",
    cases: [{
      id: 1,
      name: 'dorf',
      dorf: 'string'
    }]
  },
  {
    id: "2",
    name: "Alan Turing",
    birthDate: "1912-06-23",
    username: "@complete",
    cases: [{
      id: 1,
      name: 'dorf',
      dorf: 'string'
    }]
  }
];
