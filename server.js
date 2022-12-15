const express = require('express')
const expressGraphQL = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')
const app = express()

const authors = [
	{ id: 1, name: 'C. Tangana', email: 'c.tangana@gmail.com', homeTown: 'Madrid, Spain'},
	{ id: 2, name: 'Arctic Monkeys',email: 'arctic@gmail.com', homeTown: 'Sheffield, UK' },
	{ id: 3, name: 'Metallica', email: 'metallica@gmail.com', homeTown: 'Lost Angeles, USA' }
]

const songs = [
	{ id: 1, title: 'Tu Me Dejaste De Querer', release: 2021, album: 'El Madrileno',genre: 'flamenco' ,authorId: 1 },
  { id: 2, title: 'Do I Wanna Know?', release: 2013, album: 'AM',genre: 'rock' ,authorId: 2 },
  { id: 3, title: 'R U Mine?', release: 2013, album: 'AM',genre: 'rock' ,authorId: 2 },
  { id: 4, title: 'Nothing else matters', release: 1991, album: 'Metallica',genre: 'rock' ,authorId: 3 },
  { id: 5, title: 'Master Of Puppets', release: 1986, album: 'Master of Puppets',genre: 'rock' ,authorId: 3 },
]

const SongType = new GraphQLObjectType({
  name: 'Song',
  description: 'This represents a song written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLNonNull(GraphQLString) },
    release: { type: GraphQLNonNull(GraphQLInt) },
    album: { type: GraphQLNonNull(GraphQLString) },
    genre: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (song) => {
        return authors.find(author => author.id === song.authorId)
      }
    }
  })
})

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of a song',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    homeTown: { type: GraphQLNonNull(GraphQLString) },
    songs: {
      type: new GraphQLList(SongType),
      resolve: (author) => {
        return songs.filter(song => song.authorId === author.id)
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    song: {
      type: SongType,
      description: 'A song',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => songs.find(song => song.id === args.id)
    },
    songs: {
      type: new GraphQLList(SongType),
      description: 'List of all songs',
      resolve: () => songs
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of All Authors',
      resolve: () => authors
    },
    author: {
      type: AuthorType,
      description: 'A Single Author',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addSong: {
      type: SongType,
      description: 'Add a new song',
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        release: { type: GraphQLNonNull(GraphQLInt) },
        album: { type: GraphQLNonNull(GraphQLString) },
        genre: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const song = { id: songs.length + 1, title: args.title,release: args.release,album:args.album,genre:args.genre, authorId: args.authorId }
        songs.push(song)
        return song;
      }
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        homeTown: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = { id: authors.length + 1, name: args.name, email: args.email, homeTown: args.homeTown }
        authors.push(author)
        return author
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

const PORT = 5000;
const PATH = '/graphql';

app.use(PATH, expressGraphQL({
  schema: schema,
  graphiql: true
}))
app.listen(PORT, () => console.log('Server running on http://localhost:'+PORT+PATH));
