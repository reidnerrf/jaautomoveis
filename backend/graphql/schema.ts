import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Vehicle {
    id: ID!
    name: String!
    price: Float!
    make: String!
    model: String!
    year: Int!
    km: Int!
    color: String!
    gearbox: String!
    fuel: String!
    doors: Int!
    additionalInfo: String
    optionals: [String!]
    images: [String!]!
    views: Int!
    createdAt: String!
    updatedAt: String!
  }

  type VehicleConnection {
    edges: [VehicleEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type VehicleEdge {
    node: Vehicle!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: String!
  }

  type Analytics {
    totalVehicles: Int!
    totalViews: Int!
    totalUsers: Int!
    averagePrice: Float!
    topVehicles: [Vehicle!]!
    recentActivity: [Activity!]!
  }

  type Activity {
    id: ID!
    type: String!
    description: String!
    timestamp: String!
    userId: String
    vehicleId: String
  }

  type PushSubscription {
    id: ID!
    endpoint: String!
    isActive: Boolean!
    createdAt: String!
    lastUsed: String!
  }

  input VehicleInput {
    name: String!
    price: Float!
    make: String!
    model: String!
    year: Int!
    km: Int!
    color: String!
    gearbox: String!
    fuel: String!
    doors: Int!
    additionalInfo: String
    optionals: [String!]
    images: [String!]!
  }

  input VehicleFilterInput {
    make: String
    model: String
    year: Int
    minPrice: Float
    maxPrice: Float
    fuel: String
    gearbox: String
    search: String
  }

  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  type Query {
    # Vehicles
    vehicles(
      filter: VehicleFilterInput
      pagination: PaginationInput
    ): VehicleConnection!

    vehicle(id: ID!): Vehicle

    # Analytics
    analytics: Analytics!

    # Users
    me: User
    users: [User!]!

    # Push Subscriptions
    pushSubscriptions: [PushSubscription!]!
  }

  type Mutation {
    # Vehicle mutations
    createVehicle(input: VehicleInput!): Vehicle!
    updateVehicle(id: ID!, input: VehicleInput!): Vehicle!
    deleteVehicle(id: ID!): Boolean!
    incrementVehicleViews(id: ID!): Vehicle!

    # User mutations
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String!): AuthPayload!
    logout: Boolean!

    # Push notification mutations
    subscribeToPush(endpoint: String!, keys: PushKeysInput!): PushSubscription!
    unsubscribeFromPush(endpoint: String!): Boolean!
    sendPushNotification(input: PushNotificationInput!): PushNotificationResult!
  }

  type Subscription {
    vehicleUpdated: Vehicle!
    newVehicle: Vehicle!
    vehicleViewed: Vehicle!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input PushKeysInput {
    p256dh: String!
    auth: String!
  }

  input PushNotificationInput {
    title: String!
    body: String!
    url: String
    icon: String
    badge: String
    tag: String
    data: JSON
    userId: String
  }

  type PushNotificationResult {
    success: Boolean!
    message: String!
    total: Int!
    successful: Int!
    failed: Int!
  }

  scalar JSON
  scalar Date
`;

export default typeDefs;
