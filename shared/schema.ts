import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull().default("senior_citizen"), // 'senior_citizen' or 'relative'
  phone: varchar("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relatives table for linking accounts
export const relatives = pgTable("relatives", {
  id: serial("id").primaryKey(),
  seniorCitizenId: varchar("senior_citizen_id").notNull().references(() => users.id),
  relativeId: varchar("relative_id").notNull().references(() => users.id),
  relationship: varchar("relationship").notNull(), // 'son', 'daughter', 'spouse', etc.
  canBookServices: boolean("can_book_services").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service providers table
export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  serviceType: varchar("service_type").notNull(), // 'nurse', 'electrician', 'plumber', 'beautician', 'cab_driver'
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  experience: integer("experience"), // years of experience
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  location: varchar("location").notNull(),
  availableFrom: varchar("available_from"), // time like "09:00"
  availableTo: varchar("available_to"), // time like "18:00"
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  totalReviews: integer("total_reviews").default(0),
  isActive: boolean("is_active").default(true),
  profileImageUrl: varchar("profile_image_url"),
  specialization: text("specialization"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  bookingDate: timestamp("booking_date").notNull(),
  duration: integer("duration").notNull(), // in hours
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  address: text("address").notNull(),
  specialInstructions: text("special_instructions"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  bookedByRelative: boolean("booked_by_relative").default(false),
  relativeId: varchar("relative_id").references(() => users.id),
  smsNotificationSent: boolean("sms_notification_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews and ratings table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Emergency contacts table
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  relationship: varchar("relationship").notNull(),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
  emergencyContacts: many(emergencyContacts),
  seniorCitizenRelatives: many(relatives, { relationName: "seniorCitizen" }),
  relativeRelatives: many(relatives, { relationName: "relative" }),
}));

export const relativesRelations = relations(relatives, ({ one }) => ({
  seniorCitizen: one(users, {
    fields: [relatives.seniorCitizenId],
    references: [users.id],
    relationName: "seniorCitizen",
  }),
  relative: one(users, {
    fields: [relatives.relativeId],
    references: [users.id],
    relationName: "relative",
  }),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [bookings.providerId],
    references: [serviceProviders.id],
  }),
  relative: one(users, {
    fields: [bookings.relativeId],
    references: [users.id],
  }),
  review: one(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [reviews.providerId],
    references: [serviceProviders.id],
  }),
}));

export const emergencyContactsRelations = relations(emergencyContacts, ({ one }) => ({
  user: one(users, {
    fields: [emergencyContacts.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  rating: true,
  totalReviews: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  smsNotificationSent: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertRelativeSchema = createInsertSchema(relatives).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Relative = typeof relatives.$inferSelect;
export type InsertRelative = z.infer<typeof insertRelativeSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
