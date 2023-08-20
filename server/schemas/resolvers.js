const { signToken, AuthenticationError } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
                const userData = await User.findOne({})
                .select('-__v -password')
                .populate('savedBooks');
                return userData;
        }
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
          },
          login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw AuthenticationError;
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw AuthenticationError;
            }
      
            const token = signToken(user);
      
            return { token, user };
          },
        saveBook: async (parent, bookData) => {
                const updatedUser = await User.findOneAndUpdate(
                    {},
                    { $addToSet: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
        },

        removeBook: async (parent, { bookId }) => {
                  const updatedUser = await User.findOneAndUpdate(
                      { },
                      { $pull: { savedBooks: { bookId: bookId } } },
                      { new: true }
                  );
                  return updatedUser;
              },
    },  
};
module.exports = resolvers;