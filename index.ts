import { GraphQLServer, PubSub } from "graphql-yoga";
import gql from "graphql-tag";

import { Resolvers } from "./resolverType";

const typeDefs = gql`
  type Query {
    blogPosts: [BlogPost!]!
  }

  type Counter {
    count: Int!
    countStr: String
  }

  type BlogPost {
    title: String
  }

  type Subscription {
    blogPosts: [BlogPost!]!
  }

  type Mutation {
    addBlogPost(title: String!): BlogPost!
  }
`;

const pubsub = new PubSub();
const initialBlogPosts = [{ title: "my first post" }];
const BLOGPOST_CHANNEL = "blogposts";
pubsub.publish(BLOGPOST_CHANNEL, { blogPosts: initialBlogPosts });

const resolvers: Resolvers<{ pubsub: PubSub }> = {
  Query: {
    blogPosts: () => initialBlogPosts
  },
  Mutation: {
    addBlogPost: (_parent, args, { pubsub }) => {
      const newBlogPost = { title: args.title };
      initialBlogPosts.push(newBlogPost);

      pubsub.publish(BLOGPOST_CHANNEL, { blogPosts: initialBlogPosts });

      return newBlogPost;
    }
  },
  Subscription: {
    blogPosts: {
      subscribe: (_parent, _args, { pubsub }) => {
        setTimeout(() => {
          pubsub.publish(BLOGPOST_CHANNEL, { blogPosts: initialBlogPosts });
        }, 100);
        return pubsub.asyncIterator(BLOGPOST_CHANNEL);
      }
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: { pubsub }
} as any);

server.start(() => console.log("Server is running on localhost:4000"));
