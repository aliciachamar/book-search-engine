const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

// query requests
const resolvers = {
  Query: {
    // By adding context to our query, 
    // we can retrieve the logged in user without specifically searching for them
    me: async(parent, args, context) => {
      if(context.user) {
          const userData = await User.findOne({_id: context.user._id})
          .select('-_v -password')

          return userData;
      }

      throw new AuthenticationError('You are not logged in');
  
  }
},

  Mutation: {
    loginUser: async (_parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No profile found!');
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect info!');
      }
      const token = signToken(user);
      return { token, user };
    },

    addUser: async (_parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (_parent, { input }, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: input },
          },
          { new: true }
        )
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    removeBook: async (_parent, { bookId }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  }
};

module.exports = resolvers;