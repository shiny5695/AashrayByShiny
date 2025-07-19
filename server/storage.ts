import {
  users,
  serviceProviders,
  bookings,
  reviews,
  relatives,
  emergencyContacts,
  type User,
  type UpsertUser,
  type ServiceProvider,
  type InsertServiceProvider,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type Relative,
  type InsertRelative,
  type EmergencyContact,
  type InsertEmergencyContact,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Service provider operations
  getServiceProviders(serviceType?: string, location?: string): Promise<ServiceProvider[]>;
  getServiceProviderById(id: number): Promise<ServiceProvider | undefined>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<(Booking & { provider: ServiceProvider })[]>;
  getBookingById(id: number): Promise<(Booking & { provider: ServiceProvider }) | undefined>;
  updateBookingStatus(id: number, status: string): Promise<void>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getProviderReviews(providerId: number): Promise<(Review & { user: User })[]>;
  updateProviderRating(providerId: number): Promise<void>;
  
  // Relative operations
  linkRelative(relative: InsertRelative): Promise<Relative>;
  getUserRelatives(userId: string): Promise<(Relative & { relative: User })[]>;
  getRelativeAccess(seniorCitizenId: string, relativeId: string): Promise<boolean>;
  
  // Emergency contact operations
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  getUserEmergencyContacts(userId: string): Promise<EmergencyContact[]>;
  
  // Mock SMS operations
  sendSMSNotification(phone: string, message: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getServiceProviders(serviceType?: string, location?: string): Promise<ServiceProvider[]> {
    let whereConditions = [eq(serviceProviders.isActive, true)];
    
    if (serviceType) {
      whereConditions.push(eq(serviceProviders.serviceType, serviceType));
    }
    
    if (location) {
      whereConditions.push(like(serviceProviders.location, `%${location}%`));
    }
    
    return await db
      .select()
      .from(serviceProviders)
      .where(and(...whereConditions))
      .orderBy(desc(serviceProviders.rating));
  }

  async getServiceProviderById(id: number): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return provider;
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [newProvider] = await db.insert(serviceProviders).values(provider).returning();
    return newProvider;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getUserBookings(userId: string): Promise<(Booking & { provider: ServiceProvider })[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        providerId: bookings.providerId,
        bookingDate: bookings.bookingDate,
        duration: bookings.duration,
        totalAmount: bookings.totalAmount,
        address: bookings.address,
        specialInstructions: bookings.specialInstructions,
        status: bookings.status,
        bookedByRelative: bookings.bookedByRelative,
        relativeId: bookings.relativeId,
        smsNotificationSent: bookings.smsNotificationSent,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        provider: serviceProviders,
      })
      .from(bookings)
      .innerJoin(serviceProviders, eq(bookings.providerId, serviceProviders.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: number): Promise<(Booking & { provider: ServiceProvider }) | undefined> {
    const [booking] = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        providerId: bookings.providerId,
        bookingDate: bookings.bookingDate,
        duration: bookings.duration,
        totalAmount: bookings.totalAmount,
        address: bookings.address,
        specialInstructions: bookings.specialInstructions,
        status: bookings.status,
        bookedByRelative: bookings.bookedByRelative,
        relativeId: bookings.relativeId,
        smsNotificationSent: bookings.smsNotificationSent,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        provider: serviceProviders,
      })
      .from(bookings)
      .innerJoin(serviceProviders, eq(bookings.providerId, serviceProviders.id))
      .where(eq(bookings.id, id));
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<void> {
    await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    // Update provider rating after new review
    await this.updateProviderRating(review.providerId);
    return newReview;
  }

  async getProviderReviews(providerId: number): Promise<(Review & { user: User })[]> {
    return await db
      .select({
        id: reviews.id,
        bookingId: reviews.bookingId,
        userId: reviews.userId,
        providerId: reviews.providerId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: users,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.providerId, providerId))
      .orderBy(desc(reviews.createdAt));
  }

  async updateProviderRating(providerId: number): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})::DECIMAL(2,1)`,
        totalReviews: sql<number>`COUNT(*)::INTEGER`,
      })
      .from(reviews)
      .where(eq(reviews.providerId, providerId));

    if (result[0]) {
      await db
        .update(serviceProviders)
        .set({
          rating: result[0].avgRating.toString(),
          totalReviews: result[0].totalReviews,
        })
        .where(eq(serviceProviders.id, providerId));
    }
  }

  async linkRelative(relative: InsertRelative): Promise<Relative> {
    const [newRelative] = await db.insert(relatives).values(relative).returning();
    return newRelative;
  }

  async getUserRelatives(userId: string): Promise<(Relative & { relative: User })[]> {
    return await db
      .select({
        id: relatives.id,
        seniorCitizenId: relatives.seniorCitizenId,
        relativeId: relatives.relativeId,
        relationship: relatives.relationship,
        canBookServices: relatives.canBookServices,
        createdAt: relatives.createdAt,
        relative: users,
      })
      .from(relatives)
      .innerJoin(users, eq(relatives.relativeId, users.id))
      .where(eq(relatives.seniorCitizenId, userId));
  }

  async getRelativeAccess(seniorCitizenId: string, relativeId: string): Promise<boolean> {
    const [access] = await db
      .select({ canBookServices: relatives.canBookServices })
      .from(relatives)
      .where(
        and(
          eq(relatives.seniorCitizenId, seniorCitizenId),
          eq(relatives.relativeId, relativeId)
        )
      );
    return access?.canBookServices ?? false;
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const [newContact] = await db.insert(emergencyContacts).values(contact).returning();
    return newContact;
  }

  async getUserEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    return await db
      .select()
      .from(emergencyContacts)
      .where(eq(emergencyContacts.userId, userId))
      .orderBy(desc(emergencyContacts.isPrimary));
  }

  async sendSMSNotification(phone: string, message: string): Promise<boolean> {
    // Mock SMS implementation - in production, integrate with SMS provider
    console.log(`📱 SMS to ${phone}: ${message}`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Always return true for mock implementation
    return true;
  }
}

export const storage = new DatabaseStorage();
