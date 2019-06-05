import { GraphQLResolveInfo } from "graphql";

type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

interface SubscriptionResolverObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<TResult, TParent, TContext, TArgs>;
}

type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;
type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<
  TResult,
  TParent,
  TContext,
  TArgs
>;

type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionResolverObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionResolverObject<TResult, TKey, TParent, TContext, TArgs>;

interface BlogPost {
  title: string;
}

type SubscriptionResolvers<ContextType = any, ParentType = {}> = {
  blogPosts?: SubscriptionResolver<
    BlogPost,
    "blogPosts",
    ParentType,
    ContextType
  >;
};

type QueryResolvers<ContextType = any, ParentType = {}> = {
  blogPosts?: Resolver<BlogPost[], ParentType, ContextType>;
};

interface BlogPostArgs {
  title: string;
}

type MutationResolvers<ContextType = any, ParentType = {}> = {
  addBlogPost?: Resolver<BlogPost, ParentType, ContextType, BlogPostArgs>;
};

export type Resolvers<ContextType = any> = {
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
};
